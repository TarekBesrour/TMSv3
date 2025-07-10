// VehicleDetails.tsx - Vue détaillée d'un véhicule avec onglets (shadcn/ui)

import React, { useEffect, useState } from 'react';
import { useParams , useNavigate  } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { apiFetch } from '../utils/apiFetch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const truckIcon = L.icon({
  iconUrl: '/icons/truck-marker.png',
  iconSize: [32, 32],        // largeur, hauteur en pixels
  iconAnchor: [16, 32],      // point de l’icône aligné sur la position GPS
  popupAnchor: [0, -32],     // position du popup par rapport à l’icône
});

interface Vehicle {
  id: string;
  registration_number: string;
  type: string;
  brand?: string;
  model?: string;
  year?: number;
  status: string;
  capacity_volume?: number;
  capacity_weight?: number;
  length?: number;
  width?: number;
  height?: number;
  fuel_type?: string;
  emissions_class?: string;
  health?: number;
  nextMaintenance?: string;
  alerts?: number;
  partner?: { name: string };
  location?: string;
  latitude?: number;
  longitude?: number;
}

const VehicleDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Vehicle>>({});

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await apiFetch(`/vehicles/${id}`);        
        const result = await response.json();
        
         // Affecter des valeurs de test si manquantes
        const testLat = 36.8065;   // Tunis
        const testLng = 10.1815;

        const patched = {
          ...result,
          latitude: result.latitude ?? testLat,
          longitude: result.longitude ?? testLng,
        };

        setVehicle(patched);
        
        setFormData(patched); // init form
      } catch (error) {
        console.error('Erreur chargement véhicule :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (!vehicle) return <div>Véhicule introuvable.</div>;

  const handleDelete = async () => {
    const confirm = window.confirm("Confirmer la suppression de ce véhicule ?");
    if (!confirm) return;
    try {
      await apiFetch(`/vehicles/${id}`, { method: 'DELETE' });
      navigate('/vehicles');
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      if (type === 'number') {
        return { ...prev, [name]: value === '' ? null : Number(value) };
      }
      return { ...prev, [name]: value };
    });
  };
  const handleSave = async () => {
    const payload = {
    ...formData,
    year: formData.year ? Number(formData.year) : null,
    capacity_volume: formData.capacity_volume ? Number(formData.capacity_volume) : null,
    capacity_weight: formData.capacity_weight ? Number(formData.capacity_weight) : null,
    length: formData.length ? Number(formData.length) : null,
    width: formData.width ? Number(formData.width) : null,
    height: formData.height ? Number(formData.height) : null,
  };

    try {
      const response = await apiFetch(`/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const updated = await response.json();
      setVehicle(updated);
      setIsEditing(false);
    } catch (err) {
      alert('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
                {vehicle.registration_number} - {vehicle.brand} {vehicle.model}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
              {isEditing ? (
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave}>
                    Enregistrer
                </Button>
              ) : (
            <Button variant="secondary" onClick={() => setIsEditing(true)}>Modifier</Button>
              )}

              
              <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
            </div>
          </div>

        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">Infos générales</TabsTrigger>
              <TabsTrigger value="tech">Caractéristiques</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="docs">Documents</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
                {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Input name="type" value={formData.type ?? ''} onChange={handleChange} />
                  </div>
                  <div>
                    <Label>Année</Label>
                    <Input name="year" type="number" value={formData.year ?? ''} onChange={handleChange} />
                  </div>
                  <div className="col-span-2">
                    <Label>Localisation</Label>
                    <Input name="location" value={formData.location ?? ''} onChange={handleChange} />
                  </div>
                </div>
              ) : (
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Type:</strong> {vehicle.type}</li>
                <li><strong>Année:</strong> {vehicle.year ?? '—'}</li>
                <li><strong>Partenaire:</strong> {vehicle.partner?.name ?? '—'}</li>
                <li><strong>Localisation:</strong> {vehicle.location ?? '—'}</li>
              </ul>
              )}
            </TabsContent>

            <TabsContent value="tech">
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Volume:</strong> {vehicle.capacity_volume ?? '—'} m³</li>
                <li><strong>Poids:</strong> {vehicle.capacity_weight ?? '—'} kg</li>
                <li><strong>Dimensions (L x l x h):</strong> {vehicle.length ?? '—'} × {vehicle.width ?? '—'} × {vehicle.height ?? '—'} m</li>
                <li><strong>Carburant:</strong> {vehicle.fuel_type ?? '—'}</li>
                <li><strong>Émission:</strong> {vehicle.emissions_class ?? '—'}</li>
              </ul>
            </TabsContent>

            <TabsContent value="maintenance">
              <ul className="text-sm text-gray-700 space-y-1">
                <li><strong>Prochaine maintenance:</strong> {vehicle.nextMaintenance ?? '—'}</li>
                <li><strong>État de santé:</strong> {vehicle.health ?? '—'}%</li>
                <li><strong>Alertes:</strong> {vehicle.alerts ?? 0}</li>
              </ul>
            </TabsContent>

            <TabsContent value="docs">
              <p className="text-sm text-gray-500">Gestion documentaire à venir...</p>
            </TabsContent>

            <TabsContent value="history">
              <p className="text-sm text-gray-500">Historique d'utilisation à venir...</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

            {vehicle.latitude && vehicle.longitude ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-md font-semibold">Localisation actuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full">
              <MapContainer
                center={[vehicle.latitude, vehicle.longitude]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[vehicle.latitude, vehicle.longitude]}
                  icon={truckIcon}
                >
                  <Popup>
                    {vehicle.registration_number} — {vehicle.location}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p className="text-sm text-gray-500">Position GPS non disponible.</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default VehicleDetails;
