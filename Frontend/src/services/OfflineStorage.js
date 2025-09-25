import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PENDING_ALERTS: 'pendingAlerts',
  PENDING_FLAGS: 'pendingFlags',
  PENDING_PATIENT_UPDATES: 'pendingPatientUpdates',
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
};

export default {
  async savePendingAlert(alert) {
    try {
      const existingAlerts = await this.getPendingAlerts();
      const alertWithId = {
        ...alert,
        tempId: Date.now().toString(),
        createdAt: new Date().toISOString(),
        pendingSync: true,
        syncAttempts: 0
      };
      const updatedAlerts = [...existingAlerts, alertWithId];
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ALERTS, JSON.stringify(updatedAlerts));
      return alertWithId;
    } catch (error) {
      console.error('Error guardando alerta pendiente:', error);
      throw error;
    }
  },

  async getPendingAlerts() {
    try {
      const alerts = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ALERTS);
      return alerts ? JSON.parse(alerts) : [];
    } catch (error) {
      console.error('Error obteniendo alertas pendientes:', error);
      return [];
    }
  },

  async getPendingAlert(tempId) {
    try {
      const alerts = await this.getPendingAlerts();
      return alerts.find(alert => alert.tempId === tempId) || null;
    } catch (error) {
      console.error('Error obteniendo alerta pendiente:', error);
      return null;
    }
  },

  async updatePendingAlert(tempId, updates) {
    try {
      const alerts = await this.getPendingAlerts();
      const updatedAlerts = alerts.map(alert => {
        if (alert.tempId === tempId) {
          return { ...alert, ...updates };
        }
        return alert;
      });
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ALERTS, JSON.stringify(updatedAlerts));
      return true;
    } catch (error) {
      console.error('Error actualizando alerta pendiente:', error);
      return false;
    }
  },

  async removePendingAlert(tempId) {
    try {
      const alerts = await this.getPendingAlerts();
      const updatedAlerts = alerts.filter(alert => alert.tempId !== tempId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ALERTS, JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error eliminando alerta pendiente:', error);
    }
  },

  async savePendingFlag(flag) {
    try {
      const existing = await this.getPendingFlags();
      const item = {
        ...flag,
        tempId: Date.now().toString(),
        createdAt: new Date().toISOString(),
        pendingSync: true,
        syncAttempts: 0
      };
      const updated = [...existing, item];
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_FLAGS, JSON.stringify(updated));
      return item;
    } catch (error) {
      console.error('Error guardando flag pendiente:', error);
      throw error;
    }
  },

  async getPendingFlags() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_FLAGS);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Error obteniendo flags pendientes:', error);
      return [];
    }
  },

  async getPendingFlag(tempId) {
    try {
      const flags = await this.getPendingFlags();
      return flags.find(f => f.tempId === tempId) || null;
    } catch (error) {
      console.error('Error obteniendo flag pendiente:', error);
      return null;
    }
  },

  async updatePendingFlag(tempId, updates) {
    try {
      const flags = await this.getPendingFlags();
      const updated = flags.map(f => (f.tempId === tempId ? { ...f, ...updates } : f));
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_FLAGS, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error actualizando flag pendiente:', error);
      return false;
    }
  },

  async removePendingFlag(tempId) {
    try {
      const flags = await this.getPendingFlags();
      const updated = flags.filter(f => f.tempId !== tempId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_FLAGS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error eliminando flag pendiente:', error);
    }
  },

  async savePendingPatientUpdate(update) {
    try {
      const existing = await this.getPendingPatientUpdates();
      const item = {
        ...update,
        tempId: Date.now().toString(),
        createdAt: new Date().toISOString(),
        pendingSync: true,
        syncAttempts: 0
      };
      const updated = [...existing, item];
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_PATIENT_UPDATES, JSON.stringify(updated));
      return item;
    } catch (error) {
      console.error('Error guardando update paciente pendiente:', error);
      throw error;
    }
  },

  async getPendingPatientUpdates() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_PATIENT_UPDATES);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Error obteniendo updates paciente pendientes:', error);
      return [];
    }
  },

  async removePendingPatientUpdate(tempId) {
    try {
      const list = await this.getPendingPatientUpdates();
      const updated = list.filter(u => u.tempId !== tempId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_PATIENT_UPDATES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error eliminando update paciente pendiente:', error);
    }
  },

  async updatePendingPatientUpdate(tempId, updates) {
    try {
      const list = await this.getPendingPatientUpdates();
      const updated = list.map(u => u.tempId === tempId ? { ...u, ...updates } : u);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_PATIENT_UPDATES, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error actualizando update paciente pendiente:', error);
      return false;
    }
  },

  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error guardando datos de usuario:', error);
    }
  },

  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error obteniendo datos de usuario:', error);
      return null;
    }
  },

  async saveToken(token) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  },

  async clearSession() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error limpiando todo el almacenamiento:', error);
    }
  }
};
