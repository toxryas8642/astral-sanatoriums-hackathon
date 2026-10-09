const ILLUSTRATIONS = {
  sea:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',

  forest:
    'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1000&q=80',

  mountains:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80'
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function validImageUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value, document.baseURI);

    return ['https:', 'http:'].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function getIllustration(sanatorium) {
  const region =
    sanatorium.regionFull || sanatorium.region || '';

  if (/Краснодар|Крым|Дагестан|Сочи/i.test(region)) {
    return ILLUSTRATIONS.sea;
  }

  if (/Алтай|Ставрополь|КМВ/i.test(region)) {
    return ILLUSTRATIONS.mountains;
  }

  return ILLUSTRATIONS.forest;
}

export function renderRating(value) {
  const valid =
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 0 &&
    value <= 5;

  if (!valid) {
    return `
      <span
        class="inline-flex items-center rounded-xl px-3 py-1.5
               text-xs font-bold"
        style="
          background:#F1EBE1;
          color:#6b5a45;
          border:1px solid #e0d3b3;
        "
      >
        Нет оценки
      </span>
    `;
  }

  let background;
  let color;
  let border;

  if (value >= 4.5) {
    background = '#c8d9b0';
    color = '#3d4a22';
    border = '#b0c296';
  } else if (value >= 3.5) {
    background = '#e8dcc4';
    color = '#6b4f24';
    border = '#d4c29e';
  } else {
    background = '#f4d9cb';
    color = '#7a3d2b';
    border = '#dfb9a8';
  }

  const rating = value.toLocaleString('ru-RU', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  return `
    <span
      class="inline-flex items-center gap-1.5 rounded-xl
             px-3 py-1.5 text-sm font-bold"
      style="
        background:${background};
        color:${color};
        border:1px solid ${border};
      "
      aria-label="Рейтинг ${rating} из 5"
    >
      <span aria-hidden="true">★</span>

      <span>
        ${rating}
      </span>

      <span class="text-xs font-medium">
        / 5
      </span>
    </span>
  `;
}

export function renderCardImage(sanatorium) {
  const actualPhoto = validImageUrl(sanatorium.imageUrl);

  const source =
    actualPhoto ||
    getIllustration(sanatorium);

  const alt = actualPhoto
    ? `Фото: ${sanatorium.name}`
    : 'Пейзажная иллюстрация отдыха';

  return `
    <div
      class="relative mb-4 overflow-hidden rounded-2xl"
      style="
        height:180px;
        background:linear-gradient(
          135deg,
          #c8d9b0,
          #e8dcc4
        );
      "
    >
      <div
        class="absolute inset-0 flex items-center justify-center
               text-sm text-[#3d2817]"
      >
        Фото недоступно
      </div>

      <img
        src="${escapeHtml(source)}"
        alt="${escapeHtml(alt)}"
        width="1000"
        height="600"
        loading="lazy"
        decoding="async"
        class="relative w-full h-full object-cover"
        onerror="this.style.display='none'"
      >
    </div>
  `;
}