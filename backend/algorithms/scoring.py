import re

MEDICAL_PROFILES = {
    "опорно-двигательный": {
        "procedures": ["грязи", "ЛФК", "мануальная терапия", "минеральные ванны", "массаж"],
        "keywords": [
            "спина", "спине", "спину", "спиной", "спинной", "позвоночник", "позвоночнике",
            "поясниц", "пояснице", "поясницу", "шея", "шее", "шеи", "шею", "сустав", "суставы",
            "суставах", "артрит", "артроз", "остеохондроз", "грыжа", "радикулит", "сколиоз",
            "осанка", "колено", "колени", "коленях", "коленка", "плечо", "плече", "рука",
            "руке", "нога", "ноге", "хруст", "заклинило", "прострелило", "разогнуться",
            "согнуться", "не могу разогнуться", "не могу согнуться", "спина колесом",
            "сидячая работа", "болит спина", "болит шея", "болит колено", "болит поясница",
            "больно сидеть", "больно ходить", "не повернуть голову", "тяжело вставать"
        ],
        "semantic_hint": (
            "Болит спина, шея, поясница, колени, суставы. Тяжело разогнуться, согнуться, "
            "повернуть голову. Сидячая работа, офис, компьютер. Хруст, прострелы, заклинило. "
            "Плохая осанка, сколиоз, грыжа. Не могу долго стоять или сидеть."
        )
    },
    "сердечно-сосудистый": {
        "procedures": ["кардиотренировки", "кислородные коктейли", "терренкур", "минеральные ванны"],
        "keywords": [
            "сердце", "сердца", "сердцу", "сердечный", "сердечно", "сосудистый", "сосуды",
            "сосудах", "давление", "гипертония", "гипотония", "аритмия", "тахикардия",
            "брадикардия", "холестерин", "инфаркт", "инсульт", "стенокардия", "одышка",
            "задыхаюсь", "болит в груди", "колет в груди", "перебои в сердце"
        ],
        "semantic_hint": (
            "Проблемы с сердцем, давлением, сосудами. Одышка, тяжело дышать. Высокое или "
            "низкое давление. Болит или колет в груди. Плохая кардиограмма. Перебои в сердце. "
            "Нехватка воздуха при нагрузке."
        )
    },
    "дыхательный": {
        "procedures": ["ингаляции", "спелеотерапия", "климатотерапия"],
        "keywords": [
            "астма", "астме", "бронхит", "бронхите", "лёгкие", "легкие", "лёгких", "легких",
            "кашель", "кашле", "пневмония", "туберкулёз", "туберкулез", "аллергия", "насморк",
            "заложен нос", "тяжело дышать", "не хватает воздуха", "курильщик", "бросить курить",
            "часто болею", "простуда", "постоянный кашель", "сухой кашель"
        ],
        "semantic_hint": (
            "Часто болею простудами, кашель, насморк. Астма, бронхит. Тяжело дышать, "
            "не хватает воздуха. Аллергия, заложен нос. Хронический кашель. Бронхиальная астма."
        )
    },
    "нервная система": {
        "procedures": ["психотерапия", "ароматерапия", "массаж", "релаксация"],
        "keywords": [
            "стресс", "стресса", "стрессе", "нервы", "нервах", "нервный", "бессонница",
            "бессонницей", "усталость", "устал", "устала", "выгорание", "выгорел", "депрессия",
            "депрессии", "тревога", "тревожность", "паника", "панические атаки",
            "раздражительность", "не могу спать", "не сплю", "переутомление", "перегрузка",
            "нервничаю", "всё бесит", "всё надоело", "нет мотивации", "апатия", "вымотан",
            "измотан", "не хочу ничего", "нет сил", "на грани", "сгорел на работе",
            "постоянная усталость", "хроническая усталость"
        ],
        "semantic_hint": (
            "Стресс, выгорание, депрессия, тревога. Не могу спать, бессонница. Постоянно "
            "нервничаю, раздражаюсь. Панические атаки. На грани, вымотан, не хочу ничего "
            "делать. Апатия, всё бесит, нет сил. Хочу тишины, покоя, уединения. Потерял "
            "интерес к жизни. Работа доводит до нервного истощения."
        )
    },
    "ЖКТ": {
        "procedures": ["минеральные воды", "диетотерапия", "грязи"],
        "keywords": [
            "желудок", "желудке", "желудка", "кишечник", "кишечнике", "кишечника", "жкт",
            "гастрит", "гастрите", "язва", "язве", "печень", "печени", "поджелудочная",
            "пищеварение", "пищеварении", "изжога", "тошнота", "вздутие", "запор", "диарея",
            "колит", "холецистит", "панкреатит", "отравление", "не переваривается",
            "болит живот", "болит желудок", "тяжесть в животе", "проблемы с животом"
        ],
        "semantic_hint": (
            "Болит живот, желудок, кишечник. Плохое пищеварение, изжога. Гастрит, язва, "
            "проблемы с печенью. Дискомфорт после еды. Тошнота, вздутие, запор, диарея."
        )
    },
    "Кожа": {
        "procedures": ["грязи", "минеральные ванны", "климатотерапия"],
        "keywords": [
            "псориаз", "псориазе", "экзема", "экземе", "дерматит", "дерматите", "кожа",
            "коже", "кожи", "угри", "акне", "прыщи", "сыпь", "зуд", "шелушение",
            "нейродермит", "красные пятна", "аллергическая сыпь", "чешется кожа",
            "шелушится кожа", "сухая кожа"
        ],
        "semantic_hint": (
            "Проблемы с кожей: сыпь, зуд, покраснения. Псориаз, экзема, дерматит. Угри, акне, "
            "шелушение. Кожа чешется, шелушится, покрывается пятнами."
        )
    },
    "Женское здоровье": {
        "procedures": ["грязи", "минеральные ванны", "психотерапия"],
        "keywords": [
            "гинекология", "гинекологии", "женское", "женского", "гормоны", "гормональный",
            "климакс", "менопауза", "цикл", "менструация", "беременность", "после родов",
            "эндометриоз", "миома", "поликистоз", "не могу забеременеть", "женское здоровье"
        ],
        "semantic_hint": (
            "Гинекологические проблемы. Нарушения цикла, гормональный фон. Климакс, "
            "планирование беременности. Женское здоровье."
        )
    },
    "Общее укрепление": {
        "procedures": ["ЛФК", "массаж", "терренкур", "ароматерапия", "климатотерапия"],
        "keywords": [
            "устал", "устала", "отдохнуть", "отдохну", "оздоровиться", "профилактика",
            "укрепление", "иммунитет", "иммунитета", "авитаминоз", "хочу в отпуск",
            "надо отдохнуть", "перезагрузка", "перезагрузиться", "восстановление",
            "поправить здоровье", "заняться собой", "релакс", "спа", "хочу отдохнуть",
            "устал от работы", "устал от города", "надоел город", "хочу к морю",
            "хочу на природу", "хочу сменить обстановку", "нужен отдых"
        ],
        "semantic_hint": (
            "Хочу отдохнуть, восстановиться, перезагрузиться. Устал от работы, от города, "
            "от суеты. Хочу сменить обстановку, побыть на природе. Профилактика, укрепление "
            "иммунитета. Хочу начать заботиться о себе. Нужен перерыв."
        )
    }
}


_ENDINGS = (
    "ами", "ями", "ах", "ях", "ой", "ей", "ую", "юю", "ий", "ый", "ая", "яя",
    "ое", "ее", "ые", "ие", "ов", "ев", "ам", "ям", "ом", "ем", "ой", "ей",
    "а", "я", "у", "ю", "о", "е", "ы", "и", "ь"
)


def _stem(word: str) -> str:
    word = word.lower()
    for end in _ENDINGS:
        if word.endswith(end) and len(word) - len(end) >= 4:
            return word[: -len(end)]
    return word


def _tokenize(text: str):
    text = text.lower()
    text = re.sub(r"[^а-яёa-z0-9\s]", " ", text)
    return [_stem(w) for w in text.split() if w]


def _levenshtein(a: str, b: str) -> int:
    if len(a) < len(b):
        a, b = b, a
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a):
        curr = [i + 1]
        for j, cb in enumerate(b):
            curr.append(min(
                prev[j + 1] + 1,
                curr[j] + 1,
                prev[j] + (ca != cb)
            ))
        prev = curr
    return prev[-1]


def _fuzzy_match(word: str, keyword: str, threshold: float = 0.78) -> bool:
    if word == keyword:
        return True
    if not word or not keyword:
        return False
    if abs(len(word) - len(keyword)) > 3:
        return False
    dist = _levenshtein(word, keyword)
    max_len = max(len(word), len(keyword))
    return (1 - dist / max_len) >= threshold


def detect_profile_keywords(user_text: str):
    if not user_text:
        return None

    text_lower = user_text.lower()
    tokens = set(_tokenize(user_text))
    raw_words = [w for w in re.findall(r"[а-яёa-z]+", text_lower) if len(w) >= 4]

    best = None
    best_score = 0

    for name, profile in MEDICAL_PROFILES.items():
        score = 0
        for kw in profile["keywords"]:
            kw_lower = kw.lower()
            if " " in kw_lower:
                if kw_lower in text_lower:
                    score += 2
                continue
            kw_stem = _stem(kw_lower)
            if not kw_stem:
                continue
            matched = False
            for tok in tokens:
                if kw_stem == tok or kw_stem in tok:
                    matched = True
                    break
                if _fuzzy_match(kw_stem, tok):
                    matched = True
                    break
            if matched:
                score += 1
            else:
                for w in raw_words:
                    if _fuzzy_match(kw_lower, w):
                        score += 1
                        break

        if score > best_score:
            best_score = score
            best = {"name": name, "procedures": profile["procedures"]}

    return best if best_score > 0 else None


_model = None
_profile_embeddings = None
_profile_names = None


def _try_load_model():
    global _model, _profile_embeddings, _profile_names
    if _model is not None:
        return True

    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

        texts = []
        names = []
        for name, profile in MEDICAL_PROFILES.items():
            joined = (
                f"{name}. " +
                "Симптомы: " + ", ".join(profile["keywords"]) + ". " +
                "Процедуры: " + ", ".join(profile["procedures"]) + ". " +
                (profile.get("semantic_hint") or "")
            )
            texts.append(joined)
            names.append(name)

        _profile_embeddings = _model.encode(texts, normalize_embeddings=True)
        _profile_names = names
        return True
    except Exception as e:
        print(f"[semantic] модель не загрузилась: {e}")
        return False


def _looks_like_real_text(text: str) -> bool:
    """Проверяет, что текст не мусор: есть хотя бы одно русское слово 3+ символов."""
    if not text:
        return False
    words = re.findall(r"[а-яё]{3,}", text.lower())
    return len(words) >= 1


def detect_profile_semantic(user_text: str, threshold: float = 0.32):
    if not user_text or not _try_load_model():
        return None

    if not _looks_like_real_text(user_text):
        return None

    try:
        import numpy as np
        user_emb = _model.encode([user_text], normalize_embeddings=True)[0]
        sims = np.dot(_profile_embeddings, user_emb)
        best_idx = int(np.argmax(sims))
        best_score = float(sims[best_idx])

        if best_score < threshold:
            return None

        name = _profile_names[best_idx]
        return {
            "name": name,
            "procedures": MEDICAL_PROFILES[name]["procedures"],
            "similarity": round(best_score, 3)
        }
    except Exception as e:
        print(f"[semantic] ошибка: {e}")
        return None


def detect_profile(user_text: str):
    if not user_text:
        return None

    by_kw = detect_profile_keywords(user_text)
    by_sem = detect_profile_semantic(user_text)

    if by_kw and by_sem:
        if by_kw["name"] == by_sem["name"]:
            by_kw["method"] = "keywords+semantic"
            by_kw["similarity"] = by_sem.get("similarity")
            return by_kw
        by_kw["method"] = "keywords"
        return by_kw

    if by_kw:
        by_kw["method"] = "keywords"
        return by_kw

    if by_sem:
        by_sem["method"] = "semantic"
        return by_sem

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