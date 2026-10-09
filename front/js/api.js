export const API_URL = 'http://127.0.0.1:8000';

export async function fetchSanatoriums() {
  const res = await fetch(`${API_URL}/api/sanatoriums`);
  if (!res.ok) throw new Error('Ошибка загрузки санаториев');
  return res.json();
}

export async function fetchMatch(payload) {
  const res = await fetch(`${API_URL}/api/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Ошибка подбора');
  return res.json();
}