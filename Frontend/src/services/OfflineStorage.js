import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PENDING_ALERTS: 'pendingAlerts',
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
};

export default {
  async savePendingAlert(alert) {
    try {
      //Se obtienen alertas existentes
      const existingAlerts = await this.getPendingAlerts();
      
      //ID temporal para identificarla localmente
      const alertWithId = {
        ...alert,
        tempId: Date.now().toString(),
        createdAt: new Date().toISOString(),
        pendingSync: true
      };
      
      const updatedAlerts = [...existingAlerts, alertWithId];
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_ALERTS, 
        JSON.stringify(updatedAlerts)
      );
      
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

  //Eliminar una alerta pendiente después de sincronizarla
  async removePendingAlert(tempId) {
    try {
      const alerts = await this.getPendingAlerts();
      const updatedAlerts = alerts.filter(alert => alert.tempId !== tempId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PENDING_ALERTS, 
        JSON.stringify(updatedAlerts)
      );
    } catch (error) {
      console.error('Error eliminando alerta pendiente:', error);
    }
  },

  //Guardar datos del usuario para acceso offline
  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error guardando datos de usuario:', error);
    }
  },

  //Obtener datos del usuario guardados
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error obteniendo datos de usuario:', error);
      return null;
    }
  },

  //Guardar token de autenticación
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

  //Limpiar datos de sesión
  async clearSession() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error limpiando sesión:', error);
    }
  }
};