import NetInfo from '@react-native-community/netinfo';

class ConnectivityService {
  constructor() {
    this.isConnected = false;
    this.listeners = [];
    
    this.unsubscribe = NetInfo.addEventListener(state => {
      const prevValue = this.isConnected;
      this.isConnected = state.isConnected;
      
      //Notificar a los listeners solo si hubo cambio
      if (prevValue !== this.isConnected) {
        this.notifyListeners();
      }
    });
  }

  //Añadir un listener para cambios de conectividad
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.isConnected));
  }

  //Estado de la conectividad
  async getConnectionStatus() {
    const state = await NetInfo.fetch();
    return state.isConnected;
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export default new ConnectivityService();