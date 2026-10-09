import { fetchSanatoriums, fetchMatch } from '../api.js';
import {
  adaptSanatorium,
  getVerdict,
  getRegionEmoji
} from '../adapter.js';
import {
  syncHeaderUser,
  getCurrentUser
} from '../ui.js';
import {
  getUserPosition,
  addDistances,
  getCityCoordinates
} from '../geo.js';
import { renderRating, renderCardImage } from '../card-media.js';

const byId = id => document.getElementById(id);

const API_URL = 'http://127.0.0.1:8000';

const PROFILE_TO_PROCEDURES = {
  'Опорно-двигательный': ['грязи', 'лфк', 'минеральные ванны', 'массаж'],
  'Сердечно-сосудистый': ['кардиотренировки', 'терренкур', 'минеральные ванны'],
  'Дыхательный': ['ингаляции', 'спелеотерапия', 'климатотерапия'],
  'Нервная система': ['психотерапия', 'ароматерапия', 'массаж'],
  'ЖКТ': ['минеральные воды', 'диетотерапия', 'грязи'],
  'Кожа': ['грязи', 'минеральные ванны', 'климатотерапия'],
  'Женское здоровье': ['грязи', 'минеральные ванны', 'психотерапия'],
  'Общее укрепление': ['лфк', 'массаж', 'терренкур', 'ароматерапия']
};

let matchedSanatoriums = [];
let userPosition = null;
let requestNumber = 0;
let hasResults = false;

syncHeaderUser();

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function showSearchStatus(message) {
  const element = byId('searchStatus');
  if (!element) return;
  element.textContent = message;
  element.classList.toggle('hidden', !message);
}

function getSelectedProcedures() {
  return Array.from(
    document.querySelectorAll('.f-proc:checked')
  ).map(checkbox => {
    const value = checkbox.value.trim().toLowerCase();
    if (value === 'ванны') return 'минеральные ванны';
    if (value === 'лфк') return 'ЛФК';
    return value;
  });
}

async function loadRegions() {
  const select = byId('regionSelect');
  if (!select) return;

  try {
    const res = await fetch(`${API_URL}/api/regions`);
    if (!res.ok) throw new Error('Не удалось загрузить регионы');
    const data = await res.json();

    if (!Array.isArray(data.regions)) return;

    select.innerHTML = '<option value="all">Все регионы</option>';

    data.regions.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      select.appendChild(option);
    });
  } catch (e) {
    console.error('loadRegions error:', e);
  }
}

function initUserPositionFromProfile() {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.city) return;

  const cityCoords = getCityCoordinates(currentUser.city);
  if (!cityCoords) return;

  userPosition = cityCoords;

  updateLocationControls();

  const status = byId('locationStatus');
  if (status) {
    status.textContent =
      `Сортировка «Сначала ближе» — по городу из профиля: ${currentUser.city}. ` +
      `Можно уточнить точное местоположение кнопкой выше.`;
  }

  const btn = byId('detectLocationBtn');
  if (btn) {
    btn.textContent = 'Определить точнее';
  }
}

function applyProfilePreferences() {
  const user = getCurrentUser();
  if (!user) return;

  if (user.budget && Number(user.budget) > 0) {
    const slider = byId('priceRange');
    if (slider) {
      slider.value = Math.min(Number(user.budget), 15000);
      byId('priceLabel').textContent =
        Number(slider.value).toLocaleString('ru-RU') + ' ₽';
    }
  }

  if (user.medical && PROFILE_TO_PROCEDURES[user.medical]) {
    const procs = PROFILE_TO_PROCEDURES[user.medical];

    document.querySelectorAll('.f-proc').forEach(checkbox => {
      const val = checkbox.value.trim().toLowerCase();
      checkbox.checked = procs.some(p => val.includes(p) || p.includes(val));
    });
  }

  if (Array.isArray(user.excursionPrefs) && user.excursionPrefs.length > 0) {
    document.querySelectorAll('.f-tour').forEach(checkbox => {
      checkbox.checked = user.excursionPrefs.includes(checkbox.value);
    });
  }

  const parts = [];
  if (user.medical && PROFILE_TO_PROCEDURES[user.medical]) {
    parts.push(user.medical);
  }
  if (user.budget && Number(user.budget) > 0) {
    parts.push(`бюджет до ${Number(user.budget).toLocaleString('ru-RU')} ₽`);
  }
  if (Array.isArray(user.excursionPrefs) && user.excursionPrefs.length > 0) {
    parts.push(`экскурсии: ${user.excursionPrefs.join(', ')}`);
  }

  if (parts.length > 0) {
    const status = byId('searchStatus');
    if (status) {
      status.textContent = `Учтены ваши предпочтения из профиля: ${parts.join('; ')}.`;
      status.classList.remove('hidden');
    }
  }
}

async function init() {
  const pendingText = sessionStorage.getItem('pendingProblemText');
  if (pendingText) {
    sessionStorage.removeItem('pendingProblemText');
    const input = byId('problemInput');
    if (input) input.value = pendingText;
  }

  await loadRegions();
  initUserPositionFromProfile();

  if (!pendingText) {
    applyProfilePreferences();
  }

  try {
    const raw = await fetchSanatoriums();
    window.__allSanatoriums = raw.map(adaptSanatorium);
    await runFilter(!!pendingText);
  } catch (e) {
    console.error(e);
    byId('cardsFeed').innerHTML = `
      <div class="text-center py-10">
        <video src="assets/sloth-v2.mp4" autoplay loop muted playsinline class="w-32 h-32 mx-auto object-contain"></video>
        <p class="text-sm text-[#6b5a45] mt-3">Бэкенд недоступен. Запустите uvicorn на порту 8000.</p>
      </div>`;
  }
}

async function runFilter(useText = false) {
  const currentRequest = ++requestNumber;

  const problemText = useText
    ? (byId('problemInput')?.value || '').trim()
    : '';

  if (useText && problemText) {
    document.querySelectorAll('.f-proc, .f-tour').forEach(cb => {
      cb.checked = false;
    });
  }

  const priceValue = Number(byId('priceRange').value);

  const payload = {
    procedures: getSelectedProcedures(),
    excursions: Array.from(
      document.querySelectorAll('.f-tour:checked')
    ).map(checkbox => checkbox.value.toLowerCase()),
    include_all: true
  };

  if (priceValue < 15000) {
    payload.budget = priceValue;
  }

  if (problemText) {
    payload.text = problemText;
  }

  byId('cardsFeed').setAttribute('aria-busy', 'true');

  try {
    const data = await fetchMatch(payload);

    if (currentRequest !== requestNumber) return;

    if (!Array.isArray(data.results)) {
      throw new Error('Сервер вернул некорректный список результатов.');
    }

    matchedSanatoriums = data.results.map(adaptSanatorium);
    hasResults = true;

    // Автоподстановка из текстового поиска
    if (problemText && Array.isArray(data.autoExcursions) && data.autoExcursions.length > 0) {
      document.querySelectorAll('.f-tour').forEach(checkbox => {
        const val = checkbox.value.trim().toLowerCase();
        checkbox.checked = data.autoExcursions.some(e => e === val);
      });
    }

    if (problemText && typeof data.autoBudget === 'number') {
      const slider = byId('priceRange');
      const label = byId('priceLabel');
      if (slider && Number(slider.value) >= 15000) {
        slider.value = Math.min(data.autoBudget, 15000);
        if (label) {
          label.textContent = Number(slider.value).toLocaleString('ru-RU') + ' ₽';
        }
      }
    }

    if (problemText && !data.detectedProfile) {
      showSearchStatus(
        'Мы не смогли точно определить профиль по описанию. ' +
        'Показываем популярные варианты — попробуйте описать иначе: ' +
        '«болит спина», «часто болею», «хочу отдохнуть».'
      );
    } else if (!problemText) {
      // оставляем плашку "учтены предпочтения", если она была
    } else {
      showSearchStatus('');
    }

    applyLocalFilters();
  } catch (error) {
    if (currentRequest !== requestNumber) return;
    console.error(error);

    matchedSanatoriums = [];
    hasResults = false;

    byId('cardsFeed').innerHTML = '';
    byId('countVal').textContent = '0';
    byId('noResults').classList.add('hidden');

    showSearchStatus(
      'Не удалось получить подборку. Проверьте, что backend запущен.'
    );
  } finally {
    if (currentRequest === requestNumber) {
      byId('cardsFeed').setAttribute('aria-busy', 'false');
    }
  }
}

function applyLocalFilters() {
  if (!hasResults) return;

  let results = addDistances(matchedSanatoriums, userPosition);

  const region = byId('regionSelect').value;
  const onlySafe = byId('onlySafeCheck').checked;
  const distanceLimit = byId('distanceLimit').value;

  if (region !== 'all') {
    results = results.filter(s =>
      s.regionFull === region || s.region === region
    );
  }

  if (onlySafe) {
    results = results.filter(s => !s.isClone);
  }

  if (userPosition && distanceLimit !== 'all') {
    const limitKm = Number(distanceLimit);
    results = results.filter(s =>
      Number.isFinite(s.distanceKm) && s.distanceKm <= limitKm
    );
  }

  const sortBy = byId('sortBy').value;

  if (sortBy === 'distance' && userPosition) {
    results.sort((a, b) => {
      const aKnown = Number.isFinite(a.distanceKm);
      const bKnown = Number.isFinite(b.distanceKm);
      if (aKnown !== bKnown) return aKnown ? -1 : 1;
      if (aKnown && a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      return (b.matchScore ?? 0) - (a.matchScore ?? 0);
    });
  } else if (sortBy === 'price-asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'trust') {
    results.sort((a, b) => b.trust - a.trust);
  } else {
    results.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
  }

  renderResults(results);
}

function getDistanceMarkup(sanatorium) {
  if (!userPosition) return '';
  if (!Number.isFinite(sanatorium.distanceKm)) {
    return `<p class="text-xs text-[#8a7a60] mt-2">📍 Расстояние неизвестно: нет координат</p>`;
  }
  const km = Math.round(sanatorium.distanceKm).toLocaleString('ru-RU');
  const label = sanatorium.distanceApproximate
    ? `≈ ${km} км до города · по прямой`
    : `≈ ${km} км от вас · по прямой`;
  return `<p class="text-xs font-semibold text-[#8a9a5b] mt-2">📍 ${label}</p>`;
}

function renderResults(list) {
  const feed = byId('cardsFeed');
  const noResults = byId('noResults');

  byId('countVal').textContent = list.length;
  noResults.classList.toggle('hidden', list.length > 0);

  feed.innerHTML = list.map(s => {
    const verdict = getVerdict(s.trust);

    const procedures = s.procedures.slice(0, 3).map(p => `
      <span class="px-2 py-0.5 rounded-md bg-[#c8d9b0] border border-[#b0c296] text-[#3d4a22] text-[10px]">
        ${escapeHtml(p)}
      </span>
    `).join('');

    const tours = s.tours.slice(0, 2).map(t => `
      <span class="px-2 py-0.5 rounded-md bg-[#f4d9cb] border border-[#e2b8a3] text-[#7a3f28] text-[10px]">
        ${escapeHtml(t)}
      </span>
    `).join('');

    const cloneWarning = s.isClone
      ? `<div class="text-[11px] text-[#a8442a] font-bold mt-2">⚠️ Возможный дубликат сайта</div>`
      : '';

    const price = Number(s.price).toLocaleString('ru-RU');

    return `
      <a
        href="sanatorium.html?id=${encodeURIComponent(s.id)}"
        class="block bg-white border border-[#e3d8bd] rounded-3xl p-5 hover:border-[#8a9a5b] hover:shadow-xl hover:shadow-[#c8d9b0]/40 transition"
      >
        ${renderCardImage(s)}

        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">${getRegionEmoji(s.region)}</span>
              <span class="text-[10px] uppercase tracking-wider text-[#8a7a60] font-bold">
                ${escapeHtml(s.region)} · ${escapeHtml(s.city)}
              </span>
            </div>

            <h3 class="font-black text-[#3d2817] break-words">
              ${escapeHtml(s.name)}
            </h3>

            <div class="mt-2">
              ${renderRating(s.rating)}
            </div>

            <p class="text-xs text-[#6b5a45] mt-1">
              ${escapeHtml(s.description)}
            </p>

            ${getDistanceMarkup(s)}

            <div class="flex flex-wrap gap-1.5 mt-2">
              ${procedures}
              ${tours}
            </div>

            ${cloneWarning}
          </div>

          <div class="text-right shrink-0">
            <div class="text-2xl font-black text-[#6b4226]">
              ${escapeHtml(s.matchScore ?? '—')}%
            </div>

            <div class="text-[10px] text-[#8a7a60] uppercase font-bold">
              Соответствие
            </div>

            <div class="text-lg font-black text-[#c97b5a] mt-2">
              ${price} ₽
            </div>

            <div class="text-[10px] text-[#8a7a60]">
              за сутки
            </div>

            <div class="${verdict.bg} ${verdict.border} ${verdict.text} border px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 mt-2">
              <i class="fa-solid ${verdict.icon}"></i>
              ${escapeHtml(s.trust)}
            </div>
          </div>
        </div>
      </a>
    `;
  }).join('');
}

function updateLocationControls() {
  const enabled = Boolean(userPosition);
  const dl = byId('distanceLimit');
  const dso = byId('distanceSortOption');
  const cl = byId('clearLocationBtn');
  if (dl) dl.disabled = !enabled;
  if (dso) dso.disabled = !enabled;
  if (cl) cl.classList.toggle('hidden', !enabled);
}

async function detectLocation() {
  const button = byId('detectLocationBtn');
  if (!button) return;

  button.disabled = true;
  button.textContent = 'Определяем…';
  byId('locationStatus').textContent =
    'Ожидаем координаты. Если браузер спросит — разрешите доступ.';

  try {
    userPosition = await getUserPosition();

    const accuracyKm = userPosition.accuracy / 1000;
    const accuracy = accuracyKm >= 1
      ? `${accuracyKm.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} км`
      : `${Math.round(userPosition.accuracy)} м`;

    byId('locationStatus').textContent =
      `Местоположение определено. Точность: около ${accuracy}.`;

    updateLocationControls();
    byId('sortBy').value = 'distance';
    applyLocalFilters();
  } catch (error) {
    byId('locationStatus').textContent =
      error.message + (userPosition ? ' Используется предыдущая позиция.' : '');
  } finally {
    button.disabled = false;
    button.textContent = userPosition
      ? 'Обновить местоположение'
      : 'Определить местоположение';
  }
}

function clearLocation() {
  userPosition = null;
  byId('distanceLimit').value = 'all';

  if (byId('sortBy').value === 'distance') {
    byId('sortBy').value = 'score';
  }

  const currentUser = getCurrentUser();
  const hasCity = currentUser && currentUser.city;

  byId('locationStatus').textContent = hasCity
    ? `Будет использован город из профиля: ${currentUser.city}. Нажмите ещё раз, чтобы очистить полностью.`
    : 'Разрешите геолокацию, чтобы увидеть расстояния.';

  byId('detectLocationBtn').textContent = hasCity
    ? `Определить точнее (сейчас ${currentUser.city})`
    : 'Определить местоположение';

  updateLocationControls();
  applyLocalFilters();
}

function resetFilters() {
  byId('priceRange').value = 15000;
  byId('priceLabel').textContent = '15 000 ₽';

  document.querySelectorAll('.f-proc, .f-tour').forEach(checkbox => {
    checkbox.checked = false;
  });

  byId('regionSelect').value = 'all';
  byId('onlySafeCheck').checked = false;
  byId('sortBy').value = 'score';
  byId('distanceLimit').value = 'all';

  const problemInput = byId('problemInput');
  if (problemInput) problemInput.value = '';

  showSearchStatus('');

  runFilter();
}

window.runFilter = runFilter;
window.resetFilters = resetFilters;

byId('priceRange').addEventListener('input', event => {
  byId('priceLabel').textContent =
    Number(event.target.value).toLocaleString('ru-RU') + ' ₽';
});

byId('priceRange').addEventListener('change', () => runFilter(false));

document.querySelectorAll('.f-proc, .f-tour').forEach(checkbox => {
  checkbox.addEventListener('change', () => runFilter(false));
});

byId('regionSelect').addEventListener('change', applyLocalFilters);
byId('sortBy').addEventListener('change', applyLocalFilters);
byId('onlySafeCheck').addEventListener('change', applyLocalFilters);

const dl = byId('distanceLimit');
if (dl) dl.addEventListener('change', applyLocalFilters);

const dlb = byId('detectLocationBtn');
if (dlb) dlb.addEventListener('click', detectLocation);

const clb = byId('clearLocationBtn');
if (clb) clb.addEventListener('click', clearLocation);

updateLocationControls();
init();