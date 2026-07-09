import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    const { token, user: userData, requiresOTP } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return { token, user: userData, requiresOTP };
  };

  const verifyOTP = async (otp) => {
    const response = await authService.verifyOTP({ otp });
    const { token, user: userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    return response.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with local cleanup even if API fails
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Check if user needs to sign indemnity
  const needsIndemnity = () => {
    if (!user) return false;
    return !user.indemnity_signed;
  };

  // Get redirect path based on user state
  const getRedirectPath = () => {
    if (!user) return '/login';
    if (!user.indemnity_signed) {
      return user.role === 'nurse' ? '/nurse/indemnity' : '/patient/indemnity';
    }
    return user.role === 'nurse' ? '/nurse/dashboard' : '/patient/dashboard';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    verifyOTP,
    register,
    logout,
    updateUser,
    needsIndemnity,
    getRedirectPath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
