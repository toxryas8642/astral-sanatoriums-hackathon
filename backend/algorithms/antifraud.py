# algorithms/antifraud.py

from difflib import SequenceMatcher

import re

def string_similarity(a: str, b: str) -> float:
    """Схожесть строк 0..1, игнорируя служебные слова."""
    noise = ["санаторий", "санатория", "санатории", "спа", "spa", "resort"]
    
    def clean(s):
        s = s.lower()
        s = re.sub(r"[«»\"'\-]", "", s)
        for word in noise:
            s = s.replace(word, "")
        return s.strip()
    
    a = clean(a)
    b = clean(b)
    
    if not a or not b:
        return 0.0
    
    return SequenceMatcher(None, a, b).ratio()

def find_duplicates(sanatoriums: list) -> list:
    suspicious = []

    for i in range(len(sanatoriums)):
        for j in range(i + 1, len(sanatoriums)):
            s1 = sanatoriums[i]
            s2 = sanatoriums[j]
            reasons = []
            strong_match = False

            if s1.get("inn") and s1["inn"] == s2.get("inn"):
                reasons.append("Одинаковый ИНН")
                strong_match = True

            if s1.get("address") == s2.get("address") and s1.get("phone") == s2.get("phone"):
                reasons.append("Совпадают адрес и телефон")
                strong_match = True
            elif s1.get("address") == s2.get("address"):
                reasons.append("Одинаковый адрес, но разные телефоны")
                strong_match = True

            sim = string_similarity(s1.get("name", ""), s2.get("name", ""))
            if strong_match and sim > 0.5:
                reasons.append(f"Похожие названия ({round(sim * 100)}%)")
            elif sim > 0.85:
                reasons.append(f"Очень похожие названия ({round(sim * 100)}%)")

            if reasons:
                risk = "высокий" if "Одинаковый ИНН" in reasons else (
                        "средний" if "Совпадают адрес и телефон" in reasons else "низкий")
                suspicious.append({
                    "original": {"id": s1["id"], "name": s1["name"], "site": s1.get("site")},
                    "candidate": {"id": s2["id"], "name": s2["name"], "site": s2.get("site")},
                    "reasons": reasons,
                    "riskLevel": risk
                })

    return suspicious