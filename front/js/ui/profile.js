import { state } from '../state.js';
import { openRoutine } from './routine.js';

export function openProfile(id) {
  const item = state.allSanatoriums.find(s => s.id === id);
  if (!item) return;
  state.currentProfileId = id;

  document.getElementById('profPhoto1').src = 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80';
  document.getElementById('profPhoto2').src = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80';
  document.getElementById('profPhoto3').src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';

  document.getElementById('profName').textContent = item.name;

  const badge = document.getElementById('profBadge');
  if (item.isClone) {
    badge.textContent = '⚠️ Подозрительный сайт';
    badge.className = 'text-xs px-3 py-1 rounded-full font-bold bg-red-50 text-red-700 border border-red-200';
  } else {
    badge.textContent = 'Проверенный партнер';
    badge.className = 'text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
  }

  document.getElementById('profLocation').textContent = `${item.region}, ${item.city}`;
  document.getElementById('profTransit').textContent = `${item.transport.airport} мин от аэропорта, ${item.transport.train} мин от вокзала`;
  document.getElementById('profFounded').textContent = '';

  document.getElementById('profScore').textContent = item.matchScore + '%';
  document.getElementById('profDescription').textContent = `Санаторий в ${item.city}. Рейтинг ${item.rating}.`;

  document.getElementById('profMedical').innerHTML = (item.procedures || []).map(m =>
    `<span class="px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-medium">${m}</span>`
  ).join('');

  const features = [];
  if (item.has_pool) features.push('Бассейн');
  if (item.child_friendly) features.push('Для детей');
  document.getElementById('profFeatures').innerHTML = features.map(f =>
    `<span class="px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-medium">${f}</span>`
  ).join('');

  document.getElementById('profAddress').textContent = item.address;
  document.getElementById('profPhone').textContent = item.phone;
  document.getElementById('profEmail').textContent = 'info@' + item.site;
  document.getElementById('profWebsite').textContent = item.site;

  const secBox = document.getElementById('profSecurityBox');
  if (item.isClone) {
    secBox.className = 'p-4 rounded-2xl text-xs leading-relaxed bg-red-50 border border-red-200 text-red-800';
    secBox.innerHTML = `<div class="font-black mb-1">⚠️ ВОЗМОЖНЫЙ ДУБЛИКАТ</div><p>Этот сайт может быть клоном. Проверьте ИНН и адрес перед бронированием.</p>`;
  } else {
    secBox.className = 'p-4 rounded-2xl text-xs leading-relaxed bg-emerald-50 border border-emerald-200 text-emerald-800';
    secBox.innerHTML = `<div class="font-black mb-1">🛡 ВЕРИФИЦИРОВАННЫЙ ОБЪЕКТ</div><p>Медицинская лицензия подтверждена.</p>`;
  }

  document.getElementById('profPrice').textContent = item.price_per_day.toLocaleString() + ' ₽';
  document.getElementById('profRating').textContent = '★ ' + item.rating;
  document.getElementById('profFoundedSide').textContent = '—';
  document.getElementById('profCapacity').textContent = '—';
  document.getElementById('profDuration').textContent = '—';

  const modal = document.getElementById('profileModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

export function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  state.currentProfileId = null;
}

export function openRoutineFromProfile() {
  if (state.currentProfileId !== null) openRoutine(state.currentProfileId);
}