import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OfflineStorage from '../services/OfflineStorage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      let userRole = null;

      // 1) Intentar leer del login (OfflineStorage)
      try {
        const userData = await OfflineStorage.getUserData();
        if (userData?.rol) userRole = userData.rol;
      } catch (e) { /* no data */ }

      // 2) Si no existe, caemos al registro (AsyncStorage)
      if (!userRole) {
        const tipo = await AsyncStorage.getItem('tipo');
        if (tipo) userRole = tipo;
      }

      setRole(userRole);
      setLoading(false);
    };

    bootstrap();
  }, []);

  const signIn = (newRole) => {
    // Úsalo si necesitas cambiar rol manualmente
    setRole(newRole);
  };

  const signOut = async () => {
    // Limpia todo: token, userData y demás
    await OfflineStorage.clearAll();
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
