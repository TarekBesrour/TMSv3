export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('accessToken');
  return fetch(`${API_URL}${url}`, {
    method: options.method || 'GET', // <-- méthode par défaut GET
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}