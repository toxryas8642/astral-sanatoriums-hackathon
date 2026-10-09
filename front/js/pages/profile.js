import { syncHeaderUser } from '../ui.js';

const DEFAULT_USER = {
  name: 'Пользователь',
  email: '',
  city: 'Москва',
  budget: 8500,
  comfort: 'Стандарт+',
  medical: 'Общее укрепление',
  excursionPrefs: [],
  notifEmail: false,
  notifNew: false
};

const DEFAULT_SEARCHES = [];

function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getVerdict(trust) {
  if (trust >= 80) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Доверенный', icon: 'fa-shield-halved' };
  if (trust >= 60) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Осторожно', icon: 'fa-triangle-exclamation' };
  return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Риск', icon: 'fa-circle-xmark' };
}
function getRegionEmoji(region) {
  return { 'КМВ': '⛰️', 'Сочи': '🌴', 'Алтай': '🌲', 'Подмосковье': '🌳' }[region] || '📍';
}

let user = loadLS('user', DEFAULT_USER);
let favorites = loadLS('favorites', []);
let searches = loadLS('searches', DEFAULT_SEARCHES);

syncHeaderUser();

function renderUser() {
  document.getElementById('headerName').textContent = user.name || 'Профиль';
  document.getElementById('headerAvatar').textContent = (user.name || 'П').charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = user.name || 'Пользователь';
  document.getElementById('profileEmail').textContent = user.email || '—';
  document.getElementById('profileAvatar').textContent = (user.name || 'П').charAt(0).toUpperCase();

  document.getElementById('prefCity').textContent = user.city || '—';
  document.getElementById('prefBudget').textContent = user.budget ? 'до ' + (+user.budget).toLocaleString('ru-RU') + ' ₽' : '—';
  document.getElementById('prefComfort').textContent = user.comfort || '—';
  document.getElementById('prefMedical').textContent = user.medical || '—';
  document.getElementById('prefExcursion').textContent = (user.excursionPrefs || []).join(', ') || '—';

  document.getElementById('notifEmail').checked = !!user.notifEmail;
  document.getElementById('notifNew').checked = !!user.notifNew;
}

function renderFavorites() {
  const list = document.getElementById('favoritesList');
  const empty = document.getElementById('favoritesEmpty');
  list.innerHTML = '';

  if (!favorites.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  favorites.forEach(fav => {
    const v = getVerdict(fav.trust || 0);
    const emoji = getRegionEmoji(fav.region);

    const card = document.createElement('div');
    card.className = 'flex items-center gap-4 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 hover:border-purple-500/40 transition';
    card.innerHTML = `
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-600/20 border border-pink-500/20 flex items-center justify-center text-2xl flex-shrink-0">
        ${emoji}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-sm text-white truncate">${fav.name}</p>
        <p class="text-[11px] text-slate-500">${fav.region || ''} · ${fav.city || ''}</p>
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <span class="text-xs font-black text-pink-400">${(fav.price || 0).toLocaleString('ru-RU')} ₽/день</span>
          <span class="${v.bg} ${v.border} ${v.text} border px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
            <i class="fa-solid ${v.icon}"></i>${fav.trust || 0}/100
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <a href="sanatorium.html?id=${fav.id}" class="text-slate-400 hover:text-cyan-400 transition p-1" title="Открыть">
          <i class="fa-solid fa-arrow-up-right-from-square text-sm"></i>
        </a>
        <button data-remove-fav="${fav.id}" class="text-slate-500 hover:text-red-400 transition p-1" title="Удалить">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('[data-remove-fav]').forEach(btn => {
    btn.addEventListener('click', () => removeFavorite(+btn.dataset.removeFav));
  });
}

function renderSearches() {
  const list = document.getElementById('searchesList');
  const empty = document.getElementById('searchesEmpty');
  list.innerHTML = '';

  if (!searches.length) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  searches.forEach((s, idx) => {
    const card = document.createElement('div');
    card.className = 'flex items-center justify-between gap-3 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 hover:border-cyan-500/40 transition flex-wrap';
    card.innerHTML = `
      <div class="min-w-0 flex-1">
        <p class="font-bold text-sm text-white truncate">${s.name}</p>
        <p class="text-[11px] text-slate-400 mt-0.5 truncate">${s.params}</p>
        <p class="text-[10px] text-slate-600 mt-1">${s.date || ''}</p>
      </div>
      <div class="flex items-center gap-2">
        <button data-apply-search="${idx}" class="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-lg text-[11px] font-bold hover:bg-cyan-500/20 transition">
          <i class="fa-solid fa-rotate-right mr-1"></i>Повторить
        </button>
        <button data-remove-search="${idx}" class="text-slate-500 hover:text-red-400 transition p-1">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('[data-apply-search]').forEach(btn => {
    btn.addEventListener('click', () => { window.location.href = 'search.html'; });
  });
  list.querySelectorAll('[data-remove-search]').forEach(btn => {
    btn.addEventListener('click', () => removeSearch(+btn.dataset.removeSearch));
  });
}

function calculateHealth() {
  const checks = [
    { label: 'Имя и email', weight: 15, done: !!(user.name && user.email) },
    { label: 'Город вылета', weight: 15, done: !!(user.city && user.city.trim()) },
    { label: 'Бюджет указан', weight: 15, done: user.budget > 0 },
    { label: 'Профиль лечения', weight: 25, done: !!(user.medical && user.medical.trim()) },
    { label: 'Экскурсии выбраны', weight: 15, done: !!(user.excursionPrefs && user.excursionPrefs.length > 0) },
    { label: 'Есть избранное', weight: 15, done: favorites.length > 0 }
  ];
  const total = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
  return { total, checks };
}

function renderHealth() {
  const { total, checks } = calculateHealth();
  const circle = document.getElementById('healthCircle');
  const percent = document.getElementById('healthPercent');
  const status = document.getElementById('healthStatus');
  const hint = document.getElementById('healthHint');

  circle.setAttribute('stroke-dasharray', `${total} ${100 - total}`);
  percent.textContent = total + '%';

  let color, statusText, hintText;
  if (total >= 80) { color = '#10b981'; statusText = 'Отличный профиль'; hintText = 'Рекомендации максимально точные'; }
  else if (total >= 50) { color = '#f59e0b'; statusText = 'Почти готово'; hintText = 'Дополните данные для лучшего подбора'; }
  else { color = '#ec4899'; statusText = 'Профиль пустой'; hintText = 'Заполните данные — подбор станет точнее'; }

  circle.setAttribute('stroke', color);
  status.textContent = statusText;
  hint.textContent = hintText;

  const list = document.getElementById('healthChecklist');
  list.innerHTML = '';
  checks.forEach(c => {
    const li = document.createElement('li');
    li.className = 'flex items-center gap-2';
    li.innerHTML = `
      <i class="fa-solid ${c.done ? 'fa-circle-check text-pink-400' : 'fa-circle text-slate-700'} w-4 text-xs"></i>
      <span class="${c.done ? 'text-slate-200' : 'text-slate-500'} flex-1">${c.label}</span>
      <span class="text-[10px] ${c.done ? 'text-cyan-400 font-bold' : 'text-slate-600'}">${c.weight}%</span>
    `;
    list.appendChild(li);
  });
}

function removeFavorite(id) {
  favorites = favorites.filter(f => f.id !== id);
  saveLS('favorites', favorites);
  renderFavorites();
  renderHealth();
}
function removeSearch(idx) {
  searches.splice(idx, 1);
  saveLS('searches', searches);
  renderSearches();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('tab-active');
      b.classList.add('tab-inactive');
    });
    btn.classList.add('tab-active');
    btn.classList.remove('tab-inactive');

    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById('tab-' + btn.dataset.tab).classList.remove('hidden');
  });
});

function openEditProfile() {
  document.getElementById('inputName').value = user.name || '';
  document.getElementById('inputEmail').value = user.email || '';
  const modal = document.getElementById('editProfileModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
function closeEditProfile() {
  const modal = document.getElementById('editProfileModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}
function saveProfile() {
  user.name = document.getElementById('inputName').value.trim() || 'Пользователь';
  user.email = document.getElementById('inputEmail').value.trim();
  saveLS('user', user);
  renderUser();
  renderHealth();
  closeEditProfile();
}

function openEditPrefs() {
  document.getElementById('inputPrefCity').value = user.city || '';
  const budgetInput = document.getElementById('inputPrefBudget');
  budgetInput.value = user.budget || 8500;
  document.getElementById('prefBudgetLabel').textContent = (+user.budget || 8500).toLocaleString('ru-RU');
  document.getElementById('inputPrefComfort').value = user.comfort || 'Стандарт+';
  document.getElementById('inputPrefMedical').value = user.medical || 'Общее укрепление';

  document.querySelectorAll('.pref-excursion').forEach(cb => {
    cb.checked = user.excursionPrefs && user.excursionPrefs.includes(cb.value);
  });

  const modal = document.getElementById('editPrefsModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
function closeEditPrefs() {
  const modal = document.getElementById('editPrefsModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}
function savePrefs() {
  user.city = document.getElementById('inputPrefCity').value.trim();
  user.budget = parseInt(document.getElementById('inputPrefBudget').value) || 0;
  user.comfort = document.getElementById('inputPrefComfort').value;
  user.medical = document.getElementById('inputPrefMedical').value;
  user.excursionPrefs = Array.from(document.querySelectorAll('.pref-excursion:checked')).map(cb => cb.value);

  saveLS('user', user);
  renderUser();
  renderHealth();
  closeEditPrefs();
}

function clearAllData() {
  if (confirm('Удалить все данные? Это действие нельзя отменить.')) {
    localStorage.clear();
    location.reload();
  }
}

window.openEditProfile = openEditProfile;
window.closeEditProfile = closeEditProfile;
window.saveProfile = saveProfile;
window.openEditPrefs = openEditPrefs;
window.closeEditPrefs = closeEditPrefs;
window.savePrefs = savePrefs;
window.clearAllData = clearAllData;

document.getElementById('inputPrefBudget').addEventListener('input', e => {
  document.getElementById('prefBudgetLabel').textContent = (+e.target.value).toLocaleString('ru-RU');
});

document.getElementById('notifEmail').addEventListener('change', e => {
  user.notifEmail = e.target.checked;
  saveLS('user', user);
});
document.getElementById('notifNew').addEventListener('change', e => {
  user.notifNew = e.target.checked;
  saveLS('user', user);
});

renderUser();
renderFavorites();
renderSearches();
renderHealth();