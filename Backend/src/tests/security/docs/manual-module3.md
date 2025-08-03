# Pruebas Manuales - Módulo 3

## Cómo ejecutar
```bash
npm run test:security:module3
```

## Test 1: Escalación de Privilegios
**Objetivo:** Verificar que usuarios no puedan elevar sus permisos

**Procedimiento:**
1. Login como voluntario:
```json
POST http://localhost:3001/api/auth/login
{
  "email": "voluntario@test.com",
  "password": "TestPassword123!"
}
```

2. Intentar acceder a endpoint de admin:
```bash
curl -H "Authorization: Bearer [TOKEN]" \
     http://localhost:3001/api/admin-only
```

**Resultado esperado:**
- Status: 403 Forbidden
- Error: "acceso denegado"

## Test 2: Gestión de Sesiones Múltiples
**Objetivo:** Verificar límites de sesiones concurrentes

**Procedimiento:**
1. Login múltiple con mismo usuario (6+ veces)
2. Verificar que se rechaza después del límite
3. Consultar sesiones activas:
```bash
curl -H "Authorization: Bearer [TOKEN]" \
     http://localhost:3001/api/auth/sessions
```

**Resultado esperado:**
- Máximo 5 sesiones concurrentes
- Error 429 después del límite
- Lista de sesiones activas visible

## Test 3: Auditoría de Acciones
**Objetivo:** Verificar registro de auditoría

**Procedimiento:**
1. Login como admin
2. Realizar varias acciones
3. Consultar logs:
```bash
curl -H "Authorization: Bearer [ADMIN_TOKEN]" \
     http://localhost:3001/api/audit/logs
```

**Resultado esperado:**
- Logs detallados de todas las acciones
- Timestamps correctos
- Información de IP y User-Agent

## Test 4: Terminación de Sesiones
**Objetivo:** Verificar control de sesiones

**Procedimiento:**
1. Login desde 2 dispositivos diferentes
2. Terminar sesión específica:
```bash
curl -X DELETE \
     -H "Authorization: Bearer [TOKEN]" \
     http://localhost:3001/api/auth/sessions/[SESSION_ID]
```

**Resultado esperado:**
- Sesión específica terminada
- Otras sesiones siguen activas
- Auditoría registrada

## Test 5: Detección de Anomalías
**Objetivo:** Verificar detección de actividad sospechosa

**Procedimiento:**
1. Login normal desde IP conocida
2. Intentar acceso desde IP diferente con mismo token
3. Revisar logs de auditoría

**Resultado esperado:**
- Acceso permitido pero marcado como sospechoso
- Risk level elevado en logs
- Posible alerta generada

## Test 6: Jerarquía de Roles
**Objetivo:** Verificar niveles de acceso

**Procedimiento:**
1. Login como diferentes roles
2. Probar acceso a endpoint de jerarquía:
```bash
curl -H "Authorization: Bearer [TOKEN]" \
     http://localhost:3001/api/hierarchy/admin
```

**Resultado esperado:**
- Admin accede a todos los niveles
- ONG no accede a nivel admin
- Voluntario solo accede a su nivel
