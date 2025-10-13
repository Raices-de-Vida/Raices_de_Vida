// services/pacientes.js - COMPLETO
const BASE_URL = 'http://localhost:3001';

async function req(path, { method = 'GET', body} = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const msg = data?.error || data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function createPaciente(payload) {
  return req('/api/pacientes', { method: 'POST', body: payload});
}

export async function registrarSignos(id_paciente, signos) {
  return req(`/api/pacientes/${id_paciente}/signos`, { method: 'POST', body: signos});
}

export async function autoEvaluarAlertas(id_paciente) {
  return req(`/api/alertas/auto-evaluar/${id_paciente}`, { method: 'POST'});
}