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
const statisticsRoutes = require('./routes/statisticsRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const imagenRoutes = require('./routes/imagenRoutes');
const AlertaMedica = require('./models/AlertaMedica');
const CasoCritico = require('./models/CasoCritico');
const Paciente = require('./models/Paciente');
const Alerta = require('./models/Alerta');
const User = require('./models/User');


const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const cors = require('cors');
app.use(cors({ 
  origin: ['http://localhost:8081', 'http://localhost:19006', '*'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// conexión y sincronización
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

//rutas
app.use('/api/auth', authRoutes);
app.use('/api/casos', casoRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/user-info', userInfoRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api', imagenRoutes);
app.use('/api/statistics', statisticsRoutes);

//ruta de seed (dev)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/seed', async (req, res) => {
    try {
      // Sincronizar modelos (crea tablas si no existen)
      console.log('Sincronizando modelos (creando tablas)...');
      await sequelize.sync({ force: true }); // CUIDADO: Elimina y recrea todas las tablas
      console.log('Tablas creadas correctamente');
      
      const nombres = ['Ana','Luis','María','Carlos','Sofía','José','Lucía','Pedro','Elena','Miguel','Laura','Jorge'];
      const comunidades = ['San Pedro','San Juan','Sololá','Atitlán','Panajachel','Santa Clara'];
      const gen = () => (Math.random() < 0.5 ? 'F' : 'M');
      const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
      const rndF = (a,b) => (Math.random()*(b-a)+a).toFixed(1);

  const created = [];
      for (let i=0;i<20;i++) {
        const g = gen();
        const p = await Paciente.create({
          idioma: 'Español',
          nombre: nombres[rnd(0, nombres.length-1)],
          apellido: `Demo${i+1}`,
          telefono: String(rnd(40000000, 59999999)),
          comunidad_pueblo: comunidades[rnd(0, comunidades.length-1)],
          genero: g,
          edad: rnd(1, 80),
          peso: rndF(10, 100),
          estatura: rndF(80, 190),
          presion_arterial_sistolica: rnd(90, 180),
          presion_arterial_diastolica: rnd(50, 110),
          frecuencia_cardiaca: rnd(55, 110),
          saturacion_oxigeno: rnd(88, 100),
          glucosa: rnd(70, 180),
          temperatura: rndF(35.0, 39.5),
          fecha_signos_vitales: new Date()
        });
        created.push(p);

        //0-2 flags random
        const nFlags = rnd(0,2);
        const niveles = ['Baja','Media','Alta','Crítica'];
        for (let j=0;j<nFlags;j++) {
          await AlertaMedica.create({
            id_paciente: p.id_paciente,
            tipo_alerta_medica: 'Otro',
            descripcion_medica: `Flag demo ${j+1}`,
            prioridad_medica: niveles[rnd(0, niveles.length-1)],
            estado_alerta: 'Pendiente'
          });
        }
      }
      //user demo
      console.log('Creando usuario demo...');
      
      let demoUser = await User.findOne({ where: { email: 'demo@seed.local' } });
      if (!demoUser) {
        demoUser = await User.create({ 
          nombre: 'Demo', 
          apellido: 'Seed', 
          email: 'demo@seed.local', 
          password: 'demo123', // Sin hashear - el beforeCreate hook lo hará
          rol: 'ONG', 
          estado: true 
        });
        console.log('Usuario demo creado: demo@seed.local / demo123');
      }

      console.log(`Seed completado: ${created.length} pacientes creados`);
      res.json({ ok: true, pacientes: created.length, usuario: 'demo@seed.local' });
    } catch (e) {
      console.error('seed error', e);
      res.status(500).json({ error: e.message });
    }
  });
}

//salud
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

//manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

//server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
