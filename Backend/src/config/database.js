// database.js
// Configuración segura para trabajar con múltiples entornos
// NO HARDCODEAR CONTRASEÑAS EN ESTE ARCHIVO

const { Sequelize } = require('sequelize');
const path = require('path');

// IMPORTANTE: El archivo .env está en la raíz del proyecto (3 niveles arriba)
// Backend/src/config/database.js → necesita subir 3 niveles para llegar a la raíz
const envPath = path.resolve(__dirname, '../../../.env');
const envLocalPath = path.resolve(__dirname, '../../../.env.local');

// Cargar variables de entorno desde la raíz del proyecto
require('dotenv').config({
  path: process.env.NODE_ENV === 'development' ? envLocalPath : envPath
});

console.log('Cargando configuración desde:', process.env.NODE_ENV === 'development' ? '.env.local' : '.env');

let sequelize;

// Verificar si hay una URL de conexión proporcionada (Aiven, Render, etc.)
if (process.env.DATABASE_URL) {
  console.log('Usando DATABASE_URL para conexión...');
  
  // Parse la URL para verificar el tipo de servidor
  const isAiven = process.env.DATABASE_URL.includes('aivencloud.com');
  const isRender = process.env.DATABASE_URL.includes('render.com');
  
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        // Para Aiven y otros servicios cloud que usan certificados self-signed
        rejectUnauthorized: false
      }
    },
    logging: false,
    define: {
      timestamps: false
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  
  if (isAiven) {
    console.log('Detectado servidor Aiven - SSL configurado');
  } else if (isRender) {
    console.log('Detectado servidor Render - SSL configurado');
  }
  
} else {
  // Configuración para desarrollo local o conexión por partes
  const dbConfig = {
    database: process.env.DB_NAME || 'Proyecto1',
    username: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: false
    },
    retry: {
      max: 5,
      timeout: 5000
    }
  };

  // Detectar si es una base de datos remota por el host
  const isRemoteDb = 
    dbConfig.host.includes('.') && 
    !dbConfig.host.includes('localhost') && 
    !dbConfig.host.includes('127.0.0.1') &&
    !dbConfig.host.includes('db'); // 'db' es el nombre del servicio Docker local
  
  if (isRemoteDb) {
    console.log('Detectada base de datos remota, configurando SSL...');
    
    // Construir URL de conexión para bases de datos remotas
    const connectionString = `postgres://${dbConfig.username}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
    
    sequelize = new Sequelize(connectionString, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false,
      define: {
        timestamps: false
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
  } else {
    // Conexión local normal sin SSL
    console.log('Usando conexión local sin SSL...');
    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        define: dbConfig.define
      }
    );
  }
}

// Función de conexión con reintentos
const connectWithRetry = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a PostgreSQL establecida correctamente.');
      
      // Mostrar información de conexión (sin contraseña)
      const config = sequelize.config;
      console.log(`📍 Conectado a: ${config.host || 'localhost'}:${config.port || 5432}/${config.database}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Intento ${i + 1}/${retries} falló:`, error.message);
      
      if (i === retries - 1) {
        console.error('Error de conexión a PostgreSQL:', error);
        console.error('Detalles adicionales:', {
          host: sequelize.config.host || process.env.DB_HOST,
          database: sequelize.config.database || process.env.DB_NAME,
          ssl_configured: !!sequelize.config.dialectOptions?.ssl,
          error_code: error.original?.code,
          error_message: error.message
        });
        
        // Verificar si las variables de entorno se cargaron
        if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
          console.error('⚠️  ADVERTENCIA: No se encontraron variables de entorno de base de datos.');
          console.error('   Verifica que el archivo .env existe en la raíz del proyecto.');
          console.error('   Ruta esperada:', envPath);
        }
        
        throw error;
      }
      
      // Esperar antes de reintentar
      console.log(`⏳ Esperando 5 segundos antes de reintentar...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Iniciar conexión con reintentos
console.log('Intentando conectar a la base de datos...');
connectWithRetry().catch(err => {
  console.error('Fatal: No se pudo establecer conexión con la base de datos después de todos los intentos.');
});

module.exports = sequelize;