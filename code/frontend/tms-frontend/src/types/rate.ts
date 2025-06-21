export interface Rate {
  id: number;
  rate_name: string;
  rate_type: string;
  base_rate: number;
  currency: string;
  min_weight?: number;
  max_weight?: number;
  min_volume?: number;
  max_volume?: number;
  min_distance?: number;
  max_distance?: number;
  origin_country?: string;
  destination_country?: string;
  mode_of_transport?: string;
  valid_from?: string; // format: date
  valid_to?: string;   // format: date
  notes?: string;
  status?: 'active' | 'inactive' | 'expired' | string;
}