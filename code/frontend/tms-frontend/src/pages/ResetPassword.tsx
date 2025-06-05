import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { KeyIcon } from '@heroicons/react/24/solid';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  
  const { resetPassword, error, clearError, isLoading } = useAuth();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    
    // In a real app, we would validate the token with the backend
    // For now, we'll just assume it's valid if it exists
    setTokenValid(true);
    
    // Clear any auth errors when component mounts
    clearError();
  }, [token, clearError]);
  
  const validatePassword = () => {
    if (password !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    if (password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    setPasswordError(null);
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword() || !token) {
      return;
    }
    
    try {
      await resetPassword(token, password);
      // If reset is successful, the auth context will redirect
    } catch (err) {
      // Error is handled by the auth context
    }
  };
  
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Lien invalide
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Le lien de réinitialisation de mot de passe est invalide ou a expiré.
            </p>
          </div>
          <div className="text-center">
            <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Réinitialisation du mot de passe
          </h2>
          <h3 className="mt-2 text-center text-xl text-gray-600">
            Créez un nouveau mot de passe
          </h3>
        </div>
        
        {/* Error message */}
        {(error || passwordError) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{passwordError || error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">Nouveau mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirmer le mot de passe</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <KeyIcon className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
              </span>
              {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Retour à la page de connexion
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
