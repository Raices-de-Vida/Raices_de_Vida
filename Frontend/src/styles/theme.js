// Paleta de colores institucional Raíces de Vida
export const brandColors = {
  tangerine: '#F08C21',    // Color de acción/énfasis principal
  butter: '#F2D88F',       // Fondo suave alternativo
  sea: '#6698CC',          // Azul para contraste suave
  matcha: '#B4B534',       // Botones secundarios/neutrales
  blush: '#E3688B',        // Mensajes importantes/errores
  // Variaciones para mejor contraste
  tangerineLight: '#F5A653',
  tangerineDark: '#E0761B',
  butterLight: '#F7E4A3',
  butterDark: '#EDCC7B',
  seaLight: '#85B0D9',
  seaDark: '#4F7FB5',
  matchaLight: '#C5C84A',
  matchaDark: '#A3A42D',
  blushLight: '#E987A3',
  blushDark: '#DD5078',
};

export const lightTheme = {
  // 🌞 MODO CLARO - Cards blancas con bordes elegantes
  
  // Fondos principales - Blanco base limpio
  background: '#FFFFFF',                   // Blanco limpio y moderno como base
  cardBackground: '#FFFFFF',               // Cards también blancas
  sectionBackground: '#FFFFFF',            // Consistencia total
  alternativeBackground: '#F8F9FA',        // Gris muy claro para variaciones
  
  // Jerarquía de textos - Legibilidad optimizada
  text: '#2A2A2A',                        // Gris oscuro para excelente legibilidad
  secondaryText: brandColors.sea,          // #6698CC para hints e información secundaria
  placeholderText: '#7A9CC7',             // Sea más claro para placeholders
  
  // Componentes de formulario
  card: '#FFFFFF',                        // Cards blancas
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  cardBorder: brandColors.butter,          // Borde Butter sutil (#F2D88F)
  header: brandColors.tangerine,           // #F08C21 - Header energético
  headerText: '#FFFFFF',                   // Blanco para contraste perfecto
  
  // Sistema de inputs - Claridad y accesibilidad
  inputBackground: '#FFFFFF',              // Fondo blanco limpio en inputs
  inputBorder: brandColors.butter,         // Borde Butter (#F2D88F) en modo claro
  inputBorderFocus: brandColors.sea,       // #6698CC al enfocar - azul calmante
  inputText: '#2A2A2A',                   // Texto principal oscuro
  inputPlaceholder: '#7A9CC7',            // Sea claro para sugerencias
  inputIcon: '#7A9CC7',                   // Íconos en tono Sea claro
  
  // Sistema de botones - Jerarquía visual clara
  primaryButton: brandColors.blush,        // #E36888 - Botón primario destacado
  primaryButtonText: '#FFFFFF',           // Texto blanco para contraste
  secondaryButton: 'transparent',         // Fondo transparente
  secondaryButtonText: brandColors.sea,    // Texto azul para cancelar
  secondaryButtonBorder: brandColors.sea, // Borde azul
  cancelButton: 'transparent',            // Botón cancelar discreto
  cancelButtonText: brandColors.sea,       // Texto azul calmante
  cancelButtonBorder: brandColors.sea,     // Borde azul consistente
  deleteButton: '#C94A6A',               // Blush oscuro para acciones destructivas
  deleteButtonText: '#FFFFFF',
  
  // Elementos de interfaz
  borderColor: brandColors.butter,         // Butter para bordes en modo claro
  dividerColor: 'rgba(242, 216, 143, 0.3)', // Butter muy tenue para divisores
  switchActive: brandColors.tangerine,
  switchInactive: brandColors.butter,
  
  // Dropdowns y selecciones
  dropdownBackground: '#FFFFFF',          // Dropdowns en blanco
  dropdownBorder: brandColors.sea,
  dropdownShadow: 'rgba(102, 152, 204, 0.15)',
  optionSelected: 'rgba(102, 152, 204, 0.1)', // Sea muy suave
  
  // Estados y feedback - Nueva paleta mejorada
  successColor: '#22C55E',                 // Verde más moderno para pocos caracteres
  warningColor: '#F97316',                 // Naranja para nivel medio  
  errorColor: '#EF4444',                   // Rojo moderno para muchos caracteres
  infoColor: brandColors.sea,              // Sea para información
  
  // Colores específicos para niveles de prioridad
  priorityLow: '#38BDF8',                  // Celeste para prioridad baja
  priorityMedium: '#22C55E',               // Verde para prioridad media
  priorityHigh: '#F97316',                 // Naranja para prioridad alta
  priorityCritical: '#EF4444',             // Rojo para prioridad crítica
  
  // Estados de alerta
  pendingStatus: brandColors.blush,
  attendedStatus: brandColors.matcha,
  derivedStatus: brandColors.tangerine,
  
  // Notificaciones
  toastSuccess: brandColors.matcha,
  toastError: '#C94A6A',
  toastInfo: brandColors.sea,
  toastWarning: brandColors.tangerine,
  toastText: '#FFFFFF',
};

export const darkTheme = {
  // 🌚 MODO OSCURO - Configuración optimizada para bajo contraste lumínico
  
  // Fondos principales - Negro profundo base
  background: '#121212',                   // Fondo base negro profundo
  cardBackground: '#1E1E1E',              // Cards en gris oscuro para contraste
  sectionBackground: '#1E1E1E',           // Consistencia en secciones
  alternativeBackground: '#2A2A2A',       // Alternativo más claro
  
  // Jerarquía de textos - Contraste optimizado para ojos
  text: '#FFFFFF',                        // Blanco puro para máxima legibilidad
  secondaryText: brandColors.sea,          // #6698CC - Sea original para hints
  placeholderText: '#9A9A9A',            // Gris medio para placeholders
  
  // Componentes de formulario
  card: '#1E1E1E',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  cardBorder: brandColors.tangerine,       // Borde naranja en modo oscuro
  header: brandColors.tangerine,           // #F08C21 - Header mantiene energía
  headerText: '#FFFFFF',                   // Blanco para contraste perfecto
  
  // Sistema de inputs - Visibilidad nocturna
  inputBackground: '#1E1E1E',             // Gris oscuro para inputs
  inputBorder: brandColors.tangerine,      // Borde naranja en modo oscuro
  inputBorderFocus: brandColors.sea,       // #6698CC - Sea para foco
  inputText: '#FFFFFF',                   // Texto blanco para legibilidad
  inputPlaceholder: '#9A9A9A',            // Gris medio para sugerencias
  inputIcon: '#9A9A9A',                   // Íconos en gris medio
  
  // Sistema de botones - Jerarquía visual en oscuro
  primaryButton: brandColors.blush,        // #E36888 - Blush resalta en negro
  primaryButtonText: '#FFFFFF',           // Texto blanco para contraste
  secondaryButton: 'transparent',         // Fondo transparente
  secondaryButtonText: '#9A9A9A',         // Gris claro discreto
  secondaryButtonBorder: '#9A9A9A',       // Borde gris claro
  cancelButton: 'transparent',            // Botón cancelar discreto
  cancelButtonText: brandColors.sea,       // Sea tenue para cancelar
  cancelButtonBorder: brandColors.sea,     // Borde Sea tenue
  deleteButton: '#C94A6A',               // Blush oscuro para acciones destructivas
  deleteButtonText: '#FFFFFF',
  
  // Elementos de interfaz
  borderColor: brandColors.tangerine,      // Naranja para bordes en modo oscuro
  dividerColor: 'rgba(240, 140, 33, 0.15)', // Naranja tenue para divisores
  switchActive: brandColors.tangerine,
  switchInactive: '#404040',
  
  // Dropdowns y selecciones
  dropdownBackground: '#1E1E1E',
  dropdownBorder: brandColors.tangerine,   // Borde naranja en modo oscuro
  dropdownShadow: 'rgba(0, 0, 0, 0.6)',
  optionSelected: 'rgba(240, 140, 33, 0.2)', // Naranja tenue para selección
  
  // Estados y feedback - Mismos colores que modo claro
  successColor: '#22C55E',                 // Verde moderno
  warningColor: '#F97316',                 // Naranja
  errorColor: '#EF4444',                   // Rojo moderno  
  infoColor: brandColors.sea,             // Sea para información
  
  // Colores específicos para niveles de prioridad
  priorityLow: '#38BDF8',                  // Celeste para prioridad baja
  priorityMedium: '#22C55E',               // Verde para prioridad media
  priorityHigh: '#F97316',                 // Naranja para prioridad alta
  priorityCritical: '#EF4444',             // Rojo para prioridad crítica
  
  // Estados de alerta
  pendingStatus: brandColors.blush,
  attendedStatus: brandColors.matcha,
  derivedStatus: brandColors.tangerine,
  
  // Notificaciones
  toastSuccess: brandColors.matcha,
  toastError: brandColors.blush,
  toastInfo: brandColors.sea,
  toastWarning: brandColors.tangerine,
  toastText: '#FFFFFF',
};

export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};