
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Equipment } from '../types/equipment';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/apiFetch';

const EquipmentList: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const response = await apiFetch('/equipments');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Equipment[] = await response.json();
        setEquipments(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipments();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        const response = await fetch(`/api/equipments/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        setEquipments(equipments.filter((eq) => eq.id !== id));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return <div>Loading equipments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Equipment List</h1>
      <div className="flex justify-end mb-4">
        <Link to="/equipments/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" /> Add New Equipment
        </Link>
      </div>
      {equipments.length === 0 ? (
        <p>No equipments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Identification</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Location</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((equipment) => (
                <tr key={equipment.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b text-center">{equipment.id}</td>
                  <td className="py-2 px-4 border-b">{equipment.identification}</td>
                  <td className="py-2 px-4 border-b">{equipment.type}</td>
                  <td className="py-2 px-4 border-b">{equipment.status}</td>
                  <td className="py-2 px-4 border-b">{equipment.location || 'N/A'}</td>
                  <td className="py-2 px-4 border-b text-center">
                    <Link to={`/equipments/${equipment.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      <PencilIcon className="h-5 w-5 inline-block" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(equipment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5 inline-block" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;


