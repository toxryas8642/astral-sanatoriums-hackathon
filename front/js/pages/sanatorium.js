import { fetchSanatoriums } from '../api.js';
import { adaptSanatorium, getVerdict, getRegionEmoji } from '../adapter.js';
import { ensureUser, loadFavorites, saveFavorites } from '../ui.js';

ensureUser();

const id = +new URLSearchParams(location.search).get('id');
const wrap = document.getElementById('content');

async function init() {
    await ensureUser();
  try {
    const raw = await fetchSanatoriums();
    const list = raw.map(adaptSanatorium);
    const s = list.find(x => x.id === id);

    if (!s) {
      wrap.innerHTML = `
        <div class="text-center py-16">
          <video src="assets/sloth.mp4" autoplay loop muted playsinline class="w-40 h-40 mx-auto object-contain"></video>
          <p class="text-[#3d2817] font-bold mt-3">Санаторий не найден</p>
          <a href="search.html" class="inline-block mt-4 px-5 py-2 bg-[#6b4226] hover:bg-[#553319] rounded-xl text-white text-xs font-bold transition">← Вернуться к подбору</a>
        </div>`;
      return;
    }

    const v = getVerdict(s.trust);
    const emoji = getRegionEmoji(s.region);

    wrap.innerHTML = `
      <div class="bg-white border border-[#e3d8bd] rounded-3xl p-6 md:p-8 shadow-sm">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg">${emoji}</span>
          <span class="text-[10px] uppercase tracking-wider text-[#8a7a60] font-bold">${s.region} · ${s.city}</span>
          <span class="${v.bg} ${v.border} ${v.text} border px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ml-auto">
            <i class="fa-solid ${v.icon}"></i>${v.label} ${s.trust}/100
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-[#3d2817]">${s.name}</h1>
        <p class="text-[#6b5a45] mt-2">${s.description}</p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div class="p-3 bg-[#c8d9b0] rounded-xl border border-[#b0c296]">
            <div class="text-[10px] uppercase tracking-wider text-[#4a5a2a] font-bold">Цена</div>
            <div class="text-[#3d4a22] font-black mt-1">${s.price.toLocaleString('ru-RU')} ₽</div>
            <div class="text-[10px] text-[#4a5a2a]">за сутки</div>
          </div>
          <div class="p-3 bg-[#e8dcc4] rounded-xl border border-[#d5c8a8]">
            <div class="text-[10px] uppercase tracking-wider text-[#6b5a45] font-bold">Рейтинг</div>
            <div class="text-[#6b4226] font-black mt-1">★ ${s.rating}</div>
            <div class="text-[10px] text-[#6b5a45]">из 5</div>
          </div>
          <div class="p-3 bg-[#F1EBE1] rounded-xl border border-[#e0d3b3]">
            <div class="text-[10px] uppercase tracking-wider text-[#8a7a60] font-bold">Комфорт</div>
            <div class="text-[#3d2817] font-black mt-1">${s.comfort}</div>
            <div class="text-[10px] text-[#8a7a60]">уровень</div>
          </div>
          <div class="p-3 bg-[#F1EBE1] rounded-xl border border-[#e0d3b3]">
            <div class="text-[10px] uppercase tracking-wider text-[#8a7a60] font-bold">Дорога</div>
            <div class="text-[#3d2817] font-black mt-1 text-xs">${s.transitTime}</div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#8a7a60] mb-2">Медицинский профиль</h3>
            <div class="flex flex-wrap gap-1.5">
              ${s.procedures.map(p => `<span class="px-2 py-1 rounded-md bg-[#c8d9b0] border border-[#b0c296] text-[#3d4a22] text-xs">${p}</span>`).join('')}
            </div>
          </div>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#8a7a60] mb-2">Экскурсии рядом</h3>
            <div class="flex flex-wrap gap-1.5">
              ${s.tours.map(t => `<span class="px-2 py-1 rounded-md bg-[#f4d9cb] border border-[#e2b8a3] text-[#7a3f28] text-xs">${t}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 rounded-2xl bg-[#F1EBE1] border border-[#e0d3b3]">
          <h3 class="text-xs font-bold uppercase tracking-wider text-[#8a7a60] mb-3">
            <i class="fa-solid fa-shield-halved text-[#8a9a5b] mr-1"></i>
            Протокол безопасности сайта
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <div class="text-[#8a7a60]">ИНН в ЕГРЮЛ</div>
              <div class="text-[#3d2817] font-bold">${s.egrulInn}</div>
            </div>
            <div>
              <div class="text-[#8a7a60]">Адрес</div>
              <div class="text-[#3d2817] font-bold text-[10px]">${s.address || '—'}</div>
            </div>
            <div>
              <div class="text-[#8a7a60]">Телефон</div>
              <div class="text-[#3d2817] font-bold text-[10px]">${s.phone || '—'}</div>
            </div>
            <div>
              <div class="text-[#8a7a60]">Статус</div>
              <div class="${v.text} font-bold">${v.label}</div>
            </div>
          </div>
          <p class="text-xs text-[#6b5a45] mt-3 leading-relaxed">${s.securityDetails}</p>
        </div>

        ${s.matchReasons && s.matchReasons.length ? `
          <div class="mt-6 p-4 rounded-2xl bg-[#f4d9cb] border border-[#e2b8a3]">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#7a3f28] mb-2">
              <i class="fa-solid fa-check mr-1"></i> Почему подходит
            </h3>
            <ul class="text-xs text-[#7a3f28] space-y-1">
              ${s.matchReasons.map(r => `<li>• ${r}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="mt-6 flex flex-wrap gap-3">
          <a href="${s.siteUrl}" target="_blank" rel="noopener" class="px-6 py-3 bg-[#6b4226] hover:bg-[#553319] rounded-2xl text-white text-sm font-black transition inline-flex items-center gap-2">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            Перейти на сайт
          </a>
          <button
            id="favBtn"
            onclick="toggleFavorite(${s.id})"
            class="px-6 py-3 border border-[#d5c8a8] rounded-2xl text-sm font-bold hover:border-[#6b4226] transition inline-flex items-center gap-2 bg-white"
            >
            <i id="favIcon" class="fa-regular fa-heart"></i>
            <span id="favLabel">В избранное</span>
            </button>
          <a href="search.html" class="px-6 py-3 border border-[#d5c8a8] rounded-2xl text-[#3d2817] text-sm font-bold hover:border-[#8a9a5b] hover:text-[#8a9a5b] transition inline-flex items-center gap-2 bg-white">
            ← Другой вариант
          </a>
        </div>
      </div>`;

    window.__currentSanatorium = s;
    renderFavoriteButton();
  } catch (e) {
    console.error(e);
    wrap.innerHTML = `
      <div class="text-center py-10">
        <video src="assets/sloth.mp4" autoplay loop muted playsinline class="w-32 h-32 mx-auto object-contain"></video>
        <p class="text-sm text-[#6b5a45] mt-3">Бэкенд недоступен.</p>
      </div>`;
  }
}

function renderFavoriteButton() {
  const s = window.__currentSanatorium;
  if (!s) return;

  const favs = loadFavorites();
  const isFav = favs.some(f => f.id === s.id);

  const btn = document.getElementById('favBtn');
  const icon = document.getElementById('favIcon');
  const label = document.getElementById('favLabel');
  if (!btn || !icon || !label) return;

  if (isFav) {
    btn.className = 'px-6 py-3 border border-[#c97b5a] rounded-2xl text-sm font-bold transition inline-flex items-center gap-2 bg-[#f4d9cb] text-[#7a3f28] hover:bg-[#ecc7b3]';
    icon.className = 'fa-solid fa-heart text-[#c97b5a]';
    label.textContent = 'В избранном';
  } else {
    btn.className = 'px-6 py-3 border border-[#d5c8a8] rounded-2xl text-sm font-bold hover:border-[#6b4226] hover:text-[#6b4226] transition inline-flex items-center gap-2 bg-white text-[#3d2817]';
    icon.className = 'fa-regular fa-heart';
    label.textContent = 'В избранное';
  }
}

window.toggleFavorite = function (sid) {
  const s = window.__currentSanatorium;
  if (!s) return;

  let favs = loadFavorites();
  const isFav = favs.some(f => f.id === sid);

  if (isFav) {
    favs = favs.filter(f => f.id !== sid);
  } else {
    favs.push({
      id: s.id,
      name: s.name,
      region: s.region,
      city: s.city,
      price: s.price,
      trust: s.trust
    });
  }

  saveFavorites(favs);
  renderFavoriteButton();
};

init();