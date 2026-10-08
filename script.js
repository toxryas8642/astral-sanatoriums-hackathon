const data = [
  {
    id: 1,
    name: "Санаторий «Плаза Кисловодск»",
    region: "КМВ",
    city: "Кисловодск",
    price: 7200,
    transit: "35 мин от вокзала",
    vibeScore: 98,
    tags: ["Грязи", "Ванны"],
    tours: ["Горы"],
    scam: false,
    scamTitle: "🛡 Официальный ресурс подтверждён",
    scamDesc: "Сайт верифицирован в ЕГРЮЛ (ИНН 2628012345). Прямое бронирование с фискальным чеком.",
    routine: [
      "08:00 – 08:30 — Приём минеральных вод в бювете по назначению врача",
      "08:30 – 09:30 — Завтрак по диетическому меню",
      "10:00 – 12:00 — Блок бальнеологических процедур и грязелечения",
      "13:00 – 14:00 — Обед и послепроцедурный отдых",
      "15:00 – 18:00 — Пешая экскурсия и прогулка по горному терренкуру",
      "19:00 – 20:00 — Ужин",
      "20:30 – 22:00 — Свободное вечернее время, климатотерапия"
    ]
  },
  {
    id: 2,
    name: "«Лазурный Бриз» (Сочи)",
    region: "Сочи",
    city: "Сочи",
    price: 7900,
    transit: "20 мин от аэропорта",
    vibeScore: 15,
    tags: ["Ванны", "Массаж"],
    tours: ["Водопады"],
    scam: true,
    scamTitle: "⚠️ Подозрительный ресурс / Клон",
    scamDesc: "Домен зарегистрирован недавно, реквизиты юридического лица отсутствуют, предлагается оплата переводом.",
    routine: [
      "08:30 — Завтрак",
      "10:00 — Бальнеотерапия",
      "14:00 — Экскурсия к водопадам"
    ]
  },
  {
    id: 3,
    name: "Эко-Курорт «Алтай Резорт»",
    region: "Алтай",
    city: "Белокуриха",
    price: 6800,
    transit: "90 мин от аэропорта Горно-Алтайска",
    vibeScore: 94,
    tags: ["Грязи", "Массаж"],
    tours: ["Горы"],
    scam: false,
    scamTitle: "🛡 Лицензия Минздрава подтверждена",
    scamDesc: "Аккредитованный санаторный комплекс в предгорьях Алтая.",
    routine: [
      "08:00 – 08:45 — Утренняя лечебная гимнастика (ЛФК) и фитобар",
      "09:00 – 10:00 — Завтрак",
      "10:30 – 12:30 — Сеанс лечебного массажа и фитобочка",
      "13:00 – 14:00 — Обед",
      "14:30 – 17:30 — Экскурсионный подъем на гору Церковка",
      "18:30 – 19:30 — Ужин",
      "20:00 – 21:30 — Отдых на территории, сеанс спелеотерапии"
    ]
  }
];

const priceRange = document.getElementById('priceRange');
const priceLabel = document.getElementById('priceLabel');
const regionSelect = document.getElementById('regionSelect');
const antiScamCheck = document.getElementById('antiScamCheck');
const cardsFeed = document.getElementById('cardsFeed');
const countVal = document.getElementById('countVal');
const routineModal = document.getElementById('routineModal');
const routineTitle = document.getElementById('routineTitle');
const routineList = document.getElementById('routineList');

function applyFilters() {
  const maxP = Number(priceRange.value);
  priceLabel.textContent = `${maxP.toLocaleString()} ₽`;

  const reg = regionSelect.value;
  const hideScam = antiScamCheck.checked;

  const filtered = data.filter(item => {
    if (item.price > maxP) return false;
    if (reg !== 'all' && item.region !== reg) return false;
    if (hideScam && item.scam) return false;
    return true;
  });

  countVal.textContent = filtered.length;
  render(filtered);
}

function render(list) {
  cardsFeed.innerHTML = '';

  if (list.length === 0) {
    cardsFeed.innerHTML = `
      <div class="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
        <div class="text-4xl mb-2">🏖</div>
        <div class="font-bold text-slate-200">Варианты по заданным параметрам не найдены</div>
        <div class="text-xs text-slate-500 mt-1">Попробуйте скорректировать бюджет или выбрать другой регион.</div>
      </div>
    `;
    return;
  }

  list.forEach(san => {
    const card = document.createElement('div');
    card.className = `p-6 rounded-3xl bg-slate-900/90 border ${san.scam ? 'border-red-500/60' : 'border-slate-800'} backdrop-blur`;
    card.innerHTML = `
      <div class="flex flex-col md:flex-row justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="text-lg font-black text-white">${san.name}</h3>
            <span class="text-xs px-2.5 py-0.5 rounded-full font-bold ${san.scam ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}">
              ${san.scamTitle}
            </span>
          </div>

          <div class="text-xs text-slate-400 mb-3">📍 ${san.region}, ${san.city} • ⏱ ${san.transit}</div>

          <div class="flex flex-wrap gap-1.5 mb-2">
            ${san.tags.map(t => `<span class="px-2.5 py-1 rounded-xl bg-pink-950/40 border border-pink-800/40 text-pink-300 text-xs font-medium">${t}</span>`).join('')}
            ${san.tours.map(t => `<span class="px-2.5 py-1 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-xs font-medium">${t}</span>`).join('')}
          </div>

          <div class="p-3 rounded-2xl ${san.scam ? 'bg-red-950/40 border border-red-800/80 text-red-200' : 'bg-slate-950 border border-slate-800 text-slate-300'} text-xs">
            ${san.scamDesc}
          </div>
        </div>

        <div class="flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
          <div class="text-right">
            <div class="text-2xl font-black ${san.scam ? 'text-red-400' : 'text-cyan-400'}">${san.vibeScore}%</div>
            <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Индекс соответствия</div>
          </div>

          <div class="text-right my-2">
            <div class="text-xl font-black text-white">${san.price.toLocaleString()} ₽</div>
            <div class="text-[11px] text-slate-400">сутки (проживание + лечение)</div>
          </div>

          <div class="flex flex-col gap-2 w-full">
            <button class="btn-routine w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition" data-id="${san.id}">
              График дня
            </button>
            <button class="w-full py-2 ${san.scam ? 'bg-red-600 text-white' : 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white'} text-xs font-black rounded-xl shadow-lg transition">
              ${san.scam ? 'Сайт заблокирован' : 'Перейти к бронированию'}
            </button>
          </div>
        </div>
      </div>
    `;
    cardsFeed.appendChild(card);
  });

  document.querySelectorAll('.btn-routine').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      openRoutine(id);
    });
  });
}

function openRoutine(id) {
  const item = data.find(d => d.id === id);
  routineTitle.textContent = item.name;
  routineList.innerHTML = item.routine.map(r => `
    <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">${r}</div>
  `).join('');
  routineModal.classList.remove('hidden');
}

function closeRoutineModal() {
  routineModal.classList.add('hidden');
}

function setVibe(type) {
  if (type === 'shrimp') {
    regionSelect.value = 'all';
    priceRange.value = 9000;
  } else if (type === 'monster') {
    regionSelect.value = 'КМВ';
    priceRange.value = 8000;
  } else if (type === 'overload') {
    regionSelect.value = 'Алтай';
  } else if (type === 'scam') {
    antiScamCheck.checked = false;
  }
  applyFilters();
}

priceRange.addEventListener('input', applyFilters);
regionSelect.addEventListener('change', applyFilters);
antiScamCheck.addEventListener('change', applyFilters);

document.querySelectorAll('#procBox input, #tourBox input').forEach(input => {
  input.addEventListener('change', applyFilters);
});

document.getElementById('btnVibeShrimp').addEventListener('click', () => setVibe('shrimp'));
document.getElementById('btnVibeMonster').addEventListener('click', () => setVibe('monster'));
document.getElementById('btnVibeOverload').addEventListener('click', () => setVibe('overload'));
document.getElementById('btnVibeScam').addEventListener('click', () => setVibe('scam'));

document.getElementById('closeRoutineBtn').addEventListener('click', closeRoutineModal);
document.getElementById('acceptVibeBtn').addEventListener('click', closeRoutineModal);

applyFilters();