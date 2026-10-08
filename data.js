// data.js — единый источник данных для всех страниц

const SANATORIUMS = [
  {
    id: 1,
    name: 'Санаторий «Кавказ»',
    city: 'Кисловодск',
    region: 'КМВ',
    price: 5800,
    trust: 92,
    comfort: 'Стандарт+',
    rating: 4.7,
    procedures: ['Грязи', 'Ванны', 'Массаж'],
    tours: ['Горы', 'Исторические'],
    description: 'Классика КМВ — нарзан, грязи и виды на Эльбрус',
    transitTime: '40 мин от ЖД / 55 мин от аэропорта',
    siteUrl: 'https://kavkaz-kislovodsk.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 4500,
    egrulInn: '2628045610',
    sslIssuer: 'GlobalSign Trust CA',
    securityDetails: 'Официальный сайт учреждения. ИНН совпадает с лицензией Минздрава ЛО-26-01-00812.'
  },
  {
    id: 2,
    name: 'Санаторий «Плаза»',
    city: 'Ессентуки',
    region: 'КМВ',
    price: 6200,
    trust: 88,
    comfort: 'Комфорт',
    rating: 4.5,
    procedures: ['Ванны', 'Климатотерапия', 'Массаж'],
    tours: ['Горы', 'Исторические'],
    description: 'Минеральные источники и лечебные ванны',
    transitTime: '35 мин от ЖД Минеральные Воды',
    siteUrl: 'https://plaza-essentuki.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 3200,
    egrulInn: '2626001234',
    sslIssuer: 'DigiCert SHA2',
    securityDetails: 'Официальный сайт. Полный цикл лечебных программ.'
  },
  {
    id: 3,
    name: 'Санаторий «Источник»',
    city: 'Пятигорск',
    region: 'КМВ',
    price: 4500,
    trust: 85,
    comfort: 'Стандарт',
    rating: 4.3,
    procedures: ['Грязи', 'ЛФК'],
    tours: ['Гастрономические'],
    description: 'Дёшево и сердито — грязи и лечебная физкультура',
    transitTime: '30 мин от ЖД Минеральные Воды',
    siteUrl: 'https://istochnik-pyatigorsk.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 2100,
    egrulInn: '2632014589',
    sslIssuer: 'Let\'s Encrypt',
    securityDetails: 'Государственное курортное объединение.'
  },
  {
    id: 4,
    name: 'Санаторий «Роза»',
    city: 'Сочи',
    region: 'Сочи',
    price: 7500,
    trust: 95,
    comfort: 'Комфорт',
    rating: 4.9,
    procedures: ['Климатотерапия', 'Массаж', 'ЛФК'],
    tours: ['Водопады', 'Горы'],
    description: 'Море, пальмы и водопады Красной Поляны',
    transitTime: '25 мин от аэропорта Адлер',
    siteUrl: 'https://roza-sochi.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 3800,
    egrulInn: '2320112233',
    sslIssuer: 'SberCA Russian Trust',
    securityDetails: 'Аккредитованный санаторий с товарным знаком.'
  },
  {
    id: 5,
    name: 'Санаторий «Жемчужина»',
    city: 'Анапа',
    region: 'Сочи',
    price: 5200,
    trust: 78,
    comfort: 'Стандарт+',
    rating: 4.1,
    procedures: ['Грязи', 'Ванны'],
    tours: ['Водопады', 'Гастрономические'],
    description: 'Песчаные пляжи и грязевые вулканы',
    transitTime: '40 мин от ЖД Анапа',
    siteUrl: 'https://zhemchuzhina-anapa.ru',
    domainStatus: 'SUSPICIOUS',
    whoisAgeDays: 180,
    egrulInn: '2301009988',
    sslIssuer: 'Let\'s Encrypt Free',
    securityDetails: 'ПОДОЗРЕНИЕ: домен зарегистрирован недавно, требует дополнительной проверки.'
  },
  {
    id: 6,
    name: 'Санаторий «Горный воздух»',
    city: 'Белокуриха',
    region: 'Алтай',
    price: 9500,
    trust: 90,
    comfort: 'Премиум',
    rating: 4.8,
    procedures: ['Климатотерапия', 'Ванны', 'Массаж'],
    tours: ['Горы', 'Водопады', 'Исторические'],
    description: 'Радоновые источники и алтайские горы',
    transitTime: '110 мин от аэропорта Горно-Алтайск',
    siteUrl: 'https://gorny-vozduh.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 2900,
    egrulInn: '2204001923',
    sslIssuer: 'GlobalSign Trust CA',
    securityDetails: 'Официальный сайт. Радоновые источники.'
  },
  {
    id: 7,
    name: 'Санаторий «Крепость»',
    city: 'Кисловодск',
    region: 'КМВ',
    price: 4800,
    trust: 82,
    comfort: 'Стандарт',
    rating: 4.2,
    procedures: ['Ванны', 'ЛФК'],
    tours: ['Исторические'],
    description: 'Скромно, но с душой — рядом с нарзанной галереей',
    transitTime: '45 мин от аэропорта Минеральные Воды',
    siteUrl: 'https://krepost-kislovodsk.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 1800,
    egrulInn: '2628011122',
    sslIssuer: 'DigiCert SHA2',
    securityDetails: 'Официальный сайт санатория.'
  },
  {
    id: 8,
    name: 'Санаторий «Лазурный берег»',
    city: 'Сочи',
    region: 'Сочи',
    price: 8200,
    trust: 93,
    comfort: 'Комфорт',
    rating: 4.7,
    procedures: ['Климатотерапия', 'Грязи', 'Массаж'],
    tours: ['Водопады', 'Горы'],
    description: 'Современный санаторий у самого моря',
    transitTime: '20 мин от аэропорта Адлер',
    siteUrl: 'https://lazurny-bereg-sochi.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 2500,
    egrulInn: '2320223344',
    sslIssuer: 'SberCA Russian Trust',
    securityDetails: 'Официальный сайт санатория.'
  },
  {
    id: 9,
    name: 'Санаторий «Алтай-West»',
    city: 'Белокуриха',
    region: 'Алтай',
    price: 7200,
    trust: 87,
    comfort: 'Стандарт+',
    rating: 4.5,
    procedures: ['Ванны', 'Климатотерапия', 'ЛФК'],
    tours: ['Горы', 'Водопады'],
    description: 'Сибирское здоровье в горах',
    transitTime: '120 мин от аэропорта Горно-Алтайск',
    siteUrl: 'https://altay-west.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 2200,
    egrulInn: '2204003344',
    sslIssuer: 'DigiCert SHA2',
    securityDetails: 'Официальный сайт санатория.'
  },
  {
    id: 10,
    name: 'Санаторий «Нарзан»',
    city: 'Кисловодск',
    region: 'КМВ',
    price: 6800,
    trust: 89,
    comfort: 'Комфорт',
    rating: 4.6,
    procedures: ['Ванны', 'Грязи', 'Климатотерапия', 'Массаж'],
    tours: ['Горы', 'Исторические', 'Гастрономические'],
    description: 'Полный набор процедур КМВ',
    transitTime: '35 мин от ЖД Минеральные Воды',
    siteUrl: 'https://narzan-kislovodsk.ru',
    domainStatus: 'VERIFIED',
    whoisAgeDays: 4100,
    egrulInn: '2628005566',
    sslIssuer: 'GlobalSign Trust CA',
    securityDetails: 'Официальный сайт. Полный набор процедур.'
  }
];

// Хелпер для чтения из localStorage
function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}

// Хелпер для записи
function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Цвета-вердикты по trust-рейтингу
function getVerdict(trust) {
  if (trust >= 85) return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'Доверенный', icon: 'fa-shield-halved' };
  if (trust >= 70) return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'Осторожно', icon: 'fa-triangle-exclamation' };
  return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', label: 'Риск', icon: 'fa-circle-xmark' };
}

// Регион-эмодзи
function getRegionEmoji(region) {
  return { 'КМВ': '⛰️', 'Сочи': '🌴', 'Алтай': '🌲' }[region] || '📍';
}

// Синхронизация шапки с профилем
function syncHeaderUser() {
  const user = loadLS('user', null);
  if (!user || !user.name) return;
  const nameEl = document.getElementById('headerName');
  const avatarEl = document.getElementById('headerAvatar');
  if (nameEl) nameEl.textContent = user.name;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}