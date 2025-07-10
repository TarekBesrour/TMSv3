import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSite, Site } from '../services/sitesApi';

const initialSite: Omit<Site, 'id'> = {
  name: '',
  type: '',
  address: '',
  city: '',
  country: '',
  partner_id: 1,
  partner_name: '',
};

const SiteForm: React.FC = () => {
  const [site, setSite] = useState<Omit<Site, 'id'>>(initialSite);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSite({ ...site, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createSite(site);
      navigate('/sites');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du site');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Créer un site</h2>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Nom</label>
          <input name="name" value={site.name} onChange={handleChange} required className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium">Type</label>
          <select name="type" value={site.type} onChange={handleChange} required className="w-full border rounded p-2">
            <option value="">Sélectionner</option>
            <option value="WAREHOUSE">Entrepôt</option>
            <option value="FACTORY">Usine</option>
            <option value="STORE">Magasin</option>
            <option value="DISTRIBUTION_CENTER">Centre de distribution</option>
            <option value="CROSS_DOCK">Cross-dock</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">Adresse</label>
          <input name="address" value={site.address} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium">Ville</label>
          <input name="city" value={site.city} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium">Pays</label>
          <input name="country" value={site.country} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium">ID Partenaire</label>
          <input name="partner_id" value={site.partner_id} onChange={handleChange} type="number" required className="w-full border rounded p-2" />
        </div>
        <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded">
          {loading ? 'Création...' : 'Créer'}
        </button>
      </form>
    </div>
  );
};

export default SiteForm;
