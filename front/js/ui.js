const USERS_KEY = 'users';
const SESSION_KEY = 'session';

async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getCurrentUser() {
  const session = getSession();
  if (!session || !session.email) return null;
  const users = getUsers();
  return users[session.email] || null;
}

export function saveCurrentUser(updatedFields) {
  const session = getSession();
  if (!session || !session.email) return null;
  const users = getUsers();
  if (!users[session.email]) return null;

  users[session.email] = { ...users[session.email], ...updatedFields };
  saveUsers(users);

  try {
    syncHeaderUser();
  } catch {}

  return users[session.email];
}

export function getFavoritesKey() {
  const user = getCurrentUser();
  if (!user) return null;
  return `favorites_${user.email}`;
}

export function loadFavorites() {
  const key = getFavoritesKey();
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function saveFavorites(list) {
  const key = getFavoritesKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(list));
}

export function logoutUser() {
  saveSession(null);
  location.href = 'index.html';
}

export async function registerUser({ name, email, password }) {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();

  if (users[normalized]) {
    throw new Error('Пользователь с такой почтой уже существует');
  }
  if (!name.trim()) throw new Error('Введите имя');
  if (!normalized.includes('@')) throw new Error('Проверьте email');
  if (!password || password.length < 4) {
    throw new Error('Пароль должен быть не короче 4 символов');
  }

  const passwordHash = await sha256(password);
  users[normalized] = {
    name: name.trim(),
    email: normalized,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  saveUsers(users);
  saveSession({ email: normalized });
  return users[normalized];
}

export async function loginUser({ email, password }) {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  const user = users[normalized];

  if (!user) throw new Error('Пользователь не найден');
  if (!password) throw new Error('Введите пароль');

  const passwordHash = await sha256(password);
  if (passwordHash !== user.passwordHash) throw new Error('Неверный пароль');

  saveSession({ email: normalized });
  return user;
}

export function syncHeaderUser() {
  const user = getCurrentUser();
  const loginBtn = document.getElementById('loginBtn');
  const profileLink = document.getElementById('profileLink');
  const nameEl = document.getElementById('headerName');
  const avatarEl = document.getElementById('headerAvatar');

  if (user) {
    if (loginBtn) loginBtn.classList.add('hidden');
    if (profileLink) profileLink.classList.remove('hidden');
    if (profileLink) profileLink.classList.add('flex');
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (profileLink) profileLink.classList.add('hidden');
    if (profileLink) profileLink.classList.remove('flex');
    if (nameEl) nameEl.textContent = '';
    if (avatarEl) avatarEl.textContent = '';
  }
}

function buildAuthModal(mode = 'login') {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-[#3d2817]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4';
  overlay.id = 'authModal';

  overlay.innerHTML = `
    <div class="bg-white border border-[#e3d8bd] w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
      <button id="authCloseBtn" class="absolute top-4 right-4 text-[#a89575] hover:text-[#3d2817] text-lg">✕</button>

      <div class="flex gap-1 mb-5 bg-[#F1EBE1] rounded-xl p-1">
        <button data-auth-tab="login" class="flex-1 py-2 rounded-lg text-xs font-bold transition">Войти</button>
        <button data-auth-tab="register" class="flex-1 py-2 rounded-lg text-xs font-bold transition">Создать профиль</button>
      </div>

      <div id="authError" class="hidden text-xs text-[#a8442a] bg-[#f4d9cb] border border-[#e2b8a3] rounded-xl p-3 mb-4"></div>

      <form id="authForm" class="space-y-3">
        <div data-field="name" class="hidden">
          <label class="block text-xs font-bold text-[#6b5a45] mb-1.5 uppercase tracking-wider">Имя</label>
          <input name="name" type="text" class="w-full bg-[#F1EBE1] border border-[#e0d3b3] rounded-xl px-3 py-2 text-sm text-[#3d2817] focus:outline-none focus:border-[#6b4226]">
        </div>

        <div>
          <label class="block text-xs font-bold text-[#6b5a45] mb-1.5 uppercase tracking-wider">Email</label>
          <input name="email" type="email" class="w-full bg-[#F1EBE1] border border-[#e0d3b3] rounded-xl px-3 py-2 text-sm text-[#3d2817] focus:outline-none focus:border-[#6b4226]">
        </div>

        <div>
          <label class="block text-xs font-bold text-[#6b5a45] mb-1.5 uppercase tracking-wider">Пароль</label>
          <input name="password" type="password" class="w-full bg-[#F1EBE1] border border-[#e0d3b3] rounded-xl px-3 py-2 text-sm text-[#3d2817] focus:outline-none focus:border-[#6b4226]">
        </div>

        <button type="submit" id="authSubmit" class="w-full py-2.5 bg-[#6b4226] hover:bg-[#553319] rounded-xl text-sm font-bold text-white transition">
          Войти
        </button>
      </form>

      <p class="text-[11px] text-[#8a7a60] mt-4 text-center">
        Регистрация сохраняет избранное и настройки подбора.
      </p>
    </div>
  `;

  document.body.appendChild(overlay);

  const tabs = overlay.querySelectorAll('[data-auth-tab]');
  const nameField = overlay.querySelector('[data-field="name"]');
  const submitBtn = overlay.querySelector('#authSubmit');
  const form = overlay.querySelector('#authForm');
  const errorBox = overlay.querySelector('#authError');

  let currentMode = mode;

  function applyMode(newMode) {
    currentMode = newMode;
    tabs.forEach(t => {
      const active = t.dataset.authTab === newMode;
      t.className = `flex-1 py-2 rounded-lg text-xs font-bold transition ${
        active
          ? 'bg-white text-[#6b4226] shadow-sm'
          : 'text-[#8a7a60] hover:text-[#3d2817]'
      }`;
    });
    nameField.classList.toggle('hidden', newMode !== 'register');
    submitBtn.textContent = newMode === 'login' ? 'Войти' : 'Создать профиль';
    errorBox.classList.add('hidden');
  }

  tabs.forEach(t => t.addEventListener('click', () => applyMode(t.dataset.authTab)));
  applyMode(mode);

  return new Promise(resolve => {
    const close = (result) => {
      overlay.remove();
      resolve(result || null);
    };

    overlay.querySelector('#authCloseBtn').addEventListener('click', () => close(null));
    overlay.addEventListener('click', e => {
      if (e.target === overlay) close(null);
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = fd.get('name') || '';
      const email = fd.get('email') || '';
      const password = fd.get('password') || '';

      try {
        const user = currentMode === 'login'
          ? await loginUser({ email, password })
          : await registerUser({ name, email, password });

        syncHeaderUser();
        close(user);
      } catch (err) {
        errorBox.textContent = err.message;
        errorBox.classList.remove('hidden');
      }
    });
  });
}

let authModalPromise = null;

export function openAuthModal(mode = 'login') {
  if (authModalPromise) return authModalPromise;
  authModalPromise = buildAuthModal(mode).finally(() => {
    authModalPromise = null;
  });
  return authModalPromise;
}

export function requireAuth(callback) {
  const user = getCurrentUser();
  if (user) {
    return Promise.resolve(callback(user));
  }
  return openAuthModal('login').then(result => {
    if (result) return callback(result);
  });
}

window.openAuthModal = openAuthModal;
window.logoutUser = logoutUser;