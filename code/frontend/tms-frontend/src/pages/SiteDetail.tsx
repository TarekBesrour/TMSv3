import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSiteById, updateSite, deleteSite, Site } from '../services/sitesApi';

const SiteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<Site | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Site>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSiteById(id)
      .then((data) => {
        setSite(data);
        setForm(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erreur lors du chargement du site');
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    try {
      const updated = await updateSite(id, form);
      setSite(updated);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Supprimer ce site ?')) return;
    try {
      await deleteSite(id);
      navigate('/sites');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!site) return <div className="p-8">Site introuvable</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h2 className="text-2xl font-bold mb-4">Détail du site</h2>
      {!editMode ? (
        <div className="space-y-2">
          <div><b>Nom :</b> {site.name}</div>
          <div><b>Type :</b> {site.type}</div>
          <div><b>Adresse :</b> {site.address}</div>
          <div><b>Ville :</b> {site.city}</div>
          <div><b>Pays :</b> {site.country}</div>
          <div><b>ID Partenaire :</b> {site.partner_id}</div>
          <div className="flex gap-2 mt-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={() => setEditMode(true)}>Modifier</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Supprimer</button>
            <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => navigate('/sites')}>Retour</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block font-medium">Nom</label>
            <input name="name" value={form.name || ''} onChange={handleChange} required className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Type</label>
            <select name="type" value={form.type || ''} onChange={handleChange} required className="w-full border rounded p-2">
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
            <input name="address" value={form.address || ''} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Ville</label>
            <input name="city" value={form.city || ''} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">Pays</label>
            <input name="country" value={form.country || ''} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block font-medium">ID Partenaire</label>
            <input name="partner_id" value={form.partner_id || ''} onChange={handleChange} type="number" required className="w-full border rounded p-2" />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Enregistrer</button>
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditMode(false)}>Annuler</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SiteDetail;
