// Types pour les tournées (tours)

export type TourStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Tour {
  id: string;
  tour_name: string;
  tour_number: string;
  planned_date: string;
  start_time?: string;
  end_time?: string;
  status: TourStatus;
  vehicle?: {
    registration_number: string;
    type?: string;
    // autres propriétés véhicule si besoin
  };
  driver?: {
    first_name: string;
    last_name: string;
    // autres propriétés conducteur si besoin
  };
  total_distance?: number;
  estimated_duration?: number; // en minutes
  optimization_score?: number;
  notes?: string;
  stops?: Stop[];
  // autres propriétés selon le backend
}

// Ajout du type Stop pour les arrêts de tournée
export interface Stop {
  id?: string | number; // Ajout d'un identifiant optionnel pour les clés React et navigation
  address_id: string | number;
  address?: {
    street: string;
    city: string;
    // autres propriétés d'adresse si besoin
  };
  scheduled_time: string;
  location_type: 'pickup' | 'delivery' | 'intermediate';
  service_duration?: number;
  order_id?: string | number;
  shipment_id?: string | number;
}
