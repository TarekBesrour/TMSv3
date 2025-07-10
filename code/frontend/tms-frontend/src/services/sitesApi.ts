// sitesApi.ts
// Service pour accéder à l'API des sites


import { apiFetch } from '../utils/apiFetch';

export interface Site {
  id: number;
  name: string;
  type: string;
  address?: string;
  city?: string;
  country?: string;
  partner_id: number;
  partner_name?: string;
  // Ajoutez d'autres champs si besoin
}

export async function fetchSites(): Promise<Site[]> {
  const res = await apiFetch('/v1/sites');
  if (!res.ok) throw new Error('Erreur lors du chargement des sites');
  return res.json();
}

export async function getSiteById(id: number | string): Promise<Site> {
  const res = await apiFetch(`/v1/sites/${id}`);
  if (!res.ok) throw new Error('Erreur lors de la récupération du site');
  return res.json();
}

export async function createSite(site: Omit<Site, 'id'>): Promise<Site> {
  const res = await apiFetch('/v1/sites', {
    method: 'POST',
    body: JSON.stringify(site),
  });
  if (!res.ok) throw new Error('Erreur lors de la création du site');
  return res.json();
}

export async function updateSite(id: number | string, site: Partial<Site>): Promise<Site> {
  // Nettoyer l'objet pour ne garder que les champs définis et attendus (pas d'id)
  const allowedFields = ['name', 'type', 'address', 'city', 'country', 'partner_id', 'partner_name'];
  const cleaned: Record<string, any> = {};
  for (const key of allowedFields) {
    if (site[key as keyof Site] !== undefined) {
      cleaned[key] = site[key as keyof Site];
    }
  }
  const res = await apiFetch(`/v1/sites/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cleaned),
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour du site');
  return res.json();
}

export async function deleteSite(id: number | string): Promise<void> {
  const res = await apiFetch(`/v1/sites/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression du site');
}
