const DEFAULT_NAME = 'Пользователь';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCurrentUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function syncHeaderUser() {
  const user = getCurrentUser();
  const name = (user && user.name) || DEFAULT_NAME;
  const nameEl = document.getElementById('headerName');
  const avatarEl = document.getElementById('headerAvatar');
  if (nameEl) nameEl.textContent = name;
  if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
}

export function getFavoritesKey() {
  const user = getCurrentUser();
  const name = (user && user.name) || DEFAULT_NAME;
  return `favorites_${name}`;
}

export function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem(getFavoritesKey())) || [];
  } catch {
    return [];
  }
}

export function saveFavorites(list) {
  localStorage.setItem(getFavoritesKey(), JSON.stringify(list));
}

export function ensureUser() {
  const user = getCurrentUser();
  if (user && user.name) {
    syncHeaderUser();
    return Promise.resolve(user);
  }

  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className =
      'fixed inset-0 bg-[#3d2817]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4';
    overlay.innerHTML = `
      <div class="bg-white border border-[#e3d8bd] w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <div class="text-2xl mb-2">👤</div>
        <h3 class="text-lg font-black text-[#3d2817] mb-1">Как вас зовут?</h3>
        <p class="text-xs text-[#6b5a45] mb-4">
          Имя нужно, чтобы сохранять избранное и настройки подбора.
        </p>
        <input
          id="loginNameInput"
          type="text"
          placeholder="Введите имя"
          class="w-full bg-[#F1EBE1] border border-[#e0d3b3] rounded-xl px-3 py-2 text-sm text-[#3d2817] focus:outline-none focus:border-[#6b4226] mb-4"
        >
        <button
          id="loginNameBtn"
          class="w-full py-2.5 bg-[#6b4226] hover:bg-[#553319] rounded-xl text-sm font-bold text-white transition"
        >
          Начать
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#loginNameInput');
    const button = overlay.querySelector('#loginNameBtn');

    const finish = () => {
      const name = (input.value || '').trim() || DEFAULT_NAME;
      saveCurrentUser({ name });
      syncHeaderUser();
      overlay.remove();
      resolve({ name });
    };

    button.addEventListener('click', finish);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') finish();
    });
    input.focus();
  });
}

export function changeUser() {
  const current = getCurrentUser();
  const currentName = (current && current.name) || DEFAULT_NAME;

  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 bg-[#3d2817]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4';

  overlay.innerHTML = `
    <div class="bg-white border border-[#e3d8bd] w-full max-w-sm rounded-3xl p-6 shadow-2xl">
      <div class="text-2xl mb-2">🔁</div>
      <h3 class="text-lg font-black text-[#3d2817] mb-1">Сменить профиль</h3>
      <p class="text-xs text-[#6b5a45] mb-4">
        Сейчас вы вошли как <b>${currentName}</b>.
        Введите другое имя — данные переключатся на него.
      </p>
      <input
        id="changeNameInput"
        type="text"
        value="${currentName}"
        class="w-full bg-[#F1EBE1] border border-[#e0d3b3] rounded-xl px-3 py-2 text-sm text-[#3d2817] focus:outline-none focus:border-[#6b4226] mb-4"
      >
      <div class="flex gap-2">
        <button
          id="changeNameCancel"
          class="flex-1 py-2.5 border border-[#d5c8a8] rounded-xl text-xs font-bold text-[#3d2817] hover:bg-[#F1EBE1] transition"
        >Отмена</button>
        <button
          id="changeNameSave"
          class="flex-1 py-2.5 bg-[#6b4226] hover:bg-[#553319] rounded-xl text-xs font-bold text-white transition"
        >Сменить</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#changeNameInput');
  overlay.querySelector('#changeNameCancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#changeNameSave').addEventListener('click', () => {
    const name = (input.value || '').trim() || DEFAULT_NAME;
    saveCurrentUser({ name });
    overlay.remove();
    location.reload();
  });
  input.focus();
}