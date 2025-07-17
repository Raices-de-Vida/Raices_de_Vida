// Test básico sin React Native - solo JavaScript puro

describe('Funciones básicas del Frontend', () => {
  test('Jest está funcionando correctamente', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  test('validación de email', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('usuario@gmail.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  test('validación de campos vacíos', () => {
    const isEmpty = (value) => {
      return !value || value.trim() === '';
    };

    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty('texto')).toBe(false);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
  });

  test('formateo de nombres', () => {
    const formatName = (name) => {
      if (!name) return '';
      return name.trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    expect(formatName('juan pérez')).toBe('Juan Pérez');
    expect(formatName('  MARIA GARCIA  ')).toBe('Maria Garcia');
    expect(formatName('ana')).toBe('Ana');
    expect(formatName('')).toBe('');
    expect(formatName('  ')).toBe('');
  });

  test('validación de DPI guatemalteco', () => {
    const validateDPI = (dpi) => {
      if (!dpi) return false;
      const cleanDPI = dpi.toString().trim();
      return cleanDPI.length === 13 && /^\d+$/.test(cleanDPI);
    };

    expect(validateDPI('1234567890123')).toBe(true);
    expect(validateDPI(1234567890123)).toBe(true);
    expect(validateDPI('12345')).toBe(false);
    expect(validateDPI('123456789012a')).toBe(false);
    expect(validateDPI('')).toBe(false);
    expect(validateDPI(null)).toBe(false);
  });

  test('validación de teléfonos guatemaltecos', () => {
    const validateGuatemalaPhone = (phone) => {
      if (!phone) return false;
      const cleanPhone = phone.toString().replace(/\s|-/g, '');
      // Números guatemaltecos: 8 dígitos, empiezan con 2, 3, 4, 5, o 7
      return /^[23457]\d{7}$/.test(cleanPhone);
    };

    expect(validateGuatemalaPhone('23456789')).toBe(true);
    expect(validateGuatemalaPhone('7234-5678')).toBe(true);
    expect(validateGuatemalaPhone('1234567')).toBe(false);
    expect(validateGuatemalaPhone('12345678')).toBe(false);
    expect(validateGuatemalaPhone('')).toBe(false);
  });

  test('cálculo de edad', () => {
    const calculateAge = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    };

    const birthDate2000 = '2000-01-01';
    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - 2000;
    
    expect(calculateAge(birthDate2000)).toBeGreaterThanOrEqual(expectedAge - 1);
    expect(calculateAge(birthDate2000)).toBeLessThanOrEqual(expectedAge);
  });
});