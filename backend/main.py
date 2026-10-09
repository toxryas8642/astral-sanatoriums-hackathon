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
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


class MatchRequest(BaseModel):
    text: Optional[str] = None
    procedures: Optional[List[str]] = []
    excursions: Optional[List[str]] = []
    budget: Optional[int] = None
    maxDistance: Optional[int] = None
    has_pool: Optional[bool] = None
    child_friendly: Optional[bool] = None
    include_all: Optional[bool] = False


@app.get("/")
def root():
    return {"status": "ok", "message": "Курортный подбор работает"}


@app.get("/api/sanatoriums")
def get_all():
    return load_sanatoriums()


@app.get("/api/filters")
def get_filters():
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


@app.get("/api/regions")
def get_regions():
    sanatoriums = load_sanatoriums()
    regions = sorted(set(s["region"] for s in sanatoriums))
    return {"regions": regions}


@app.get("/api/stats")
def stats():
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
    sanatoriums = load_sanatoriums()
    required_procedures = req.procedures or []
    required_excursions = req.excursions or []
    budget = req.budget
    detected = None
    detected_method = None
    auto_excursions = []
    auto_budget = None

    if req.text:
        detected = detect_profile(req.text)
        if detected:
            detected_method = detected.get("method")

            if not required_procedures:
                required_procedures = detected.get("procedures", [])

            if not required_excursions:
                profile_excursions = detected.get("excursions", [])
                if profile_excursions:
                    required_excursions = profile_excursions
                    auto_excursions = profile_excursions

            if budget is None:
                hint = detected.get("budget_hint")
                if hint:
                    budget = hint
                    auto_budget = hint

    prefs = {
        "procedures": required_procedures,
        "excursions": required_excursions,
        "budget": budget,
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
        final = max(0, res["score"] - (15 if is_clone else 0))
        results.append({
            **s,
            "matchScore": final,
            "matchReasons": res["reasons"],
            "isClone": is_clone,
            "warning": "⚠️ Возможный дубликат сайта" if is_clone else None
        })

    results.sort(key=lambda x: x["matchScore"], reverse=True)

    # Жёсткий фильтр по процедурам/экскурсиям — только когда пользователь
    # сам их выбрал в форме. Если они пришли из текстового профиля — не отсекаем.
    if not req.text and req.procedures:
        results = [
            r for r in results
            if all(p in r.get("procedures", []) for p in req.procedures)
        ]

    if not req.text and req.excursions:
        results = [
            r for r in results
            if all(e in r.get("excursions", []) for e in req.excursions)
        ]

    # Порог 65 применяется только к текстовому поиску.
    if req.text:
        results = [r for r in results if r["matchScore"] >= 65]

    results = results[:30]

    return {
        "detectedProfile": detected["name"] if detected else None,
        "detectedMethod": detected_method,
        "autoExcursions": auto_excursions,
        "autoBudget": auto_budget,
        "results": results
    }


@app.get("/api/duplicates")
def duplicates():
    sanatoriums = load_sanatoriums()
    dups = find_duplicates(sanatoriums)
    return {"count": len(dups), "duplicates": dups}


@app.get("/api/duplicates/grouped")
def duplicates_grouped():
    sanatoriums = load_sanatoriums()
    clusters = group_duplicates(sanatoriums)
    return {"count": len(clusters), "clusters": clusters}


@app.get("/api/sanatoriums/{s_id}")
def get_one(s_id: int):
    for s in load_sanatoriums():
        if s["id"] == s_id:
            return s
    raise HTTPException(status_code=404, detail="Не найдено")