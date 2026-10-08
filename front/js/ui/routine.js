import { state } from '../state.js';

export function openRoutine(id) {
  const item = state.allSanatoriums.find(s => s.id === id);
  if (!item) return;
  document.getElementById('routineTitle').textContent = `План дня: ${item.name}`;
  const list = document.getElementById('routineList');
  const procs = item.procedures || [];
  const routine = [
    '08:00 — Приём минеральной воды',
    '09:00 — Завтрак',
    `10:00 — ${procs[0] || 'Процедуры'}`,
    `12:00 — ${procs[1] || 'Отдых'}`,
    '13:00 — Обед',
    `15:00 — ${procs[2] || 'Прогулка'}`,
    '19:00 — Ужин'
  ];
  list.innerHTML = routine.map(r => `<div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">${r}</div>`).join('');
  const modal = document.getElementById('routineModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeRoutineModal() {
  const modal = document.getElementById('routineModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}