# Pruebas Manuales - Módulo 1

## Cómo ejecutar
```bash
npm run test:security:manual
```

## Test 1: SQL Injection en Login
**Objetivo:** Verificar protección contra inyección SQL

**Procedimiento:**
1. Usar Postman o curl
2. POST a `http://localhost:3001/api/auth/login`
3. Probar payloads maliciosos:

```json
{
  "email": "admin'; DROP TABLE usuarios; --",
  "password": "cualquier_cosa"
}
```

```json
{
  "email": "' OR '1'='1",
  "password": "' OR '1'='1"
}
```

**Resultado esperado:**
- Status: 400 o 401
- No revelar información de base de datos
- Error genérico sin detalles

## Test 2: Validación de Contraseñas
**Objetivo:** Verificar políticas de contraseñas

**Procedimiento:**
1. POST a `http://localhost:3001/api/auth/register`
2. Probar contraseñas:
   - `123` (muy corta)
   - `password` (muy común)
   - `abcdefgh` (sin números)
   - `Password123!` (válida)

**Resultado esperado:**
- Rechazar las primeras 3
- Aceptar solo la válida
- Mensajes de error específicos

## Test 3: Protección XSS
**Objetivo:** Verificar sanitización de scripts

**Procedimiento:**
1. Intentar registro con emails maliciosos:

```json
{
  "email": "<script>alert('xss')</script>@test.com",
  "password": "ValidPass123!"
}
```

**Resultado esperado:**
- Rechazar entrada con scripts
- No ejecutar JavaScript
- Sanitizar datos de entrada

## Test 4: Validación de Email
**Objetivo:** Verificar formato correcto de email

**Procedimiento:**
1. Probar emails malformados:
   - `invalid-email`
   - `test@`
   - `@domain.com`
   - `test..test@domain.com`

**Resultado esperado:**
- Rechazar formatos incorrectos
- Validación estricta de formato
- Mensajes de error claros

## Criterios de evaluación
- Excelente: Todos los tests pasan
- Bueno: 80% de tests pasan
- Regular: 60% de tests pasan
- Malo: Menos del 60%
