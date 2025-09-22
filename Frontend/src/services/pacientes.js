const BASE_URL = 'http://localhost:8081'; 

async function req(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
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

export async function createPaciente(payload, token) {
  return req('/api/pacientes', { method: 'POST', body: payload, token });
}

export async function registrarSignos(id_paciente, signos, token) {
  return req(`/api/pacientes/${id_paciente}/signos`, { method: 'POST', body: signos, token });
}
