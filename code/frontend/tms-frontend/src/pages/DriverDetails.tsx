import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  status: string;
  partner_id: number;
  partner_name?: string;
}

const DriverDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Driver>>({});

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/drivers/${id}`);
        if (!response.ok) throw new Error('Erreur lors du chargement des détails du Conducteur');
        const data = await response.json();
        setDriver(data);
        setFormData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriver();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await apiFetch(`/drivers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      const updated = await response.json();
      setDriver(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Confirmer la suppression de ce Conducteur ?')) return;

    try {
      const response = await apiFetch(`/drivers/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      navigate('/drivers');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-8">Chargement...</div>;
  if (error) return <div className="p-8 text-red-600">Erreur : {error}</div>;
  if (!driver) return <div className="p-8">Conducteur non trouvé</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Détails du Conducteur</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label>
              Nom :
              <input
                type="text"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Prénom :
              <input
                type="text"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Numéro de permis :
              <input
                type="text"
                name="license_number"
                value={formData.license_number || ''}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Type de permis :
              <input
                type="text"
                name="license_type"
                value={formData.license_type || ''}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Expiration du permis :
              <input
                type="date"
                name="license_expiry"
                value={formData.license_expiry?.split('T')[0] || ''}
                onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                pattern="\d{4}-\d{2}-\d{2}" // optionnel pour renfort
                required
                disabled={!editing}
                className="w-full border px-2 py-1 rounded"
              />
            </label>
            <label>
              Statut :
              <select
                name="status"
                value={formData.status || ''}
                onChange={handleChange}
                disabled={!editing}
                className="w-full border px-2 py-1 rounded"
              >
                <option value="available">Disponible</option>
                <option value="on_duty">En service</option>
                <option value="off_duty">Hors service</option>
                <option value="on_leave">En congé</option>
                <option value="training">En formation</option>
              </select>
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between mt-4">
          <div className="space-x-2">
            {!editing ? (
              <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-500 text-white rounded">
                Modifier
              </button>
            ) : (
              <>
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded">
                  Enregistrer
                </button>
                <button onClick={() => { setEditing(false); setFormData(driver); }} className="px-4 py-2 bg-gray-400 text-white rounded">
                  Annuler
                </button>
              </>
            )}
          </div>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">
            Supprimer
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DriverDetails;
