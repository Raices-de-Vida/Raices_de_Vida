# Módulo 4: Detección de Amenazas y Monitoreo

## Archivos
- `monitoring.config.js` - Configuración de monitoreo y detección
- `monitoring.utils.js` - Utilidades para eventos y alertas de seguridad
- `threatdetection.security.test.js` - Pruebas de detección de amenazas automática
- `incidentresponse.security.test.js` - Pruebas de respuesta a incidentes y reportes

## Funcionalidades

### Detección de Amenazas
- Detección automática de patrones de ataque
- Monitoreo en tiempo real de eventos de seguridad
- Análisis de comportamiento anómalo
- Bloqueo automático de IPs maliciosas
- Detección de ataques de fuerza bruta y DDoS

### Respuesta a Incidentes
- Gestión completa de incidentes de seguridad
- Respuestas automáticas configurables
- Asignación y seguimiento de casos
- Escalación automática de amenazas críticas
- Simulación de escenarios de ataque

### Monitoreo y Alertas
- Dashboard de métricas de seguridad en tiempo real
- Sistema de alertas multi-canal (email, webhook, dashboard)
- Generación automática de reportes de seguridad
- Métricas de rendimiento del sistema
- Auditoría completa de eventos

### Reportes y Análisis
- Reportes diarios, semanales y mensuales automatizados
- Análisis de tendencias de seguridad
- Métricas de tiempo de respuesta
- Identificación de patrones de amenaza
- Recomendaciones de seguridad basadas en datos

## Pruebas Implementadas

### Detección de Amenazas (25 tests)
- Validación de middleware de detección
- Bloqueo automático de IPs
- Generación de alertas
- Monitoreo de eventos
- Dashboard de métricas
- Detección de patrones de ataque
- Validación de configuración

### Respuesta a Incidentes (21 tests)
- Gestión de incidentes
- Respuestas automáticas
- Generación de reportes
- Métricas de rendimiento
- Simulación de escenarios
- Validación de configuración

## Configuración Clave

### Patrones de Detección
```javascript
patterns: {
  bruteForce: { attempts: 5, window: 900 },
  dos: { requests: 100, window: 60 },
  sqlInjection: { patterns: ['union', 'select', 'drop'] },
  xss: { patterns: ['<script>', 'javascript:', 'onerror='] }
}
```

### Respuestas Automáticas
```javascript
autoResponse: {
  enabled: true,
  actions: {
    blockIp: { enabled: true, duration: 3600 },
    lockAccount: { enabled: true, duration: 1800 },
    notifyAdmins: { enabled: true, channels: ['email', 'webhook'] }
  }
}
```

### Alertas
```javascript
alerts: {
  enabled: true,
  channels: {
    email: { enabled: true, recipients: ['admin@raicesdevida.org'] },
    webhook: { enabled: true, url: 'https://api.raicesdevida.org/webhooks/security' },
    dashboard: { enabled: true, realtime: true }
  }
}
```

## Ejecución de Pruebas

### Ejecutar todas las pruebas del módulo
```bash
npm run test:security:module4
```

### Ejecutar pruebas específicas
```bash
npm run test:security:threat-detection
npm run test:security:incident-response
```

### Ejecutar con coverage
```bash
npm run test:security:module4:coverage
```

## Total de Pruebas
- **46 pruebas automáticas** de detección de amenazas y respuesta a incidentes
- Cobertura completa de funcionalidades críticas
- Validación de configuración y rendimiento
- Simulación de escenarios reales de ataque
