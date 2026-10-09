const DEFAULT_NAME = 'Пользователь';

export function syncHeaderUser() {
  try {
    const raw = localStorage.getItem('user');
    let user = raw ? JSON.parse(raw) : null;

    if (!user || !user.name) {
      user = { name: DEFAULT_NAME };
      localStorage.setItem('user', JSON.stringify(user));
    }

    const nameEl = document.getElementById('headerName');
    const avatarEl = document.getElementById('headerAvatar');
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  } catch (e) {
    console.warn('syncHeaderUser error', e);
  }
}