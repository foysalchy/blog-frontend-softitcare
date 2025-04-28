import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(null);
  const [token, setToken] = useState(null);
  const [permission, setPermission] = useState([]);

  useEffect(() => {
    const savedAuthData = localStorage.getItem('authData');
    const savedToken = localStorage.getItem('token');
    const savedPermission = localStorage.getItem('permission');
    
    if (savedAuthData) {
      setAuthData(JSON.parse(savedAuthData));
    }

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedPermission) {
        setPermission(savedPermission);
      }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      setAuthData(response.data);
      setToken(response.data.token);
      localStorage.setItem('authData', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('permission', response.data.permission);
    } catch (error) {
      console.error('Login error', error);
    }
  };

  const register = async (credentials) => {
    try {
      const response = await api.post('/auth/register', credentials);
      setAuthData(response.data);
      setToken(response.data.token);
      localStorage.setItem('authData', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('permission', response.data.permission);
    } catch (error) {
      console.error('Register error', error);
    }
  };

  const logout = () => {
    setAuthData(null);
    setToken(null);
    setPermission([]);
    localStorage.removeItem('authData');
    localStorage.removeItem('token');
    localStorage.removeItem('permission');
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout, register, token,permission }}>
      {children}
    </AuthContext.Provider>
  );
};
