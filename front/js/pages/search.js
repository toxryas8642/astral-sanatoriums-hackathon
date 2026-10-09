import { fetchSanatoriums, fetchMatch } from '../api.js';
import { adaptSanatorium, getVerdict, getRegionEmoji } from '../adapter.js';
import { syncHeaderUser } from '../ui.js';

let allSanatoriums = [];

syncHeaderUser();

async function init() {
  try {
    const raw = await fetchSanatoriums();
    allSanatoriums = raw.map(adaptSanatorium);
    await runFilter();
  } catch (e) {
    console.error(e);
    document.getElementById('cardsFeed').innerHTML =
      '<p class="text-red-400 text-sm p-6 bg-red-500/10 border border-red-500/30 rounded-2xl">Бэкенд недоступен. Запустите uvicorn на порту 8000.</p>';
  }
}

async function runFilter() {
  const maxP = +document.getElementById('priceRange').value;
  const region = document.getElementById('regionSelect').value;
  const procs = Array.from(document.querySelectorAll('.f-proc:checked')).map(c => c.value.toLowerCase());
  const tours = Array.from(document.querySelectorAll('.f-tour:checked')).map(c => c.value.toLowerCase());
  const onlySafe = document.getElementById('onlySafeCheck').checked;

  let results;
  try {
    const data = await fetchMatch({ procedures: procs, excursions: tours, budget: maxP });
    results = (data.results || []).map(adaptSanatorium);
  } catch (e) {
    console.error(e);
    results = allSanatoriums.slice();
  }

  if (region !== 'all') results = results.filter(s => s.region === region);
  if (onlySafe) results = results.filter(s => !s.isClone);

  const sortBy = document.getElementById('sortBy').value;
  if (sortBy === 'price-asc') results.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') results.sort((a, b) => b.price - a.price);
  else if (sortBy === 'trust') results.sort((a, b) => b.trust - a.trust);
  else results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  renderResults(results);
}

function renderResults(list) {
  const feed = document.getElementById('cardsFeed');
  const noRes = document.getElementById('noResults');
  document.getElementById('countVal').textContent = list.length;

  if (!list.length) {
    feed.innerHTML = '';
    noRes.classList.remove('hidden');
    return;
  }
  noRes.classList.add('hidden');

  feed.innerHTML = list.map(s => {
    const v = getVerdict(s.trust);
    const clone = s.isClone
      ? `<div class="text-[11px] text-red-400 font-bold mt-2">⚠️ Возможный дубликат сайта</div>`
      : '';
    return `
      <a href="sanatorium.html?id=${s.id}" class="block bg-slate-900/90 border border-slate-800 rounded-3xl p-5 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">${getRegionEmoji(s.region)}</span>
              <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">${s.region} · ${s.city}</span>
            </div>
            <h3 class="font-black text-white truncate">${s.name}</h3>
            <p class="text-xs text-slate-400 mt-1">${s.description}</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
              ${s.procedures.slice(0, 3).map(p => `<span class="px-2 py-0.5 rounded-md bg-pink-950/60 border border-pink-800/50 text-pink-300 text-[10px]">${p}</span>`).join('')}
              ${s.tours.slice(0, 2).map(t => `<span class="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-[10px]">${t}</span>`).join('')}
            </div>
            ${clone}
          </div>
          <div class="text-right shrink-0">
            <div class="text-2xl font-black text-cyan-400">${s.matchScore ?? '—'}%</div>
            <div class="text-[10px] text-slate-500 uppercase font-bold">Соответствие</div>
            <div class="text-lg font-black text-pink-400 mt-2">${s.price.toLocaleString('ru-RU')} ₽</div>
            <div class="text-[10px] text-slate-500">за сутки</div>
            <div class="${v.bg} ${v.border} ${v.text} border px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 mt-2">
              <i class="fa-solid ${v.icon}"></i>${s.trust}
            </div>
          </div>
        </div>
      </a>`;
  }).join('');
}

function resetFilters() {
  document.getElementById('priceRange').value = 15000;
  document.getElementById('priceLabel').textContent = '15 000 ₽';
  document.querySelectorAll('.f-proc, .f-tour').forEach(c => c.checked = false);
  document.getElementById('regionSelect').value = 'all';
  document.getElementById('onlySafeCheck').checked = false;
  document.getElementById('sortBy').value = 'score';
  runFilter();
}

window.runFilter = runFilter;
window.resetFilters = resetFilters;

document.getElementById('priceRange').addEventListener('input', e => {
  document.getElementById('priceLabel').textContent = (+e.target.value).toLocaleString('ru-RU') + ' ₽';
});
document.getElementById('priceRange').addEventListener('change', runFilter);
document.getElementById('regionSelect').addEventListener('change', runFilter);
document.getElementById('sortBy').addEventListener('change', runFilter);
document.getElementById('onlySafeCheck').addEventListener('change', runFilter);
document.querySelectorAll('.f-proc, .f-tour').forEach(c => c.addEventListener('change', runFilter));

init();