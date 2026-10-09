import { fetchSanatoriums } from '../api.js';
import { adaptSanatorium, getVerdict, getRegionEmoji } from '../adapter.js';
import { ensureUser } from '../ui.js';

ensureUser();

async function init() {
  const wrap = document.getElementById('topCards');
  try {
    const raw = await fetchSanatoriums();
    const list = raw.map(adaptSanatorium);
    const top = [...list].sort((a, b) => b.trust - a.trust).slice(0, 3);

    wrap.innerHTML = top.map(s => {
      const v = getVerdict(s.trust);
      return `
        <a href="sanatorium.html?id=${s.id}" class="block bg-white border border-[#e3d8bd] rounded-3xl p-5 hover:border-[#8a9a5b] hover:shadow-xl hover:shadow-[#c8d9b0]/40 transition">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">${getRegionEmoji(s.region)}</span>
            <span class="text-[10px] uppercase tracking-wider text-[#8a7a60] font-bold">${s.region} · ${s.city}</span>
          </div>
          <h3 class="font-black text-[#3d2817] truncate">${s.name}</h3>
          <p class="text-xs text-[#6b5a45] mt-1 line-clamp-2">${s.description}</p>
          <div class="flex items-center justify-between mt-4">
            <span class="text-[#6b4226] font-black">${s.price.toLocaleString('ru-RU')} ₽<span class="text-[#8a7a60] font-normal text-xs">/день</span></span>
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
        <video src="assets/sloth-v2.mp4" autoplay loop muted playsinline class="w-32 h-32 mx-auto object-contain"></video>
        <p class="text-sm text-[#6b5a45] mt-3">Бэкенд недоступен. Запустите uvicorn на порту 8000.</p>
      </div>`;
  }
}

init();