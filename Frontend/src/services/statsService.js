// src/services/statsService.js
// Servicio centralizado para estadísticas
import axios from 'axios';

// Cambia esta base según tu entorno (ENV mejor):
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://TU-SERVIDOR/api/statistics';

export async function fetchCasosPorLugar({ meses = 4 } = {}) {
  const { data } = await axios.get(`${API_BASE}/casos-por-lugar`, { params: { meses } });
  return data; // {desde, hasta, meses, data:[{municipio, comunidad, personas_vistas, consultas}]}
}

export async function fetchCronicosPorEdad() {
  const { data } = await axios.get(`${API_BASE}/cronicos-por-edad`);
  return data; // { total_pacientes_cronicos, rangos: {"0-17":n, "18-29":n, ... , "desconocida": n} }
}

export async function fetchPesoEdadNinos({ edad_maxima = 18 } = {}) {
  const { data } = await axios.get(`${API_BASE}/peso-edad-ninos`, { params: { edad_maxima } });
  return data; // { edad_maxima, total_ninos_con_peso, data:[{id_paciente, edad, peso_kg, sexo, municipio, comunidad}] }
}

