import { state } from '../state.js';
import { fetchMatch } from '../api.js';
import { renderCards } from './cards.js';

export async function runFilter() {
  const maxP = Number(document.getElementById('priceRange').value);
  document.getElementById('priceLabel').textContent = `${maxP.toLocaleString()} ₽`;

  const reg = document.getElementById('regionSelect').value;

  const checkedProcs = Array.from(document.querySelectorAll('#procBox input:checked')).map(c => c.value);
  const checkedTours = Array.from(document.querySelectorAll('#tourBox input:checked')).map(c => c.value);

  let data;
  try {
    data = await fetchMatch({ procedures: checkedProcs, excursions: checkedTours, budget: maxP });
  } catch (e) {
    console.error(e);
    document.getElementById('cardsFeed').innerHTML = `
      <div class="p-8 text-center bg-white border border-red-200 rounded-3xl shadow-sm">
        <div class="text-4xl mb-2">⚠️</div>
        <div class="font-bold text-slate-800">Бэкенд недоступен</div>
        <div class="text-xs text-slate-500 mt-1">Запустите uvicorn на порту 8000 и обновите страницу.</div>
      </div>`;
    document.getElementById('countVal').textContent = '0';
    return;
  }

  let results = data.results || [];

  if (reg !== 'all') {
    const regionMap = {
      'КМВ': 'Ставропольский край',
      'Сочи': 'Краснодарский край',
      'Алтай': 'Алтайский край'
    };
    const targetRegion = regionMap[reg] || reg;
    results = results.filter(s => s.region === targetRegion);
  }

  document.getElementById('countVal').textContent = results.length;
  renderCards(results);
}

export function resetFilters() {
  document.getElementById('priceRange').value = 15000;
  document.getElementById('priceLabel').textContent = '15 000 ₽';
  document.getElementById('regionSelect').value = 'all';
  document.querySelectorAll('#procBox input, #tourBox input').forEach(cb => cb.checked = false);
  runFilter();
}

export function setVibe(type) {
  const reg = document.getElementById('regionSelect');
  const pr = document.getElementById('priceRange');
  const procs = document.querySelectorAll('#procBox input');
  const tours = document.querySelectorAll('#tourBox input');

  procs.forEach(cb => cb.checked = false);
  tours.forEach(cb => cb.checked = false);

  if (type === 'shrimp') {
    reg.value = 'all';
    pr.value = 8500;
    procs.forEach(cb => { if (['грязи', 'массаж'].includes(cb.value)) cb.checked = true; });
  } else if (type === 'monster') {
    reg.value = 'КМВ';
    pr.value = 8500;
    procs.forEach(cb => { if (['грязи', 'минеральные ванны'].includes(cb.value)) cb.checked = true; });
  } else if (type === 'overload') {
    reg.value = 'Алтай';
    pr.value = 8500;
    procs.forEach(cb => { if (['массаж'].includes(cb.value)) cb.checked = true; });
  }
  runFilter();
}