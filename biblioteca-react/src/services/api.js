const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function apiFetch(path, options = {}) {
  const token = sessionStorage.getItem('biblioteca_token');
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inicia el backend con "cd server; npm run dev".');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la solicitud.');
  return data;
}
