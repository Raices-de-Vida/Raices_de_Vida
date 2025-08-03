# Módulo 1: Autenticación y Validación de Entrada

## Descripción
Pruebas de seguridad básicas para autenticación de usuarios y validación de datos de entrada.

### Componentes principales:
- Protección contra SQL injection
- Validación de contraseñas
- Sanitización de entrada XSS
- Validación de formato de email
- Límites de tamaño de datos

## Comandos automáticos

### Ejecutar todas las pruebas del Módulo 1
```bash
npm run test:security:module1
```

### Ejecutar pruebas específicas
```bash
# Solo autenticación
npx jest src/tests/security/auth.security.test.js --verbose

# Solo validación de entrada
npx jest src/tests/security/input.validation.test.js --verbose

# En modo watch
npm run test:security:watch
```

## Archivos del módulo
- `auth.security.test.js` - Tests de autenticación (23 pruebas)
- `input.validation.test.js` - Tests de validación (15 pruebas)
- `security.config.js` - Configuración básica
- `security.utils.js` - Utilidades compartidas

## Resultado esperado
- Total: 38 pruebas automáticas
- Tiempo: ~2-3 segundos
- Cobertura: Autenticación básica y validación de entrada
