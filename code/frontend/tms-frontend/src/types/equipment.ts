
export interface Equipment {
  id: number;
  identification: string;
  type: string; // e.g., 'remorque', 'conteneur', 'hayon'
  characteristics?: string; // JSON string or text for dimensions, capacity, compatibilities
  financialInfo?: string; // JSON string or text for cost, amortization, ownership/lease
  status: 'available' | 'in_maintenance' | 'reserved' | 'in_use' | 'out_of_service';
  location?: string; // Current physical location or last known GPS location
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  documents?: string; // JSON string for associated documents (e.g., 'immatriculation', 'certificats')
  createdAt?: string;
  updatedAt?: string;
}


