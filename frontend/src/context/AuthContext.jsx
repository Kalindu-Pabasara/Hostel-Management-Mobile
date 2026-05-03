import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';

// AuthContext stores the logged-in user and token globally.
// Any screen can call useAuth() to get the user info or logout.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // checking saved session

  // On app start, check if user was previously logged in
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('hms_token');
        const savedUser  = await AsyncStorage.getItem('hms_user');
        if (savedToken && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {}
      setLoading(false);
    };
    loadSession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user, token } = res.data;
    await AsyncStorage.setItem('hms_token', token);
    await AsyncStorage.setItem('hms_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('hms_token');
    await AsyncStorage.removeItem('hms_user');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
