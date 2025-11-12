// Frontend/src/utils/validation.js
// Utilidades de validación para formularios de pacientes

/**
 * Límites de caracteres según pdfFieldsMap.json
 */
export const FIELD_LIMITS = {
  date: 15,
  patient_name: 50,
  phone: 20,
  town: 40,
  dob: 12,
  age: 10,
  language: 20,
  // Signos vitales
  bp: 10,
  hr: 10,
  spo2: 10,
  glucose: 10,
  weight: 10,
  height: 10,
  temp: 10,
  // Campos largos
  chiefComplaint: 200,
  hpi: 500,
  pmh_med: 200,
  pmh_surg: 200,
  pmh_meds: 200,
  pe_heart: 150,
  pe_lungs: 150,
  pe_abdomen: 150,
  pe_gyn: 150,
  impression: 300,
  plan: 300,
};

/**
 * Rangos válidos para signos vitales
 */
export const VITAL_RANGES = {
  presion_sistolica: { min: 50, max: 250 },
  presion_diastolica: { min: 30, max: 200 },
  frecuencia_cardiaca: { min: 30, max: 250 },
  saturacion_oxigeno: { min: 0, max: 100 },
  glucosa: { min: 20, max: 600 },
  peso: { min: 1, max: 300 },
  estatura: { min: 30, max: 250 },
  temperatura: { min: 30, max: 45 },
};

/**
 * Formatea un teléfono con guion (12345678 -> 1234-5678)
 */
export function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 4) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return digits;
}

/**
 * Formatea una fecha mientras el usuario escribe (MM/DD/YYYY)
 */
export function formatDateInput(value) {
  // Remover todo excepto números
  const digits = value.replace(/\D/g, '').slice(0, 8);
  
  let formatted = '';
  if (digits.length >= 1) {
    formatted += digits.slice(0, 2); // MM
  }
  if (digits.length >= 3) {
    formatted += '/' + digits.slice(2, 4); // /DD
  }
  if (digits.length >= 5) {
    formatted += '/' + digits.slice(4, 8); // /YYYY
  }
  
  return formatted;
}

/**
 * Valida que una fecha tenga formato MM/DD/YYYY correcto
 */
export function isValidDateFormat(dateStr) {
  if (!dateStr) return { valid: true, error: null }; // Opcional
  
  const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
  if (!regex.test(dateStr)) {
    return { valid: false, error: 'dateFormat' };
  }
  
  // Validar que sea una fecha real
  const [month, day, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { valid: false, error: 'invalidDate' };
  }
  
  return { valid: true, error: null };
}

/**
 * Valida que un teléfono tenga 8 dígitos
 */
export function validatePhone(phone) {
  if (!phone) return { valid: true, error: null }; // Opcional
  
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 0) return { valid: true, error: null };
  
  if (!/^\d+$/.test(digits)) {
    return { valid: false, error: 'phoneOnlyNumbers' };
  }
  
  if (digits.length !== 8) {
    return { valid: false, error: 'phoneDigits' };
  }
  
  return { valid: true, error: null };
}

/**
 * Valida límite de caracteres
 */
export function validateMaxChars(value, maxChars, fieldName) {
  if (!value) return { valid: true, error: null };
  
  const length = value.length;
  if (length > maxChars) {
    return { 
      valid: false, 
      error: 'maxChars',
      params: { field: fieldName, max: maxChars, current: length }
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Valida rango numérico
 */
export function validateRange(value, min, max, fieldName) {
  if (!value || value === '') return { valid: true, error: null }; // Opcional
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: 'notNumber' };
  }
  
  if (num < min) {
    return { 
      valid: false, 
      error: 'rangeMin',
      params: { field: fieldName, min }
    };
  }
  
  if (num > max) {
    return { 
      valid: false, 
      error: 'rangeMax',
      params: { field: fieldName, max }
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Valida todos los campos del formulario de paciente
 * Retorna { valid: boolean, errors: [{ field, message }] }
 */
export function validatePatientData(data, t) {
  const errors = [];
  
  // Validar teléfono
  const phoneValidation = validatePhone(data.telefono);
  if (!phoneValidation.valid) {
    errors.push({
      field: t('fields.phone', { ns: 'DetallePaciente' }),
      message: t(`errors.validation.${phoneValidation.error}`, { ns: 'DetallePaciente' })
    });
  }
  
  // Validar fecha de nacimiento
  if (data.fecha_nacimiento) {
    const dateValidation = isValidDateFormat(data.fecha_nacimiento);
    if (!dateValidation.valid) {
      errors.push({
        field: t('c1.dobAge', { ns: 'DetallePaciente' }),
        message: t(`errors.validation.${dateValidation.error}`, { ns: 'DetallePaciente' })
      });
    }
  }
  
  // Validar límites de caracteres
  const charValidations = [
    { value: data.nombre, max: FIELD_LIMITS.patient_name, field: 'Nombre' },
    { value: data.apellido, max: FIELD_LIMITS.patient_name, field: 'Apellido' },
    { value: data.comunidad_pueblo, max: FIELD_LIMITS.town, field: t('fields.town', { ns: 'DetallePaciente' }) },
    { value: data.idioma, max: FIELD_LIMITS.language, field: t('c1.language', { ns: 'DetallePaciente' }) },
  ];
  
  charValidations.forEach(({ value, max, field }) => {
    const validation = validateMaxChars(value, max, field);
    if (!validation.valid) {
      errors.push({
        field,
        message: t(`errors.validation.${validation.error}`, { 
          ...validation.params, 
          ns: 'DetallePaciente' 
        })
      });
    }
  });
  
  // Validar rangos de signos vitales
  const vitalValidations = [
    { value: data.presion_arterial_sistolica, range: VITAL_RANGES.presion_sistolica, field: t('c1.vitals.bp', { ns: 'DetallePaciente' }) + ' Sistólica' },
    { value: data.presion_arterial_diastolica, range: VITAL_RANGES.presion_diastolica, field: t('c1.vitals.bp', { ns: 'DetallePaciente' }) + ' Diastólica' },
    { value: data.frecuencia_cardiaca, range: VITAL_RANGES.frecuencia_cardiaca, field: t('c1.vitals.hr', { ns: 'DetallePaciente' }) },
    { value: data.saturacion_oxigeno, range: VITAL_RANGES.saturacion_oxigeno, field: t('c1.vitals.spo2', { ns: 'DetallePaciente' }) },
    { value: data.glucosa, range: VITAL_RANGES.glucosa, field: t('c1.vitals.bs', { ns: 'DetallePaciente' }) },
    { value: data.peso, range: VITAL_RANGES.peso, field: t('c1.vitals.weight', { ns: 'DetallePaciente' }) },
    { value: data.estatura, range: VITAL_RANGES.estatura, field: t('c1.vitals.height', { ns: 'DetallePaciente' }) },
    { value: data.temperatura, range: VITAL_RANGES.temperatura, field: t('c1.vitals.temp', { ns: 'DetallePaciente' }) },
  ];
  
  vitalValidations.forEach(({ value, range, field }) => {
    if (value !== undefined && value !== null && value !== '') {
      const validation = validateRange(value, range.min, range.max, field);
      if (!validation.valid) {
        errors.push({
          field,
          message: t(`errors.validation.${validation.error}`, { 
            ...validation.params, 
            ns: 'DetallePaciente' 
          })
        });
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}
