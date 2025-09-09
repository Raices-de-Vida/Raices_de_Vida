// index.js
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('./config/database');

require('./models/associations');

const authRoutes = require('./routes/authRoutes');
const casoRoutes = require('./routes/casoRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const userInfoRoutes = require('./routes/UserInfoRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({ origin: '*', credentials: true }));

// Conexión y sincronización
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL exitosa');
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados');
  } catch (error) {
    console.error('Error en la base de datos:', error);
  }
})();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/casos', casoRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/user-info', userInfoRoutes);
app.use('/api/pacientes', pacienteRoutes);

// Salud
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend funcionando',
    routes: {
      auth: '/api/auth',
      casos: '/api/casos',
      alertas: '/api/alertas',
      userInfo: '/api/user-info',
      pacientes: '/api/pacientes'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
