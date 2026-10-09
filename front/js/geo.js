// Примерные координаты городов для демонстрации.
// Это НЕ проверенные координаты конкретных санаториев.
// Формат: [широта, долгота].
const CITY_COORDINATES = {
  'Пушкино': [56.01, 37.85],
  'Кисловодск': [43.91, 42.72],
  'Белокуриха': [51.99, 84.98],
  'Нижний Новгород': [56.33, 44.01],
  'Сосновый Бор': [59.90, 29.09],
  'Сочи': [43.59, 39.72],
  'Челябинск': [55.16, 61.40],
  'Барнаул': [53.35, 83.78],
  'Ялта': [44.50, 34.17],
  'Иркутск': [52.29, 104.28],
  'Пенза': [53.20, 45.02],
  'Петрозаводск': [61.79, 34.35],
  'Пермь': [58.01, 56.25],
  'Ростов-на-Дону': [47.24, 39.70],
  'Томск': [56.50, 84.97],
  'Владимир': [56.13, 40.41],
  'Казань': [55.80, 49.11],
  'Рязань': [54.63, 39.74],
  'Красноярск': [56.02, 92.87],
  'Воронеж': [51.67, 39.18],
  'Хабаровск': [48.48, 135.08],
  'Осташков': [57.15, 33.11],
  'Омск': [54.99, 73.37],
  'Приозерск': [61.04, 30.12],
  'Махачкала': [42.98, 47.50]
};

function validCoordinates(point) {
  return (
    point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lon) <= 180
  );
}

// Сначала используем координаты объекта из базы.
// Если их нет — примерные координаты его города.
function getDestination(sanatorium) {
  if (validCoordinates(sanatorium.coordinates)) {
    return {
      lat: sanatorium.coordinates.lat,
      lon: sanatorium.coordinates.lon,
      approximate: false
    };
  }

  const city = CITY_COORDINATES[sanatorium.city];

  if (!city) return null;

  return {
    lat: city[0],
    lon: city[1],
    approximate: true
  };
}

export function distanceKm(from, to) {
  if (!validCoordinates(from) || !validCoordinates(to)) {
    return null;
  }

  const radians = degrees => degrees * Math.PI / 180;
  const earthRadiusKm = 6371;

  const deltaLat = radians(to.lat - from.lat);
  const deltaLon = radians(to.lon - from.lon);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(from.lat)) *
    Math.cos(radians(to.lat)) *
    Math.sin(deltaLon / 2) ** 2;

  // Ограничение защищает от погрешностей округления.
  const bounded = Math.min(1, Math.max(0, a));

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(bounded));
}

export function addDistances(sanatoriums, userPosition) {
  return sanatoriums.map(sanatorium => {
    const destination = getDestination(sanatorium);

    return {
      ...sanatorium,
      distanceKm:
        userPosition && destination
          ? distanceKm(userPosition, destination)
          : null,
      distanceApproximate: destination?.approximate ?? false
    };
  });
}

export function getUserPosition() {
  return new Promise((resolve, reject) => {
    if (!window.isSecureContext) {
      reject(new Error(
        'Геолокация доступна через HTTPS или localhost.'
      ));
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error(
        'Этот браузер не поддерживает геолокацию.'
      ));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = {
          lat: coords.latitude,
          lon: coords.longitude,
          accuracy: coords.accuracy
        };

        if (!validCoordinates(position)) {
          reject(new Error('Браузер вернул некорректные координаты.'));
          return;
        }

        resolve(position);
      },
      error => {
        const messages = {
          1: 'Доступ к местоположению запрещён. Разрешите его в настройках сайта и повторите.',
          2: 'Не удалось определить местоположение. Проверьте настройки геолокации устройства.',
          3: 'Время ожидания истекло. Попробуйте ещё раз.'
        };

        reject(new Error(
          messages[error.code] || 'Ошибка определения местоположения.'
        ));
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  });
}