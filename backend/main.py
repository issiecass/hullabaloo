from dotenv import load_dotenv
load_dotenv()
import os, random
from datetime import date, datetime, timedelta
from typing import Annotated
from zoneinfo import ZoneInfo
import httpx
import psycopg
from psycopg.types.json import Jsonb
from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, StringConstraints
import auth, db
import uuid
from typing import Literal
from fastapi.responses import PlainTextResponse

# Only finishing onboarding writes answers, so an empty answers means the user hasn't onboarded yet.
USER_COLUMNS = "id, name, email, spice_level, interests, filters, answers, answers <> '{}'::jsonb AS onboarded, chirps_paused_until, created_at, shortcut_key"

TZ = ZoneInfo("America/New_York")

app = FastAPI()

def parse_key(raw: str | None):
    try:
        return uuid.UUID(raw) if raw else None
    except ValueError:
        return None

@app.get("/should-interrupt", response_class=PlainTextResponse)
def should_interrupt(key: str | None = None):
    k = parse_key(key)
    if k is None:
        return "yes"
    with db.connect() as conn:
        row = conn.execute(
            "SELECT chirps_paused_until > now() AS paused FROM users WHERE shortcut_key = %s",
            (k,),
        ).fetchone()
    return "no" if row and row["paused"] else "yes"

class Snooze(BaseModel):
    key: str
    minutes: Literal[1, 15, 30]

@app.post("/snooze")
def snooze(body: Snooze):
    k = parse_key(body.key)
    if k is None:
        raise HTTPException(404, "Unknown key")
    with db.connect() as conn:
        row = conn.execute(
            "UPDATE users SET chirps_paused_until = now() + make_interval(mins => %s) "
            "WHERE shortcut_key = %s RETURNING id",
            (body.minutes, k),
        ).fetchone()
    if not row:
        raise HTTPException(404, "Unknown key")
    return {"ok": True}

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_methods=["*"], allow_headers=["*"])

FALLBACK = ["Go look at one tree. Just one.", "Walk to the end of your street and back."]

class Checkin(BaseModel):
    app: str = "instagram"
    action: str = "went_outside"

@app.get("/health")
def health(): return {"ok": True}

@app.get("/suggestion")
def suggestion(app: str = "instagram"):
    return {"suggestion": random.choice(FALLBACK)}   # LLM call comes later

@app.post("/checkins")
def checkin(c: Checkin):
    with db.connect() as conn:
        conn.execute(
            "INSERT INTO checkins (app, action) VALUES (%s, %s)",
            (c.app, c.action),
        )
    return {"ok": True}

@app.post("/events")
def event(payload: dict = {}): return {"ok": True}

@app.get("/stats")
def stats():
    with db.connect() as conn:
        total = conn.execute("SELECT count(*) AS n FROM checkins").fetchone()["n"]
        rows = conn.execute(
            "SELECT DISTINCT (created_at AT TIME ZONE 'America/New_York')::date AS d FROM checkins"
        ).fetchall()

    days = {r["d"] for r in rows}
    day = datetime.now(TZ).date()
    if day not in days:               # no check-in yet today: streak can still be alive from yesterday
        day -= timedelta(days=1)
    streak = 0
    while day in days:
        streak += 1
        day -= timedelta(days=1)
    return {"checkins": total, "streak": streak}


class Signup(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=auth.MAX_PASSWORD_BYTES)

class Login(BaseModel):
    email: str
    password: str

@app.post("/auth/signup", status_code=201)
def signup(body: Signup):
    email = body.email.strip().lower()
    if "@" not in email:
        raise HTTPException(400, "Invalid email")
    if len(body.password.encode()) > auth.MAX_PASSWORD_BYTES:
        raise HTTPException(400, "Password is too long")
    try:
        with db.connect() as conn:
            user = conn.execute(
                f"INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING {USER_COLUMNS}",
                (body.name.strip(), email, auth.hash_password(body.password)),
            ).fetchone()
    except psycopg.errors.UniqueViolation:
        raise HTTPException(409, "An account with that email already exists")
    return {"token": auth.create_token(user["id"]), "user": user}

@app.post("/auth/login")
def login(body: Login):
    with db.connect() as conn:
        user = conn.execute(
            f"SELECT {USER_COLUMNS}, password_hash FROM users WHERE lower(email) = %s",
            (body.email.strip().lower(),),
        ).fetchone()
    if not user or not auth.verify_password(body.password, user.pop("password_hash")):
        raise HTTPException(401, "Wrong email or password")
    return {"token": auth.create_token(user["id"]), "user": user}

@app.get("/auth/me")
def me(user_id: int = Depends(auth.current_user_id)):
    with db.connect() as conn:
        user = conn.execute(f"SELECT {USER_COLUMNS} FROM users WHERE id = %s", (user_id,)).fetchone()
    if not user:
        raise HTTPException(404, "User not found")
    return user

Interest = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]

class Preferences(BaseModel):
    interests: list[Interest] | None = Field(default=None, max_length=50)
    spice_level: int | None = Field(default=None, ge=1, le=4)
    filters: list[Literal["free", "nearby", "hour"]] | None = None
    answers: dict | None = None

@app.patch("/auth/me")
def update_me(body: Preferences, user_id: int = Depends(auth.current_user_id)):
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(400, "Nothing to update")
    if any(value is None for value in changes.values()):
        raise HTTPException(400, "Preferences can't be cleared")
    if "filters" in changes:
        changes["filters"] = list(dict.fromkeys(changes["filters"]))
    if "answers" in changes:
        changes["answers"] = Jsonb(changes["answers"])
    # Keys come from Preferences' fields, never from the raw request, so they're safe to put in the SQL.
    assignments = ", ".join(f"{field} = %s" for field in changes)
    with db.connect() as conn:
        user = conn.execute(
            f"UPDATE users SET {assignments} WHERE id = %s RETURNING {USER_COLUMNS}",
            (*changes.values(), user_id),
        ).fetchone()
    if not user:
        raise HTTPException(404, "User not found")
    return user

TODO_COLUMNS = "id, text, note, due_date, done, created_at, COALESCE(NOT done AND due_date < current_date, false) AS overdue"
NULLABLE_TODO_FIELDS = {"note", "due_date"}

TodoText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)]
TodoNote = Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)]

class TodoCreate(BaseModel):
    text: TodoText
    note: TodoNote | None = None
    due_date: date | None = None

class TodoUpdate(BaseModel):
    text: TodoText | None = None
    note: TodoNote | None = None
    due_date: date | None = None
    done: bool | None = None

@app.get("/todos")
def list_todos(user_id: int = Depends(auth.current_user_id)):
    with db.connect() as conn:
        return conn.execute(
            f"SELECT {TODO_COLUMNS} FROM todos WHERE user_id = %s ORDER BY created_at, id",
            (user_id,),
        ).fetchall()

@app.post("/todos", status_code=201)
def create_todo(body: TodoCreate, user_id: int = Depends(auth.current_user_id)):
    with db.connect() as conn:
        return conn.execute(
            f"INSERT INTO todos (user_id, text, note, due_date) VALUES (%s, %s, %s, %s) RETURNING {TODO_COLUMNS}",
            (user_id, body.text, body.note or None, body.due_date),
        ).fetchone()

@app.patch("/todos/{todo_id}")
def update_todo(todo_id: int, body: TodoUpdate, user_id: int = Depends(auth.current_user_id)):
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(400, "Nothing to update")
    if any(value is None and field not in NULLABLE_TODO_FIELDS for field, value in changes.items()):
        raise HTTPException(400, "Only note and due_date can be cleared")
    if "note" in changes:
        changes["note"] = changes["note"] or None
    # Keys come from TodoUpdate's fields, never from the raw request, so they're safe to put in the SQL.
    assignments = ", ".join(f"{field} = %s" for field in changes)
    with db.connect() as conn:
        todo = conn.execute(
            f"UPDATE todos SET {assignments} WHERE id = %s AND user_id = %s RETURNING {TODO_COLUMNS}",
            (*changes.values(), todo_id, user_id),
        ).fetchone()
    if not todo:
        raise HTTPException(404, "Todo not found")
    return todo

@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, user_id: int = Depends(auth.current_user_id)):
    with db.connect() as conn:
        deleted = conn.execute("DELETE FROM todos WHERE id = %s AND user_id = %s", (todo_id, user_id)).rowcount
    if not deleted:
        raise HTTPException(404, "Todo not found")
    return Response(status_code=204)

# Gemini, through its OpenAI-compatible endpoint. The key stays on the server; the frontend only ever talks to /llm/chat.
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"

class LlmChat(BaseModel):
    system: str = Field(min_length=1, max_length=6000)
    user: str = Field(min_length=1, max_length=6000)

@app.post("/llm/chat")
def llm_chat(body: LlmChat, user_id: int = Depends(auth.current_user_id)):
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise HTTPException(503, "The LLM is not configured")
    try:
        res = httpx.post(
            GEMINI_URL,
            headers={"Authorization": f"Bearer {key}"},
            json={
                "model": os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
                "temperature": 0.9,
                "response_format": {"type": "json_object"},
                "messages": [{"role": "system", "content": body.system}, {"role": "user", "content": body.user}],
            },
            timeout=20,
        )
        res.raise_for_status()
        return {"content": res.json()["choices"][0]["message"]["content"]}
    except (httpx.HTTPError, KeyError, IndexError, TypeError, ValueError):
        # The frontend falls back to its written lines on any failure, so one generic error is enough.
        raise HTTPException(502, "The LLM request failed")

        
# A scrolling session the user allows themselves from the Home screen.
# While it runs, /should-interrupt answers "no", so the Shortcut lets them through.
class Session(BaseModel):
    seconds: int = Field(ge=0, le=7200)   # 0 ends the session now; the cap is two hours

@app.post("/session")
def start_session(body: Session, user_id: int = Depends(auth.current_user_id)):
    with db.connect() as conn:
        row = conn.execute(
            "UPDATE users SET chirps_paused_until = now() + make_interval(secs => %s) "
            "WHERE id = %s RETURNING chirps_paused_until",
            (body.seconds, user_id),
        ).fetchone()
    if not row:
        raise HTTPException(404, "User not found")
    return row