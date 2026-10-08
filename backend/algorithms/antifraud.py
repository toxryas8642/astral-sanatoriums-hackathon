# algorithms/antifraud.py

import re
from difflib import SequenceMatcher


def _normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[«»\"'\-]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def string_similarity(a: str, b: str) -> float:
    noise = ["санаторий", "санатория", "санатории", "спа", "spa", "resort"]

    def clean(s: str) -> str:
        s = _normalize(s)
        for word in noise:
            s = s.replace(word, "")
        return s.strip()

    a_clean = clean(a)
    b_clean = clean(b)

    if not a_clean or not b_clean:
        return 0.0

    return SequenceMatcher(None, a_clean, b_clean).ratio()


def _domain_base(site: str) -> str:
    if not site:
        return ""
    d = site.lower()
    d = d.replace("https://", "").replace("http://", "")
    d = d.replace("www.", "")
    d = d.split("/")[0]
    d = d.split(".")[0]
    return d


def similar_domains(site1: str, site2: str) -> bool:
    d1 = _domain_base(site1)
    d2 = _domain_base(site2)

    if not d1 or not d2 or d1 == d2:
        return False

    common = 0
    for i in range(min(len(d1), len(d2))):
        if d1[i] == d2[i]:
            common += 1
        else:
            break

    return common >= 8


def _calculate_risk(reasons: list) -> dict:
    score = 0
    if "Одинаковый ИНН" in reasons:
        score += 50
    if "Совпадают адрес и телефон" in reasons:
        score += 30
    elif "Одинаковый адрес, но разные телефоны" in reasons:
        score += 15
    if "Похожие домены" in reasons:
        score += 20
    for r in reasons:
        if r.startswith("Похожие названия"):
            score += 10
        elif r.startswith("Очень похожие названия"):
            score += 20

    score = min(score, 100)

    if score >= 70:
        level = "высокий"
    elif score >= 40:
        level = "средний"
    else:
        level = "низкий"

    return {"riskLevel": level, "riskScore": score}


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

            if similar_domains(s1.get("site", ""), s2.get("site", "")):
                reasons.append("Похожие домены")
                strong_match = True

            sim = string_similarity(s1.get("name", ""), s2.get("name", ""))
            if strong_match and sim > 0.5:
                reasons.append(f"Похожие названия ({round(sim * 100)}%)")
            elif sim > 0.85:
                reasons.append(f"Очень похожие названия ({round(sim * 100)}%)")

            if reasons:
                risk_info = _calculate_risk(reasons)
                suspicious.append({
                    "original": {
                        "id": s1["id"],
                        "name": s1["name"],
                        "site": s1.get("site"),
                        "address": s1.get("address"),
                        "phone": s1.get("phone"),
                    },
                    "candidate": {
                        "id": s2["id"],
                        "name": s2["name"],
                        "site": s2.get("site"),
                        "address": s2.get("address"),
                        "phone": s2.get("phone"),
                    },
                    "reasons": reasons,
                    "riskLevel": risk_info["riskLevel"],
                    "riskScore": risk_info["riskScore"],
                })

    suspicious.sort(key=lambda x: x["riskScore"], reverse=True)
    return suspicious


def group_duplicates(sanatoriums: list) -> list:
    dups = find_duplicates(sanatoriums)
    clusters = {}

    for d in dups:
        orig = d["original"]
        key = orig["id"]
        if key not in clusters:
            clusters[key] = {
                "original": orig,
                "candidates": [],
                "maxRiskScore": 0,
                "riskLevel": d["riskLevel"],
            }
        clusters[key]["candidates"].append({
            "id": d["candidate"]["id"],
            "name": d["candidate"]["name"],
            "site": d["candidate"]["site"],
            "reasons": d["reasons"],
            "riskLevel": d["riskLevel"],
            "riskScore": d["riskScore"],
        })
        if d["riskScore"] > clusters[key]["maxRiskScore"]:
            clusters[key]["maxRiskScore"] = d["riskScore"]
            clusters[key]["riskLevel"] = d["riskLevel"]

    result = list(clusters.values())
    result.sort(key=lambda x: x["maxRiskScore"], reverse=True)
    return result