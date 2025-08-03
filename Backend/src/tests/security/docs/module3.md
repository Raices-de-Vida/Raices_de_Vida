# Módulo 3: Gestión de Usuarios y Autorización

## Descripción
Pruebas avanzadas de autorización, control de acceso basado en roles, gestión de sesiones y auditoría de seguridad.

### Componentes principales:
- Control de acceso basado en roles (RBAC)
- Autorización por permisos específicos
- Gestión de sesiones concurrentes
- Auditoría de acciones sensibles
- Detección de actividad sospechosa
- Jerarquía de roles y niveles de acceso

## Comandos automáticos

### Ejecutar todas las pruebas del Módulo 3
```bash
npm run test:security:module3
```

### Ejecutar pruebas específicas
```bash
# Solo autorización
npx jest src/tests/security/authorization.security.test.js --verbose

# Solo sesiones
npx jest src/tests/security/session.security.test.js --verbose

# En modo watch
npm run test:security:watch
```

## Archivos del módulo
- `authorization.security.test.js` - Tests de autorización (25 pruebas)
- `session.security.test.js` - Tests de sesiones (20 pruebas)
- `usermanagement.config.js` - Configuración de roles y permisos
- `usermanagement.utils.js` - Utilidades para gestión de usuarios

## Resultado esperado
- Total: 45 pruebas automáticas
- Tiempo: ~2-3 segundos
- Cobertura: Autorización completa y gestión de sesiones
