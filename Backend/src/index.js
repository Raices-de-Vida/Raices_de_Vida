const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const casoRoutes = require('./routes/casoRoutes');

dotenv.config();

const app = express();

app.use(express.json());
const cors = require('cors');
app.use(cors({ origin: '*', credentials: true }));

//conexión a PostgreSQL
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

//config rutas
app.use('/api/auth', authRoutes); // Autenticación
app.use('/api/casos', casoRoutes); // Rutas de casos críticos

//manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

//init de servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});