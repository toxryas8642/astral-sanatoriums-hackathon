export function syncHeaderUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    const user = JSON.parse(raw);
    if (!user || !user.name) return;
    const nameEl = document.getElementById('headerName');
    const avatarEl = document.getElementById('headerAvatar');
    if (nameEl) nameEl.textContent = user.name;
    if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
  } catch (e) {
    console.warn('syncHeaderUser error', e);
  }
}