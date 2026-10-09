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
        <a href="sanatorium.html?id=${s.id}" class="block bg-white border border-stone-200 rounded-3xl p-5 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-100 transition">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">${getRegionEmoji(s.region)}</span>
            <span class="text-[10px] uppercase tracking-wider text-stone-500 font-bold">${s.region} · ${s.city}</span>
          </div>
          <h3 class="font-black text-stone-900 truncate">${s.name}</h3>
          <p class="text-xs text-stone-500 mt-1 line-clamp-2">${s.description}</p>
          <div class="flex items-center justify-between mt-4">
            <span class="text-orange-600 font-black">${s.price.toLocaleString('ru-RU')} ₽<span class="text-stone-400 font-normal text-xs">/день</span></span>
            <span class="${v.bg} ${v.border} ${v.text} border px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
              <i class="fa-solid ${v.icon}"></i>${s.trust}
            </span>
          </div>
        </a>`;
    }).join('');
  } catch (e) {
    console.error(e);
    wrap.innerHTML = `
      <div class="col-span-full text-center py-10">
        <img src="assets/sloth.gif" alt="Загрузка" class="w-32 h-32 mx-auto object-contain">
        <p class="text-sm text-stone-500 mt-3">Бэкенд недоступен. Запустите uvicorn на порту 8000.</p>
      </div>`;
  }
}

init();