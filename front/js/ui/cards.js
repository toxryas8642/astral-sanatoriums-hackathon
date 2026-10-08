import { state } from '../state.js';

export function renderCards(list) {
  const feed = document.getElementById('cardsFeed');
  feed.innerHTML = '';

  if (list.length === 0) {
    feed.innerHTML = `
      <div class="p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div class="text-4xl mb-2">🏖</div>
        <div class="font-bold text-slate-800">Ничего не найдено по этим параметрам</div>
        <div class="text-xs text-slate-500 mt-1">Попробуйте увеличить дневной прайс или сбросить фильтры.</div>
      </div>`;
    return;
  }

  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'san-card p-6 rounded-3xl bg-white border border-slate-200 shadow-sm backdrop-blur';
    card.onclick = () => import('./profile.js').then(m => m.openProfile(item.id));

    const cloneWarning = item.isClone
      ? `<div class="text-[11px] text-red-600 font-bold mt-2">⚠️ Возможный дубликат сайта</div>`
      : '';

    card.innerHTML = `
      <div class="flex flex-col md:flex-row justify-between gap-4">
        <div class="flex-1">
          <h3 class="text-lg font-black text-slate-900">${item.name}</h3>
          <div class="text-xs text-slate-500 mb-3">📍 ${item.region}, ${item.city} • ⏱ ${item.transport.airport} мин от аэропорта</div>
          <div class="flex flex-wrap gap-1.5 mb-2">
            ${(item.procedures || []).slice(0, 4).map(t => `<span class="px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium">${t}</span>`).join('')}
            ${(item.excursions || []).slice(0, 2).map(t => `<span class="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium">${t}</span>`).join('')}
          </div>
          ${cloneWarning}
        </div>
        <div class="flex md:flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
          <div class="text-right">
            <div class="text-2xl font-black text-sky-600">${item.matchScore}%</div>
            <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Индекс соответствия</div>
          </div>
          <div class="text-right my-2">
            <div class="text-xl font-black text-slate-900">${item.price_per_day.toLocaleString()} ₽</div>
            <div class="text-[11px] text-slate-400">сутки</div>
          </div>
          <div class="flex flex-col gap-2 w-full" onclick="event.stopPropagation()">
            <button data-action="routine" data-id="${item.id}" class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition">График дня</button>
            <button class="w-full py-2 bg-gradient-to-r from-pink-500 to-sky-500 text-white text-xs font-black rounded-xl shadow-md">Забронировать</button>
          </div>
        </div>
      </div>`;
    feed.appendChild(card);
  });

  feed.querySelectorAll('[data-action="routine"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      import('./routine.js').then(m => m.openRoutine(Number(btn.dataset.id)));
    });
  });
}