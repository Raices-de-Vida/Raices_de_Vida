# Guía de Pruebas Manuales - Módulo 4: Detección de Amenazas

## 1. Verificación de Detección de Patrones

### Paso 1: Simular Ataque de Fuerza Bruta
1. Realizar múltiples intentos de login fallidos desde la misma IP
2. Verificar que el sistema detecte el patrón
3. Confirmar bloqueo automático de IP
4. Revisar logs de seguridad

### Paso 2: Prueba de Detección de DoS
1. Generar múltiples requests simultáneas
2. Verificar activación de rate limiting
3. Confirmar respuesta automática del sistema
4. Validar métricas de monitoreo

## 2. Gestión de Incidentes

### Paso 1: Crear Incidente Manual
1. Acceder al panel de administración
2. Crear nuevo incidente de seguridad
3. Asignar a usuario responsable
4. Verificar notificaciones automáticas

### Paso 2: Respuesta a Incidentes
1. Ejecutar respuesta manual a incidente
2. Verificar ejecución de acciones automáticas
3. Documentar resolución del incidente
4. Revisar tiempo de respuesta

## 3. Dashboard de Monitoreo

### Paso 1: Métricas en Tiempo Real
1. Acceder al dashboard de seguridad
2. Verificar actualización de métricas
3. Revisar gráficos de amenazas
4. Validar alertas activas

### Paso 2: Análisis de Tendencias
1. Revisar patrones de tráfico
2. Identificar anomalías
3. Analizar reportes históricos
4. Verificar recomendaciones

## 4. Sistema de Alertas

### Paso 1: Configurar Canales de Alerta
1. Configurar email de notificaciones
2. Configurar webhook para integraciones
3. Activar alertas de dashboard
4. Probar cada canal de comunicación

### Paso 2: Validar Escalación
1. Generar alerta de severidad alta
2. Verificar escalación automática
3. Confirmar notificación a administradores
4. Revisar registro de alertas

## 5. Simulación de Escenarios

### Escenario 1: Filtración de Datos
1. Simular acceso no autorizado a datos
2. Verificar detección automática
3. Confirmar respuestas de seguridad
4. Revisar reporte de incidente

### Escenario 2: Inyección SQL
1. Intentar queries maliciosos
2. Verificar detección de patrones
3. Confirmar bloqueo de request
4. Validar logging de evento

## Criterios de Éxito

- Detección automática de amenazas funcional
- Respuestas automáticas se ejecutan correctamente
- Dashboard muestra métricas actualizadas
- Alertas se envían por todos los canales
- Incidentes se gestionan completamente
