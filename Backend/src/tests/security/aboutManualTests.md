### Cómo ejecutar estas pruebas
```bash
npm run test:security:manual
```

#### Test 1: Intentos de login maliciosos
**Objetivo**: Verificar protección contra SQL injection en login

**Pasos**:
1. Abrir Postman
2. Hacer POST a `http://localhost:3000/auth/login`
3. Probar estos payloads en el campo `email`:

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

**Resultado esperado**: 
- Debe rechazar el login
- NO debe mostrar información de la base de datos
- Debe devolver error genérico

---

#### Test 2: Validación de contraseñas
**Objetivo**: Verificar que las políticas de contraseña se cumplan

**Pasos**:
1. Intentar registrar usuarios con estas contraseñas:
   - `123` (muy corta)
   - `password` (muy común)
   - `abcdefgh` (sin números/símbolos)
   - `Password123!` (válida)

**POST a**: `http://localhost:3000/auth/register`

**Resultado esperado**:
- Debe rechazar las primeras 3
- Debe aceptar la última

#### Test 3: Protección XSS
**Objetivo**: Verificar sanitización de scripts maliciosos

**Pasos**:
1. Intentar registrar con emails que contengan scripts:

```json
{
  "email": "<script>alert('xss')</script>@test.com",
  "password": "ValidPass123!"
}
```

```json
{
  "email": "test@test.com<img src=x onerror=alert('xss')>",
  "password": "ValidPass123!"
}
```

**Resultado esperado**:
- Debe rechazar ambos
- NO debe ejecutar JavaScript
- Debe sanitizar la entrada

#### Test 4: Límites de velocidad (Rate Limiting)
**Objetivo**: Verificar protección contra ataques de fuerza bruta

**Pasos**:
1. Hacer múltiples requests rápidos al endpoint de login (más de 5 en 15 minutos)
2. Usar script o Postman para automatizar

**Resultado esperado**:
- Después de 5 intentos debe bloquear temporalmente
- Debe mostrar mensaje de "demasiados intentos"

---

#### REPORTE (Documentación)
Crear un archivo `security-manual-report.md` con:

### Comandos útiles:
```bash
# Ver logs en tiempo real
npm run dev

# Ejecutar todas las pruebas automáticas primero
npm run test:security:auto

# Monitorear en modo watch
npm run test:security:watch
```