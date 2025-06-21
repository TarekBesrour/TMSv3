import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ExclamationCircleIcon
  // TruckIcon,
  // LocationMarkerIcon,
  // CalendarIcon,
  // GlobeIcon,
  // DocumentTextIcon
} from '@heroicons/react/24/outline';

// Types
interface ShipmentFormData {
  reference?: string;
  order_id?: number;
  order_reference?: string;
  carrier_id: number;
  carrier_name: string;
  origin_address: string;
  destination_address: string;
  transport_mode: string;
  service_level: string;
  planned_pickup_date: string;
  planned_delivery_date: string;
  shipment_type: string;
  incoterm?: string;
  carrier_reference?: string;
  description?: string;
  total_weight?: number;
  weight_unit?: string;
  total_volume?: number;
  volume_unit?: string;
  package_count?: number;
  special_instructions?: string;
  customs_status?: string;
}

interface TransportSegment {
  id?: number; // For existing segments
  temp_id?: string; // For new segments before saving
  sequence: number;
  origin: string;
  destination: string;
  transport_mode: string;
  carrier_name: string;
  carrier_reference?: string;
  vehicle_type?: string;
  vehicle_reference?: string;
  driver_name?: string;
  driver_contact?: string;
  planned_departure: string;
  planned_arrival: string;
  transfer_type?: string;
  transfer_location?: string;
}

interface Order {
  id: number;
  reference: string;
  origin_address: string;
  destination_address: string;
  total_weight?: number;
  weight_unit?: string;
  total_volume?: number;
  volume_unit?: string;
  package_count?: number;
  shipment_type: string;
  transport_mode: string;
  incoterm?: string;
}

interface Carrier {
  id: number;
  name: string;
}

const ShipmentForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: shipmentId } = useParams<{ id: string }>();
  const isEditMode = !!shipmentId;
  const orderFromState = location.state?.orderId ? { id: location.state.orderId } : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [segments, setSegments] = useState<TransportSegment[]>([]);
  const [showAddSegmentForm, setShowAddSegmentForm] = useState(false);
  const [newSegment, setNewSegment] = useState<Partial<TransportSegment>>({
    sequence: 1,
    transport_mode: 'road',
    planned_departure: new Date().toISOString().split('T')[0],
    planned_arrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [formData, setFormData] = useState<ShipmentFormData>({
    carrier_id: 0,
    carrier_name: '',
    origin_address: '',
    destination_address: '',
    transport_mode: 'road',
    service_level: 'standard',
    planned_pickup_date: new Date().toISOString().split('T')[0],
    planned_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    shipment_type: 'domestic',
    weight_unit: 'kg',
    volume_unit: 'm³',
    package_count: 1,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock data fetching
        const mockOrders: Order[] = [
          { id: 1, reference: 'ORD-2025-0001', origin_address: 'Paris, France', destination_address: 'Madrid, Spain', shipment_type: 'international', transport_mode: 'multimodal', incoterm: 'DAP', total_weight: 1250, weight_unit: 'kg', total_volume: 3.5, volume_unit: 'm³', package_count: 15 },
          { id: 2, reference: 'ORD-2025-0002', origin_address: 'Lyon, France', destination_address: 'Marseille, France', shipment_type: 'domestic', transport_mode: 'road', total_weight: 500, weight_unit: 'kg', total_volume: 1.2, volume_unit: 'm³', package_count: 5 },
        ];
        const mockCarriers: Carrier[] = [
          { id: 1, name: 'Global Shipping Lines' },
          { id: 2, name: 'France Express Routier' },
          { id: 3, name: 'EuroRail Cargo' },
        ];
        setOrders(mockOrders);
        setCarriers(mockCarriers);

        if (isEditMode && shipmentId) {
          // Simulate fetching existing shipment data
          setTimeout(() => {
            const mockShipment: ShipmentFormData = {
              reference: `SHP-2025-000${shipmentId}`,
              order_id: 1,
              order_reference: 'ORD-2025-0001',
              carrier_id: 1,
              carrier_name: 'Global Shipping Lines',
              origin_address: 'Shanghai, China',
              destination_address: 'Hamburg, Germany',
              transport_mode: 'multimodal',
              service_level: 'express',
              planned_pickup_date: '2025-06-03',
              planned_delivery_date: '2025-06-20',
              shipment_type: 'international',
              incoterm: 'CIF',
              carrier_reference: 'GSL-123456',
              total_weight: 1250, weight_unit: 'kg', total_volume: 3.5, volume_unit: 'm³', package_count: 15,
            };
            const mockSegmentsData: TransportSegment[] = [
              { id: 1, sequence: 1, origin: 'Shanghai, China', destination: 'Shanghai Port', transport_mode: 'road', carrier_name: 'China Express', planned_departure: '2025-06-03', planned_arrival: '2025-06-03' },
              { id: 2, sequence: 2, origin: 'Shanghai Port', destination: 'Rotterdam Port', transport_mode: 'sea', carrier_name: 'Global Shipping Lines', planned_departure: '2025-06-05', planned_arrival: '2025-06-18' },
            ];
            setFormData(mockShipment);
            setSegments(mockSegmentsData);
            setLoading(false);
          }, 800);
        } else if (orderFromState) {
          const linkedOrder = mockOrders.find(o => o.id === orderFromState.id);
          if (linkedOrder) {
            setFormData(prev => ({
              ...prev,
              order_id: linkedOrder.id,
              order_reference: linkedOrder.reference,
              origin_address: linkedOrder.origin_address,
              destination_address: linkedOrder.destination_address,
              shipment_type: linkedOrder.shipment_type,
              transport_mode: linkedOrder.transport_mode,
              incoterm: linkedOrder.incoterm,
              total_weight: linkedOrder.total_weight,
              weight_unit: linkedOrder.weight_unit,
              total_volume: linkedOrder.total_volume,
              volume_unit: linkedOrder.volume_unit,
              package_count: linkedOrder.package_count,
            }));
            // Auto-create a default segment if it's a simple transport
            if (linkedOrder.transport_mode !== 'multimodal') {
              setSegments([
                {
                  temp_id: Date.now().toString(),
                  sequence: 1,
                  origin: linkedOrder.origin_address,
                  destination: linkedOrder.destination_address,
                  transport_mode: linkedOrder.transport_mode,
                  carrier_name: '', // To be filled by user
                  planned_departure: new Date().toISOString().split('T')[0],
                  planned_arrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                }
              ]);
            }
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur de chargement');
        setLoading(false);
      }
    };
    fetchData();
  }, [isEditMode, shipmentId, orderFromState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
    if (name === 'shipment_type' && value === 'domestic') {
      setFormData(prev => ({ ...prev, incoterm: undefined }));
    }
    if (name === 'transport_mode' && value !== 'multimodal' && segments.length <= 1) {
        // If switching from multimodal to a single mode, and only one segment exists (or none),
        // update that segment's mode or create a default one.
        if (segments.length === 1) {
            setSegments(prevSegments => [
                { ...prevSegments[0], transport_mode: value }
            ]);
        } else if (segments.length === 0 && formData.origin_address && formData.destination_address) {
            setSegments([
                {
                    temp_id: Date.now().toString(),
                    sequence: 1,
                    origin: formData.origin_address,
                    destination: formData.destination_address,
                    transport_mode: value,
                    carrier_name: '',
                    planned_departure: formData.planned_pickup_date,
                    planned_arrival: formData.planned_delivery_date,
                }
            ]);
        }
    } else if (name === 'transport_mode' && value === 'multimodal' && segments.length === 0) {
        // If switching to multimodal and no segments, clear segments to allow manual addition
        setSegments([]);
    }
  };

  const handleCarrierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const carrierId = Number(e.target.value);
    const selectedCarrier = carriers.find(c => c.id === carrierId);
    if (selectedCarrier) {
      setFormData(prev => ({ ...prev, carrier_id: carrierId, carrier_name: selectedCarrier.name }));
    }
  };
  
  const handleOrderLinkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orderId = Number(e.target.value);
    const selectedOrder = orders.find(o => o.id === orderId);
    if (selectedOrder) {
        setFormData(prev => ({
            ...prev,
            order_id: selectedOrder.id,
            order_reference: selectedOrder.reference,
            origin_address: selectedOrder.origin_address,
            destination_address: selectedOrder.destination_address,
            shipment_type: selectedOrder.shipment_type,
            transport_mode: selectedOrder.transport_mode,
            incoterm: selectedOrder.incoterm,
            total_weight: selectedOrder.total_weight,
            weight_unit: selectedOrder.weight_unit,
            total_volume: selectedOrder.total_volume,
            volume_unit: selectedOrder.volume_unit,
            package_count: selectedOrder.package_count,
        }));
        if (selectedOrder.transport_mode !== 'multimodal') {
            setSegments([
                {
                    temp_id: Date.now().toString(),
                    sequence: 1,
                    origin: selectedOrder.origin_address,
                    destination: selectedOrder.destination_address,
                    transport_mode: selectedOrder.transport_mode,
                    carrier_name: '', 
                    planned_departure: formData.planned_pickup_date,
                    planned_arrival: formData.planned_delivery_date,
                }
            ]);
        } else {
            setSegments([]); // Clear for manual multimodal setup
        }
    } else {
        // Clear fields if no order is selected
        setFormData(prev => ({
            ...prev,
            order_id: undefined,
            order_reference: undefined,
        }));
        setSegments([]);
    }
  };

  const handleNewSegmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSegment(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSegment = () => {
    if (!newSegment.origin || !newSegment.destination || !newSegment.carrier_name) {
      setError('Veuillez remplir les champs obligatoires du segment.');
      return;
    }
    setError(null);
    const newSegmentToAdd: TransportSegment = {
      temp_id: Date.now().toString(),
      sequence: segments.length + 1,
      origin: newSegment.origin || '',
      destination: newSegment.destination || '',
      transport_mode: newSegment.transport_mode || 'road',
      carrier_name: newSegment.carrier_name || '',
      carrier_reference: newSegment.carrier_reference,
      vehicle_type: newSegment.vehicle_type,
      vehicle_reference: newSegment.vehicle_reference,
      driver_name: newSegment.driver_name,
      driver_contact: newSegment.driver_contact,
      planned_departure: newSegment.planned_departure || '',
      planned_arrival: newSegment.planned_arrival || '',
      transfer_type: newSegment.transfer_type,
      transfer_location: newSegment.transfer_location,
    };
    setSegments(prev => [...prev, newSegmentToAdd]);
    setNewSegment({
      sequence: segments.length + 2,
      origin: segments.length > 0 ? segments[segments.length -1].destination : '', // Pre-fill origin from previous destination
      transport_mode: 'road',
      planned_departure: new Date().toISOString().split('T')[0],
      planned_arrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowAddSegmentForm(false);
  };

  const handleRemoveSegment = (idToRemove: string | number | undefined) => {
    if (!idToRemove) return;
    setSegments(prev => prev.filter(seg => (seg.id || seg.temp_id) !== idToRemove)
                         .map((seg, index) => ({ ...seg, sequence: index + 1 })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!formData.carrier_id || !formData.origin_address || !formData.destination_address) {
        setError('Veuillez remplir tous les champs obligatoires de l\'expédition.');
        setSaving(false);
        return;
      }
      if (formData.transport_mode === 'multimodal' && segments.length === 0) {
        setError('Pour un transport multimodal, veuillez ajouter au moins un segment.');
        setSaving(false);
        return;
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving shipment:', formData, segments);
      navigate('/shipments');
    } catch (err: any) {
      setError(err.message || 'Erreur d\'enregistrement');
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => navigate('/shipments');

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex items-center">
          <button type="button" onClick={handleCancel} className="mr-4 p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? `Modifier l'expédition ${formData.reference}` : 'Nouvelle expédition'}</h2>
        </div>
      </div>

      {error && <div className="rounded-md bg-red-50 p-4 mb-6"><div className="flex"><div className="flex-shrink-0"><ExclamationCircleIcon className="h-5 w-5 text-red-400" /></div><div className="ml-3"><p className="text-sm font-medium text-red-800">{error}</p></div></div></div>}

            <form onSubmit={handleSubmit}>
        {/* General Info Section */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6"><h3 className="text-lg font-medium text-gray-900">Informations Générales</h3></div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
            <div className="sm:col-span-3">
              <label htmlFor="order_id" className="block text-sm font-medium text-gray-700">Lier à une commande (Optionnel)</label>
              <select id="order_id" name="order_id" value={formData.order_id || ''} onChange={handleOrderLinkChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="">Aucune commande liée</option>
                {orders.map(order => <option key={order.id} value={order.id}>{order.reference}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="carrier_id" className="block text-sm font-medium text-gray-700">Transporteur *</label>
              <select id="carrier_id" name="carrier_id" value={formData.carrier_id} onChange={handleCarrierChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                <option value="">Sélectionner un transporteur</option>
                {carriers.map(carrier => <option key={carrier.id} value={carrier.id}>{carrier.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-3"><label htmlFor="origin_address" className="block text-sm font-medium text-gray-700">Adresse d'origine *</label><input type="text" name="origin_address" id="origin_address" value={formData.origin_address} onChange={handleInputChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-3"><label htmlFor="destination_address" className="block text-sm font-medium text-gray-700">Adresse de destination *</label><input type="text" name="destination_address" id="destination_address" value={formData.destination_address} onChange={handleInputChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-2"><label htmlFor="planned_pickup_date" className="block text-sm font-medium text-gray-700">Date d'enlèvement prévue *</label><input type="date" name="planned_pickup_date" id="planned_pickup_date" value={formData.planned_pickup_date} onChange={handleInputChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-2"><label htmlFor="planned_delivery_date" className="block text-sm font-medium text-gray-700">Date de livraison prévue *</label><input type="date" name="planned_delivery_date" id="planned_delivery_date" value={formData.planned_delivery_date} onChange={handleInputChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-2"><label htmlFor="service_level" className="block text-sm font-medium text-gray-700">Niveau de service</label><select id="service_level" name="service_level" value={formData.service_level} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"><option value="standard">Standard</option><option value="express">Express</option><option value="economy">Économique</option></select></div>
          </div>
        </div>

        {/* Transport Details Section */}
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6"><h3 className="text-lg font-medium text-gray-900">Détails du Transport</h3></div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
            <div className="sm:col-span-3"><label htmlFor="shipment_type" className="block text-sm font-medium text-gray-700">Type d'expédition</label><select id="shipment_type" name="shipment_type" value={formData.shipment_type} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"><option value="domestic">National</option><option value="international">International</option><option value="cross_border">Transfrontalier</option></select></div>
            <div className="sm:col-span-3"><label htmlFor="transport_mode" className="block text-sm font-medium text-gray-700">Mode de transport principal</label><select id="transport_mode" name="transport_mode" value={formData.transport_mode} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"><option value="road">Routier</option><option value="rail">Ferroviaire</option><option value="sea">Maritime</option><option value="air">Aérien</option><option value="multimodal">Multimodal</option></select></div>
            {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && <div className="sm:col-span-3"><label htmlFor="incoterm" className="block text-sm font-medium text-gray-700">Incoterm</label><select id="incoterm" name="incoterm" value={formData.incoterm || ''} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"><option value="">Sélectionner</option><option value="EXW">EXW</option><option value="FCA">FCA</option><option value="CPT">CPT</option><option value="CIP">CIP</option><option value="DAP">DAP</option><option value="DPU">DPU</option><option value="DDP">DDP</option></select></div>}
            <div className="sm:col-span-3"><label htmlFor="carrier_reference" className="block text-sm font-medium text-gray-700">Référence Transporteur</label><input type="text" name="carrier_reference" id="carrier_reference" value={formData.carrier_reference || ''} onChange={handleInputChange} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-2"><label htmlFor="total_weight" className="block text-sm font-medium text-gray-700">Poids total</label><input type="number" name="total_weight" id="total_weight" value={formData.total_weight || ''} onChange={handleInputChange} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-1"><label htmlFor="weight_unit" className="block text-sm font-medium text-gray-700">Unité</label><select id="weight_unit" name="weight_unit" value={formData.weight_unit} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"><option value="kg">kg</option><option value="lb">lb</option></select></div>
            <div className="sm:col-span-2"><label htmlFor="total_volume" className="block text-sm font-medium text-gray-700">Volume total</label><input type="number" name="total_volume" id="total_volume" value={formData.total_volume || ''} onChange={handleInputChange} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-1"><label htmlFor="volume_unit" className="block text-sm font-medium text-gray-700">Unité</label><select id="volume_unit" name="volume_unit" value={formData.volume_unit} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"><option value="m³">m³</option><option value="ft³">ft³</option></select></div>
            <div className="sm:col-span-2"><label htmlFor="package_count" className="block text-sm font-medium text-gray-700">Nombre de colis</label><input type="number" name="package_count" id="package_count" value={formData.package_count || ''} onChange={handleInputChange} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-6"><label htmlFor="description" className="block text-sm font-medium text-gray-700">Description des marchandises</label><textarea name="description" id="description" rows={2} value={formData.description || ''} onChange={handleInputChange} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
            <div className="sm:col-span-6"><label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700">Instructions spéciales</label><textarea name="special_instructions" id="special_instructions" rows={2} value={formData.special_instructions || ''} onChange={handleInputChange} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
          </div>
        </div>

        {/* Segments Section - only for multimodal or if segments exist */}
        {(formData.transport_mode === 'multimodal' || segments.length > 0) && (
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div><h3 className="text-lg font-medium text-gray-900">Segments de Transport</h3><p className="text-sm text-gray-500">Définir les étapes du transport multimodal</p></div>
              {formData.transport_mode === 'multimodal' && <button type="button" onClick={() => { setShowAddSegmentForm(true); setNewSegment(prev => ({...prev, origin: segments.length > 0 ? segments[segments.length -1].destination : formData.origin_address, sequence: segments.length + 1}))}} className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"><PlusIcon className="-ml-0.5 mr-2 h-4 w-4"/>Ajouter Segment</button>}
            </div>
            {showAddSegmentForm && (
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6 bg-gray-50 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
                <div className="sm:col-span-1"><label htmlFor="seg_sequence" className="block text-sm font-medium text-gray-700">Seq.</label><input type="number" name="sequence" id="seg_sequence" value={newSegment.sequence || ''} onChange={handleNewSegmentChange} readOnly className="mt-1 bg-gray-100 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
                <div className="sm:col-span-2"><label htmlFor="seg_origin" className="block text-sm font-medium text-gray-700">Origine Seg. *</label><input type="text" name="origin" id="seg_origin" value={newSegment.origin || ''} onChange={handleNewSegmentChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
                <div className="sm:col-span-2"><label htmlFor="seg_destination" className="block text-sm font-medium text-gray-700">Destination Seg. *</label><input type="text" name="destination" id="seg_destination" value={newSegment.destination || ''} onChange={handleNewSegmentChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
                <div className="sm:col-span-1"><label htmlFor="seg_transport_mode" className="block text-sm font-medium text-gray-700">Mode Seg.</label><select name="transport_mode" id="seg_transport_mode" value={newSegment.transport_mode || 'road'} onChange={handleNewSegmentChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"><option value="road">Routier</option><option value="rail">Ferroviaire</option><option value="sea">Maritime</option><option value="air">Aérien</option></select></div>
                <div className="sm:col-span-3"><label htmlFor="seg_carrier_name" className="block text-sm font-medium text-gray-700">Transporteur Seg. *</label><input type="text" name="carrier_name" id="seg_carrier_name" value={newSegment.carrier_name || ''} onChange={handleNewSegmentChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
                <div className="sm:col-span-3"><label htmlFor="seg_carrier_reference" className="block text-sm font-medium text-gray-700">Réf. Transp. Seg.</label><input type="text" name="carrier_reference" id="seg_carrier_reference" value={newSegment.carrier_reference || ''} onChange={handleNewSegmentChange} className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
                <div className="sm:col-span-3"><label htmlFor="seg_planned_departure" className="block text-sm font-medium text-gray-700">Départ Prévu Seg. *</label><input type="date" name="planned_departure" id="seg_planned_departure" value={newSegment.planned_departure || ''} onChange={handleNewSegmentChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
                <div className="sm:col-span-3"><label htmlFor="seg_planned_arrival" className="block text-sm font-medium text-gray-700">Arrivée Prévue Seg. *</label><input type="date" name="planned_arrival" id="seg_planned_arrival" value={newSegment.planned_arrival || ''} onChange={handleNewSegmentChange} required className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"/></div>
                <div className="sm:col-span-6 flex justify-end space-x-2">
                    <button type="button" onClick={() => setShowAddSegmentForm(false)} className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Annuler</button>
                    <button type="button" onClick={handleAddSegment} className="px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">Ajouter ce segment</button>
                </div>
              </div>
            )}
                     {segments.length > 0 && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50"><tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seq</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Origine</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transporteur</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Départ</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Arrivée</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr></thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {segments.map(seg => (
                      <tr key={seg.id || seg.temp_id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{seg.sequence}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{seg.origin}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{seg.destination}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{seg.transport_mode}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{seg.carrier_name}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{seg.planned_departure}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{seg.planned_arrival}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                          <button type="button" onClick={() => handleRemoveSegment(seg.id || seg.temp_id)} className="text-red-600 hover:text-red-800"><TrashIcon className="h-4 w-4"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {formData.transport_mode === 'multimodal' && segments.length === 0 && !showAddSegmentForm && <p className="px-4 py-3 text-sm text-gray-500 text-center">Aucun segment défini. Cliquez sur "Ajouter Segment" pour commencer.</p>}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-8">
          <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Annuler</button>
          <button type="submit" disabled={saving} className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {saving ? <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : ''}
            {isEditMode ? 'Enregistrer les modifications' : 'Créer l\'expédition'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShipmentForm;

