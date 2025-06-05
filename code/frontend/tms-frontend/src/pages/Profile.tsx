import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, PhotoIcon, CogIcon } from '@heroicons/react/24/outline';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const Profile: React.FC = () => {
  const { user, isLoading, error, changePassword } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  // Load user data
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setJobTitle(user.job_title || '');
    }
  }, [user]);
  
  const handleSaveProfile = async () => {
    // In a real app, we would update the user profile here
    // For now, we'll just toggle editing mode
    setIsEditing(false);
  };
  
  const validatePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    setPasswordError(null);
    return true;
  };
  
  const handleChangePassword = async () => {
    if (!validatePasswordChange()) {
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Mot de passe modifié avec succès');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err) {
      // Error is handled by the auth context
    }
  };
  
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profil utilisateur</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Informations personnelles et préférences</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Modifier
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveProfile}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Enregistrer
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Annuler
              </button>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile Photo */}
            <div className="md:col-span-1 p-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {user.profile_image_url ? (
                  <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>
              
              {isEditing && (
                <button
                  type="button"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PhotoIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Changer la photo
                </button>
              )}
              
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">{user.first_name} {user.last_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-2">
                  {user.roles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-1 mb-1"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Personal Information */}
            <div className="md:col-span-2 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{firstName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{lastName}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      disabled
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{phone || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Fonction</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="jobTitle"
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{jobTitle || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Actif' :
                       user.status === 'pending' ? 'En attente' :
                       user.status === 'locked' ? 'Verrouillé' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Password Change Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Sécurité</h3>
                  {!isChangingPassword ? (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <CogIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                      Changer le mot de passe
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsChangingPassword(false)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <XMarkIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                      Annuler
                    </button>
                  )}
                </div>
                
                {isChangingPassword && (
                  <div className="mt-4 space-y-4">
                    {/* Password error/success messages */}
                    {passwordError && (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{passwordError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {passwordSuccess && (
                      <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">{passwordSuccess}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <button
                        onClick={handleChangePassword}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Changer le mot de passe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
