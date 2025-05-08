import axios from 'axios';
import OfflineStorage from './OfflineStorage';
import ConnectivityService from './ConnectivityService';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    
    //Configurar listener para cambios en conectividad
    ConnectivityService.addListener(isConnected => {
      if (isConnected) {
        this.syncPendingData();
      }
    });
  }

  //Añadir listener para eventos de sincronización
  addSyncListener(listener) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  //Notificar sobre el estado de sincronización
  notifySyncStatus(status, data) {
    this.syncListeners.forEach(listener => listener(status, data));
  }

  //Sincronizar todas las alertas pendientes
  async syncPendingData() {
    if (this.isSyncing) return;
    
    try {
      this.isSyncing = true;
      this.notifySyncStatus('started');
      
      const isConnected = await ConnectivityService.getConnectionStatus();
      if (!isConnected) {
        this.notifySyncStatus('offline');
        return;
      }
      
      //Obtener token
      const token = await OfflineStorage.getToken();
      if (!token) {
        this.notifySyncStatus('error', { message: 'No hay sesión activa' });
        return;
      }
      
      //Obtener alertas pendientes
      const pendingAlerts = await OfflineStorage.getPendingAlerts();
      if (pendingAlerts.length === 0) {
        this.notifySyncStatus('complete', { syncedCount: 0 });
        return;
      }
      
      //Sincronizar cada alerta
      let syncedCount = 0;
      for (const alert of pendingAlerts) {
        try {
          //Eliminar propiedades específicas de offline
          const { tempId, pendingSync, createdAt, ...alertData } = alert;
          
          //Enviar al servidor
          await axios.post('http://localhost:3001/api/alertas', alertData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          //Eliminar de pendientes
          await OfflineStorage.removePendingAlert(tempId);
          syncedCount++;
        } catch (error) {
          console.error('Error al sincronizar alerta:', error);
        }
      }
      
      this.notifySyncStatus('complete', { 
        syncedCount, 
        totalCount: pendingAlerts.length 
      });
    } catch (error) {
      this.notifySyncStatus('error', { message: error.message });
    } finally {
      this.isSyncing = false;
    }
  }

  manualSync() {
    return this.syncPendingData();
  }
}

export default new SyncService();