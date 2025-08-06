# Pruebas Manuales - Módulo 2

## Cómo ejecutar
```bash
npm run test:security:module2
```

## Test 1: Configuración SSL/TLS
**Objetivo:** Verificar configuración HTTPS

**Procedimiento:**
1. Verificar certificado SSL:
```bash
openssl s_client -connect localhost:3001 -servername localhost
```

2. Verificar versión TLS:
```bash
curl -I --tlsv1.2 https://localhost:3001
```

**Resultado esperado:**
- Certificado válido
- TLS 1.2 o superior
- Cifrados seguros habilitados

## Test 2: Headers de Seguridad
**Objetivo:** Verificar headers HTTP de seguridad

**Procedimiento:**
```bash
curl -I http://localhost:3001/api/status
```

**Headers requeridos:**
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

**Resultado esperado:**
- Todos los headers presentes
- Valores de seguridad correctos

## Test 3: Encriptación de Datos
**Objetivo:** Verificar encriptación de datos sensibles

**Procedimiento:**
```json
POST http://localhost:3001/api/secure/data
{
  "sensitiveData": {
    "dpi": "1234567890123",
    "telefono": "+502 1234-5678"
  }
}
```

**Resultado esperado:**
- Datos se encriptan correctamente
- Algoritmo AES-256
- No aparecen datos en logs

## Test 4: Rate Limiting
**Objetivo:** Verificar límites de velocidad

**Procedimiento:**
```bash
# Hacer 6 requests rápidos
for i in {1..6}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

**Resultado esperado:**
- Primeros 5: HTTP 401
- Sexto: HTTP 429 (rate limit)
- Header `Retry-After` presente

## Test 5: Protección DoS
**Objetivo:** Verificar resistencia a ataques DoS

**Procedimiento:**
1. Enviar payload grande (>1MB):
```bash
dd if=/dev/zero of=large.txt bs=1M count=2
curl -X POST http://localhost:3001/api/test/dos \
  -d @large.txt
```

**Resultado esperado:**
- Rechazar payloads grandes
- Sistema mantiene responsividad
- HTTP 413 (Payload too large)

## Test 6: Timing Attacks
**Objetivo:** Verificar tiempos consistentes

**Procedimiento:**
```bash
# Medir tiempos de respuesta
for user in "admin" "fake1" "fake2"; do
  time curl -X POST http://localhost:3001/api/auth/login \
    -d "{\"email\":\"$user@test.com\",\"password\":\"wrong\"}"
done
```

**Resultado esperado:**
- Tiempos consistentes (diferencia <50ms)
- No filtrar información por timing

## Criterios de evaluación
- Excelente: Todos los tests pasan
- Bueno: 80% de tests pasan
- Regular: 60% de tests pasan
- Malo: Menos del 60%
