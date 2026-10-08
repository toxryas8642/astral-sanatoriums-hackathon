import { state } from './state.js';
import { fetchSanatoriums } from './api.js';
import { runFilter, resetFilters, setVibe } from './ui/filters.js';
import { openProfile, closeProfileModal, openRoutineFromProfile } from './ui/profile.js';
import { closeRoutineModal } from './ui/routine.js';
import { openUserMenu } from './user.js';

window.runFilter = runFilter;
window.resetFilters = resetFilters;
window.setVibe = setVibe;
window.openProfile = openProfile;
window.closeProfileModal = closeProfileModal;
window.openRoutineFromProfile = openRoutineFromProfile;
window.closeRoutineModal = closeRoutineModal;
window.openUserMenu = openUserMenu;

document.getElementById('profileModal').addEventListener('click', (e) => {
  if (e.target.id === 'profileModal') closeProfileModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProfileModal();
    closeRoutineModal();
  }
});

(async () => {
  try {
    state.allSanatoriums = await fetchSanatoriums();
    await runFilter();
  } catch (e) {
    console.error(e);
    document.getElementById('cardsFeed').innerHTML = `
      <div class="p-8 text-center bg-white border border-red-200 rounded-3xl shadow-sm">
        <div class="text-4xl mb-2">⚠️</div>
        <div class="font-bold text-slate-800">Бэкенд недоступен</div>
        <div class="text-xs text-slate-500 mt-1">Запустите uvicorn на порту 8000 и обновите страницу.</div>
      </div>`;
  }
})();