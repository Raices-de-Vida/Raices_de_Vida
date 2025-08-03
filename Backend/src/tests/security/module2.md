# Módulo 2: Comunicación Segura y Criptografía

## Descripción
Pruebas avanzadas de comunicación segura, encriptación de datos y protección contra ataques DoS.

### Componentes principales:
- Configuración SSL/TLS
- Encriptación de datos sensibles
- Headers de seguridad HTTP
- Rate limiting por endpoint
- Monitoreo y auditoría
- Protección contra timing attacks

## Comandos automáticos

### Ejecutar todas las pruebas del Módulo 2
```bash
npm run test:security:module2
```

### Ejecutar pruebas específicas
```bash
# Solo comunicación segura
npm run test:security:communication

# Solo rate limiting
npm run test:security:ratelimit

# En modo watch
npm run test:security:watch
```

## Archivos del módulo
- `communication.security.test.js` - Tests de comunicación (25 pruebas)
- `ratelimit.security.test.js` - Tests de rate limiting (19 pruebas)
- `communication.config.js` - Configuración avanzada
- `communication.utils.js` - Utilidades de encriptación

## Resultado esperado
- Total: 44 pruebas automáticas
- Tiempo: ~1.5-2 segundos
- Cobertura: Comunicación segura y criptografía avanzada
