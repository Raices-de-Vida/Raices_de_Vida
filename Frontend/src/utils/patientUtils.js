// patientUtils.js - Utilidades para cálculos y transformaciones de datos del paciente

/**
 * Calcula el IMC (Índice de Masa Corporal)
 * @param {number} peso - Peso en kilogramos
 * @param {number} estatura - Estatura en centímetros
 * @returns {number|null} - IMC calculado o null si los datos son inválidos
 */
export function calcularIMC(peso, estatura) {
  const pesoNum = parseFloat(String(peso).replace(',', '.'));
  const estaturaNum = parseFloat(String(estatura).replace(',', '.'));
  
  if (pesoNum > 0 && estaturaNum > 0) {
    const imc = pesoNum / Math.pow(estaturaNum / 100, 2);
    return parseFloat(imc.toFixed(2));
  }
  
  return null;
}

/**
 * Obtiene la categoría del IMC y su color asociado
 * @param {number} imc - Índice de Masa Corporal
 * @returns {{key: string, color: string}} - Categoría y color
 */
export function getBMICategory(imc) {
  if (imc < 18.5) return { key: 'underweight', color: '#3B82F6' };
  if (imc < 25) return { key: 'normal', color: '#10B981' };
  if (imc < 30) return { key: 'overweight', color: '#F59E0B' };
  if (imc < 35) return { key: 'obesity1', color: '#F97316' };
  if (imc < 40) return { key: 'obesity2', color: '#DC2626' };
  return { key: 'obesity3', color: '#8B0000' };
}

/**
 * Convierte fecha ISO a formato DD/MM/YYYY
 * @param {string} iso - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {string} - Fecha en formato DD/MM/YYYY
 */
export function isoToDMY(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Convierte fecha DD/MM/YYYY a formato ISO
 * @param {string} dmy - Fecha en formato DD/MM/YYYY
 * @returns {string} - Fecha en formato ISO (YYYY-MM-DD)
 */
export function dmyToISO(dmy) {
  if (!dmy || dmy.length < 8) return '';
  const cleaned = dmy.replace(/\D/g, '');
  if (cleaned.length !== 8) return '';
  
  const d = cleaned.substring(0, 2);
  const m = cleaned.substring(2, 4);
  const y = cleaned.substring(4, 8);
  
  return `${y}-${m}-${d}`;
}

/**
 * Parsea una fecha ISO en componentes separados
 * @param {string} dateString - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {{month: string, day: string, year: string}} - Componentes de la fecha
 */
export function parseLMPDate(dateString) {
  if (!dateString) return { month: '', day: '', year: '' };
  
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return {
      month: parts[1], // MM
      day: parts[2],   // DD
      year: parts[0]   // YYYY
    };
  }
  
  return { month: '', day: '', year: '' };
}

/**
 * Construye una fecha ISO desde componentes separados
 * @param {string} month - Mes (MM)
 * @param {string} day - Día (DD)
 * @param {string} year - Año (YYYY)
 * @returns {string|null} - Fecha en formato ISO o null si falta algún componente
 */
export function buildISODate(month, day, year) {
  if (!month || !day || !year) return null;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Obtiene el color de severidad
 * @param {string} severidad - 'Baja', 'Media', 'Alta', 'Crítica'
 * @returns {string} - Color hexadecimal
 */
export function getSeverityColor(severidad) {
  const colors = {
    'Crítica': '#E53935',
    'Alta': '#F08C21',
    'Media': '#FFC107',
    'Baja': '#4CAF50'
  };
  return colors[severidad] || '#6698CC';
}

/**
 * Convierte un array de checkboxes en un string separado por comas
 * @param {Object} checkboxes - Objeto con propiedades booleanas
 * @param {Object} labels - Mapeo de keys a labels
 * @returns {string|null} - String separado por comas o null
 */
export function checkboxesToString(checkboxes, labels) {
  const selected = [];
  
  for (const [key, value] of Object.entries(checkboxes)) {
    if (value && labels[key]) {
      selected.push(labels[key]);
    }
  }
  
  return selected.length > 0 ? selected.join(', ') : null;
}

/**
 * Convierte un string separado por comas en un objeto de checkboxes
 * @param {string} str - String separado por comas
 * @param {Array<string>} options - Opciones posibles
 * @returns {Object} - Objeto con propiedades booleanas
 */
export function stringToCheckboxes(str, options) {
  if (!str) return {};
  
  const lowerStr = str.toLowerCase();
  const result = {};
  
  options.forEach(opt => {
    result[opt] = lowerStr.includes(opt.toLowerCase());
  });
  
  return result;
}
