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

const { Sequelize } = require('sequelize');

// Configuración segura con valores por defecto
const sequelize = new Sequelize({
  database: 'Proyecto1',  // Coincide con POSTGRES_DB
  username: process.env.DB_USER || 'user',      // Valor por defecto 'user'
  password: process.env.DB_PASSWORD || 'password', // Valor por defecto 'password'
  host: process.env.DB_HOST || 'db',           // Nombre del servicio en Docker
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: false
  },
  retry: {  // ¡Añade reintentos para evitar fallos en Docker!
    max: 5,
    timeout: 5000
  }
});

// Verificación de conexión (opcional pero útil)
sequelize.authenticate()
  .then(() => console.log('Conexión a PostgreSQL establecida correctamente.'))
  .catch(err => console.error('Error de conexión a PostgreSQL:', err));

module.exports = sequelize;