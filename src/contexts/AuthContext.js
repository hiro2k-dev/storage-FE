import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import api from 'api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // ✅ Check if user is logged in on app load
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null); // Not logged in
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      window.location.href = '/auth/sign-in';
    } catch (error) {
      console.error('❌ Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
