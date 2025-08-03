/**
 * utilidades para monitoreo y respuesta a incidentes de seguridad
 */

const crypto = require('crypto');
const monitoringConfig = require('./monitoring.config');

class MonitoringUtils {

  /**
   * genera evento de seguridad simulado
   */
  static generateSecurityEvent(type = 'login_attempt', severity = 'low', overrides = {}) {
    const baseEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: type,
      severity: severity,
      source: {
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 Test Browser',
        country: 'GT',
        city: 'Guatemala City'
      },
      target: {
        endpoint: '/api/auth/login',
        method: 'POST',
        userId: Math.floor(Math.random() * 1000),
        resource: 'authentication'
      },
      details: {
        success: false,
        errorCode: '401',
        payload: '{"email":"test@example.com","password":"***"}',
        responseTime: Math.floor(Math.random() * 1000),
        dataSize: Math.floor(Math.random() * 5000)
      },
      riskScore: this.calculateRiskScore(type, severity),
      resolved: false,
      resolvedAt: null,
      resolvedBy: null
    };

    return { ...baseEvent, ...overrides };
  }

  /**
   * calcula puntuación de riesgo
   */
  static calculateRiskScore(eventType, severity) {
    const typeScores = {
      login_attempt: 10,
      sql_injection: 90,
      xss_attempt: 85,
      brute_force: 80,
      privilege_escalation: 95,
      data_access: 70,
      suspicious_request: 40,
      rate_limit_exceeded: 30,
      anomalous_behavior: 60
    };

    const severityMultipliers = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    const baseScore = typeScores[eventType] || 50;
    const multiplier = severityMultipliers[severity] || 1;
    
    return Math.min(100, baseScore * multiplier);
  }

  /**
   * genera múltiples eventos para testing
   */
  static generateSecurityEvents(count = 10) {
    const eventTypes = [
      'login_attempt', 'sql_injection', 'xss_attempt', 
      'brute_force', 'privilege_escalation', 'data_access',
      'suspicious_request', 'rate_limit_exceeded', 'anomalous_behavior'
    ];

    const severities = ['low', 'medium', 'high', 'critical'];
    const events = [];

    for (let i = 0; i < count; i++) {
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      events.push(this.generateSecurityEvent(type, severity, {
        id: `event-${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // últimas 24h
      }));
    }

    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * simula patrón de ataque
   */
  static generateAttackPattern(attackType = 'brute_force') {
    const patterns = {
      brute_force: {
        events: 15,
        duration: 5 * 60 * 1000, // 5 minutos
        type: 'login_attempt',
        severity: 'high',
        sameIp: true
      },
      sql_injection: {
        events: 3,
        duration: 30 * 1000, // 30 segundos
        type: 'sql_injection',
        severity: 'critical',
        sameIp: true
      },
      privilege_escalation: {
        events: 5,
        duration: 2 * 60 * 1000, // 2 minutos
        type: 'privilege_escalation',
        severity: 'critical',
        sameIp: false
      },
      data_scraping: {
        events: 50,
        duration: 10 * 60 * 1000, // 10 minutos
        type: 'data_access',
        severity: 'medium',
        sameIp: true
      }
    };

    const pattern = patterns[attackType];
    if (!pattern) return [];

    const events = [];
    const baseTime = Date.now();
    const baseIp = pattern.sameIp ? '192.168.1.200' : null;

    for (let i = 0; i < pattern.events; i++) {
      const timestamp = new Date(baseTime + (i * (pattern.duration / pattern.events)));
      const ip = pattern.sameIp ? baseIp : `192.168.1.${200 + i}`;

      events.push(this.generateSecurityEvent(pattern.type, pattern.severity, {
        id: `${attackType}-${i + 1}`,
        timestamp,
        source: { ip, userAgent: 'Malicious Bot 1.0', country: 'XX' },
        details: { success: false, attackPattern: attackType }
      }));
    }

    return events;
  }

  /**
   * genera alerta de seguridad
   */
  static generateSecurityAlert(eventId, alertType = 'threshold_exceeded', overrides = {}) {
    const baseAlert = {
      id: crypto.randomUUID(),
      eventId: eventId,
      type: alertType,
      severity: 'medium',
      title: this.getAlertTitle(alertType),
      description: this.getAlertDescription(alertType),
      timestamp: new Date(),
      status: 'active',
      assignedTo: null,
      escalated: false,
      escalationLevel: 0,
      autoResolved: false,
      resolvedAt: null,
      responseActions: [],
      metadata: {
        threshold: monitoringConfig.monitoring.alertThresholds.failedLogins,
        currentCount: 6,
        timeWindow: '15 minutes'
      }
    };

    return { ...baseAlert, ...overrides };
  }

  /**
   * obtiene título de alerta según tipo
   */
  static getAlertTitle(alertType) {
    const titles = {
      threshold_exceeded: 'umbral de seguridad excedido',
      attack_detected: 'ataque detectado',
      anomaly_detected: 'comportamiento anómalo detectado',
      system_compromise: 'posible compromiso del sistema',
      data_breach: 'posible filtración de datos',
      privilege_escalation: 'escalación de privilegios detectada',
      brute_force: 'ataque de fuerza bruta en curso'
    };

    return titles[alertType] || 'evento de seguridad detectado';
  }

  /**
   * obtiene descripción de alerta según tipo
   */
  static getAlertDescription(alertType) {
    const descriptions = {
      threshold_exceeded: 'se ha excedido el umbral configurado para eventos de seguridad',
      attack_detected: 'se ha detectado un patrón de ataque contra el sistema',
      anomaly_detected: 'se ha identificado comportamiento anómalo que requiere revisión',
      system_compromise: 'indicadores sugieren posible compromiso del sistema',
      data_breach: 'acceso no autorizado a datos sensibles detectado',
      privilege_escalation: 'intento de obtener privilegios elevados sin autorización',
      brute_force: 'múltiples intentos fallidos de autenticación desde mismo origen'
    };

    return descriptions[alertType] || 'evento de seguridad requiere atención';
  }

  /**
   * simula respuesta automática
   */
  static generateAutoResponse(alertId, actionType = 'block_ip') {
    const responses = {
      block_ip: {
        action: 'block_ip',
        target: '192.168.1.200',
        duration: 3600000, // 1 hora
        reason: 'automated response to security threat'
      },
      lock_account: {
        action: 'lock_account',
        target: 'user@example.com',
        duration: 1800000, // 30 minutos
        reason: 'suspicious activity detected'
      },
      rate_limit: {
        action: 'apply_rate_limit',
        target: 'api_endpoint',
        duration: 900000, // 15 minutos
        reason: 'excessive requests detected'
      },
      notify_admin: {
        action: 'notify_admin',
        target: 'admin@raicesdevida.org',
        method: 'email',
        reason: 'critical security event'
      }
    };

    const baseResponse = responses[actionType] || responses.notify_admin;

    return {
      id: crypto.randomUUID(),
      alertId: alertId,
      timestamp: new Date(),
      status: 'executed',
      ...baseResponse,
      executionTime: Math.floor(Math.random() * 1000), // ms
      success: true,
      error: null
    };
  }

  /**
   * genera reporte de seguridad
   */
  static generateSecurityReport(timeframe = 'daily') {
    const now = new Date();
    const periods = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    const period = periods[timeframe] || periods.daily;
    const startTime = new Date(now.getTime() - period);

    return {
      id: crypto.randomUUID(),
      type: timeframe,
      period: {
        start: startTime,
        end: now
      },
      summary: {
        totalEvents: Math.floor(Math.random() * 1000) + 100,
        securityAlerts: Math.floor(Math.random() * 50) + 10,
        blockedRequests: Math.floor(Math.random() * 200) + 50,
        failedLogins: Math.floor(Math.random() * 100) + 20,
        successfulLogins: Math.floor(Math.random() * 500) + 200,
        averageRiskScore: Math.floor(Math.random() * 30) + 20
      },
      topThreats: [
        { type: 'brute_force', count: 15, severity: 'high' },
        { type: 'sql_injection', count: 3, severity: 'critical' },
        { type: 'rate_limit_exceeded', count: 25, severity: 'medium' }
      ],
      recommendations: [
        'considerar implementar autenticación de dos factores',
        'revisar políticas de contraseñas',
        'actualizar reglas de rate limiting',
        'monitorear patrones de acceso anómalos'
      ],
      generatedAt: now,
      generatedBy: 'security_monitoring_system'
    };
  }

  /**
   * detecta si patrón es malicioso
   */
  static detectMaliciousPattern(events) {
    if (!events || events.length === 0) return null;

    // detectar fuerza bruta (múltiples fallos desde misma IP)
    const ipCounts = {};
    const timeWindow = 15 * 60 * 1000; // 15 minutos
    const now = Date.now();

    events.forEach(event => {
      if (now - new Date(event.timestamp).getTime() <= timeWindow) {
        const ip = event.source?.ip;
        if (ip) {
          ipCounts[ip] = (ipCounts[ip] || 0) + 1;
        }
      }
    });

    // verificar umbrales
    for (const [ip, count] of Object.entries(ipCounts)) {
      if (count >= monitoringConfig.monitoring.alertThresholds.bruteForce) {
        return {
          type: 'brute_force',
          severity: 'high',
          source: ip,
          count: count,
          recommendation: 'block_ip'
        };
      }
    }

    return null;
  }

  /**
   * valida configuración de monitoreo
   */
  static validateMonitoringConfig() {
    const issues = [];

    // verificar umbrales
    const thresholds = monitoringConfig.monitoring.alertThresholds;
    if (!thresholds || Object.keys(thresholds).length === 0) {
      issues.push('umbrales de alerta no configurados');
    }

    // verificar severidades
    const severities = monitoringConfig.alerts.severityLevels;
    if (!severities || !severities.critical || !severities.high) {
      issues.push('niveles de severidad críticos no configurados');
    }

    // verificar respuesta automática
    if (!monitoringConfig.autoResponse.enabled) {
      issues.push('respuesta automática deshabilitada');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * genera métricas de rendimiento del sistema de monitoreo
   */
  static generateMonitoringMetrics() {
    return {
      timestamp: new Date(),
      systemHealth: {
        uptime: Math.floor(Math.random() * 99) + 1,
        responseTime: Math.floor(Math.random() * 100) + 50,
        errorRate: Math.random() * 5,
        memoryUsage: Math.floor(Math.random() * 30) + 50,
        cpuUsage: Math.floor(Math.random() * 20) + 10
      },
      securityMetrics: {
        eventsProcessed: Math.floor(Math.random() * 1000) + 500,
        alertsGenerated: Math.floor(Math.random() * 50) + 10,
        threatsBlocked: Math.floor(Math.random() * 20) + 5,
        falsePositives: Math.floor(Math.random() * 10),
        responseTime: Math.floor(Math.random() * 5000) + 1000
      },
      compliance: {
        dataRetentionCompliant: true,
        auditTrailComplete: true,
        encryptionActive: true,
        backupsCompleted: true
      }
    };
  }
}

module.exports = MonitoringUtils;
