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
    },
    "ЖКТ": {
        "procedures": ["минеральные воды", "диетотерапия", "грязи"],
        "keywords": ["желудок", "кишечник", "гастрит", "печень", "жкт", "пищеварение"]
    },
    "Кожа": {
        "procedures": ["грязи", "минеральные ванны", "климатотерапия"],
        "keywords": ["псориаз", "экзема", "дерматит", "кожа", "угри"]
    },
    "Женское здоровье": {
        "procedures": ["грязи", "минеральные ванны", "психотерапия"],
        "keywords": ["гинекология", "женское", "гормоны", "климакс"]
    },
    "Общее укрепление": {
        "procedures": ["ЛФК", "массаж", "терренкур", "ароматерапия", "климатотерапия"],
        "keywords": ["устал", "отдохнуть", "оздоровиться", "профилактика", "укрепление", "иммунитет"]
    }
}


def detect_profile(user_text: str):
    if not user_text:
        return None
    text = user_text.lower()
    for name, profile in MEDICAL_PROFILES.items():
        for keyword in profile["keywords"]:
            if keyword in text:
                return {"name": name, "procedures": profile["procedures"]}
    return None


def calculate_score(sanatorium: dict, prefs: dict):
    score = 0.0
    max_score = 0.0
    reasons = []

    required = prefs.get("procedures") or []
    if required:
        max_score += 40
        matched = [p for p in required if p in sanatorium.get("procedures", [])]
        score += (len(matched) / len(required)) * 40
        if matched:
            reasons.append(f"Есть {len(matched)} из {len(required)}: {', '.join(matched)}")

    required_ex = prefs.get("excursions") or []
    if required_ex:
        max_score += 20
        matched = [e for e in required_ex if e in sanatorium.get("excursions", [])]
        score += (len(matched) / len(required_ex)) * 20
        if matched:
            reasons.append(f"Есть {len(matched)} из {len(required_ex)} экскурсий")

    budget = prefs.get("budget")
    if budget:
        max_score += 20
        if sanatorium.get("price_per_day", 0) <= budget:
            score += 20
            reasons.append("Вписывается в бюджет")
        else:
            over = sanatorium["price_per_day"] - budget
            score += max(0, 20 - over / 100)

    max_dist = prefs.get("maxDistance")
    if max_dist:
        max_score += 10
        airport_dist = sanatorium.get("transport", {}).get("airport", 9999)
        if airport_dist <= max_dist:
            score += 10
            reasons.append("Удобная транспортная доступность")
        else:
            over = airport_dist - max_dist
            score += max(0, 10 - over / 10)

    if prefs.get("has_pool") is not None:
        max_score += 5
        if sanatorium.get("has_pool") == prefs["has_pool"]:
            score += 5
            if prefs["has_pool"]:
                reasons.append("Есть бассейн")

    if prefs.get("child_friendly") is not None:
        max_score += 5
        if sanatorium.get("child_friendly") == prefs["child_friendly"]:
            score += 5
            if prefs["child_friendly"]:
                reasons.append("Подходит для детей")

    max_score += 10
    score += (sanatorium.get("rating", 0) / 5) * 10

    final_score = (score / max_score) * 100 if max_score > 0 else 0

    return {"score": round(final_score), "reasons": reasons}