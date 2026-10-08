# main.py
# Главный файл сервера

import json
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from algorithms.scoring import detect_profile, calculate_score
from algorithms.antifraud import find_duplicates

# --- Инициализация ---
app = FastAPI(title="Курортный подбор")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Загрузка данных
DATA_PATH = Path(__file__).parent / "data" / "sanatoriums.json"
with open(DATA_PATH, encoding="utf-8") as f:
    SANATORIUMS = json.load(f)

def load_sanatoriums():
    """Читает JSON каждый раз при вызове."""
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)

# --- Схема запроса ---
class MatchRequest(BaseModel):
    text: Optional[str] = None
    procedures: Optional[List[str]] = []
    excursions: Optional[List[str]] = []
    budget: Optional[int] = None
    maxDistance: Optional[int] = None


# --- ЭНДПОИНТЫ ---

@app.get("/")
def root():
    return {"status": "ok", "message": "Курортный подбор работает"}


@app.get("/api/sanatoriums")
def get_all():
    return load_sanatoriums()


@app.post("/api/match")
def match(req: MatchRequest):
    required_procedures = req.procedures or []
    detected = None
    SANATORIUMS = load_sanatoriums()
    if req.text:
        detected = detect_profile(req.text)
        if detected and not required_procedures:
            required_procedures = detected["procedures"]

    prefs = {
        "procedures": required_procedures,
        "excursions": req.excursions or [],
        "budget": req.budget,
        "maxDistance": req.maxDistance
    }

    results = []
    for s in SANATORIUMS:
        res = calculate_score(s, prefs)
        results.append({**s, "matchScore": res["score"], "matchReasons": res["reasons"]})

    results.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "detectedProfile": detected["name"] if detected else None,
        "results": results[:10]
    }


@app.get("/api/duplicates")
def duplicates():
    SANATORIUMS = load_sanatoriums()
    dups = find_duplicates(SANATORIUMS)
    return {"count": len(dups), "duplicates": dups}


@app.get("/api/sanatoriums/{s_id}")
def get_one(s_id: int):
    SANATORIUMS = load_sanatoriums()
    for s in SANATORIUMS:
        if s["id"] == s_id:
            return s
    raise HTTPException(status_code=404, detail="Не найдено")