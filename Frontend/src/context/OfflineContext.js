import React, { createContext, useState, useContext, useEffect } from 'react';
import ConnectivityService from '../services/ConnectivityService';
import SyncService from '../services/SyncService';

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [syncInfo, setSyncInfo] = useState({
    isSyncing: false,
    lastSync: null,
    syncStats: null
  });

  useEffect(() => {
    //estado inicial de conectividad
    const checkInitialConnection = async () => {
      const status = await ConnectivityService.getConnectionStatus();
      setIsConnected(status);
    };
    
    checkInitialConnection();
    
    // cambios de conectividad
    const unsubscribeConnection = ConnectivityService.addListener((status) => {
      setIsConnected(status);
    });
    
    // eventos de sincronización
    const unsubscribeSync = SyncService.addSyncListener((status, data) => {
      setSyncInfo(prev => ({
        ...prev,
        isSyncing: status === 'started',
        lastSync: status === 'complete' ? new Date() : prev.lastSync,
        syncStats: data
      }));
    });
    
    return () => {
      unsubscribeConnection();
      unsubscribeSync();
    };
  }, []);

  const syncNow = async () => {
    await SyncService.manualSync();
  };

  return (
    <OfflineContext.Provider value={{
      isConnected,
      syncInfo,
      syncNow
    }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);