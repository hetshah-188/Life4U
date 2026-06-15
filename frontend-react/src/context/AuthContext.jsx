import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('bbms_token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('bbms_user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = (userData, token) => {
    localStorage.setItem('bbms_token', token);
    localStorage.setItem('bbms_user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);

    const redirectMap = {
      donor: '/donor-dashboard',
      recipient: '/patient-dashboard',
      staff: '/hospital-dashboard',
      admin: '/admin-dashboard',
    };
    navigate(redirectMap[userData.role] || '/');
  };

  const logout = () => {
    localStorage.removeItem('bbms_token');
    localStorage.removeItem('bbms_user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const updateUser = (userData) => {
    localStorage.setItem('bbms_user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
