import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  PlusIcon, 
  PencilIcon , 
  TrashIcon, 
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';

// Types
interface Role {
  id: number;
  name: string;
  description: string;
  is_system_role: boolean;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  code: string;
  module: string;
  description: string;
}

interface PermissionsByModule {
  [module: string]: Permission[];
}

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionsByModule>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState<{name: string; description: string; permissionIds: number[]}>({
    name: '',
    description: '',
    permissionIds: []
  });
  
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL; //|| 'http://localhost:5000/api';
  
  // Fetch roles and permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch roles
         const token = localStorage.getItem('accessToken');
        //const rolesResponse = await axios.get(`${API_URL}/auth/roles`);
             
         const rolesResponse = await axios.get(`${API_URL}/auth/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        setRoles(rolesResponse.data.data);
        
        // Fetch permissions by module
        const permissionsResponse = await axios.get(`${API_URL}/auth/permissions/by-module`);
        setAllPermissions(permissionsResponse.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Une erreur est survenue lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleCreateRole = async () => {
    try {
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/roles`, newRole);
      
      // Add new role to list
      setRoles([...roles, response.data]);
      
      // Reset form
      setNewRole({
        name: '',
        description: '',
        permissionIds: []
      });
      
      setIsCreating(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la création du rôle');
    }
  };
  
  const handleUpdateRole = async () => {
    if (!editingRole) return;
    
    try {
      setError(null);
      
      const response = await axios.put(`${API_URL}/auth/roles/${editingRole.id}`, {
        name: editingRole.name,
        description: editingRole.description,
        permissionIds: editingRole.permissions.map(p => p.id)
      });
      
      // Update role in list
      setRoles(roles.map(role => 
        role.id === editingRole.id ? response.data : role
      ));
      
      setEditingRole(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour du rôle');
    }
  };
  
  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/auth/roles/${id}`);
      
      // Remove role from list
      setRoles(roles.filter(role => role.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la suppression du rôle');
    }
  };
  
  const handleTogglePermission = (permission: Permission) => {
    if (!editingRole) return;
    
    const hasPermission = editingRole.permissions.some(p => p.id === permission.id);
    
    if (hasPermission) {
      // Remove permission
      setEditingRole({
        ...editingRole,
        permissions: editingRole.permissions.filter(p => p.id !== permission.id)
      });
    } else {
      // Add permission
      setEditingRole({
        ...editingRole,
        permissions: [...editingRole.permissions, permission]
      });
    }
  };
  
  const handleToggleNewRolePermission = (permission: Permission) => {
    const hasPermission = newRole.permissionIds.includes(permission.id);
    
    if (hasPermission) {
      // Remove permission
      setNewRole({
        ...newRole,
        permissionIds: newRole.permissionIds.filter(id => id !== permission.id)
      });
    } else {
      // Add permission
      setNewRole({
        ...newRole,
        permissionIds: [...newRole.permissionIds, permission.id]
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Gestion des rôles et permissions
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          {hasPermission('role:create') && !isCreating && !editingRole && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Nouveau rôle
            </button>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Create new role form */}
      {isCreating && (
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Créer un nouveau rôle</h3>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom du rôle
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                
                {Object.entries(allPermissions).map(([module, permissions]) => (
                  <div key={module} className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">{module}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center">
                          <input
                            id={`permission-${permission.id}`}
                            name={`permission-${permission.id}`}
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={newRole.permissionIds.includes(permission.id)}
                            onChange={() => handleToggleNewRolePermission(permission)}
                          />
                          <label htmlFor={`permission-${permission.id}`} className="ml-2 block text-sm text-gray-900">
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleCreateRole}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit role form */}
      {editingRole && (
        <div className="bg-white shadow sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Modifier le rôle</h3>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                  Nom du rôle
                </label>
                <input
                  type="text"
                  name="edit-name"
                  id="edit-name"
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  disabled={editingRole.is_system_role}
                />
              </div>
              
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="edit-description"
                  id="edit-description"
                  rows={3}
                  className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  disabled={editingRole.is_system_role}
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                
                {Object.entries(allPermissions).map(([module, permissions]) => (
                  <div key={module} className="mb-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">{module}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center">
                          <input
                            id={`edit-permission-${permission.id}`}
                            name={`edit-permission-${permission.id}`}
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            checked={editingRole.permissions.some(p => p.id === permission.id)}
                            onChange={() => handleTogglePermission(permission)}
                            disabled={editingRole.is_system_role}
                          />
                          <label htmlFor={`edit-permission-${permission.id}`} className="ml-2 block text-sm text-gray-900">
                            {permission.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Annuler
                </button>
                {!editingRole.is_system_role && (
                  <button
                    type="button"
                    onClick={handleUpdateRole}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Enregistrer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Roles list */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-4 py-4 sm:px-6">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-2">Chargement...</span>
              </div>
            </li>
          ) : roles.length === 0 ? (
            <li className="px-4 py-4 sm:px-6 text-center text-sm text-gray-500">
              Aucun rôle trouvé
            </li>
          ) : (
            roles.map((role) => (
              <li key={role.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {role.is_system_role ? (
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-500">
                            <span className="text-xs font-medium leading-none text-white">SYS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-500">
                            <span className="text-xs font-medium leading-none text-white">
                              {role.name.substring(0, 2).toUpperCase()}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                          {role.is_system_role && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Système
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 5).map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {permission.name}
                          </span>
                        ))}
                        {role.permissions.length > 5 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{role.permissions.length - 5} autres
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    {hasPermission('role:update') && (
                      <button
                        onClick={() => setEditingRole(role)}
                        className="mr-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <PencilIcon  className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                        {role.is_system_role ? 'Voir' : 'Modifier'}
                      </button>
                    )}
                    
                    {hasPermission('role:delete') && !role.is_system_role && (
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default RoleManagement;
