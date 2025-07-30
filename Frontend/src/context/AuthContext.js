// src/context/AuthContext.js 
import React, { createContext, useState, useEffect } from 'react';
import OfflineStorage from '../services/OfflineStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (newRole) => {
    setRole(newRole);
    setLoading(false);
    await AsyncStorage.setItem('userRole', newRole); // ← opcional si usas persistencia
  };

  const signOut = async () => {
    await OfflineStorage.clearAll();
    await AsyncStorage.clear(); // ← este es el agregado necesario
    setRole(null);
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
