import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeftIcon,
  //LocationMarkerIcon,
  CalendarIcon,
  TruckIcon,
  //GlobeIcon,
  PlusIcon,
  //TrashIcon,
  ExclamationCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Types
interface OrderFormData {
  reference?: string;
  customer_id: number;
  customer_name: string;
  origin_address: string;
  destination_address: string;
  service_type: string;
  priority: string;
  promised_date: string;
  incoterm?: string;
  currency?: string;
  shipment_type: string;
  transport_mode: string;
  description?: string;
  total_weight?: number;
  weight_unit?: string;
  total_volume?: number;
  volume_unit?: string;
  package_count?: number;
  special_instructions?: string;
  customs_value?: number;
  customs_currency?: string;
}

interface OrderLine {
  id?: number;
  product_id: number;
  product_name: string;
  quantity: number;
  weight: number;
  weight_unit: string;
  volume: number;
  volume_unit: string;
  description?: string;
  hs_code?: string;
  country_of_origin?: string;
}

interface Customer {
  id: number;
  name: string;
}

const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit');
  const orderId = isEditMode ? location.pathname.split('/')[2] : null;
  const duplicateOrder = location.state?.duplicate;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [showAddLineForm, setShowAddLineForm] = useState(false);
  const [newLine, setNewLine] = useState<OrderLine>({
    product_id: 0,
    product_name: '',
    quantity: 1,
    weight: 0,
    weight_unit: 'kg',
    volume: 0,
    volume_unit: 'm³'
  });
  
  const [formData, setFormData] = useState<OrderFormData>({
    customer_id: 0,
    customer_name: '',
    origin_address: '',
    destination_address: '',
    service_type: 'standard',
    priority: 'normal',
    promised_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    shipment_type: 'domestic',
    transport_mode: 'road',
    weight_unit: 'kg',
    volume_unit: 'm³',
    package_count: 1
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real app, this would be an API call to fetch customers
        // For now, we'll simulate with mock data
        const mockCustomers: Customer[] = [
          { id: 1, name: 'Acme Corporation' },
          { id: 2, name: 'Globex Industries' },
          { id: 3, name: 'Stark Enterprises' },
          { id: 4, name: 'Wayne Industries' },
          { id: 5, name: 'Umbrella Corporation' }
        ];
        
        setCustomers(mockCustomers);
        
        if (isEditMode && orderId) {
          // In a real app, this would be an API call to fetch order details
          // For now, we'll simulate with mock data
          setTimeout(() => {
            const mockOrder: OrderFormData = {
              reference: `ORD-2025-000${orderId}`,
              customer_id: 1,
              customer_name: 'Acme Corporation',
              origin_address: 'Paris, France',
              destination_address: 'Madrid, Spain',
              service_type: 'standard',
              priority: 'normal',
              promised_date: '2025-06-10',
              incoterm: 'DAP',
              currency: 'EUR',
              shipment_type: 'international',
              transport_mode: 'multimodal',
              description: 'Équipements électroniques pour le bureau de Madrid',
              total_weight: 1250,
              weight_unit: 'kg',
              total_volume: 3.5,
              volume_unit: 'm³',
              package_count: 15,
              special_instructions: 'Fragile, manipuler avec précaution. Livraison sur rendez-vous uniquement.',
              customs_value: 25000,
              customs_currency: 'EUR'
            };
            
            const mockOrderLines: OrderLine[] = [
              {
                id: 1,
                product_id: 101,
                product_name: 'Écran LCD 27"',
                quantity: 5,
                weight: 35,
                weight_unit: 'kg',
                volume: 0.5,
                volume_unit: 'm³',
                description: 'Écrans LCD haute résolution',
                hs_code: '8528.52.00',
                country_of_origin: 'China'
              },
              {
                id: 2,
                product_id: 102,
                product_name: 'Ordinateur portable',
                quantity: 10,
                weight: 25,
                weight_unit: 'kg',
                volume: 0.2,
                volume_unit: 'm³',
                description: 'Ordinateurs portables professionnels',
                hs_code: '8471.30.00',
                country_of_origin: 'Vietnam'
              }
            ];
            
            setFormData(mockOrder);
            setOrderLines(mockOrderLines);
            setLoading(false);
          }, 800);
        } else if (duplicateOrder) {
          // If duplicating, use the provided order data but remove the reference
          const { reference, ...restData } = duplicateOrder;
          setFormData(restData);
          // In a real app, we would also fetch and duplicate the order lines
          setLoading(false);
        } else {
          // New order, use default values
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors du chargement des données');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isEditMode, orderId, duplicateOrder]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Special handling for shipment_type
    if (name === 'shipment_type') {
      if (value === 'domestic') {
        // Reset international fields for domestic shipments
        setFormData({
          ...formData,
          shipment_type: value,
          incoterm: undefined,
          customs_value: undefined,
          customs_currency: undefined
        });
      }
    }
    
    // Special handling for transport_mode
    if (name === 'transport_mode') {
      if (value !== 'multimodal') {
        // Reset any multimodal specific fields if needed
      }
    }
  };
  
  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = Number(e.target.value);
    const selectedCustomer = customers.find(c => c.id === customerId);
    
    if (selectedCustomer) {
      setFormData({
        ...formData,
        customer_id: customerId,
        customer_name: selectedCustomer.name
      });
    }
  };
  
  const handleNewLineChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric inputs
    if (type === 'number') {
      setNewLine({
        ...newLine,
        [name]: value === '' ? 0 : Number(value)
      });
    } else {
      setNewLine({
        ...newLine,
        [name]: value
      });
    }
  };
  
  const handleAddLine = () => {
    // Validate new line
    if (!newLine.product_name || newLine.quantity <= 0) {
      return;
    }
    
    // Add new line to order lines
    const lineWithId = {
      ...newLine,
      id: Date.now() // Temporary ID for new lines
    };
    
    setOrderLines([...orderLines, lineWithId]);
    
    // Reset new line form
    setNewLine({
      product_id: 0,
      product_name: '',
      quantity: 1,
      weight: 0,
      weight_unit: 'kg',
      volume: 0,
      volume_unit: 'm³'
    });
    
    setShowAddLineForm(false);
    
    // Update order totals
    updateOrderTotals([...orderLines, lineWithId]);
  };
  
  const handleRemoveLine = (lineId: number | undefined) => {
    if (!lineId) return;
    
    const updatedLines = orderLines.filter(line => line.id !== lineId);
    setOrderLines(updatedLines);
    
    // Update order totals
    updateOrderTotals(updatedLines);
  };
  
  const updateOrderTotals = (lines: OrderLine[]) => {
    // Calculate total weight, volume, and package count
    const totalWeight = lines.reduce((sum, line) => sum + (line.weight * line.quantity), 0);
    const totalVolume = lines.reduce((sum, line) => sum + (line.volume * line.quantity), 0);
    const totalPackages = lines.reduce((sum, line) => sum + line.quantity, 0);
    
    setFormData({
      ...formData,
      total_weight: totalWeight,
      total_volume: totalVolume,
      package_count: totalPackages
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Validate form data
      if (!formData.customer_id || !formData.origin_address || !formData.destination_address) {
        setError('Veuillez remplir tous les champs obligatoires');
        setSaving(false);
        return;
      }
      
      // In a real app, this would be an API call to save the order
      // For now, we'll simulate with a timeout
      setTimeout(() => {
        console.log('Saving order:', formData);
        console.log('Order lines:', orderLines);
        
        // Navigate back to orders list or order detail
        navigate('/orders');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement de la commande');
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/orders');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleCancel}
              className="mr-4 inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
            </button>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {isEditMode ? `Modifier la commande ${formData.reference}` : 'Nouvelle commande'}
            </h2>
          </div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Informations générales</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Détails de base de la commande</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Customer */}
              <div className="sm:col-span-3">
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                  Client *
                </label>
                <div className="mt-1">
                  <select
                    id="customer_id"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleCustomerChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Service type */}
              <div className="sm:col-span-3">
                <label htmlFor="service_type" className="block text-sm font-medium text-gray-700">
                  Type de service
                </label>
                <div className="mt-1">
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="standard">Standard</option>
                    <option value="express">Express</option>
                    <option value="economy">Économique</option>
                  </select>
                </div>
              </div>
              
              {/* Priority */}
              <div className="sm:col-span-3">
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priorité
                </label>
                <div className="mt-1">
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="low">Basse</option>
                    <option value="normal">Normale</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>
              
              {/* Promised date */}
              <div className="sm:col-span-3">
                <label htmlFor="promised_date" className="block text-sm font-medium text-gray-700">
                  Date promise *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="promised_date"
                    id="promised_date"
                    value={formData.promised_date}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    />
                </div>
              </div>
              
              {/* Origin address */}
              <div className="sm:col-span-6">
                <label htmlFor="origin_address" className="block text-sm font-medium text-gray-700">
                  Adresse d'origine *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="origin_address"
                    id="origin_address"
                    value={formData.origin_address}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              
              {/* Destination address */}
              <div className="sm:col-span-6">
                <label htmlFor="destination_address" className="block text-sm font-medium text-gray-700">
                  Adresse de destination *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="destination_address"
                    id="destination_address"
                    value={formData.destination_address}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Détails du transport</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Informations sur le type de transport</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              {/* Shipment type */}
              <div className="sm:col-span-3">
                <label htmlFor="shipment_type" className="block text-sm font-medium text-gray-700">
                  Type d'expédition
                </label>
                <div className="mt-1">
                  <select
                    id="shipment_type"
                    name="shipment_type"
                    value={formData.shipment_type}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="domestic">National</option>
                    <option value="international">International</option>
                    <option value="cross_border">Transfrontalier</option>
                  </select>
                </div>
              </div>
              
              {/* Transport mode */}
              <div className="sm:col-span-3">
                <label htmlFor="transport_mode" className="block text-sm font-medium text-gray-700">
                  Mode de transport
                </label>
                <div className="mt-1">
                  <select
                    id="transport_mode"
                    name="transport_mode"
                    value={formData.transport_mode}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="road">Routier</option>
                    <option value="rail">Ferroviaire</option>
                    <option value="sea">Maritime</option>
                    <option value="air">Aérien</option>
                    <option value="multimodal">Multimodal</option>
                  </select>
                </div>
              </div>
              
              {/* Incoterm - only for international */}
              {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && (
                <div className="sm:col-span-3">
                  <label htmlFor="incoterm" className="block text-sm font-medium text-gray-700">
                    Incoterm
                  </label>
                  <div className="mt-1">
                    <select
                      id="incoterm"
                      name="incoterm"
                      value={formData.incoterm || ''}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionner un Incoterm</option>
                      <option value="EXW">EXW - Ex Works</option>
                      <option value="FCA">FCA - Free Carrier</option>
                      <option value="CPT">CPT - Carriage Paid To</option>
                      <option value="CIP">CIP - Carriage and Insurance Paid To</option>
                      <option value="DAP">DAP - Delivered at Place</option>
                      <option value="DPU">DPU - Delivered at Place Unloaded</option>
                      <option value="DDP">DDP - Delivered Duty Paid</option>
                      <option value="FAS">FAS - Free Alongside Ship</option>
                      <option value="FOB">FOB - Free on Board</option>
                      <option value="CFR">CFR - Cost and Freight</option>
                      <option value="CIF">CIF - Cost, Insurance and Freight</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Currency - only for international */}
              {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && (
                <div className="sm:col-span-3">
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Devise
                  </label>
                  <div className="mt-1">
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency || ''}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionner une devise</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar américain</option>
                      <option value="GBP">GBP - Livre sterling</option>
                      <option value="JPY">JPY - Yen japonais</option>
                      <option value="CNY">CNY - Yuan chinois</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Description */}
              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Special instructions */}
              <div className="sm:col-span-6">
                <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700">
                  Instructions spéciales
                </label>
                <div className="mt-1">
                  <textarea
                    id="special_instructions"
                    name="special_instructions"
                    rows={3}
                    value={formData.special_instructions || ''}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              {/* Customs value - only for international */}
              {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && (
                <div className="sm:col-span-3">
                  <label htmlFor="customs_value" className="block text-sm font-medium text-gray-700">
                    Valeur en douane
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="customs_value"
                      id="customs_value"
                      value={formData.customs_value || ''}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
              
              {/* Customs currency - only for international */}
              {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && formData.customs_value && (
                <div className="sm:col-span-3">
                  <label htmlFor="customs_currency" className="block text-sm font-medium text-gray-700">
                    Devise (douane)
                  </label>
                  <div className="mt-1">
                    <select
                      id="customs_currency"
                      name="customs_currency"
                      value={formData.customs_currency || ''}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionner une devise</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar américain</option>
                      <option value="GBP">GBP - Livre sterling</option>
                      <option value="JPY">JPY - Yen japonais</option>
                      <option value="CNY">CNY - Yuan chinois</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Lignes de commande</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Produits et quantités</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddLineForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Ajouter une ligne
            </button>
          </div>
          
          {/* Add line form */}
          {showAddLineForm && (
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6 bg-gray-50">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="product_name" className="block text-sm font-medium text-gray-700">
                    Produit *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="product_name"
                      id="product_name"
                      value={newLine.product_name}
                      onChange={handleNewLineChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-1">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantité *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      min="1"
                      value={newLine.quantity}
                      onChange={handleNewLineChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-1">
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                    Poids
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="weight"
                      id="weight"
                      min="0"
                      step="0.01"
                      value={newLine.weight}
                      onChange={handleNewLineChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-1">
                  <label htmlFor="weight_unit" className="block text-sm font-medium text-gray-700">
                    Unité
                  </label>
                  <div className="mt-1">
                    <select
                      id="weight_unit"
                      name="weight_unit"
                      value={newLine.weight_unit}
                      onChange={handleNewLineChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-1">
                  <label htmlFor="volume" className="block text-sm font-medium text-gray-700">
                    Volume
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="volume"
                      id="volume"
                      min="0"
                      step="0.01"
                      value={newLine.volume}
                      onChange={handleNewLineChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div className="sm:col-span-1">
                  <label htmlFor="volume_unit" className="block text-sm font-medium text-gray-700">
                    Unité
                  </label>
                  <div className="mt-1">
                    <select
                      id="volume_unit"
                      name="volume_unit"
                      value={newLine.volume_unit}
                      onChange={handleNewLineChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="m³">m³</option>
                      <option value="cm³">cm³</option>
                      <option value="ft³">ft³</option>
                    </select>
                  </div>
                </div>
                
                <div className="sm:col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="description"
                      id="description"
                      value={newLine.description || ''}
                      onChange={handleNewLineChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                {/* HS Code and Country of Origin - only for international */}
                {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && (
                  <>
                    <div className="sm:col-span-3">
                      <label htmlFor="hs_code" className="block text-sm font-medium text-gray-700">
                        Code HS
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="hs_code"
                          id="hs_code"
                          value={newLine.hs_code || ''}
                          onChange={handleNewLineChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label htmlFor="country_of_origin" className="block text-sm font-medium text-gray-700">
                        Pays d'origine
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="country_of_origin"
                          id="country_of_origin"
                          value={newLine.country_of_origin || ''}
                          onChange={handleNewLineChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="sm:col-span-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddLineForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Order lines table */}
          <div className="border-t border-gray-200">
            {orderLines.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Produit
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantité
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Poids
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Volume
                      </th>
                      {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code HS
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Origine
                          </th>
                        </>
                      )}
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderLines.map((line) => (
                      <tr key={line.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{line.product_name}</div>
                          <div className="text-sm text-gray-500">{line.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {line.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {line.weight} {line.weight_unit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {line.volume} {line.volume_unit}
                        </td>
                        {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {line.hs_code || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {line.country_of_origin || '-'}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(line.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <th scope="row" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                        {formData.package_count} colis
                      </td>
                      <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                        {formData.total_weight} {formData.weight_unit}
                      </td>
                      <td className="px-6 py-3 text-left text-xs font-medium text-gray-900">
                        {formData.total_volume} {formData.volume_unit}
                      </td>
                      {(formData.shipment_type === 'international' || formData.shipment_type === 'cross_border') && (
                        <td colSpan={2}></td>
                      )}
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                Aucune ligne de commande. Cliquez sur "Ajouter une ligne" pour commencer.
              </div>
            )}
          </div>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
