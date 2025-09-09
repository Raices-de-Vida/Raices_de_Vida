const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const casoRoutes = require('./routes/casoRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const userInfoRoutes = require('./routes/UserInfoRoutes');

// rutas de pacientes
const pacienteRoutes = require('./routes/pacienteRoutes');

// carguar TODAS las asociaciones
require('./models/associations');

dotenv.config();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({ origin: '*', credentials: true }));


// RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/casos', casoRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/user-info', userInfoRoutes);
app.use('/api/pacientes', pacienteRoutes);

// Root
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
