from dotenv import load_dotenv
load_dotenv()
import os, random
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_methods=["*"], allow_headers=["*"])

FALLBACK = ["Go look at one tree. Just one.", "Walk to the end of your street and back."]
CHECKINS: list[dict] = []   # swap for a real DB (see step 4)

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
    CHECKINS.append({**c.model_dump(), "at": datetime.now(timezone.utc).isoformat()})
    return {"ok": True}

@app.post("/events")
def event(payload: dict = {}): return {"ok": True}

@app.get("/stats")
def stats():
    return {"checkins": len(CHECKINS), "streak": 1 if CHECKINS else 0}