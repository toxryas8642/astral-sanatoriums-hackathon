# main.py

import json
from pathlib import Path
from typing import Optional, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from algorithms.scoring import detect_profile, calculate_score, MEDICAL_PROFILES
from algorithms.antifraud import find_duplicates, group_duplicates

app = FastAPI(title="Курортный подбор")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent / "data" / "sanatoriums.json"


def load_sanatoriums():
    """Загружает данные о санаториях из JSON-файла."""
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


class MatchRequest(BaseModel):
    """Модель запроса для подбора санатория."""
    text: Optional[str] = None
    procedures: Optional[List[str]] = []
    excursions: Optional[List[str]] = []
    budget: Optional[int] = None
    maxDistance: Optional[int] = None
    has_pool: Optional[bool] = None
    child_friendly: Optional[bool] = None


@app.get("/")
def root():
    """Корневой эндпоинт для проверки работоспособности."""
    return {"status": "ok", "message": "Курортный подбор работает"}


@app.get("/api/sanatoriums")
def get_all():
    """Возвращает список всех санаториев."""
    return load_sanatoriums()


@app.get("/api/filters")
def get_filters():
    """
    Возвращает справочники доступных процедур и экскурсий.
    Нужен фронтенду для построения фильтров.
    """
    sanatoriums = load_sanatoriums()
    procedures = set()
    excursions = set()
    for s in sanatoriums:
        procedures.update(s.get("procedures", []))
        excursions.update(s.get("excursions", []))
    return {
        "procedures": sorted(list(procedures)),
        "excursions": sorted(list(excursions))
    }


@app.get("/api/stats")
def stats():
    """Возвращает общую статистику по базе санаториев."""
    sanatoriums = load_sanatoriums()
    duplicates = find_duplicates(sanatoriums)
    return {
        "total_sanatoriums": len(sanatoriums),
        "regions_count": len(set(s["region"] for s in sanatoriums)),
        "avg_price": round(sum(s["price_per_day"] for s in sanatoriums) / len(sanatoriums)),
        "avg_rating": round(sum(s["rating"] for s in sanatoriums) / len(sanatoriums), 2),
        "duplicates_found": len(duplicates),
        "procedures_supported": 12,
        "medical_profiles": len(MEDICAL_PROFILES)
    }


@app.post("/api/match")
def match(req: MatchRequest):
    """
    Основной эндпоинт подбора.
    Принимает предпочтения пользователя и возвращает топ-10 санаториев.
    """
    sanatoriums = load_sanatoriums()
    required_procedures = req.procedures or []
    detected = None

    if req.text:
        detected = detect_profile(req.text)
        if detected and not required_procedures:
            required_procedures = detected["procedures"]

    prefs = {
        "procedures": required_procedures,
        "excursions": req.excursions or [],
        "budget": req.budget,
        "maxDistance": req.maxDistance,
        "has_pool": req.has_pool,
        "child_friendly": req.child_friendly
    }

    duplicates = find_duplicates(sanatoriums)
    duplicate_ids = {d["candidate"]["id"] for d in duplicates}

    results = []
    for s in sanatoriums:
        res = calculate_score(s, prefs)
        is_clone = s["id"] in duplicate_ids
        results.append({
            **s,
            "matchScore": res["score"],
            "matchReasons": res["reasons"],
            "isClone": is_clone,
            "warning": "Возможный дубликат сайта" if is_clone else None
        })

    results.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "detectedProfile": detected["name"] if detected else None,
        "results": results[:10]
    }


@app.get("/api/duplicates")
def duplicates():
    """Возвращает список найденных дубликатов."""
    sanatoriums = load_sanatoriums()
    dups = find_duplicates(sanatoriums)
    return {"count": len(dups), "duplicates": dups}


@app.get("/api/duplicates/grouped")
def duplicates_grouped():
    """Возвращает сгруппированные дубликаты (кластеры)."""
    sanatoriums = load_sanatoriums()
    clusters = group_duplicates(sanatoriums)
    return {"count": len(clusters), "clusters": clusters}


@app.get("/api/sanatoriums/{s_id}")
def get_one(s_id: int):
    """Возвращает информацию о конкретном санатории по ID."""
    for s in load_sanatoriums():
        if s["id"] == s_id:
            return s
    raise HTTPException(status_code=404, detail="Не найдено")