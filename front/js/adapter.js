const REGION_MAP = {
  'Ставропольский край': 'КМВ',
  'Краснодарский край': 'Сочи',
  'Алтайский край': 'Алтай',
  'Республика Крым': 'Сочи',
  'Московская область': 'Подмосковье',
  'Ленинградская область': 'Подмосковье',
  'Нижегородская область': 'Подмосковье'
};

export function getShortRegion(region) {
  return REGION_MAP[region] || region;
}

export function getComfort(price) {
  if (price >= 8000) return 'Премиум';
  if (price >= 6000) return 'Комфорт';
  if (price >= 4500) return 'Стандарт+';
  return 'Стандарт';
}

export function getTrust(s) {
  const base = Math.round(((s.rating || 0) / 5) * 100);
  return s.isClone ? Math.max(20, base - 50) : base;
}

export function getVerdict(trust) {
  if (trust >= 80) return { bg: 'bg-[#c8d9b0]', border: 'border-[#8a9a5b]', text: 'text-[#3d4a22]', label: 'Доверенный', icon: 'fa-shield-halved' };
  if (trust >= 60) return { bg: 'bg-[#f4d9cb]', border: 'border-[#e2b8a3]', text: 'text-[#7a3f28]', label: 'Осторожно', icon: 'fa-triangle-exclamation' };
  return { bg: 'bg-[#f4d9cb]', border: 'border-[#c97b5a]', text: 'text-[#7a1f1f]', label: 'Риск', icon: 'fa-circle-xmark' };
}

export function getRegionEmoji(region) {
  const short = getShortRegion(region);
  return { 'КМВ': '⛰️', 'Сочи': '🌴', 'Алтай': '🌲', 'Подмосковье': '🌳' }[short] || '📍';
}

export function adaptSanatorium(s) {
  const trust = getTrust(s);
  return {
    id: s.id,
    name: s.name,
    city: s.city,
    coordinates: s.coordinates ?? null,
    region: getShortRegion(s.region),
    regionFull: s.region,
    price: s.price_per_day,
    rating: s.rating,
    trust,
    comfort: getComfort(s.price_per_day),
    procedures: (s.procedures || []).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
    tours: (s.excursions || []).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
    description: `Санаторий в ${s.city}. Рейтинг ${s.rating}.`,
    transitTime: `${s.transport?.airport ?? '—'} мин от аэропорта / ${s.transport?.train ?? '—'} мин от ЖД`,
    siteUrl: 'https://' + (s.site || ''),
    hasPool: !!s.has_pool,
    childFriendly: !!s.child_friendly,
    isClone: !!s.isClone,
    matchScore: s.matchScore ?? null,
    matchReasons: s.matchReasons || [],
    address: s.address,
    phone: s.phone,
    inn: s.inn,
    domainStatus: s.isClone ? 'SUSPICIOUS' : 'VERIFIED',
    egrulInn: s.inn || '—',
    securityDetails: s.isClone
      ? 'ВНИМАНИЕ: сайт помечен как возможный дубликат. Проверьте ИНН и адрес перед бронированием.'
      : 'Официальный сайт. Данные совпадают с ЕГРЮЛ.'
  };
}