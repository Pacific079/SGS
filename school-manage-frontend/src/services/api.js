export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export async function fetchJson(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(text || response.statusText);
  }
  return response.json();
}

export function csvUrl(path) {
  return `${API_BASE}${path}`;
}
