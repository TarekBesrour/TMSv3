// Types pour la disponibilité des ressources

export type ResourceType = 'vehicle' | 'driver';
export type ResourceAvailabilityStatus = 'available' | 'unavailable' | 'booked' | 'maintenance';

export interface ResourceAvailability {
  id: string; // Ajout de l'identifiant unique pour la ressource
  resource_type: ResourceType;
  resource_id: string;
  start_time: string;
  end_time: string;
  status: ResourceAvailabilityStatus;
  notes?: string;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  type?: string;
  // autres propriétés véhicule si besoin
}

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  // autres propriétés conducteur si besoin
}
