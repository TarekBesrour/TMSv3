// Utilitaire pour centraliser l'URL de l'API backend

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export function apiUrl(path: string) {
  if (path.startsWith('/')) {
    return `${API_URL}${path}`;
  }
  return `${API_URL}/${path}`;
}
