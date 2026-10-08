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
    rating: 4.9,
    founded: "1972",
    capacity: "480 мест",
    duration: "от 7 ночей",
    address: "г. Кисловодск, пр. Ленина, 45",
    phone: "+7 (87937) 4-12-05",
    email: "booking@plaza-kislovodsk.ru",
    website: "plaza-kislovodsk-official.ru",
    description: "Легендарная здравница в самом сердце Кисловодска, в 5 минутах от Нарзанной галереи. Специализируется на лечении ЖКТ, кардиологии и опорно-двигательного аппарата. Собственный питьевой бювет с четырьмя типами минеральной воды прямо на территории. Территория 12 гектаров реликтового парка с лечебными терренкурами.",
    medical: ["Заболевания ЖКТ", "Кардиология", "Опорно-двигательный аппарат", "Нервная система", "Гинекология"],
    features: ["Собственный бювет", "Открытый бассейн с нарзаном", "Терренкур 3 км", "Фитобар", "SPA-центр", "Кинотеатр"],
    gallery: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80"
    ],
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
    rating: 2.1,
    founded: "2026",
    capacity: "??",
    duration: "??",
    address: "г. Сочи, ул. Морская, д. ???",
    phone: "8-800-XXX-XX-XX",
    email: "info@lazurny-sochi.top",
    website: "lazurny-sochi-bronirovanie2026.top",
    description: "Филиал оздоровительного комплекса в Сочи. Доступны ванны и массаж.",
    medical: ["Профиль в разработке"],
    features: ["Бассейн", "Парковая зона"],
    gallery: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80"
    ],
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
    score: 94,
    tags: ["Грязи", "Массаж"],
    tours: ["Горы"],
    isScam: false,
    rating: 4.8,
    founded: "2008",
    capacity: "320 мест",
    duration: "от 5 ночей",
    address: "Алтайский край, г. Белокуриха, ул. Славского, 21",
    phone: "+7 (38577) 3-25-80",
    email: "welcome@altai-resort.ru",
    website: "belokuriha-resort.ru",
    description: "Современный эко-курорт в предгорьях Алтая с панорамным видом на гору Церковка. Уникальный микроклимат: воздух с ионами серебра, слаборадоновые источники. Основной профиль — лечение сердечно-сосудистой системы, эндокринологии и заболеваний кожи. Собственная сыроварня и фермерская кухня.",
    medical: ["Кардиология", "Эндокринология", "Дерматология", "Пульмонология", "Стресс и бессонница"],
    features: ["Горный терренкур", "Соляная пещера", "Фитобочка", "Кедровая фитосауна", "Лыжная трасса зимой", "Прогулки с алпака"],
    gallery: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80"
    ],
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
    rating: 4.7,
    founded: "1954",
    capacity: "600 мест",
    duration: "от 10 ночей",
    address: "г. Пятигорск, ул. Крайнего, 14",
    phone: "+7 (8793) 33-21-77",
    email: "san@pyatigorye.ru",
    website: "pyatigorsk-terrenkur-san.ru",
    description: "Одна из старейших профсоюзных здравниц Кавминвод. Расположена на склоне горы Машук, рядом с озером Провал и Лермонтовскими местами. Специализация — лечение гинекологии, мочеполовой системы и заболеваний суставов. Применяются тамбуканские грязи и радоновые воды Пятигорского месторождения.",
    medical: ["Гинекология", "Урология", "Артрология", "Ревматология", "Гастроэнтерология"],
    features: ["Радоновые ванны", "Тамбуканские грязи", "Ингаляторий", "Лечебный бассейн", "Терренкур к Провалу"],
    gallery: [
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80"
    ],
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

let currentProfileId = null;

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
      <div class="p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div class="text-4xl mb-2">🏖</div>
        <div class="font-bold text-slate-800">Ничего не найдено по этим параметрам</div>
        <div class="text-xs text-slate-500 mt-1">Попробуйте увеличить дневной прайс или выбрать «Есть минералка».</div>
      </div>
    `;
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'san-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm backdrop-blur';
    card.onclick = () => openProfile(item.id);
    card.innerHTML = `
      <div class="flex flex-col md:flex-row justify-between gap-4">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <h3 class="text-lg font-black text-slate-900 hover:text-pink-600 transition">${item.name}</h3>
          </div>

          <div class="text-xs text-slate-500 mb-3">📍 ${item.region}, ${item.city} • ⏱ ${item.transit}</div>

          <div class="flex flex-wrap gap-1.5 mb-2">
            ${item.tags.map(t => `<span class="px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium">${t}</span>`).join('')}
            ${item.tours.map(t => `<span class="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium">${t}</span>`).join('')}
          </div>

          <div class="text-[11px] text-pink-600 mt-3 font-bold">
            👉 Нажми на карточку, чтобы открыть профиль
          </div>
        </div>

        <div class="flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
          <div class="text-right">
            <div class="text-2xl font-black text-sky-600">${item.score}%</div>
            <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Индекс соответствия</div>
          </div>

          <div class="text-right my-2">
            <div class="text-xl font-black text-slate-900">${item.price.toLocaleString()} ₽</div>
            <div class="text-[11px] text-slate-400">сутки (проживание + процедуры)</div>
          </div>

          <div class="flex flex-col gap-2 w-full" onclick="event.stopPropagation()">
            <button onclick="openRoutine(${item.id})" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">
              График дня
            </button>
            <button class="w-full py-2 bg-gradient-to-r from-pink-500 to-sky-500 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition">
              Забронировать
            </button>
          </div>
        </div>
      </div>
    `;
    feed.appendChild(card);
  });
}

function openProfile(id) {
  const item = sanatoriums.find(s => s.id === id);
  if (!item) return;
  currentProfileId = id;

  document.getElementById('profPhoto1').src = item.gallery[0];
  document.getElementById('profPhoto2').src = item.gallery[1];
  document.getElementById('profPhoto3').src = item.gallery[2];

  document.getElementById('profName').textContent = item.name;

  const badge = document.getElementById('profBadge');
  badge.textContent = "Проверенный партнер";
  badge.className = 'text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';

  document.getElementById('profLocation').textContent = `${item.region}, ${item.city}`;
  document.getElementById('profTransit').textContent = item.transit;
  document.getElementById('profFounded').textContent = `🏛 Основан: ${item.founded}`;

  document.getElementById('profScore').textContent = item.score + '%';
  document.getElementById('profDescription').textContent = item.description;

  document.getElementById('profMedical').innerHTML = item.medical.map(m =>
    `<span class="px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium">${m}</span>`
  ).join('');

  document.getElementById('profFeatures').innerHTML = item.features.map(f =>
    `<span class="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium">${f}</span>`
  ).join('');

  document.getElementById('profAddress').textContent = item.address;
  document.getElementById('profPhone').textContent = item.phone;
  document.getElementById('profEmail').textContent = item.email;
  document.getElementById('profWebsite').textContent = item.website;

  const secBox = document.getElementById('profSecurityBox');
  secBox.className = 'p-4 rounded-2xl text-xs leading-relaxed bg-emerald-50 border border-emerald-200 text-emerald-800';
  secBox.innerHTML = `
    <div class="font-black mb-1 flex items-center gap-2">🛡 ВЕРИФИЦИРОВАННЫЙ ОБЪЕКТ</div>
    <p>Медицинская лицензия и прямое бронирование подтверждены через государственные реестры.</p>
  `;

  document.getElementById('profPrice').textContent = item.price.toLocaleString() + ' ₽';

  const btn = document.getElementById('profBookBtn');
  btn.textContent = 'Забронировать';
  btn.className = 'w-full py-3 bg-gradient-to-r from-pink-500 to-sky-500 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-md transition mb-2';
  btn.disabled = false;

  document.getElementById('profRating').textContent = '★ ' + item.rating;
  document.getElementById('profFoundedSide').textContent = item.founded;
  document.getElementById('profCapacity').textContent = item.capacity;
  document.getElementById('profDuration').textContent = item.duration;

  const modal = document.getElementById('profileModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  currentProfileId = null;
}

function openRoutine(id) {
  const item = sanatoriums.find(s => s.id === id);
  document.getElementById('routineTitle').textContent = `План дня: ${item.name}`;
  const list = document.getElementById('routineList');
  list.innerHTML = item.routine.map(r => `
    <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">${r}</div>
  `).join('');
  const modal = document.getElementById('routineModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function openRoutineFromProfile() {
  if (currentProfileId !== null) {
    openRoutine(currentProfileId);
  }
}

function closeRoutineModal() {
  const modal = document.getElementById('routineModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

document.getElementById('profileModal').addEventListener('click', (e) => {
  if (e.target.id === 'profileModal') closeProfileModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProfileModal();
    closeRoutineModal();
  }
});

function setVibe(type) {
  const reg = document.getElementById('regionSelect');
  const pr = document.getElementById('priceRange');

  if (type === 'shrimp') {
    reg.value = 'all';
    pr.value = 8500;
  } else if (type === 'monster') {
    reg.value = 'КМВ';
    pr.value = 8000;
  } else if (type === 'overload') {
    reg.value = 'Алтай';
    pr.value = 8500;
  }
  runFilter();
}

runFilter();