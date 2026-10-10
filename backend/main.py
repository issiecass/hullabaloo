from dotenv import load_dotenv
load_dotenv()
import os, random
from datetime import datetime, timezone
import psycopg
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import auth, db
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/New_York")

app = FastAPI()

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

USER_COLUMNS = "id, name, email, spice_level, interests, filters, answers, chirps_paused_until, created_at"

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