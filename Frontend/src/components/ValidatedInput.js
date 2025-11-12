// Frontend/src/components/ValidatedInput.js
// Componentes de input con validación visual

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { formatPhone, formatDateInput, FIELD_LIMITS, VITAL_RANGES } from '../utils/validation';

/**
 * Input con contador de caracteres
 */
export function CharCounterInput({ 
  value, 
  onChangeText, 
  maxChars, 
  placeholder, 
  style, 
  multiline = false,
  ...props 
}) {
  // Asegurar que value siempre sea string, nunca null o undefined
  const safeValue = value || '';
  const currentLength = safeValue.length;
  const isOverLimit = currentLength > maxChars;
  
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          isOverLimit && styles.errorInput,
          style
        ]}
        value={safeValue}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        maxLength={maxChars + 10} // Permitir escribir más para mostrar error
        {...props}
      />
      <Text style={[styles.counter, isOverLimit && styles.errorText]}>
        {currentLength}/{maxChars}
      </Text>
    </View>
  );
}

/**
 * Input de teléfono con formato automático (1234-5678)
 */
export function PhoneInput({ value, onChangeText, style, ...props }) {
  const safeValue = value || '';
  
  const handleChange = (text) => {
    const formatted = formatPhone(text);
    onChangeText(formatted);
  };
  
  const digits = safeValue.replace(/\D/g, '');
  const isValid = digits.length === 0 || digits.length === 8;
  
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          !isValid && styles.errorInput,
          style
        ]}
        value={safeValue}
        onChangeText={handleChange}
        placeholder="1234-5678"
        keyboardType="numeric"
        maxLength={9} // 8 dígitos + 1 guion
        {...props}
      />
      {!isValid && (
        <Text style={styles.helperText}>8 dígitos requeridos</Text>
      )}
    </View>
  );
}

/**
 * Input de fecha con formato automático (MM/DD/YYYY)
 */
export function DateInput({ value, onChangeText, style, ...props }) {
  const safeValue = value || '';
  
  const handleChange = (text) => {
    const formatted = formatDateInput(text);
    onChangeText(formatted);
  };
  
  const isComplete = safeValue.length === 10; // MM/DD/YYYY
  const isValidFormat = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/.test(safeValue);
  
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          isComplete && !isValidFormat && styles.errorInput,
          style
        ]}
        value={safeValue}
        onChangeText={handleChange}
        placeholder="MM/DD/YYYY"
        keyboardType="numeric"
        maxLength={10}
        {...props}
      />
      <Text style={styles.helperText}>Formato: MM/DD/YYYY</Text>
    </View>
  );
}

/**
 * Input numérico con rango de validación
 */
export function RangeInput({ 
  value, 
  onChangeText, 
  min, 
  max, 
  unit = '', 
  style, 
  ...props 
}) {
  const safeValue = value || '';
  const numValue = parseFloat(safeValue);
  const isOutOfRange = safeValue && !isNaN(numValue) && (numValue < min || numValue > max);
  
  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          isOutOfRange && styles.errorInput,
          style
        ]}
        value={safeValue}
        onChangeText={onChangeText}
        keyboardType="numeric"
        {...props}
      />
      <Text style={[styles.helperText, isOutOfRange && styles.errorText]}>
        Rango: {min}-{max} {unit}
      </Text>
    </View>
  );
}

/**
 * Input de signos vitales con rangos predefinidos
 */
export function VitalSignInput({ 
  type, // 'presion_sistolica', 'glucosa', etc.
  value, 
  onChangeText, 
  style, 
  ...props 
}) {
  const range = VITAL_RANGES[type];
  if (!range) {
    console.warn(`VitalSignInput: tipo "${type}" no tiene rango definido`);
    return (
      <TextInput
        style={[styles.input, style]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        {...props}
      />
    );
  }
  
  return (
    <RangeInput
      value={value}
      onChangeText={onChangeText}
      min={range.min}
      max={range.max}
      style={style}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9E2C6',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#1B1B1B',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorInput: {
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  counter: {
    fontSize: 12,
    color: '#687076',
    textAlign: 'right',
    marginTop: 2,
  },
  helperText: {
    fontSize: 11,
    color: '#687076',
    marginTop: 2,
  },
  errorText: {
    color: '#E74C3C',
    fontWeight: '600',
  },
});
