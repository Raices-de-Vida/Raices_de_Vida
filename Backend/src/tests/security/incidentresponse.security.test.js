/**
 * pruebas automáticas de respuesta a incidentes y reportes
 */

const request = require('supertest');
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const MonitoringUtils = require('./monitoring.utils');
const monitoringConfig = require('./monitoring.config');

describe('respuesta a incidentes y reportes', () => {
  let app;
  let sequelize;
  let IncidentResponse, SecurityReport, AutoResponse;
  let incidents = [];
  let responses = [];
  let reports = [];

  beforeAll(async () => {
    // configuración de base de datos en memoria
    sequelize = new Sequelize('sqlite::memory:', { 
      logging: false,
      dialect: 'sqlite'
    });

    // modelos para testing
    IncidentResponse = sequelize.define('IncidentResponse', {
      id: { type: DataTypes.STRING, primaryKey: true },
      incident_id: { type: DataTypes.STRING },
      response_type: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING },
      executed_at: { type: DataTypes.DATE },
      executed_by: { type: DataTypes.STRING },
      details: { type: DataTypes.TEXT }
    });

    SecurityReport = sequelize.define('SecurityReport', {
      id: { type: DataTypes.STRING, primaryKey: true },
      type: { type: DataTypes.STRING },
      period_start: { type: DataTypes.DATE },
      period_end: { type: DataTypes.DATE },
      summary: { type: DataTypes.TEXT },
      generated_at: { type: DataTypes.DATE }
    });

    AutoResponse = sequelize.define('AutoResponse', {
      id: { type: DataTypes.STRING, primaryKey: true },
      trigger_event: { type: DataTypes.STRING },
      action: { type: DataTypes.STRING },
      target: { type: DataTypes.STRING },
      success: { type: DataTypes.BOOLEAN },
      execution_time: { type: DataTypes.INTEGER }
    });

    await sequelize.sync();

    // configuración de express
    app = express();
    app.use(express.json());

    // simulador de respuesta automática
    const executeAutoResponse = async (alertId, actionType, target) => {
      const response = MonitoringUtils.generateAutoResponse(alertId, actionType);
      response.target = target;
      
      responses.push(response);
      
      // simular ejecución de acción
      switch (actionType) {
        case 'block_ip':
          // simular bloqueo de IP
          break;
        case 'lock_account':
          // simular bloqueo de cuenta
          break;
        case 'notify_admin':
          // simular notificación
          break;
      }

      return response;
    };

    // endpoints para gestión de incidentes
    app.post('/api/security/incidents', async (req, res) => {
      const { alertId, severity, description, assignedTo } = req.body;

      const incident = {
        id: `incident-${Date.now()}`,
        alertId,
        severity,
        description,
        status: 'open',
        assignedTo: assignedTo || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        responses: []
      };

      incidents.push(incident);

      // ejecutar respuesta automática si está habilitada
      if (monitoringConfig.autoResponse.enabled && severity === 'critical') {
        const autoResponse = await executeAutoResponse(alertId, 'notify_admin', 'admin@raicesdevida.org');
        incident.responses.push(autoResponse.id);
      }

      res.status(201).json({ incident, message: 'incidente creado' });
    });

    app.get('/api/security/incidents', (req, res) => {
      const { status, severity, assignedTo } = req.query;
      
      let filteredIncidents = [...incidents];

      if (status) {
        filteredIncidents = filteredIncidents.filter(i => i.status === status);
      }

      if (severity) {
        filteredIncidents = filteredIncidents.filter(i => i.severity === severity);
      }

      if (assignedTo) {
        filteredIncidents = filteredIncidents.filter(i => i.assignedTo === assignedTo);
      }

      res.json({
        incidents: filteredIncidents,
        count: filteredIncidents.length,
        timestamp: new Date()
      });
    });

    app.put('/api/security/incidents/:id', (req, res) => {
      const { id } = req.params;
      const { status, assignedTo, notes } = req.body;

      const incident = incidents.find(i => i.id === id);
      if (!incident) {
        return res.status(404).json({ error: 'incidente no encontrado' });
      }

      if (status) incident.status = status;
      if (assignedTo) incident.assignedTo = assignedTo;
      if (notes) incident.notes = notes;
      incident.updatedAt = new Date();

      res.json({ incident, message: 'incidente actualizado' });
    });

    app.post('/api/security/incidents/:id/response', async (req, res) => {
      const { id } = req.params;
      const { actionType, target, notes } = req.body;

      const incident = incidents.find(i => i.id === id);
      if (!incident) {
        return res.status(404).json({ error: 'incidente no encontrado' });
      }

      const response = await executeAutoResponse(incident.alertId, actionType, target);
      response.notes = notes;
      response.executedBy = 'manual-user';

      incident.responses.push(response.id);

      res.json({ response, message: 'respuesta ejecutada' });
    });

    // endpoints para reportes
    app.get('/api/security/reports', (req, res) => {
      const { type, period } = req.query;

      let filteredReports = [...reports];

      if (type) {
        filteredReports = filteredReports.filter(r => r.type === type);
      }

      res.json({
        reports: filteredReports,
        count: filteredReports.length
      });
    });

    app.post('/api/security/reports/generate', (req, res) => {
      const { type = 'daily', startDate, endDate } = req.body;

      const report = MonitoringUtils.generateSecurityReport(type);
      
      if (startDate) report.period.start = new Date(startDate);
      if (endDate) report.period.end = new Date(endDate);

      reports.push(report);

      res.status(201).json({ 
        report, 
        message: `reporte ${type} generado exitosamente` 
      });
    });

    app.get('/api/security/reports/:id', (req, res) => {
      const { id } = req.params;
      const report = reports.find(r => r.id === id);

      if (!report) {
        return res.status(404).json({ error: 'reporte no encontrado' });
      }

      res.json({ report });
    });

    // endpoints para respuestas automáticas
    app.get('/api/security/auto-responses', (req, res) => {
      const { success, action } = req.query;

      let filteredResponses = [...responses];

      if (success !== undefined) {
        filteredResponses = filteredResponses.filter(r => r.success === (success === 'true'));
      }

      if (action) {
        filteredResponses = filteredResponses.filter(r => r.action === action);
      }

      res.json({
        responses: filteredResponses,
        count: filteredResponses.length,
        averageExecutionTime: filteredResponses.reduce((sum, r) => sum + (r.executionTime || 0), 0) / filteredResponses.length || 0
      });
    });

    app.post('/api/security/auto-responses/test', async (req, res) => {
      const { actionType, target } = req.body;

      try {
        const response = await executeAutoResponse('test-alert', actionType, target);
        response.test = true;

        res.json({ 
          response, 
          message: 'respuesta automática ejecutada en modo prueba' 
        });

      } catch (error) {
        res.status(500).json({ 
          error: 'error ejecutando respuesta automática',
          details: error.message 
        });
      }
    });

    // endpoint para métricas de rendimiento
    app.get('/api/security/performance', (req, res) => {
      const metrics = MonitoringUtils.generateMonitoringMetrics();

      const performanceData = {
        ...metrics,
        incidentMetrics: {
          totalIncidents: incidents.length,
          openIncidents: incidents.filter(i => i.status === 'open').length,
          resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
          averageResolutionTime: '2.5 hours', // simulado
          criticalIncidents: incidents.filter(i => i.severity === 'critical').length
        },
        responseMetrics: {
          totalResponses: responses.length,
          successfulResponses: responses.filter(r => r.success).length,
          failedResponses: responses.filter(r => !r.success).length,
          averageExecutionTime: responses.reduce((sum, r) => sum + (r.executionTime || 0), 0) / responses.length || 0
        },
        reportMetrics: {
          totalReports: reports.length,
          recentReports: reports.filter(r => 
            Date.now() - new Date(r.generatedAt).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length
        }
      };

      res.json(performanceData);
    });

    // endpoint para simulación de escenarios
    app.post('/api/security/simulate', async (req, res) => {
      const { scenario } = req.body;

      try {
        switch (scenario) {
          case 'brute_force_attack':
            // simular ataque de fuerza bruta
            const bruteForceEvents = MonitoringUtils.generateAttackPattern('brute_force');
            
            // crear incidente
            const incident = {
              id: `incident-${Date.now()}`,
              alertId: 'simulated-alert',
              severity: 'high',
              description: 'ataque de fuerza bruta simulado',
              status: 'open',
              createdAt: new Date(),
              responses: []
            };
            incidents.push(incident);

            // ejecutar respuesta automática
            const response = await executeAutoResponse('simulated-alert', 'block_ip', '192.168.1.200');
            incident.responses.push(response.id);

            res.json({
              message: 'ataque de fuerza bruta simulado',
              incident,
              response,
              events: bruteForceEvents.length
            });
            break;

          case 'data_breach':
            // simular filtración de datos
            const breachIncident = {
              id: `incident-${Date.now()}`,
              alertId: 'breach-alert',
              severity: 'critical',
              description: 'posible filtración de datos detectada',
              status: 'open',
              createdAt: new Date(),
              responses: []
            };
            incidents.push(breachIncident);

            // múltiples respuestas automáticas
            const notifyResponse = await executeAutoResponse('breach-alert', 'notify_admin', 'admin@raicesdevida.org');
            const lockResponse = await executeAutoResponse('breach-alert', 'lock_account', 'compromised-user');
            
            breachIncident.responses.push(notifyResponse.id, lockResponse.id);

            res.json({
              message: 'filtración de datos simulada',
              incident: breachIncident,
              responses: [notifyResponse, lockResponse]
            });
            break;

          default:
            res.status(400).json({ error: 'escenario no reconocido' });
        }

      } catch (error) {
        res.status(500).json({ 
          error: 'error en simulación',
          details: error.message 
        });
      }
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(() => {
    // limpiar datos entre tests
    incidents.length = 0;
    responses.length = 0;
    reports.length = 0;
  });

  describe('gestión de incidentes', () => {
    test('debería crear nuevo incidente', async () => {
      const incidentData = {
        alertId: 'alert-123',
        severity: 'high',
        description: 'actividad sospechosa detectada',
        assignedTo: 'security-team@example.com'
      };

      const response = await request(app)
        .post('/api/security/incidents')
        .send(incidentData)
        .expect(201);

      expect(response.body.incident).toBeDefined();
      expect(response.body.incident.status).toBe('open');
      expect(response.body.incident.severity).toBe('high');
      expect(incidents.length).toBe(1);
    });

    test('debería crear respuesta automática para incidentes críticos', async () => {
      const criticalIncident = {
        alertId: 'critical-alert',
        severity: 'critical',
        description: 'amenaza crítica detectada'
      };

      const response = await request(app)
        .post('/api/security/incidents')
        .send(criticalIncident)
        .expect(201);

      expect(response.body.incident.responses).toBeDefined();
      expect(response.body.incident.responses.length).toBeGreaterThan(0);
      expect(responses.length).toBeGreaterThan(0);
    });

    test('debería consultar incidentes por estado', async () => {
      // crear incidentes de prueba
      incidents.push({
        id: 'inc-1',
        status: 'open',
        severity: 'high'
      });
      incidents.push({
        id: 'inc-2',
        status: 'resolved',
        severity: 'medium'
      });

      const response = await request(app)
        .get('/api/security/incidents?status=open')
        .expect(200);

      expect(response.body.incidents.length).toBe(1);
      expect(response.body.incidents[0].status).toBe('open');
    });

    test('debería actualizar estado de incidente', async () => {
      const incident = {
        id: 'test-incident',
        status: 'open',
        assignedTo: null
      };
      incidents.push(incident);

      const response = await request(app)
        .put('/api/security/incidents/test-incident')
        .send({ 
          status: 'in_progress',
          assignedTo: 'analyst@example.com'
        })
        .expect(200);

      expect(response.body.incident.status).toBe('in_progress');
      expect(response.body.incident.assignedTo).toBe('analyst@example.com');
    });

    test('debería ejecutar respuesta manual a incidente', async () => {
      const incident = {
        id: 'manual-incident',
        alertId: 'alert-456',
        status: 'open',
        responses: []
      };
      incidents.push(incident);

      const response = await request(app)
        .post('/api/security/incidents/manual-incident/response')
        .send({
          actionType: 'block_ip',
          target: '192.168.1.100',
          notes: 'bloqueo manual por actividad sospechosa'
        })
        .expect(200);

      expect(response.body.response).toBeDefined();
      expect(response.body.response.action).toBe('block_ip');
      expect(incident.responses.length).toBeGreaterThan(0);
    });
  });

  describe('generación de reportes', () => {
    test('debería generar reporte diario', async () => {
      const response = await request(app)
        .post('/api/security/reports/generate')
        .send({ type: 'daily' })
        .expect(201);

      expect(response.body.report).toBeDefined();
      expect(response.body.report.type).toBe('daily');
      expect(response.body.report.summary).toBeDefined();
      expect(reports.length).toBe(1);
    });

    test('debería generar reporte semanal', async () => {
      const response = await request(app)
        .post('/api/security/reports/generate')
        .send({ type: 'weekly' })
        .expect(201);

      expect(response.body.report.type).toBe('weekly');
      expect(response.body.report.topThreats).toBeDefined();
      expect(response.body.report.recommendations).toBeDefined();
    });

    test('debería consultar reportes existentes', async () => {
      // generar algunos reportes
      reports.push(MonitoringUtils.generateSecurityReport('daily'));
      reports.push(MonitoringUtils.generateSecurityReport('weekly'));

      const response = await request(app)
        .get('/api/security/reports')
        .expect(200);

      expect(response.body.reports.length).toBe(2);
      expect(response.body.count).toBe(2);
    });

    test('debería obtener reporte específico', async () => {
      const report = MonitoringUtils.generateSecurityReport('monthly');
      reports.push(report);

      const response = await request(app)
        .get(`/api/security/reports/${report.id}`)
        .expect(200);

      expect(response.body.report.id).toBe(report.id);
      expect(response.body.report.type).toBe('monthly');
    });
  });

  describe('respuestas automáticas', () => {
    test('debería consultar historial de respuestas automáticas', async () => {
      // generar respuestas de prueba
      responses.push(MonitoringUtils.generateAutoResponse('alert-1', 'block_ip'));
      responses.push(MonitoringUtils.generateAutoResponse('alert-2', 'notify_admin'));

      const response = await request(app)
        .get('/api/security/auto-responses')
        .expect(200);

      expect(response.body.responses.length).toBe(2);
      expect(response.body.averageExecutionTime).toBeGreaterThan(0);
    });

    test('debería filtrar respuestas por éxito', async () => {
      responses.push({ ...MonitoringUtils.generateAutoResponse('alert-1', 'block_ip'), success: true });
      responses.push({ ...MonitoringUtils.generateAutoResponse('alert-2', 'lock_account'), success: false });

      const response = await request(app)
        .get('/api/security/auto-responses?success=true')
        .expect(200);

      expect(response.body.responses.length).toBe(1);
      expect(response.body.responses[0].success).toBe(true);
    });

    test('debería ejecutar respuesta automática en modo prueba', async () => {
      const response = await request(app)
        .post('/api/security/auto-responses/test')
        .send({
          actionType: 'notify_admin',
          target: 'test@example.com'
        })
        .expect(200);

      expect(response.body.response).toBeDefined();
      expect(response.body.response.test).toBe(true);
      expect(response.body.response.action).toBe('notify_admin');
    });
  });

  describe('métricas de rendimiento', () => {
    test('debería obtener métricas completas del sistema', async () => {
      // generar algunos datos de prueba
      incidents.push({ id: 'inc-1', status: 'open', severity: 'high' });
      incidents.push({ id: 'inc-2', status: 'resolved', severity: 'medium' });
      responses.push(MonitoringUtils.generateAutoResponse('alert-1', 'block_ip'));

      const response = await request(app)
        .get('/api/security/performance')
        .expect(200);

      expect(response.body.systemHealth).toBeDefined();
      expect(response.body.securityMetrics).toBeDefined();
      expect(response.body.incidentMetrics).toBeDefined();
      expect(response.body.responseMetrics).toBeDefined();
      
      expect(response.body.incidentMetrics.totalIncidents).toBe(2);
      expect(response.body.responseMetrics.totalResponses).toBe(1);
    });
  });

  describe('simulación de escenarios', () => {
    test('debería simular ataque de fuerza bruta', async () => {
      const response = await request(app)
        .post('/api/security/simulate')
        .send({ scenario: 'brute_force_attack' })
        .expect(200);

      expect(response.body.incident).toBeDefined();
      expect(response.body.response).toBeDefined();
      expect(response.body.incident.severity).toBe('high');
      expect(response.body.response.action).toBe('block_ip');
      
      expect(incidents.length).toBe(1);
      expect(responses.length).toBe(1);
    });

    test('debería simular filtración de datos', async () => {
      const response = await request(app)
        .post('/api/security/simulate')
        .send({ scenario: 'data_breach' })
        .expect(200);

      expect(response.body.incident).toBeDefined();
      expect(response.body.responses).toBeDefined();
      expect(response.body.incident.severity).toBe('critical');
      expect(response.body.responses.length).toBe(2);
      
      expect(incidents.length).toBe(1);
      expect(responses.length).toBe(2);
    });

    test('debería rechazar escenario no válido', async () => {
      const response = await request(app)
        .post('/api/security/simulate')
        .send({ scenario: 'invalid_scenario' })
        .expect(400);

      expect(response.body.error).toBe('escenario no reconocido');
    });
  });

  describe('validación de configuración de respuesta', () => {
    test('configuración de respuesta automática debería estar habilitada', () => {
      expect(monitoringConfig.autoResponse.enabled).toBe(true);
    });

    test('debería tener acciones de respuesta configuradas', () => {
      const actions = monitoringConfig.autoResponse.actions;
      
      expect(actions.blockIp).toBeDefined();
      expect(actions.lockAccount).toBeDefined();
      expect(actions.notifyAdmins).toBeDefined();
      
      expect(actions.blockIp.enabled).toBe(true);
      expect(actions.lockAccount.enabled).toBe(true);
    });

    test('debería tener canales de alerta configurados', () => {
      const channels = monitoringConfig.alerts.channels;
      
      expect(channels.email).toBeDefined();
      expect(channels.webhook).toBeDefined();
      expect(channels.dashboard).toBeDefined();
      
      expect(channels.email.enabled).toBe(true);
      expect(channels.webhook.enabled).toBe(true);
    });
  });
});
