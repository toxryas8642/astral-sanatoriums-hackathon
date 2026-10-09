import { fetchMatch } from '../api.js';
import {
  adaptSanatorium,
  getVerdict,
  getRegionEmoji
} from '../adapter.js';
import { syncHeaderUser } from '../ui.js';
import { getUserPosition, addDistances } from '../geo.js';

const byId = id => document.getElementById(id);

let matchedSanatoriums = [];
let userPosition = null;
let requestNumber = 0;
let hasResults = false;

// Экранируем значения, попадающие в HTML карточек.
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
  element.textContent = message;
  element.classList.toggle('hidden', !message);
}

// В текущем HTML значения "Ванны" и "ЛФК"
// требуют приведения к названиям из backend/data/sanatoriums.json.
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

async function runFilter() {
  const currentRequest = ++requestNumber;

  const payload = {
    procedures: getSelectedProcedures(),
    excursions: Array.from(
      document.querySelectorAll('.f-tour:checked')
    ).map(checkbox => checkbox.value.toLowerCase()),
    budget: Number(byId('priceRange').value),
    include_all: true
  };

  showSearchStatus('Подбираем санатории…');
  byId('cardsFeed').setAttribute('aria-busy', 'true');

  try {
    const data = await fetchMatch(payload);

    // Более старый запрос не должен перезаписывать новый.
    if (currentRequest !== requestNumber) return;

    if (!Array.isArray(data.results)) {
      throw new Error('Сервер вернул некорректный список результатов.');
    }

    matchedSanatoriums = data.results.map(adaptSanatorium);
    hasResults = true;

    applyLocalFilters();
    showSearchStatus('');
  } catch (error) {
    if (currentRequest !== requestNumber) return;

    console.error(error);

    // Не выдаём старую подборку за результат новых настроек.
    matchedSanatoriums = [];
    hasResults = false;

    byId('cardsFeed').innerHTML = '';
    byId('countVal').textContent = '0';
    byId('noResults').classList.add('hidden');

    showSearchStatus(
      'Не удалось получить подборку. Проверьте, что backend запущен ' +
      'и адрес API в js/api.js указан правильно. ' +
      'После этого нажмите «Подобрать».'
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
    results = results.filter(s => s.region === region);
  }

  if (onlySafe) {
    results = results.filter(s => !s.isClone);
  }

  if (userPosition && distanceLimit !== 'all') {
    const limitKm = Number(distanceLimit);

    results = results.filter(s =>
      Number.isFinite(s.distanceKm) &&
      s.distanceKm <= limitKm
    );
  }

  const sortBy = byId('sortBy').value;

  if (sortBy === 'distance' && userPosition) {
    results.sort((a, b) => {
      const aKnown = Number.isFinite(a.distanceKm);
      const bKnown = Number.isFinite(b.distanceKm);

      // Объекты без координат помещаем в конец.
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
    results.sort(
      (a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)
    );
  }

  renderResults(results);
}

function getDistanceMarkup(sanatorium) {
  if (!userPosition) return '';

  if (!Number.isFinite(sanatorium.distanceKm)) {
    return `
      <p class="text-xs text-slate-500 mt-2">
        📍 Расстояние неизвестно: нет координат
      </p>
    `;
  }

  const km = Math.round(sanatorium.distanceKm)
    .toLocaleString('ru-RU');

  const label = sanatorium.distanceApproximate
    ? `≈ ${km} км до города · по прямой`
    : `≈ ${km} км от вас · по прямой`;

  return `
    <p class="text-xs font-semibold text-cyan-300 mt-2">
      📍 ${label}
    </p>
  `;
}

function renderResults(list) {
  const feed = byId('cardsFeed');
  const noResults = byId('noResults');

  byId('countVal').textContent = list.length;
  noResults.classList.toggle('hidden', list.length > 0);

  feed.innerHTML = list.map(s => {
    const verdict = getVerdict(s.trust);

    const procedures = s.procedures.slice(0, 3).map(p => `
      <span class="px-2 py-0.5 rounded-md bg-pink-950/60
                   border border-pink-800/50 text-pink-300 text-[10px]">
        ${escapeHtml(p)}
      </span>
    `).join('');

    const tours = s.tours.slice(0, 2).map(t => `
      <span class="px-2 py-0.5 rounded-md bg-cyan-950/60
                   border border-cyan-800/50 text-cyan-300 text-[10px]">
        ${escapeHtml(t)}
      </span>
    `).join('');

    const cloneWarning = s.isClone
      ? `<div class="text-[11px] text-red-400 font-bold mt-2">
           ⚠️ Возможный дубликат сайта
         </div>`
      : '';

    const price = Number(s.price).toLocaleString('ru-RU');

    return `
      <a
        href="sanatorium.html?id=${encodeURIComponent(s.id)}"
        class="block bg-slate-900/90 border border-slate-800
               rounded-3xl p-5 hover:border-purple-500/50
               hover:shadow-2xl hover:shadow-purple-500/10 transition"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">${getRegionEmoji(s.region)}</span>
              <span class="text-[10px] uppercase tracking-wider
                           text-slate-500 font-bold">
                ${escapeHtml(s.region)} · ${escapeHtml(s.city)}
              </span>
            </div>

            <h3 class="font-black text-white break-words">
              ${escapeHtml(s.name)}
            </h3>

            <p class="text-xs text-slate-400 mt-1">
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
            <div class="text-2xl font-black text-cyan-400">
              ${escapeHtml(s.matchScore ?? '—')}%
            </div>

            <div class="text-[10px] text-slate-500 uppercase font-bold">
              Соответствие
            </div>

            <div class="text-lg font-black text-pink-400 mt-2">
              ${price} ₽
            </div>

            <div class="text-[10px] text-slate-500">
              за сутки
            </div>

            <div class="${verdict.bg} ${verdict.border} ${verdict.text}
                        border px-2 py-1 rounded-full text-[10px]
                        font-bold inline-flex items-center gap-1 mt-2">
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

  byId('distanceLimit').disabled = !enabled;
  byId('distanceSortOption').disabled = !enabled;
  byId('clearLocationBtn').classList.toggle('hidden', !enabled);
}

async function detectLocation() {
  const button = byId('detectLocationBtn');

  button.disabled = true;
  button.textContent = 'Определяем…';
  byId('locationStatus').textContent =
    'Ожидаем координаты. Если браузер спросит — разрешите доступ.';

  try {
    userPosition = await getUserPosition();

    const accuracyKm = userPosition.accuracy / 1000;
    const accuracy = accuracyKm >= 1
      ? `${accuracyKm.toLocaleString('ru-RU', {
          maximumFractionDigits: 1
        })} км`
      : `${Math.round(userPosition.accuracy)} м`;

    byId('locationStatus').textContent =
      `Местоположение определено. ` +
      `Заявленная браузером точность: около ${accuracy}.`;

    updateLocationControls();

    byId('sortBy').value = 'distance';
    applyLocalFilters();
  } catch (error) {
    byId('locationStatus').textContent =
      error.message +
      (userPosition ? ' Используется предыдущая позиция.' : '');
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

  byId('locationStatus').textContent =
    'Разрешите геолокацию, чтобы увидеть расстояния.';
  byId('detectLocationBtn').textContent =
    'Определить местоположение';

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

  // Позицию сохраняем; убрать её можно отдельной кнопкой.
  runFilter();
}

// Эти функции вызываются через onclick в существующем HTML.
window.runFilter = runFilter;
window.resetFilters = resetFilters;

byId('priceRange').addEventListener('input', event => {
  byId('priceLabel').textContent =
    Number(event.target.value).toLocaleString('ru-RU') + ' ₽';
});

byId('priceRange').addEventListener('change', runFilter);

document.querySelectorAll('.f-proc, .f-tour').forEach(checkbox => {
  checkbox.addEventListener('change', runFilter);
});

// Эти настройки применяем к уже полученной подборке.
byId('regionSelect').addEventListener('change', applyLocalFilters);
byId('sortBy').addEventListener('change', applyLocalFilters);
byId('onlySafeCheck').addEventListener('change', applyLocalFilters);
byId('distanceLimit').addEventListener('change', applyLocalFilters);

byId('detectLocationBtn').addEventListener('click', detectLocation);
byId('clearLocationBtn').addEventListener('click', clearLocation);

syncHeaderUser();
updateLocationControls();
runFilter();