import axios from 'axios';
import OfflineStorage from './OfflineStorage';
import ConnectivityService from './ConnectivityService';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
    this.maxRetries = 3;
    
    //listener para cambios en conectividad
    ConnectivityService.addListener(isConnected => {
      if (isConnected) {
        this.syncPendingData();
      }
    });
    
    //reintento periódico para alertas que fallaron
    this.retryInterval = setInterval(() => {
      this.retryFailedAlerts();
    }, 300000); //Reintentar cada 5 minutos
  }
  
  //listener para eventos de sincronización
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
      
      const token = await OfflineStorage.getToken();
      if (!token) {
        this.notifySyncStatus('error', { message: 'No hay sesión activa' });
        return;
      }
      
      const pendingAlerts = await OfflineStorage.getPendingAlerts();
      if (pendingAlerts.length === 0) {
        this.notifySyncStatus('complete', { syncedCount: 0 });
        return;
      }
      
      //Sincronizar cada alerta
      let syncedCount = 0;
      let failedCount = 0;
      
      for (const alert of pendingAlerts) {
        //Omitir alertas con demasiados intentos fallidos
        if (alert.syncAttempts && alert.syncAttempts >= this.maxRetries) {
          failedCount++;
          continue;
        }
        
        try {
          //Eliminar propiedades específicas de offline
          const { tempId, pendingSync, createdAt, syncAttempts, syncError, ...alertData } = alert;
          
          //Enviar al servidor
          await axios.post('http://localhost:3001/api/alertas', alertData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          //Eliminar de pendientes tras éxito
          await OfflineStorage.removePendingAlert(tempId);
          syncedCount++;
          
        } catch (error) {
          console.error('Error al sincronizar alerta:', error);
          
          const attempts = (alert.syncAttempts || 0) + 1;
          await OfflineStorage.updatePendingAlert(alert.tempId, {
            syncAttempts: attempts,
            syncError: error.message || 'Error de sincronización',
            lastAttempt: new Date().toISOString()
          });
          
          failedCount++;
        }
      }
      
      this.notifySyncStatus('complete', { 
        syncedCount, 
        failedCount,
        totalCount: pendingAlerts.length 
      });
    } catch (error) {
      this.notifySyncStatus('error', { message: error.message });
    } finally {
      this.isSyncing = false;
    }
  }
  
  //Reintentar específicamente las alertas fallidas
  async retryFailedAlerts() {
    const isConnected = await ConnectivityService.getConnectionStatus();
    if (isConnected && !this.isSyncing) {
      const alerts = await OfflineStorage.getPendingAlerts();
      const failedAlerts = alerts.filter(alert => alert.syncAttempts && alert.syncAttempts < this.maxRetries);
      
      if (failedAlerts.length > 0) {
        console.log(`Reintentando ${failedAlerts.length} alertas fallidas...`);
        this.syncPendingData();
      }
    }
  }
  
  //Forzar reintento de una alerta específica
  async retryAlert(tempId) {
    const alert = await OfflineStorage.getPendingAlert(tempId);
    if (alert) {
      await OfflineStorage.updatePendingAlert(tempId, {
        syncAttempts: 0,
        syncError: null
      });
      
      return this.syncPendingData();
    }
    return false;
  }

  manualSync() {
    return this.syncPendingData();
  }
  
  cleanup() {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
    }
  }
}

export default new SyncService();