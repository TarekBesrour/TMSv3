// partnersApi.ts
// Service pour accéder à l'API des partenaires

import { apiFetch } from '../utils/apiFetch';
//import { apiFetch } from '../utils/apiFetch';

export interface Partner {
  id: string;
  name: string;
  type: 'customer' | 'carrier' | 'supplier' | 'agent' | 'broker' | 'other';
  legal_form: string | null;
  registration_number: string | null;
  vat_number: string | null;
  website: string | null;
  logo_url: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'pending' | 'blocked';
}

// ajouté Tarek

export interface Contact {
  id: number;
  partner_id: number;
  first_name: string;
  last_name: string;
  position?: string;
  email?: string;
  phone?: string;
  is_primary: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  partner_id: number;
  name?: string;
  street_line1: string;
  street_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_headquarters: boolean;
  is_billing: boolean;
  is_shipping: boolean;
  is_operational: boolean;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: number;
  partner_id: number;
  name: string;
  code?: string;
  type: 'WAREHOUSE' | 'FACTORY' | 'STORE' | 'DISTRIBUTION_CENTER' | 'CROSS_DOCK' | 'OTHER';
  capacity?: number;
  address?: Address;
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: number;
  partner_id: number;
  registration_number: string;
  type: 'TRUCK' | 'VAN' | 'TRAILER' | 'CONTAINER' | 'OTHER';
  brand?: string;
  model?: string;
  year?: number;
  capacity_weight?: number; // in kg
  capacity_volume?: number; // in m³
  status: 'active' | 'inactive' | 'maintenance' | 'out_of_service';
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: number;
  partner_id: number;
  first_name: string;
  last_name: string;
  license_number?: string;
  license_type?: string;
  license_expiry?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  partner_id: number;
  reference: string;
  type: 'TRANSPORT' | 'LOGISTICS' | 'WAREHOUSING' | 'DISTRIBUTION' | 'OTHER';
  start_date: string;
  end_date?: string;
  renewal_date?: string;
  status: 'active' | 'draft' | 'expired' | 'terminated' | 'pending_renewal';
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  partner_id: number;
  name: string;
  type: 'CONTRACT' | 'CERTIFICATE' | 'LICENSE' | 'INSURANCE' | 'INVOICE' | 'OTHER';
  file_path: string;
  size?: number; // in bytes
  upload_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}


// fin tarek

export interface PartnersApiResponse {
  data: Partner[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchPartners(params?: {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<PartnersApiResponse | Partner[]> {
  let url = '/v1/partners';
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') searchParams.append(key, value.toString());
    });
    if (Array.from(searchParams).length > 0) {
      url += `?${searchParams.toString()}`;
    }
  }
  const res = await apiFetch(url);
  if (!res.ok) throw new Error('Erreur lors du chargement des partenaires');
  return res.json();
}

export async function createPartner(partner: Omit<Partner, 'id'>): Promise<Partner> {
  // Champs autorisés et obligatoires
  const allowedTypes = ['customer', 'carrier', 'supplier', 'agent', 'broker', 'other'];
  const allowedStatus = ['active', 'inactive', 'pending', 'blocked'];
  // Validation minimale côté frontend
  if (!partner.name || !partner.type || !partner.status) {
    throw new Error('Les champs nom, type et statut sont obligatoires');
  }
  if (!allowedTypes.includes(partner.type)) {
    throw new Error('Type de partenaire invalide');
  }
  if (!allowedStatus.includes(partner.status)) {
    throw new Error('Statut de partenaire invalide');
  }
  // Nettoyer l'objet pour n'envoyer que les champs attendus et non vides
  const cleanedPartner: Record<string, any> = {
    name: partner.name,
    type: partner.type,
    status: partner.status,
  };
  if (partner.legal_form) cleanedPartner.legal_form = partner.legal_form;
  if (partner.registration_number) cleanedPartner.registration_number = partner.registration_number;
  if (partner.vat_number) cleanedPartner.vat_number = partner.vat_number;
  if (partner.website) cleanedPartner.website = partner.website;
  if (partner.logo_url) cleanedPartner.logo_url = partner.logo_url;
  if (partner.notes) cleanedPartner.notes = partner.notes;
  const res = await apiFetch('/v1/partners', {
    method: 'POST',
    body: JSON.stringify(cleanedPartner),
  });
  if (!res.ok) {
    let msg = 'Erreur lors de la création du partenaire';
    try {
      const err = await res.json();
      if (err && err.message) msg += ` : ${err.message}`;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function getPartnerById(id: string ): Promise<Partner> {
  const res = await apiFetch(`/v1/partners/${id}`);
  if (!res.ok) throw new Error('Erreur lors de la récupération du partenaire');
  return res.json();
}

// tarek 3
export const updatePartner = async (id: string, partner: Partial<Partner>): Promise<Partner> => {
  // Champs autorisés côté backend
  const allowedFields = ['name', 'type',  'legal_form', 'registration_number', 'vat_number', 'website', 'logo_url', 'notes', 'status'];
  const cleaned: Record<string, any> = {};
  for (const key of allowedFields) {
    let value = partner[key as keyof Partner];
    // Convertir toute chaîne vide en null
    if (typeof value === 'string' && value.trim() === '') {
      value = null;
    }
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  const res = await apiFetch(`/v1/partners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cleaned),
  });
  if (!res.ok) {
    let msg = 'Erreur lors de la mise à jour du partenaire';
    try {
      const err = await res.json();
      if (err && err.message) msg += ` : ${err.message}`;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
};
//Fin Tarek 3
//Tarek 2
// Related data functions
export const getPartnerContacts = async (partnerId: string): Promise<Contact[]> => {
  try {
    console.log('Fetching partner contacts for partnerId:', partnerId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/partners/${partnerId}/contacts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching partner contacts:', error);
    throw error;
  }
};

export const getPartnerAddresses = async (partnerId: string): Promise<Address[]> => {
  try {
    console.log('Fetching partner addresses for partnerId:', partnerId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/partners/${partnerId}/addresses`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching partner addresses:', error);
    throw error;
  }
};

export const getPartnerSites = async (partnerId: string): Promise<Site[]> => {
  try {
    console.log('Fetching partner sites for partnerId:', partnerId);
    return []; 
    /* const response = await fetch(`${API_BASE_URL}/partners/${partnerId}/sites`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json(); */
  } catch (error) {
    console.error('Error fetching partner sites:', error);
    throw error;
  }
};

export const getPartnerVehicles = async (partnerId: string): Promise<Vehicle[]> => {
  try {
    console.log('Fetching partner vehicles for partnerId:', partnerId); 
    return [];
    /*const response = await fetch(`${API_BASE_URL}/partners/${partnerId}/vehicles`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching partner vehicles:', error);
    throw error;
  }
};

export const getPartnerDrivers = async (partnerId: string): Promise<Driver[]> => {
  try {
    console.log('Fetching partner drivers for partnerId:', partnerId);  
     return []; // Commented out to enable actual API call
    /*const response = await fetch(`${API_BASE_URL}/partners/${partnerId}/drivers`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching partner drivers:', error);
    throw error;
  }
};

export const getPartnerContracts = async (partnerId: string): Promise<Contract[]> => {
  try {
    console.log('Fetching partner contracts for partnerId:', partnerId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/partners/${partnerId}/contracts`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching partner contracts:', error);
    throw error;
  }
};

export const getPartnerDocuments = async (partnerId: string): Promise<Document[]> => {
  try {
    console.log('Fetching partner documents for partnerId:', partnerId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/partners/${partnerId}/documents`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching partner documents:', error);
    throw error;
  }

  
};
// Fin Tarek 2
//------------
// Client-specific types
export interface Order {
  id: number;
  client_id: number;
  reference: string;
  status: 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  origin_address: string;
  destination_address: string;
  pickup_date: string;
  delivery_date?: string;
  total_amount: number;
  currency: string;
  weight?: number;
  volume?: number;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: number;
  client_id: number;
  order_id?: number;
  tracking_number: string;
  status: 'created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date?: string;
  carrier_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  client_id: number;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  paid_date?: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface ClientMetrics {
  total_orders: number;
  total_shipments: number;
  total_revenue: number;
  currency: string;
  average_order_value: number;
  on_time_delivery_rate: number;
  payment_terms_average: number;
  last_order_date?: string;
}

export interface DeliveryPreference {
  id: number;
  client_id: number;
  address_id: number;
  preferred_time_start?: string;
  preferred_time_end?: string;
  special_instructions?: string;
  access_code?: string;
  contact_person?: string;
  contact_phone?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  id: number;
  client_id: number;
  name: string;
  service_type: 'STANDARD' | 'EXPRESS' | 'ECONOMY' | 'PREMIUM';
  base_rate: number;
  per_kg_rate?: number;
  per_km_rate?: number;
  currency: string;
  effective_date: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

// Carrier-specific types
export interface TransportCapacity {
  id: number;
  carrier_id: number;
  service_type: 'ROAD' | 'RAIL' | 'AIR' | 'SEA' | 'MULTIMODAL';
  cargo_type: 'GENERAL' | 'REFRIGERATED' | 'HAZARDOUS' | 'OVERSIZED' | 'LIQUID' | 'BULK';
  max_weight: number; // in kg
  max_volume: number; // in m³
  max_distance: number; // in km
  equipment_type?: string;
  special_requirements?: string;
  created_at: string;
  updated_at: string;
}

export interface CoverageZone {
  id: number;
  carrier_id: number;
  name: string;
  zone_type: 'COUNTRY' | 'REGION' | 'CITY' | 'POSTAL_CODE' | 'CUSTOM';
  coverage_area: string; // JSON string or specific format
  service_level: 'STANDARD' | 'EXPRESS' | 'ECONOMY' | 'PREMIUM';
  delivery_time_min: number; // in hours
  delivery_time_max: number; // in hours
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: number;
  carrier_id: number;
  name: string;
  type: 'ISO' | 'SAFETY' | 'ENVIRONMENTAL' | 'QUALITY' | 'SECURITY' | 'OTHER';
  certification_number: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'suspended' | 'pending_renewal';
  document_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Insurance {
  id: number;
  carrier_id: number;
  policy_number: string;
  insurance_type: 'LIABILITY' | 'CARGO' | 'VEHICLE' | 'WORKERS_COMP' | 'GENERAL' | 'OTHER';
  provider: string;
  coverage_amount: number;
  currency: string;
  effective_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending_renewal';
  document_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CarrierMetrics {
  total_shipments: number;
  total_revenue: number;
  currency: string;
  on_time_delivery_rate: number;
  average_delivery_time: number; // in hours
  damage_rate: number; // percentage
  customer_satisfaction_score: number; // 1-5 scale
  fleet_utilization_rate: number; // percentage
  last_shipment_date?: string;
}

//-------------
//********** */
// Client-specific API functions
export const getClientOrders = async (clientId: string): Promise<Order[]> => {
  try {
    console.log('Fetching client orders for clientId:', clientId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/clients/${clientId}/orders`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching client orders:', error);
    throw error;
  }
};

export const getClientShipments = async (clientId: string): Promise<Shipment[]> => {
  try {
    console.log('Fetching client shipments for clientId:', clientId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/clients/${clientId}/shipments`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching client shipments:', error);
    throw error;
  }
};

export const getClientInvoices = async (clientId: string): Promise<Invoice[]> => {
  try {
    console.log('Fetching client invoices for clientId:', clientId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/clients/${clientId}/invoices`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching client invoices:', error);
    throw error;
  }
};

export const getClientMetrics = async (clientId: string): Promise<ClientMetrics> => {
  try {
    console.log('Fetching client metrics for clientId:', clientId);
    return {
      total_orders: 0,
      total_shipments: 0,
      total_revenue: 0,
      currency: 'EUR',
      average_order_value: 0,
      on_time_delivery_rate: 0,
      payment_terms_average: 0,
      last_order_date: undefined
    };
    /*const response = await fetch(`${API_BASE_URL}/clients/${clientId}/metrics`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching client metrics:', error);
    throw error;
  }
};

export const getClientDeliveryPreferences = async (clientId: string): Promise<DeliveryPreference[]> => {
  try {
    console.log('Fetching client delivery preferences for clientId:', clientId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/clients/${clientId}/delivery-preferences`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching client delivery preferences:', error);
    throw error;
  }
};

export const getClientPricingTiers = async (clientId: string): Promise<PricingTier[]> => {
  try {
    console.log('Fetching client pricing tiers for clientId:', clientId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/clients/${clientId}/pricing-tiers`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/ 
  } catch (error) {
    console.error('Error fetching client pricing tiers:', error);
    throw error;
  }
};

// Carrier-specific API functions
export const getCarrierTransportCapacities = async (carrierId: string): Promise<TransportCapacity[]> => {
  try {
    console.log('Fetching carrier transport capacities for carrierId:', carrierId);
    return [];      
    /*const response = await fetch(`${API_BASE_URL}/carriers/${carrierId}/transport-capacities`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching carrier transport capacities:', error);
    throw error;
  }
};

export const getCarrierCoverageZones = async (carrierId: string): Promise<CoverageZone[]> => {
  try {
    console.log('Fetching carrier coverage zones for carrierId:', carrierId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/carriers/${carrierId}/coverage-zones`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching carrier coverage zones:', error);
    throw error;
  }
};

export const getCarrierCertifications = async (carrierId: string): Promise<Certification[]> => {
  try {
    console.log('Fetching carrier certifications for carrierId:', carrierId);
    return [];  
    /*const response = await fetch(`${API_BASE_URL}/carriers/${carrierId}/certifications`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching carrier certifications:', error);
    throw error;
  }
};

export const getCarrierInsurances = async (carrierId: string): Promise<Insurance[]> => {
  try {
    console.log('Fetching carrier insurances for carrierId:', carrierId);
    return [];
    /*const response = await fetch(`${API_BASE_URL}/carriers/${carrierId}/insurances`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching carrier insurances:', error);
    throw error;
  }
};

export const getCarrierMetrics = async (carrierId: string): Promise<CarrierMetrics> => {
  try {
    console.log('Fetching carrier metrics for carrierId:', carrierId);
    return {
      total_shipments: 0,
      total_revenue: 0,
      currency: 'EUR',
      on_time_delivery_rate: 0,
      average_delivery_time: 0,
      damage_rate: 0,
      customer_satisfaction_score: 0,
      fleet_utilization_rate: 0,
      last_shipment_date: undefined
    };
    /*const response = await fetch(`${API_BASE_URL}/carriers/${carrierId}/metrics`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();*/
  } catch (error) {
    console.error('Error fetching carrier metrics:', error);
    throw error;
  }
};
//************ */
