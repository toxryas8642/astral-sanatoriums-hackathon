import { fetchSanatoriums } from '../api.js';

import {
  adaptSanatorium,
  getVerdict,
  getRegionEmoji
} from '../adapter.js';

import {
  syncHeaderUser
} from '../ui.js';

import {
  renderCardImage,
  renderRating
} from '../card-media.js';

syncHeaderUser();

window.goToSearchWithText = function () {
  const input =
    document.getElementById('homeProblemInput');

  const text =
    (input?.value || '').trim();

  if (text) {
    sessionStorage.setItem(
      'pendingProblemText',
      text
    );
  }

  location.href = 'search.html';
};

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char])
  );
}

async function init() {
  const wrap =
    document.getElementById('topCards');

  if (!wrap) {
    return;
  }

  wrap.setAttribute(
    'aria-busy',
    'true'
  );

  try {
    const raw =
      await fetchSanatoriums();

    if (!Array.isArray(raw)) {
      throw new Error(
        'Сервер вернул некорректный список санаториев.'
      );
    }

    const list =
      raw.map(adaptSanatorium);

    const top =
      [...list]
        .sort(
          (a, b) =>
            b.trust - a.trust
        )
        .slice(0, 3);

    if (!top.length) {
      wrap.innerHTML = `
        <p
          class="col-span-full text-center
                 text-sm text-[#6b5a45]
                 py-10"
        >
          Пока нет доступных санаториев.
        </p>
      `;

      return;
    }

    wrap.innerHTML =
      top.map(s => {
        const verdict =
          getVerdict(s.trust);

        const price =
          Number(s.price)
            .toLocaleString('ru-RU');

        return `
          <a
            href="sanatorium.html?id=${encodeURIComponent(s.id)}"
            class="
              flex h-full flex-col
              bg-white
              border border-[#e3d8bd]
              rounded-3xl
              p-5

              hover:border-[#8a9a5b]
              hover:shadow-xl
              hover:shadow-[#c8d9b0]/40

              transition
            "
          >

            ${renderCardImage(s)}

            <div
              class="
                flex items-center
                gap-2 mb-2
              "
            >
              <span class="text-lg">
                ${getRegionEmoji(s.region)}
              </span>

              <span
                class="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-[#8a7a60]
                  font-bold
                "
              >
                ${escapeHtml(s.region)}
                ·
                ${escapeHtml(s.city)}
              </span>
            </div>

            <h3
              class="
                font-black
                text-[#3d2817]
                break-words
              "
            >
              ${escapeHtml(s.name)}
            </h3>

            <div class="mt-3">
              ${renderRating(s.rating)}
            </div>

            <p
              class="
                text-xs
                text-[#6b5a45]
                mt-3
              "
            >
              Санаторий в
              ${escapeHtml(s.city)}.
            </p>

            <div
              class="
                mt-auto
                pt-4
                flex
                items-center
                justify-between
                gap-3
                flex-wrap
              "
            >
              <div>
                <span
                  class="
                    text-lg
                    text-[#6b4226]
                    font-black
                  "
                >
                  ${price} ₽
                </span>

                <span
                  class="
                    text-xs
                    text-[#8a7a60]
                  "
                >
                  / сутки
                </span>
              </div>

              <span
                class="
                  ${verdict.bg}
                  ${verdict.border}
                  ${verdict.text}

                  border
                  px-2
                  py-1
                  rounded-full

                  text-[10px]
                  font-bold

                  inline-flex
                  items-center
                  gap-1
                "
              >
                <i
                  class="
                    fa-solid
                    ${verdict.icon}
                  "
                  aria-hidden="true"
                ></i>

                ${escapeHtml(verdict.label)}
                ·
                ${escapeHtml(s.trust)}/100
              </span>
            </div>

          </a>
        `;
      }).join('');

  } catch (error) {
    console.error(error);

    wrap.innerHTML = `
      <div
        class="
          col-span-full
          text-center
          py-10
        "
      >
        <video
          src="assets/sloth-v2.mp4"
          autoplay
          loop
          muted
          playsinline
          class="
            w-32
            h-32
            mx-auto
            object-contain
          "
        ></video>

        <p
          class="
            text-sm
            text-[#6b5a45]
            mt-3
          "
        >
          Не удалось загрузить санатории.
          Проверьте подключение к бэкенду
          и обновите страницу.
        </p>
      </div>
    `;

  } finally {
    wrap.setAttribute(
      'aria-busy',
      'false'
    );
  }
}

init();