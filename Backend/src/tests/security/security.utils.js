/**
 * Funciones helper que serán reutilizadas en múltiples tests
 */

const crypto = require('crypto');
const securityConfig = require('./security.config');

class SecurityTestUtils {
  /**
   * Genera payloads maliciosos comunes para testing
   */
  static getMaliciousPayloads() {
    return {
      sqlInjection: [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "'; DELETE FROM users; --",
        "' OR 1=1--",
        "admin'--",
        "admin'/*",
        "' or 1=1#",
        "' or 1=1--",
        "') or '1'='1--"
      ],
      
      xss: [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert('XSS')>",
        "javascript:alert('XSS')",
        "<svg onload=alert('XSS')>",
        "'>alert('XSS')",
        "\"><script>alert('XSS')</script>",
        "<iframe src='javascript:alert(\"XSS\")'></iframe>"
      ],
      
      pathTraversal: [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
        "....//....//....//etc/passwd",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd"
      ],
      
      commandInjection: [
        "; ls -la",
        "| cat /etc/passwd",
        "&& whoami",
        "; cat /etc/shadow",
        "$(cat /etc/passwd)",
        "`whoami`"
      ]
    };
  }

  /**
   * Genera emails maliciosos para testing
   */
  static getMaliciousEmails() {
    return [
      "'; DROP TABLE users; --@test.com",
      "<script>alert('xss')</script>@test.com",
      "admin@test.com'; INSERT INTO users--",
      "test@test.com<script>alert('xss')</script>",
      "very.long.email." + "a".repeat(500) + "@test.com"
    ];
  }

  /**
   * Genera contraseñas de prueba (débiles y fuertes)
   */
  static getTestPasswords() {
    return {
      weak: [
        "123",
        "password",
        "123456",
        "qwerty",
        "abc123",
        "admin",
        "test"
      ],
      strong: [
        "SecureP@ssw0rd123!",
        "MyStr0ng#P@ssw0rd",
        "Complex!Password123",
        "Un1que#Secure$Pass"
      ]
    };
  }

  /**
   * Valida si una respuesta contiene información sensible
   */
  static containsSensitiveInfo(response) {
    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /private/i,
      /jwt/i,
      /hash/i,
      /salt/i,
      /database/i,
      /connection/i,
      /error\s+at\s+/i,
      /\.js:\d+:\d+/,
    ];

    const responseText = JSON.stringify(response);
    return sensitivePatterns.some(pattern => pattern.test(responseText));
  }

  /**
   * Genera token JWT falso para testing
   */
  static generateFakeJWT() {
    const header = Buffer.from(JSON.stringify({
      "alg": "HS256",
      "typ": "JWT"
    })).toString('base64url');

    const payload = Buffer.from(JSON.stringify({
      "sub": "fake-user-id",
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000) + 3600
    })).toString('base64url');

    const signature = "fake-signature";
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Simula diferentes User-Agents maliciosos
   */
  static getMaliciousUserAgents() {
    return [
      "Bot/1.0",
      "Scanner/1.0",
      "<script>alert('xss')</script>",
      "Mozilla/5.0 (compatible; Baiduspider/2.0)",
      "sqlmap/1.0",
      "Nikto/2.0"
    ];
  }

  /**
   * Genera datos de formulario excesivamente largos
   */
  static generateOversizedData() {
    return {
      longString: "a".repeat(10000),
      hugeName: "x".repeat(1000),
      massiveArray: new Array(1000).fill("data"),
      deepObject: this.createDeepObject(20)
    };
  }

  /**
   * Crea objeto con anidación profunda
   */
  static createDeepObject(depth) {
    let obj = {};
    let current = obj;
    
    for (let i = 0; i < depth; i++) {
      current.level = i;
      current.next = {};
      current = current.next;
    }
    
    return obj;
  }

  /**
   * Valida configuración de seguridad
   */
  static validateSecurityConfig() {
    const issues = [];
    const config = securityConfig;

    if (config.limits.maxPasswordLength < 8) {
      issues.push("Password max length too short");
    }

    if (config.limits.maxLoginAttempts > 10) {
      issues.push("Max login attempts too high");
    }

    if (config.jwt.minSecretLength < 32) {
      issues.push("JWT secret too short");
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }

  /**
   * Simula ataques de timing para detectar vulnerabilidades
   */
  static async measureResponseTime(requestFunction) {
    const start = process.hrtime.bigint();
    await requestFunction();
    const end = process.hrtime.bigint();
    
    return Number(end - start) / 1000000;
  }

  /**
   * Genera reportes de pruebas de seguridad
   */
  static generateSecurityReport(testResults) {
    const timestamp = new Date().toISOString();
    
    return {
      timestamp,
      summary: {
        total: testResults.length,
        passed: testResults.filter(r => r.status === 'passed').length,
        failed: testResults.filter(r => r.status === 'failed').length,
        warnings: testResults.filter(r => r.status === 'warning').length
      },
      details: testResults,
      recommendations: this.generateRecommendations(testResults)
    };
  }

  /**
   * Genera recomendaciones basadas en resultados
   */
  static generateRecommendations(testResults) {
    const recommendations = [];
    const failedTests = testResults.filter(r => r.status === 'failed');

    if (failedTests.some(t => t.category === 'authentication')) {
      recommendations.push("Revisar y fortalecer sistema de autenticación");
    }

    if (failedTests.some(t => t.category === 'input-validation')) {
      recommendations.push("Implementar validación más estricta de entrada");
    }

    if (failedTests.some(t => t.category === 'sql-injection')) {
      recommendations.push("Usar consultas parametrizadas en todas las operaciones de BD");
    }

    return recommendations;
  }
}

module.exports = SecurityTestUtils;
