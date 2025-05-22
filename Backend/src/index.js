const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const casoRoutes = require('./routes/casoRoutes');
const alertaRoutes = require('./routes/alertaRoutes'); 
const comunidadRoutes = require('./routes/comunidadRoutes');

dotenv.config();

const app = express();

app.use(express.json());
const cors = require('cors');
app.use(cors({ origin: '*', credentials: true }));

// Conexión a PostgreSQL
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL exitosa');

    await sequelize.sync({ alter: true }); // Usamos alter para mantener datos existentes
    console.log('Modelos sincronizados');
  } catch (error) {
    console.error('Error en la base de datos:', error);
  }
})();

// Configuración de rutas
app.use('/api/auth', authRoutes);    // Autenticación
app.use('/api/casos', casoRoutes);   // Casos críticos
app.use('/api/alertas', alertaRoutes); 
app.use('/api/comunidades', comunidadRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicio del servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Ruta raíz con documentación básica
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Backend funcionando', 
    routes: {
      auth: '/api/auth',
      casos: '/api/casos',
      alertas: '/api/alertas', // Nueva ruta documentada
      comunidades: '/api/comunidades' // Ruta de comunidades
    }
  });
});