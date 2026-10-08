const sanatoriums = [
  {
    id: 1,
    name: "Санаторий «Плаза Кисловодск»",
    region: "КМВ",
    city: "Кисловодск",
    price: 7200,
    transit: "35 мин от вокзала",
    score: 98,
    tags: ["Грязи", "Ванны"],
    tours: ["Горы"],
    isScam: false,
    desc: "Аккредитованный санаторный комплекс. Минеральные источники, бальнеология и парковая зона.",
    routine: [
      "08:00 – 08:30 — Приём минеральных вод в бювете",
      "08:30 – 09:30 — Завтрак по диетическому меню",
      "10:00 – 12:00 — Блок бальнеологических процедур и грязелечения",
      "13:00 – 14:00 — Обед и послепроцедурный отдых",
      "15:00 – 18:00 — Пешая прогулка по горному терренкуру",
      "19:00 – 20:00 — Ужин и климатотерапия"
    ]
  },
  {
    id: 2,
    name: "«Лазурный Бриз» (Сочи)",
    region: "Сочи",
    city: "Сочи",
    price: 7900,
    transit: "20 мин от аэропорта",
    score: 15,
    tags: ["Ванны", "Массаж"],
    tours: ["Водопады"],
    isScam: true,
    desc: "",
    routine: []
  },
  {
    id: 3,
    name: "Эко-Курорт «Алтай Резорт»",
    region: "Алтай",
    city: "Белокуриха",
    price: 6800,
    transit: "90 мин от аэропорта Горно-Алтайска",
    score: 94,
    tags: ["Грязи", "Массаж"],
    tours: ["Горы"],
    isScam: false,
    desc: "Комплекс в предгорьях Алтая. Бассейн, фитобочки и экологические маршруты.",
    routine: [
      "08:00 – 08:45 — Утренняя лечебная гимнастика (ЛФК)",
      "09:00 – 10:00 — Завтрак",
      "10:30 – 12:30 — Сеанс лечебного массажа и фитобочка",
      "13:00 – 14:00 — Обед",
      "14:30 – 17:30 — Экскурсионный подъем на гору Церковка",
      "18:30 – 19:30 — Ужин и спелеотерапия"
    ]
  },
  {
    id: 4,
    name: "Здравница «Пятигорье»",
    region: "КМВ",
    city: "Пятигорск",
    price: 5400,
    transit: "25 мин от ЖД вокзала",
    score: 89,
    tags: ["Грязи", "Ванны"],
    tours: ["Горы"],
    isScam: false,
    desc: "Классический санаторий у подножия Машука с собственной грязелечебницей.",
    routine: [
      "08:15 – 08:45 — Минеральный источник №4",
      "09:00 – 09:45 — Завтрак",
      "10:00 – 12:30 — Радоновые ванны и тамбуканские аппликации",
      "13:00 – 14:00 — Обед",
      "15:00 – 18:00 — Экскурсия к озеру Провал и горе Машук",
      "19:00 – 20:00 — Ужин"
    ]
  }
];

function runFilter() {
  const maxP = Number(document.getElementById('priceRange').value);
  document.getElementById('priceLabel').textContent = `${maxP.toLocaleString()} ₽`;

  const reg = document.getElementById('regionSelect').value;

  const checkedProcs = Array.from(document.querySelectorAll('#procBox input:checked')).map(c => c.value);
  const checkedTours = Array.from(document.querySelectorAll('#tourBox input:checked')).map(c => c.value);

  const filtered = sanatoriums.filter(item => {
    if (item.isScam) return false;
    if (item.price > maxP) return false;
    if (reg !== 'all' && item.region !== reg) return false;

    if (checkedProcs.length > 0) {
      const hasProc = item.tags.some(t => checkedProcs.includes(t));
      if (!hasProc) return false;
    }

    if (checkedTours.length > 0) {
      const hasTour = item.tours.some(t => checkedTours.includes(t));
      if (!hasTour) return false;
    }

    return true;
  });

  document.getElementById('countVal').textContent = filtered.length;
  renderCards(filtered);
}

function renderCards(list) {
  const feed = document.getElementById('cardsFeed');
  feed.innerHTML = '';

  if (list.length === 0) {
    feed.innerHTML = `
      <div class="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
        <div class="text-4xl mb-2">🏖</div>
        <div class="font-bold text-slate-200">Ничего не найдено по этим параметрам</div>
        <div class="text-xs text-slate-500 mt-1">Попробуйте увеличить дневной прайс или выбрать «Есть минералка».</div>
      </div>
    `;
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur';
    card.innerHTML = `
      <div class="flex flex-col md:flex-row justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h3 class="text-lg font-black text-white">${item.name}</h3>
          </div>

          <div class="text-xs text-slate-400 mb-3">📍 ${item.region}, ${item.city} • ⏱ ${item.transit}</div>

          <div class="flex flex-wrap gap-1.5 mb-3">
            ${item.tags.map(t => `<span class="px-2.5 py-1 rounded-xl bg-pink-950/40 border border-pink-800/40 text-pink-300 text-xs font-medium">${t}</span>`).join('')}
            ${item.tours.map(t => `<span class="px-2.5 py-1 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs font-medium">${t}</span>`).join('')}
          </div>

          <p class="text-xs text-slate-400 leading-relaxed">${item.desc}</p>
        </div>

        <div class="flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
          <div class="text-right">
            <div class="text-2xl font-black text-cyan-400">${item.score}%</div>
            <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Индекс соответствия</div>
          </div>

          <div class="text-right my-2">
            <div class="text-xl font-black text-white">${item.price.toLocaleString()} ₽</div>
            <div class="text-[11px] text-slate-400">сутки (проживание + процедуры)</div>
          </div>

          <div class="flex flex-col gap-2 w-full">
            <button onclick="openRoutine(${item.id})" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition">
              График дня
            </button>
            <button class="w-full py-2 bg-gradient-to-r from-pink-500 to-cyan-500 text-white text-xs font-black rounded-xl shadow-lg transition">
              Забронировать
            </button>
          </div>
        </div>
      </div>
    `;
    feed.appendChild(card);
  });
}

function openRoutine(id) {
  const item = sanatoriums.find(s => s.id === id);
  document.getElementById('routineTitle').textContent = `План дня: ${item.name}`;
  const list = document.getElementById('routineList');
  list.innerHTML = item.routine.map(r => `
    <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">${r}</div>
  `).join('');
  document.getElementById('routineModal').classList.remove('hidden');
}

function closeRoutineModal() {
  document.getElementById('routineModal').classList.add('hidden');
}

function toggleProfileModal() {
  document.getElementById('profileModal').classList.toggle('hidden');
}

function setVibe(type) {
  const reg = document.getElementById('regionSelect');
  const pr = document.getElementById('priceRange');
  const diag = document.getElementById('userDiag');

  if (type === 'shrimp') {
    reg.value = 'all';
    pr.value = 8500;
    diag.textContent = 'Спина креветки';
  } else if (type === 'monster') {
    reg.value = 'КМВ';
    pr.value = 8000;
    diag.textContent = 'ЖКТ на энергетиках';
  } else if (type === 'overload') {
    reg.value = 'Алтай';
    pr.value = 8500;
    diag.textContent = 'Сенсорный оверлоад';
  }
  runFilter();
}

runFilter();