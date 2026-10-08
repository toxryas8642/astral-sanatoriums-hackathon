# algorithms/scoring.py

MEDICAL_PROFILES = {
    "опорно-двигательный": {
        "procedures": ["грязи", "ЛФК", "мануальная терапия", "минеральные ванны", "массаж"],
        "keywords": ["грыжа", "спина", "сустав", "артрит", "остеохондроз"]
    },
    "сердечно-сосудистый": {
        "procedures": ["кардиотренировки", "кислородные коктейли", "терренкур", "минеральные ванны"],
        "keywords": ["сердце", "давление", "гипертония", "сосуды"]
    },
    "дыхательный": {
        "procedures": ["ингаляции", "спелеотерапия", "климатотерапия"],
        "keywords": ["астма", "бронхит", "лёгкие", "кашель"]
    },
    "нервная система": {
        "procedures": ["психотерапия", "ароматерапия", "массаж", "релаксация"],
        "keywords": ["стресс", "бессонница", "усталость", "нервы"]
    }
}


def detect_profile(user_text: str):
    """Определяет мед. профиль пользователя по свободному тексту."""
    if not user_text:
        return None
    text = user_text.lower()
    for name, profile in MEDICAL_PROFILES.items():
        for keyword in profile["keywords"]:
            if keyword in text:
                return {"name": name, "procedures": profile["procedures"]}
    return None


def calculate_score(sanatorium: dict, prefs: dict):
    """Считает процент соответствия санатория предпочтениям."""
    score = 0.0
    reasons = []

    required = prefs.get("procedures") or []
    if required:
        matched = [p for p in required if p in sanatorium.get("procedures", [])]
        score += (len(matched) / len(required)) * 40
        if matched:
            reasons.append(f"Есть {len(matched)} из {len(required)} нужных процедур")

    required_ex = prefs.get("excursions") or []
    if required_ex:
        matched = [e for e in required_ex if e in sanatorium.get("excursions", [])]
        score += (len(matched) / len(required_ex)) * 20

    budget = prefs.get("budget")
    if budget and sanatorium.get("price_per_day", 0) <= budget:
        score += 20
        reasons.append("Вписывается в бюджет")
    elif budget:
        over = sanatorium["price_per_day"] - budget
        score += max(0, 20 - over / 100)

    max_dist = prefs.get("maxDistance")
    if max_dist and sanatorium.get("transport", {}).get("airport", 9999) <= max_dist:
        score += 10

    score += (sanatorium.get("rating", 0) / 5) * 10

    return {"score": round(score), "reasons": reasons}