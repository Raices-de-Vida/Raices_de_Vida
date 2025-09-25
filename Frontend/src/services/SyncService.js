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

  notifySyncStatus(status, data) {
    this.syncListeners.forEach(listener => listener(status, data));
  }

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
      const pendingFlags = await OfflineStorage.getPendingFlags();
      const pendingPatientUpdates = await OfflineStorage.getPendingPatientUpdates();
      if (pendingAlerts.length === 0 && pendingFlags.length === 0 && pendingPatientUpdates.length === 0) {
        this.notifySyncStatus('complete', { syncedCount: 0 });
        return;
      }

      let syncedCount = 0;
      let failedCount = 0;

      //sincronizar cada alerta
      for (const alert of pendingAlerts) {
        //omitir alertas con demasiados intentos fallidos
        if (alert.syncAttempts && alert.syncAttempts >= this.maxRetries) {
          failedCount++;
          continue;
        }
        
        try {
          //eliminar propiedades específicas de offline
          const { tempId, pendingSync, createdAt, syncAttempts, syncError, ...alertData } = alert;
          
          //enviar al servidor
          await axios.post('http://localhost:3001/api/alertas', alertData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          //eliminar de pendientes tras éxito
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
      
      for (const flag of pendingFlags) {
        if (flag.syncAttempts && flag.syncAttempts >= this.maxRetries) {
          failedCount++;
          continue;
        }
        try {
          const { tempId, pendingSync, createdAt, syncAttempts, syncError, lastAttempt, ...flagData } = flag;
          await axios.post(`http://localhost:3001/api/pacientes/${flagData.id_paciente}/alertas-medicas/manual`, { nivel: flagData.nivel }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await OfflineStorage.removePendingFlag(tempId);
          syncedCount++;
        } catch (error) {
          console.error('Error al sincronizar flag:', error);
          const attempts = (flag.syncAttempts || 0) + 1;
          await OfflineStorage.updatePendingFlag(flag.tempId, {
            syncAttempts: attempts,
            syncError: error.message || 'Error de sincronización',
            lastAttempt: new Date().toISOString()
          });
          failedCount++;
        }
      }

      for (const upd of pendingPatientUpdates) {
        if (upd.syncAttempts && upd.syncAttempts >= this.maxRetries) { failedCount++; continue; }
        try {
          const { tempId, pendingSync, createdAt, syncAttempts, syncError, lastAttempt, ...payload } = upd; // payload: { id_paciente, peso_kg, altura_cm, manualSeverity }
          await axios.put(`http://localhost:3001/api/pacientes/${payload.id_paciente}/update-basic`, payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          await OfflineStorage.removePendingPatientUpdate(tempId);
          syncedCount++;
        } catch (error) {
          const attempts = (upd.syncAttempts || 0) + 1;
            await OfflineStorage.updatePendingPatientUpdate(upd.tempId, {
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
        totalCount: pendingAlerts.length + pendingFlags.length + pendingPatientUpdates.length
      });
    } catch (error) {
      this.notifySyncStatus('error', { message: error.message });
    } finally {
      this.isSyncing = false;
    }
  }
  
  async retryFailedAlerts() {
    const isConnected = await ConnectivityService.getConnectionStatus();
    if (isConnected && !this.isSyncing) {
      const alerts = await OfflineStorage.getPendingAlerts();
      const flags = await OfflineStorage.getPendingFlags();
      const failedAlerts = alerts.filter(alert => alert.syncAttempts && alert.syncAttempts < this.maxRetries);
      const failedFlags = flags.filter(flag => flag.syncAttempts && flag.syncAttempts < this.maxRetries);

      if (failedAlerts.length > 0 || failedFlags.length > 0) {
        console.log(`Reintentando ${failedAlerts.length} alertas y ${failedFlags.length} flags fallidos...`);
        this.syncPendingData();
      }
    }
  }
  
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

  async retryFlag(tempId) {
    const flag = await OfflineStorage.getPendingFlag(tempId);
    if (flag) {
      await OfflineStorage.updatePendingFlag(tempId, { syncAttempts: 0, syncError: null });
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