import { fetchSanatoriums } from '../api.js';
import { adaptSanatorium, getVerdict, getRegionEmoji } from '../adapter.js';
import { syncHeaderUser } from '../ui.js';

syncHeaderUser();

async function init() {
  const wrap = document.getElementById('topCards');
  try {
    const raw = await fetchSanatoriums();
    const list = raw.map(adaptSanatorium);
    const top = [...list].sort((a, b) => b.trust - a.trust).slice(0, 3);

    wrap.innerHTML = top.map(s => {
      const v = getVerdict(s.trust);
      return `
        <a href="sanatorium.html?id=${s.id}" class="block bg-slate-900/90 border border-slate-800 rounded-3xl p-5 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">${getRegionEmoji(s.region)}</span>
            <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">${s.region} · ${s.city}</span>
          </div>
          <h3 class="font-black text-white truncate">${s.name}</h3>
          <p class="text-xs text-slate-400 mt-1 line-clamp-2">${s.description}</p>
          <div class="flex items-center justify-between mt-4">
            <span class="text-pink-400 font-black">${s.price.toLocaleString('ru-RU')} ₽<span class="text-slate-500 font-normal text-xs">/день</span></span>
            <span class="${v.bg} ${v.border} ${v.text} border px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
              <i class="fa-solid ${v.icon}"></i>${s.trust}
            </span>
          </div>
        </a>`;
    }).join('');
  } catch (e) {
    console.error(e);
    wrap.innerHTML = '<p class="col-span-full text-red-400 text-sm text-center py-10">Бэкенд недоступен. Запустите uvicorn на порту 8000.</p>';
  }
}

init();