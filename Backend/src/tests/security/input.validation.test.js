/**
 * Pruebas automáticas de validación de entrada
 */

const request = require('supertest');
const express = require('express');
const SecurityTestUtils = require('./security.utils');
const securityConfig = require('./security.config');

describe('Validación de Entrada', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json({ 
      limit: securityConfig.limits.maxRequestSize,
      strict: true 
    }));

    //procesamiento de datos
    app.post('/api/test/data', (req, res) => {
      try {
        const { nombre, descripcion, telefono, ubicacion } = req.body;

        if (!nombre || typeof nombre !== 'string') {
          return res.status(400).json({ error: 'Nombre inválido' });
        }

        if (nombre.length > securityConfig.limits.maxFieldLength) {
          return res.status(400).json({ error: 'Nombre demasiado largo' });
        }

        // Detectar posibles XSS
        const xssPatterns = [/<script/i, /javascript:/i, /on\w+=/i, /<iframe/i];
        if (xssPatterns.some(pattern => pattern.test(nombre) || pattern.test(descripcion || ''))) {
          return res.status(400).json({ error: 'Contenido no permitido' });
        }

        // Detectar path traversal
        const pathTraversalPatterns = [/\.\./i, /\/etc\//i, /\/windows\//i];
        if (pathTraversalPatterns.some(pattern => pattern.test(ubicacion || ''))) {
          return res.status(400).json({ error: 'Ruta no válida' });
        }

        res.json({ 
          message: 'Datos procesados correctamente',
          nombre: nombre.trim(),
          procesado: true 
        });
      } catch (error) {
        res.status(500).json({ error: 'Error interno' });
      }
    });

    //endpoint para subida de archivos simulada
    app.post('/api/test/upload', (req, res) => {
      const { filename, content, size } = req.body;

      if (!filename || !content) {
        return res.status(400).json({ error: 'Archivo incompleto' });
      }

      if (size > securityConfig.validation.maxFileSize) {
        return res.status(400).json({ error: 'Archivo demasiado grande' });
      }

      const allowedExtensions = securityConfig.validation.allowedFileTypes;
      const fileExtension = filename.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        return res.status(400).json({ error: 'Tipo de archivo no permitido' });
      }

      res.json({ message: 'Archivo subido correctamente' });
    });

    //endpoint para testing de arrays y objetos
    app.post('/api/test/complex', (req, res) => {
      const { items, config } = req.body;

      if (Array.isArray(items) && items.length > securityConfig.validation.maxArrayLength) {
        return res.status(400).json({ error: 'Array demasiado grande' });
      }

      //verificar profundidad de objeto
      if (config && typeof config === 'object') {
        const depth = getObjectDepth(config);
        if (depth > securityConfig.validation.maxObjectDepth) {
          return res.status(400).json({ error: 'Objeto demasiado profundo' });
        }
      }

      res.json({ message: 'Datos complejos procesados' });
    });

    function getObjectDepth(obj) {
      if (typeof obj !== 'object' || obj === null) return 0;
      let depth = 1;
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          depth = Math.max(depth, 1 + getObjectDepth(obj[key]));
        }
      }
      return depth;
    }
  });

  describe('Protección contra XSS', () => {
    test('Debe rechazar scripts maliciosos', async () => {
      const xssPayloads = SecurityTestUtils.getMaliciousPayloads().xss;

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/test/data')
          .send({
            nombre: payload,
            descripcion: 'Descripción normal'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Contenido no permitido');
      }
    });

    test('Debe detectar XSS en múltiples campos', async () => {
      const response = await request(app)
        .post('/api/test/data')
        .send({
          nombre: 'Nombre normal',
          descripcion: '<script>alert("XSS")</script>'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Contenido no permitido');
    });
  });

  describe('Protección contra Path Traversal', () => {
    test('Debe rechazar intentos de path traversal', async () => {
      const pathTraversalPayloads = SecurityTestUtils.getMaliciousPayloads().pathTraversal;

      for (const payload of pathTraversalPayloads) {
        const response = await request(app)
          .post('/api/test/data')
          .send({
            nombre: 'Test User',
            ubicacion: payload
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Ruta no válida');
      }
    });
  });

  describe('Validación de Archivos', () => {
    test('Debe rechazar tipos de archivo no permitidos', async () => {
      const forbiddenFiles = [
        { filename: 'malware.exe', content: 'binary', size: 1000 },
        { filename: 'script.js', content: 'alert(1)', size: 500 },
        { filename: 'virus.bat', content: 'del *.*', size: 100 },
        { filename: 'hack.php', content: '<?php echo "hack"?>', size: 200 }
      ];

      for (const file of forbiddenFiles) {
        const response = await request(app)
          .post('/api/test/upload')
          .send(file);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Tipo de archivo no permitido');
      }
    });

    test('Debe aceptar tipos de archivo permitidos', async () => {
      const allowedFiles = [
        { filename: 'image.jpg', content: 'fake-image-data', size: 1000 },
        { filename: 'document.pdf', content: 'fake-pdf-data', size: 2000 },
        { filename: 'photo.png', content: 'fake-png-data', size: 1500 }
      ];

      for (const file of allowedFiles) {
        const response = await request(app)
          .post('/api/test/upload')
          .send(file);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Archivo subido correctamente');
      }
    });

    test('Debe rechazar archivos demasiado grandes', async () => {
      const response = await request(app)
        .post('/api/test/upload')
        .send({
          filename: 'huge.jpg',
          content: 'x'.repeat(1000),
          size: 10 * 1024 * 1024 // 10MB (mayor al límite de 5MB)
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Archivo demasiado grande');
    });
  });

  describe('Validación de Límites', () => {
    test('Debe rechazar campos excesivamente largos', async () => {
      const oversizedData = SecurityTestUtils.generateOversizedData();

      const response = await request(app)
        .post('/api/test/data')
        .send({
          nombre: oversizedData.longString,
          descripcion: 'Descripción normal'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Nombre demasiado largo');
    });

    test('Debe rechazar arrays demasiado grandes', async () => {
      const largeArray = new Array(securityConfig.validation.maxArrayLength + 1).fill('item');

      const response = await request(app)
        .post('/api/test/complex')
        .send({
          items: largeArray,
          config: {}
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Array demasiado grande');
    });

    test('Debe rechazar objetos con anidación excesiva', async () => {
      const deepObject = SecurityTestUtils.createDeepObject(
        securityConfig.validation.maxObjectDepth + 1
      );

      const response = await request(app)
        .post('/api/test/complex')
        .send({
          items: [],
          config: deepObject
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Objeto demasiado profundo');
    });
  });

  describe('Validación de JSON', () => {
    test('Debe rechazar JSON malformado', async () => {
      const response = await request(app)
        .post('/api/test/data')
        .set('Content-Type', 'application/json')
        .send('{"nombre": "test", "descripcion":');

      expect(response.status).toBe(400);
    });

    test('Debe rechazar payloads excesivamente grandes', async () => {
      const hugePayload = {
        data: 'x'.repeat(2 * 1024 * 1024) // 2MB
      };

      const response = await request(app)
        .post('/api/test/data')
        .send(hugePayload);

      expect(response.status).toBe(413); //Payload Too Large
    });
  });

  describe('Validación de Contenido', () => {
    test('Debe validar tipos de datos correctos', async () => {
      const invalidTypes = [
        { nombre: 123, descripcion: 'test' }, //número en lugar de string
        { nombre: null, descripcion: 'test' }, //null
        { nombre: [], descripcion: 'test' }, //array
        { nombre: {}, descripcion: 'test' } //objeto
      ];

      for (const invalidData of invalidTypes) {
        const response = await request(app)
          .post('/api/test/data')
          .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Nombre inválido');
      }
    });

    test('Debe aceptar datos válidos', async () => {
      const validData = {
        nombre: 'Usuario Válido',
        descripcion: 'Esta es una descripción válida',
        telefono: '502-1234-5678',
        ubicacion: 'Guatemala, Ciudad'
      };

      const response = await request(app)
        .post('/api/test/data')
        .send(validData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Datos procesados correctamente');
      expect(response.body.nombre).toBe('Usuario Válido');
    });
  });

  describe('⚡ Pruebas de Rendimiento y DoS', () => {
    test('Debe manejar múltiples peticiones simultáneas', async () => {
      const promises = [];
      const numberOfRequests = 20;

      for (let i = 0; i < numberOfRequests; i++) {
        const promise = request(app)
          .post('/api/test/data')
          .send({
            nombre: `Usuario ${i}`,
            descripcion: `Descripción ${i}`
          });
        promises.push(promise);
      }

      const responses = await Promise.all(promises);
      
      //Todas las respuestas deben ser exitosas
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status); //200 OK o 429 Too Many Requests
      });
    });

    test('Debe procesar datos válidos en tiempo razonable', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/test/data')
        .send({
          nombre: 'Test Performance',
          descripcion: 'Testing response time'
        });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); //Menos de 1 segundo
    });
  });
});
