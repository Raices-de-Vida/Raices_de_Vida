## CÓMO EJECUTAR LOS TESTS

### Pruebas AUTO
```bash
# Ejecutar TODAS las pruebas de seguridad automáticas
npm run test:security:auto

# Ejecutar al guardar
npm run test:security:watch

# Ejecutar con detalles
npm run test:security
```

### Pruebas MANUALES
```bash
# Ver la guía de pruebas manuales
npm run test:security:manual

# Luego seguir las instrucciones en:
# src/tests/security/aboutManualTests.md
```

### Config y Utilidades
- `src/tests/security/security.config.js` - Configuración centralizada de seguridad
- `src/tests/security/security.utils.js` - Utilidades para generar datos de prueba

### AUTO Tests
- `src/tests/security/auth.security.test.js` - Pruebas de autenticación
- `src/tests/security/input.validation.test.js` - Pruebas de validación de entrada


## Tipos de Pruebas

### Autos (Jest)
1. **Protección SQL Injection** - Verifica que las consultas estén protegidas
2. **Validación de contraseñas** - Políticas de contraseñas seguras
3. **Validación de emails** - Formato correcto y sanitización
4. **Protección XSS** - Filtrado de scripts maliciosos
5. **Límites de archivos** - Protección contra uploads peligrosos
6. **Rate Limiting** - Protección contra ataques de fuerza bruta

### Manuales (A petición "escalable")
1. **Pruebas con Postman** - Tests reales de endpoints
2. **Inyección SQL manual** - Intentos de bypass
3. **Scripts XSS** - Verificación de sanitización
4. **Límites de velocidad** - Tests de rate limiting
5. **Evaluación con estrellas** - Sistema de puntuación

## Ejecución Automática
Los tests se ejecutan automáticamente cuando:
1. Guardas cambios en archivos de código
2. Usas `npm run test:security:watch`
3. Hay cambios en rutas de autenticación