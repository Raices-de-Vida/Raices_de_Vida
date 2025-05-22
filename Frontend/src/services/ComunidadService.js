import axios from 'axios';

class ComunidadService {
  async getComunidadesForRegistro() {
    try {
      const response = await axios.get('//localhost:3001/api/comunidades/registro');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo comunidades:', error);
      //comunidades de respaldo en caso de error
      return [
        { id_comunidad: 1, nombre_comunidad: 'San Gaspar Ixchil' },
        { id_comunidad: 2, nombre_comunidad: 'Santa Bárbara' },
        { id_comunidad: 3, nombre_comunidad: 'Huehuetenango' },
        { id_comunidad: 4, nombre_comunidad: 'Cahabón' },
        { id_comunidad: 5, nombre_comunidad: 'Colotenango' },
        { id_comunidad: 6, nombre_comunidad: 'Lanquín' }
      ];
    }
  }
  
  //info detallada de una comunidad
  async getComunidadById(id) {
    try {
      const token = await localStorage.getItem('token');
      const response = await axios.get(`//localhost:3001/api/comunidades/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error obteniendo comunidad #${id}:`, error);
      throw error;
    }
  }
}

export default new ComunidadService();