import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { apiFetch } from '../utils/apiFetch'; 

interface Driver {
  id: number;
  first_name: string;
  last_name: string;
  license_number: string;
  license_type: string;
  license_expiry: string;
  status: string;
  partner_id: number;
  partner_name: string;
}

const Drivers: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [filterLicenseType, setFilterLicenseType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('last_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/drivers?page=${currentPage}&limit=${rowsPerPage}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des chauffeurs');

        const result = await response.json();
        setDrivers(result.data);
        setFilteredDrivers(result.data);
        setPagination(result.pagination);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, [currentPage, rowsPerPage]);

  useEffect(() => {
    let result = [...drivers];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(driver => 
        driver.first_name.toLowerCase().includes(lowerSearchTerm) ||
        driver.last_name.toLowerCase().includes(lowerSearchTerm) ||
        driver.license_number.toLowerCase().includes(lowerSearchTerm) ||
        driver.partner_name.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (filterLicenseType !== 'all') {
      result = result.filter(driver => driver.license_type.includes(filterLicenseType));
    }

    if (filterStatus !== 'all') {
      result = result.filter(driver => driver.status === filterStatus);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'last_name') {
        comparison = a.last_name.localeCompare(b.last_name);
      } else if (sortField === 'license_number') {
        comparison = a.license_number.localeCompare(b.license_number);
      } else if (sortField === 'license_expiry') {
        comparison = new Date(a.license_expiry).getTime() - new Date(b.license_expiry).getTime();
      } else if (sortField === 'partner_name') {
        comparison = a.partner_name.localeCompare(b.partner_name);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredDrivers(result);
  }, [drivers, searchTerm, filterLicenseType, filterStatus, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateDriver = () => navigate('/drivers/new');
  const handleViewDriver = (id: number) => navigate(`/drivers/${id}`);

  const getLicenseTypeIcon = (type: string) => {
    if (type.includes('ADR')) return <IdentificationIcon className="h-5 w-5 text-red-500" title="Licence ADR" />;
    if (type.includes('CE')) return <IdentificationIcon className="h-5 w-5 text-blue-500" title="Licence CE" />;
    if (type.includes('C')) return <IdentificationIcon className="h-5 w-5 text-green-500" title="Licence C" />;
    return <IdentificationIcon className="h-5 w-5 text-gray-500" title="Licence" />;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'on_duty': return 'bg-blue-100 text-blue-800';
      case 'off_duty': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusName = (status: string) => {
    const statusNames: Record<string, string> = {
      'available': 'Disponible',
      'on_duty': 'En service',
      'off_duty': 'Hors service',
      'on_leave': 'En congé',
      'training': 'En formation'
    };
    return statusNames[status] || status;
  };

  const isLicenseExpiringSoon = (date: string) => {
    const expiry = new Date(date);
    const today = new Date();
    const threshold = new Date();
    threshold.setMonth(today.getMonth() + 3);
    return expiry <= threshold && expiry >= today;
  };

  const isLicenseExpired = (date: string) => new Date(date) < new Date();
  const formatDate = (date: string) => new Date(date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-500 rounded-full"></div></div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
         <CardHeader className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle><h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Conducteurs
          </h2></CardTitle>
              <CardDescription>Affichage des conducteurs enregistrés dans le TMS</CardDescription>
            </div>
            <button onClick={handleCreateDriver} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nouveau chauffeur
            </button>
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-1 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <select
              value={filterLicenseType}
              onChange={(e) => setFilterLicenseType(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="all">Permis: Tous</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="CE">CE</option>
              <option value="ADR">ADR</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="all">Statut: Tous</option>
              <option value="available">Disponible</option>
              <option value="on_duty">En service</option>
              <option value="off_duty">Hors service</option>
              <option value="on_leave">En congé</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="px-0 overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200 text-sm">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-2 text-left font-medium text-gray-600">Nom</th>
        <th className="px-4 py-2 text-left font-medium text-gray-600">Permis</th>
        <th className="px-4 py-2 text-left font-medium text-gray-600">Expiration</th>
        <th className="px-4 py-2 text-left font-medium text-gray-600">Statut</th>
        <th className="px-4 py-2 text-left font-medium text-gray-600">Partenaire</th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-100">
      {filteredDrivers.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-4 text-gray-500">Aucun chauffeur trouvé</td>
        </tr>
      ) : (
        filteredDrivers.map((driver) => (
          <tr key={driver.id} onClick={() => handleViewDriver(driver.id)} className="hover:bg-gray-50 cursor-pointer">
            <td className="px-4 py-2">{driver.last_name} {driver.first_name}</td>
            <td className="px-4 py-2">
              {getLicenseTypeIcon(driver.license_type)} {driver.license_type}
              <div className="text-xs text-gray-500">{driver.license_number}</div>
            </td>
            <td className="px-4 py-2">
              {formatDate(driver.license_expiry)}
              {isLicenseExpired(driver.license_expiry) && <span className="ml-2 text-xs text-red-600">(expiré)</span>}
              {isLicenseExpiringSoon(driver.license_expiry) && !isLicenseExpired(driver.license_expiry) && <span className="ml-2 text-xs text-yellow-600">(bientôt)</span>}
            </td>
            <td className="px-4 py-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(driver.status)}`}>
                {getStatusName(driver.status)}
              </span>
            </td>
            <td className="px-4 py-2">{driver.partner_name}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</CardContent>


        <CardFooter className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-sm text-gray-600">
            Page {pagination.page} sur {pagination.totalPages} — {pagination.total} chauffeurs
          </div>

          <div className="flex gap-2 items-center">
            <button
              className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={pagination.page <= 1}
            >Précédent</button>

            <button
              className="px-4 py-1 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.totalPages))}
              disabled={pagination.page >= pagination.totalPages}
            >Suivant</button>

            <div className="ml-4 flex items-center gap-2">
              <label htmlFor="rowsPerPage" className="text-sm">Lignes :</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="border px-2 py-1 rounded"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Drivers;
