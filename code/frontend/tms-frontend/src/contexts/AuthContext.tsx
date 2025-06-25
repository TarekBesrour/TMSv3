import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../utils/api';

// Types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  tenant_id?: number;
  roles: Role[];
  preferences?: UserPreference;
    phone?: string;
  job_title?: string;
  profile_image_url?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  code: string;
  name: string;
  module: string;
}

export interface UserPreference {
  language: string;
  theme: string;
  timezone: string;
  date_format: string;
  time_format: string;
  start_page: string;
  notifications_enabled: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
  hasPermission: (permission: string | string[]) => boolean;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          // Set default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const response = await axios.get(apiUrl('/auth/me'));
          setUser(response.data);
        } catch (err) {
          // Token might be expired, try to refresh
          try {
            const refreshResponse = await axios.post(apiUrl('/auth/refresh-token'));
            localStorage.setItem('accessToken', refreshResponse.data.accessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.accessToken}`;
            
            // Fetch user data again
            const userResponse = await axios.get(apiUrl('/auth/me'));
            setUser(userResponse.data);
          } catch (refreshErr) {
            // Refresh failed, clear auth data
            localStorage.removeItem('accessToken');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
          }
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.post(apiUrl('/auth/login'), { email, password });
      
      // Store token
      localStorage.setItem('accessToken', response.data.accessToken);
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
      
      // Set user data
      setUser(response.data.user);
      
      // Redirect to dashboard or user's preferred start page
      const startPage = response.data.user.preferences?.start_page || 'dashboard';
      navigate(`/${startPage}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint
      await axios.post(apiUrl('/auth/logout'));
      
      // Clear auth data
      localStorage.removeItem('accessToken');
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear user data
      setUser(null);
      
      // Redirect to login
      navigate('/login');
    } catch (err) {
      // Even if the API call fails, we still want to clear local auth data
      localStorage.removeItem('accessToken');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post(apiUrl('/auth/register'), userData);
      
      // Redirect to login with success message
      navigate('/login', { state: { message: 'Registration successful. Please check your email to verify your account.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post(apiUrl('/auth/forgot-password'), { email });
      
      // Redirect to login with success message
      navigate('/login', { state: { message: 'Password reset instructions have been sent to your email.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post(apiUrl('/auth/reset-password'), { token, password });
      
      // Redirect to login with success message
      navigate('/login', { state: { message: 'Password has been reset successfully. You can now login with your new password.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await axios.post(apiUrl('/auth/change-password'), { currentPassword, newPassword });
      
      return Promise.resolve();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password.');
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    const userRoles = user.roles.map(r => r.name);
    
    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r));
    }
    
    return userRoles.includes(role);
  };

  // Check if user has a specific permission
  const hasPermission = (permission: string | string[]): boolean => {
    if (!user) return false;
    
    // Extract all permissions from user roles
    const userPermissions = new Set<string>();
    user.roles.forEach(role => {
      role.permissions.forEach(perm => {
        userPermissions.add(perm.code);
      });
    });
    
    if (Array.isArray(permission)) {
      return permission.every(p => userPermissions.has(p));
    }
    
    return userPermissions.has(permission);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
    hasRole,
    hasPermission,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
