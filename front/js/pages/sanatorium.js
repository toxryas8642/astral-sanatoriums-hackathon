import { fetchSanatoriums } from '../api.js';
import { adaptSanatorium, getVerdict, getRegionEmoji } from '../adapter.js';
import { syncHeaderUser } from '../ui.js';

syncHeaderUser();

const id = +new URLSearchParams(location.search).get('id');
const wrap = document.getElementById('content');

async function init() {
  try {
    const raw = await fetchSanatoriums();
    const list = raw.map(adaptSanatorium);
    const s = list.find(x => x.id === id);

    if (!s) {
      wrap.innerHTML = `
        <div class="text-center py-16">
          <div class="text-5xl mb-3">😴</div>
          <p class="text-slate-300 font-bold">Санаторий не найден</p>
          <a href="search.html" class="inline-block mt-4 px-5 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white text-xs font-bold">← Вернуться к подбору</a>
        </div>`;
      return;
    }

    const v = getVerdict(s.trust);
    const emoji = getRegionEmoji(s.region);

    wrap.innerHTML = `
      <div class="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8">
        <div class="flex items-center gap-2 mb-3">
          <span class="text-lg">${emoji}</span>
          <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">${s.region} · ${s.city}</span>
          <span class="${v.bg} ${v.border} ${v.text} border px-2 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ml-auto">
            <i class="fa-solid ${v.icon}"></i>${v.label} ${s.trust}/100
          </span>
        </div>
        <h1 class="text-3xl md:text-4xl font-black text-white">${s.name}</h1>
        <p class="text-slate-400 mt-2">${s.description}</p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Цена</div>
            <div class="text-pink-400 font-black mt-1">${s.price.toLocaleString('ru-RU')} ₽</div>
            <div class="text-[10px] text-slate-500">за сутки</div>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Рейтинг</div>
            <div class="text-amber-300 font-black mt-1">★ ${s.rating}</div>
            <div class="text-[10px] text-slate-500">из 5</div>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Комфорт</div>
            <div class="text-white font-black mt-1">${s.comfort}</div>
            <div class="text-[10px] text-slate-500">уровень</div>
          </div>
          <div class="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Дорога</div>
            <div class="text-white font-black mt-1 text-xs">${s.transitTime}</div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4 mt-6">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Медицинский профиль</h3>
            <div class="flex flex-wrap gap-1.5">
              ${s.procedures.map(p => `<span class="px-2 py-1 rounded-md bg-pink-950/60 border border-pink-800/50 text-pink-300 text-xs">${p}</span>`).join('')}
            </div>
          </div>
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Экскурсии рядом</h3>
            <div class="flex flex-wrap gap-1.5">
              ${s.tours.map(t => `<span class="px-2 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 text-xs">${t}</span>`).join('')}
            </div>
          </div>
        </div>

        <div class="mt-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            <i class="fa-solid fa-shield-halved text-emerald-400 mr-1"></i>
            Протокол безопасности сайта
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <div class="text-slate-500">ИНН в ЕГРЮЛ</div>
              <div class="text-white font-bold">${s.egrulInn}</div>
            </div>
            <div>
              <div class="text-slate-500">Адрес</div>
              <div class="text-white font-bold text-[10px]">${s.address || '—'}</div>
            </div>
            <div>
              <div class="text-slate-500">Телефон</div>
              <div class="text-white font-bold text-[10px]">${s.phone || '—'}</div>
            </div>
            <div>
              <div class="text-slate-500">Статус</div>
              <div class="${v.text} font-bold">${v.label}</div>
            </div>
          </div>
          <p class="text-xs text-slate-300 mt-3 leading-relaxed">${s.securityDetails}</p>
        </div>

        ${s.matchReasons && s.matchReasons.length ? `
          <div class="mt-6 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40">
            <h3 class="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">
              <i class="fa-solid fa-check mr-1"></i> Почему подходит
            </h3>
            <ul class="text-xs text-slate-300 space-y-1">
              ${s.matchReasons.map(r => `<li>• ${r}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="mt-6 flex flex-wrap gap-3">
          <a href="${s.siteUrl}" target="_blank" rel="noopener" class="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl text-white text-sm font-black shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition inline-flex items-center gap-2">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            Перейти на сайт
          </a>
          <button onclick="addToFavorites(${s.id})" class="px-6 py-3 border border-slate-700 rounded-2xl text-slate-300 text-sm font-bold hover:border-pink-500/50 hover:text-pink-300 transition inline-flex items-center gap-2">
            <i class="fa-regular fa-heart"></i> В избранное
          </button>
          <a href="search.html" class="px-6 py-3 border border-slate-700 rounded-2xl text-slate-300 text-sm font-bold hover:border-cyan-500/50 hover:text-cyan-300 transition inline-flex items-center gap-2">
            ← Другой вариант
          </a>
        </div>
      </div>`;

    window.__currentSanatorium = s;
  } catch (e) {
    console.error(e);
    wrap.innerHTML = '<p class="text-red-400 text-sm">Бэкенд недоступен.</p>';
  }
}

window.addToFavorites = function (sid) {
  const s = window.__currentSanatorium;
  if (!s) return;
  const raw = localStorage.getItem('favorites');
  const favs = raw ? JSON.parse(raw) : [];
  if (favs.some(f => f.id === sid)) {
    alert('Уже в избранном');
    return;
  }
  favs.push({
    id: s.id,
    name: s.name,
    region: s.region,
    city: s.city,
    price: s.price,
    trust: s.trust
  });
  localStorage.setItem('favorites', JSON.stringify(favs));
  alert('Добавлено в избранное');
};

init();