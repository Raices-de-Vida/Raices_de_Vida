// database.js
// Este archivo configura la conexión a la base de datos utilizando Sequelize, un ORM para Node.js.
// La base de datos utilizada es PostgreSQL, y las credenciales se obtienen de las variables de entorno.

// Dependencias requeridas:
// - Sequelize: Biblioteca para interactuar con la base de datos de manera sencilla y estructurada.

/**
 * Configuración de Sequelize
 * 
 * - Nombre de la base de datos: 'Proyecto 1'.
 * - Usuario y contraseña: Se obtienen de las variables de entorno `DB_USER` y `DB_PASSWORD`.
 * - Host: Dirección del servidor de la base de datos, obtenida de `DB_HOST`.
 * - Puerto: Por defecto, 5432 o el valor definido en `DB_PORT`.
 * - Dialecto: PostgreSQL.
 * - logging: Desactivado para evitar mostrar consultas en la consola (puede activarse para depuración).
 * - timestamps: Desactivado para evitar que Sequelize agregue automáticamente campos de tiempo (`createdAt`, `updatedAt`).
 */

// database.js
// Este archivo configura la conexión a la base de datos utilizando Sequelize, un ORM para Node.js.
// La base de datos utilizada es PostgreSQL, y las credenciales se obtienen de las variables de entorno.

const { Sequelize } = require('sequelize');
require('dotenv').config({
  path: process.env.NODE_ENV === 'development' ? '.env.local' : '.env'
});

let sequelize;

// Verificar si hay una URL de conexión proporcionada por Render
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necesario para conexiones SSL a Render
      }
    },
    logging: false,
    define: {
      timestamps: false
    }
  });
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

  // Si estamos en entorno local pero usando DB remota
  const isRemoteDb = dbConfig.host.includes('dpg-') || dbConfig.host.includes('render');
  
  if (isRemoteDb) {
    // Construir URL de conexión completa para bases de datos en Render
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
      }
    });
  } else {
    // Conexión local normal sin SSL
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

console.log('Intentando conectar a la base de datos...');

sequelize.authenticate()
  .then(() => console.log('Conexión a PostgreSQL establecida correctamente.'))
  .catch(err => {
    console.error('Error de conexión a PostgreSQL:', err);
    // Más información de diagnóstico
    console.error('Detalles adicionales:', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      error_code: err.original?.code,
      error_errno: err.original?.errno,
      error_syscall: err.original?.syscall
    });
  });

module.exports = sequelize;