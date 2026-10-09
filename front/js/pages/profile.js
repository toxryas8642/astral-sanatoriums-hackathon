import {
  syncHeaderUser,
  getCurrentUser,
  logoutUser,
  loadFavorites,
  saveFavorites,
  openAuthModal
} from '../ui.js';

syncHeaderUser();

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
  } catch { return fallback; }
}
function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getVerdict(trust) {
  if (trust >= 80) return { bg: 'bg-[#c8d9b0]', border: 'border-[#8a9a5b]', text: 'text-[#3d4a22]', label: 'Доверенный', icon: 'fa-shield-halved' };
  if (trust >= 60) return { bg: 'bg-[#f4d9cb]', border: 'border-[#e2b8a3]', text: 'text-[#7a3f28]', label: 'Осторожно', icon: 'fa-triangle-exclamation' };
  return { bg: 'bg-[#f4d9cb]', border: 'border-[#c97b5a]', text: 'text-[#7a1f1f]', label: 'Риск', icon: 'fa-circle-xmark' };
}
function getRegionEmoji(region) {
  return { 'КМВ': '⛰️', 'Сочи': '🌴', 'Алтай': '🌲', 'Подмосковье': '🌳' }[region] || '📍';
}

const current = getCurrentUser();

// Если пользователь не авторизован — открываем модалку входа.
if (!current) {
  openAuthModal('login').then(user => {
    if (user) location.reload();
    else location.href = 'index.html';
  });
}

let user = Object.assign({}, DEFAULT_USER, current || {});
let favorites = current ? loadFavorites() : [];
let searches = loadLS('searches', DEFAULT_SEARCHES);

function renderUser() {
  const name = user.name || 'Пользователь';
  document.getElementById('headerName').textContent = name;
  document.getElementById('headerAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileEmail').textContent = user.email || '—';
  document.getElementById('profileAvatar').textContent = name.charAt(0).toUpperCase();

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
    card.className = 'flex items-center gap-4 bg-[#F1EBE1] border border-[#e0d3b3] rounded-2xl p-4 hover:border-[#8a9a5b] transition';
    card.innerHTML = `
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#c8d9b0] to-[#e8dcc4] border border-[#b0c296] flex items-center justify-center text-2xl flex-shrink-0">
        ${emoji}
      </div>
      <div class="flex-1 min-w-0">
        <p class="font-bold text-sm text-[#3d2817] truncate">${fav.name}</p>
        <p class="text-[11px] text-[#8a7a60]">${fav.region || ''} · ${fav.city || ''}</p>
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <span class="text-xs font-black text-[#6b4226]">${(fav.price || 0).toLocaleString('ru-RU')} ₽/день</span>
          <span class="${v.bg} ${v.border} ${v.text} border px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
            <i class="fa-solid ${v.icon}"></i>${fav.trust || 0}/100
          </span>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <a href="sanatorium.html?id=${fav.id}" class="text-[#8a7a60] hover:text-[#6b4226] transition p-1" title="Открыть">
          <i class="fa-solid fa-arrow-up-right-from-square text-sm"></i>
        </a>
        <button data-remove-fav="${fav.id}" class="text-[#8a7a60] hover:text-[#a8442a] transition p-1" title="Удалить">
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
    card.className = 'flex items-center justify-between gap-3 bg-[#F1EBE1] border border-[#e0d3b3] rounded-2xl p-4 hover:border-[#6b4226] transition flex-wrap';
    card.innerHTML = `
      <div class="min-w-0 flex-1">
        <p class="font-bold text-sm text-[#3d2817] truncate">${s.name}</p>
        <p class="text-[11px] text-[#6b5a45] mt-0.5 truncate">${s.params}</p>
        <p class="text-[10px] text-[#a89575] mt-1">${s.date || ''}</p>
      </div>
      <div class="flex items-center gap-2">
        <button data-apply-search="${idx}" class="px-3 py-1.5 bg-[#c8d9b0] border border-[#b0c296] text-[#3d4a22] rounded-lg text-[11px] font-bold hover:bg-[#b8cca0] transition">
          <i class="fa-solid fa-rotate-right mr-1"></i>Повторить
        </button>
        <button data-remove-search="${idx}" class="text-[#8a7a60] hover:text-[#a8442a] transition p-1">
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
  if (total >= 80) { color = '#8a9a5b'; statusText = 'Отличный профиль'; hintText = 'Рекомендации максимально точные'; }
  else if (total >= 50) { color = '#c97b5a'; statusText = 'Почти готово'; hintText = 'Дополните данные для лучшего подбора'; }
  else { color = '#6b4226'; statusText = 'Профиль пустой'; hintText = 'Заполните данные — подбор станет точнее'; }

  circle.setAttribute('stroke', color);
  status.textContent = statusText;
  hint.textContent = hintText;

  const list = document.getElementById('healthChecklist');
  list.innerHTML = '';
  checks.forEach(c => {
    const li = document.createElement('li');
    li.className = 'flex items-center gap-2';
    li.innerHTML = `
      <i class="fa-solid ${c.done ? 'fa-circle-check text-[#8a9a5b]' : 'fa-circle text-[#d5c8a8]'} w-4 text-xs"></i>
      <span class="${c.done ? 'text-[#3d2817]' : 'text-[#8a7a60]'} flex-1">${c.label}</span>
      <span class="text-[10px] ${c.done ? 'text-[#6b4226] font-bold' : 'text-[#a89575]'}">${c.weight}%</span>
    `;
    list.appendChild(li);
  });
}

function removeFavorite(id) {
  favorites = favorites.filter(f => f.id !== id);
  saveFavorites(favorites);
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
  const modal = document.getElementById('editProfileModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  renderUser();
  renderHealth();
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

  renderUser();
  renderHealth();
  closeEditPrefs();
}

function clearAllData() {
  if (confirm('Удалить данные текущего профиля (избранное, предпочтения)?')) {
    const key = `favorites_${user.email}`;
    localStorage.removeItem(key);
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
window.logoutUser = logoutUser;
window.openAuthModal = openAuthModal;

document.getElementById('inputPrefBudget').addEventListener('input', e => {
  document.getElementById('prefBudgetLabel').textContent = (+e.target.value).toLocaleString('ru-RU');
});

document.getElementById('notifEmail').addEventListener('change', e => {
  user.notifEmail = e.target.checked;
});
document.getElementById('notifNew').addEventListener('change', e => {
  user.notifNew = e.target.checked;
});

renderUser();
renderFavorites();
renderSearches();
renderHealth();