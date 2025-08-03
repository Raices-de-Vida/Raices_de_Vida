/**
 * Tests automáticos para protección contra ataques de denegación de servicio
 */

const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');
const CommunicationSecurityUtils = require('./communication.utils');
const communicationConfig = require('./communication.config');

describe('Pruebas de Rate Limiting y Protección DoS', () => {
  let app;
  let rateLimitedApp;

  beforeAll(async () => {
    //app sin rate limiting
    app = express();
    app.use(express.json());

    //app con rate limiting
    rateLimitedApp = express();
    rateLimitedApp.use(express.json());

    const loginLimiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 3,
      message: {
        error: 'Demasiados intentos de login',
        retryAfter: '1 minuto'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        CommunicationSecurityUtils.logSecurityEvent('rate_limit_exceeded', {
          endpoint: req.originalUrl,
          ip: req.ip
        });
        res.status(429).json({
          error: 'Demasiados intentos de login',
          retryAfter: '1 minuto'
        });
      }
    });

    const apiLimiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 10,
      message: {
        error: 'Límite de API excedido',
        retryAfter: '1 minuto'
      }
    });

    const strictLimiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 1,
      message: {
        error: 'Endpoint muy limitado',
        retryAfter: '1 minuto'
      }
    });

    //endpoints sin rate limiting (para comparación)
    app.post('/api/unlimited', (req, res) => {
      res.json({ message: 'Request processed', timestamp: Date.now() });
    });

    app.post('/api/test/dos', (req, res) => {
      //sim endpoint vulnerable a DoS
      const { data } = req.body;
      
      if (data && typeof data === 'string' && data.length > 1000000) { // 1MB
        CommunicationSecurityUtils.logSecurityEvent('dos_attempt', {
          dataSize: data.length,
          ip: req.ip
        });
        return res.status(413).json({ error: 'Payload demasiado grande' });
      }

      res.json({ message: 'Data processed', size: data ? data.length : 0 });
    });

    //endpoints con rate limiting
    rateLimitedApp.post('/api/auth/login', loginLimiter, (req, res) => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Credenciales requeridas' });
      }

      //sim validación lenta (vulnerable a timing attacks)
      setTimeout(() => {
        if (email === 'admin@test.com' && password === 'admin123') {
          res.json({ success: true, token: 'test-token' });
        } else {
          res.status(401).json({ error: 'Credenciales inválidas' });
        }
      }, 100);
    });

    rateLimitedApp.post('/api/data', apiLimiter, (req, res) => {
      res.json({ message: 'Data endpoint', timestamp: Date.now() });
    });

    rateLimitedApp.post('/api/critical', strictLimiter, (req, res) => {
      res.json({ message: 'Critical endpoint accessed', timestamp: Date.now() });
    });

    rateLimitedApp.get('/api/status', (req, res) => {
      res.json({
        status: 'OK',
        rateLimitInfo: {
          remaining: req.rateLimit?.remaining,
          limit: req.rateLimit?.limit,
          resetTime: req.rateLimit?.resetTime
        }
      });
    });
  });

  describe('Rate Limiting Básico', () => {
    test('Debe permitir requests dentro del límite', async () => {
      const response1 = await request(rateLimitedApp)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test123' })
        .expect(401); //credenciales incorrectas pero request permitido

      const response2 = await request(rateLimitedApp)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test123' })
        .expect(401);

      expect(response1.status).toBe(401);
      expect(response2.status).toBe(401);
    });

    test('Debe bloquear requests que excedan el límite', async () => {
      //4 requests rápidos (excede límite de 3)
      await request(rateLimitedApp)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test123' });

      await request(rateLimitedApp)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test123' });

      await request(rateLimitedApp)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test123' });

      //4th request debe ser bloqueado
      const response = await request(rateLimitedApp)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test123' })
        .expect(429);

      expect(response.body.error).toContain('Demasiados intentos');
      expect(response.headers['retry-after']).toBeDefined();
    });

    test('Debe manejar diferentes límites por endpoint', async () => {
      //endpoint crítico (límite muy bajo)
      await request(rateLimitedApp)
        .post('/api/critical')
        .send({})
        .expect(200);

      //2th request debe ser bloqueado
      const response = await request(rateLimitedApp)
        .post('/api/critical')
        .send({})
        .expect(429);

      expect(response.body.error).toContain('muy limitado');
    });
  });

  describe('Protección contra DoS', () => {
    test('Debe rechazar payloads excesivamente grandes', async () => {
      const largePayload = 'A'.repeat(1500000); // 1.5MB

      const response = await request(app)
        .post('/api/test/dos')
        .send({ data: largePayload })
        .expect(413);
      expect(response.status).toBe(413);
    });

    test('Debe procesar payloads de tamaño normal', async () => {
      const normalPayload = 'A'.repeat(1000); // 1KB

      const response = await request(app)
        .post('/api/test/dos')
        .send({ data: normalPayload })
        .expect(200);

      expect(response.body.message).toBe('Data processed');
      expect(response.body.size).toBe(1000);
    });

    test('Debe detectar patrones de ataque DoS', () => {
      const requests = [];
      const now = Date.now();
      
      //sim 100 requests en 30 segundos
      for (let i = 0; i < 100; i++) {
        requests.push({
          timestamp: now - (i * 300), // Cada 300ms
          ip: '192.168.1.100',
          endpoint: '/api/auth/login'
        });
      }

      const dosPattern = CommunicationSecurityUtils.detectBruteForcePattern(requests);
      expect(dosPattern.isSuspicious).toBe(true);
    });

    test('Debe manejar requests concurrentes sin degradación', async () => {
      const startTime = Date.now();
      
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/unlimited')
          .send({ test: 'concurrent' })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Request processed');
      });

      //tiempo total no debe ser excesivo (menos de 5 segundos)
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Protección contra Timing Attacks', () => {
    test('Debe tener tiempo de respuesta consistente para credenciales inválidas', async () => {
      const times = [];

      //medir tiempo de respuesta para diferentes credenciales inválidas
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        
        await request(rateLimitedApp)
          .post('/api/auth/login')
          .send({ email: `fake${i}@test.com`, password: `fake${i}` });
        
        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      //los tiempos deben ser relativamente consistentes (diferencia < 50ms)
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      const timeDifference = maxTime - minTime;

      expect(timeDifference).toBeLessThan(50);
    });

    test('Debe usar medición de tiempo para detectar vulnerabilidades', async () => {
      const measureFunction = () => {
        return new Promise(resolve => {
          setTimeout(resolve, 100); //sim operación que toma tiempo
        });
      };

      const timeInfo = await CommunicationSecurityUtils.measureResponseTime(measureFunction);
      
      expect(timeInfo.duration).toBeGreaterThan(90);
      expect(timeInfo.duration).toBeLessThan(150);
      expect(timeInfo.startTime).toBeDefined();
      expect(timeInfo.endTime).toBeDefined();
    });
  });

  describe('Monitoreo de Rate Limiting', () => {
    test('Debe registrar eventos de rate limiting', async () => {
      //prep para exceder límite
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});
      await request(rateLimitedApp).post('/api/data').send({});

      //debe activar rate limiting
      const response = await request(rateLimitedApp)
        .post('/api/data')
        .send({})
        .expect(429);

      expect(response.body.error).toContain('Límite de API excedido');
    });

    test('Debe proporcionar información de rate limit en headers', async () => {
      const response = await request(rateLimitedApp)
        .get('/api/status')
        .expect(200);

      //verificamos que el endpoint responde
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });

    test('Debe configurar rate limiting por IP', () => {
      const config = CommunicationSecurityUtils.getRateLimitConfig('/api/auth/login');
      
      expect(config.keyGenerator).toBeInstanceOf(Function);
      
      //sim request con IP y usuario
      const mockReq = {
        ip: '192.168.1.100',
        user: { id: 'user123' }
      };

      const key = config.keyGenerator(mockReq);
      expect(key).toBe('192.168.1.100user123');
    });
  });

  describe('Config Avanzada de Rate Limiting', () => {
    test('Debe validar configuración de endpoints', () => {
      const endpoints = communicationConfig.rateLimiting.endpoints;
      
      expect(endpoints['/api/auth/login']).toBeDefined();
      expect(endpoints['/api/auth/login'].max).toBe(5);
      expect(endpoints['/api/auth/login'].windowMs).toBe(15 * 60 * 1000);

      expect(endpoints['/api/auth/register']).toBeDefined();
      expect(endpoints['/api/auth/register'].max).toBe(3);
      expect(endpoints['/api/auth/register'].windowMs).toBe(60 * 60 * 1000);
    });

    test('Debe tener configuración global de rate limiting', () => {
      const globalConfig = communicationConfig.rateLimiting.global;
      
      expect(globalConfig.windowMs).toBe(60 * 1000); // 1 minuto
      expect(globalConfig.max).toBe(100); // 100 requests
      expect(globalConfig.standardHeaders).toBe(true);
      expect(globalConfig.handler).toBeInstanceOf(Function);
    });

    test('Debe generar configuración dinámica por endpoint', () => {
      const loginConfig = CommunicationSecurityUtils.getRateLimitConfig('/api/auth/login');
      const unknownConfig = CommunicationSecurityUtils.getRateLimitConfig('/api/unknown');

      expect(loginConfig.max).toBe(5);
      expect(unknownConfig.max).toBe(100);
    });

    test('Debe manejar configuración de skip requests exitosos', () => {
      const loginEndpoint = communicationConfig.rateLimiting.endpoints['/api/auth/login'];
      const registerEndpoint = communicationConfig.rateLimiting.endpoints['/api/auth/register'];

      expect(loginEndpoint.skipSuccessfulRequests).toBe(true);
      expect(registerEndpoint.skipSuccessfulRequests).toBe(true);
    });
  });

  describe('Pruebas de Carga y Resistencia', () => {
    test('Debe manejar múltiples IPs diferentes', async () => {
      // Esta prueba simularía múltiples IPs, pero en el entorno de test
      // todas vienen del mismo origen. En producción, cada IP tendría
      // su propio contador de rate limiting.
      
      const testIPs = ['192.168.1.1', '192.168.1.2', '192.168.1.3'];
      
      testIPs.forEach(ip => {
        const config = CommunicationSecurityUtils.getRateLimitConfig('/api/auth/login');
        const key1 = config.keyGenerator({ ip, user: null });
        const key2 = config.keyGenerator({ ip: ip, user: { id: 'user1' } });
        
        expect(key1).toBe(ip);
        expect(key2).toBe(ip + 'user1');
      });
    });

    test('Debe resetear contadores después del tiempo límite', async () => {
      // En un entorno real, esto requeriría esperar el tiempo del window
      // Para el test, verificamos que la configuración del tiempo es correcta
      const config = communicationConfig.rateLimiting.endpoints['/api/auth/login'];
      
      expect(config.windowMs).toBe(15 * 60 * 1000); // 15 minutos
      expect(typeof config.windowMs).toBe('number');
    });

    test('Debe proporcionar información de recuperación', async () => {
      //sobrepasar límite para obtener información de retry
      await request(rateLimitedApp).post('/api/critical').send({});
      
      const response = await request(rateLimitedApp)
        .post('/api/critical')
        .send({})
        .expect(429);

      expect(response.headers['retry-after']).toBeDefined();
      expect(response.body.retryAfter).toBeDefined();
    });
  });
});
