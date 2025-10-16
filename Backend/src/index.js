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
const imagenRoutes = require('./routes/imagenRoutes');
const Paciente = require('./models/Paciente');
const AlertaMedica = require('./models/AlertaMedica');
const CasoCritico = require('./models/CasoCritico');
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

//ruta de seed (dev)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/seed', async (req, res) => {
    try {
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
      let demoUser = await User.findOne({ where: { email: 'demo@seed.local' } });
      if (!demoUser) {
        demoUser = await User.create({ nombre: 'Demo', apellido: 'Seed', email: 'demo@seed.local', password: 'demo123', rol: 'ONG', estado: true });
      }

      //casos críticos demo
      const responsables = [{ tipo_responsable: 'ONG', id_responsable: 1 }, { tipo_responsable: 'Voluntario', id_responsable: 2 }];
      const estadosCaso = ['Detectado','En Atención','Derivado','Resuelto','Seguimiento'];
      const casos = [];
      for (let k=0;k<8;k++) {
        const resp = responsables[rnd(0, responsables.length-1)];
        const caso = await CasoCritico.create({
          id_familia: rnd(1, 50),
          descripcion: `Caso demo ${k+1}: Necesita atencion`,
          nivel_urgencia: Math.random() < 0.5 ? 'Alto' : 'Crítico',
          sintomas: 'Fiebre, tos seca',
          acciones_tomadas: 'Derivación a centro de salud',
          estado: estadosCaso[rnd(0, estadosCaso.length-1)],
          id_responsable: resp.id_responsable,
          tipo_responsable: resp.tipo_responsable,
          requiere_traslado: Math.random() < 0.3,
          observaciones: 'Observación demo'
        });
        casos.push(caso);
      }

      //alertas asociadas a casos
      const tiposAlert = ['Médica','Nutricional','Psicosocial','Urgente'];
      const prioridades = ['Baja','Media','Alta','Crítica'];
      const estadosAlert = ['Pendiente','Atendida','Escalada','Cerrada'];
      const alerts = [];
      for (let m=0;m<16;m++) {
        const caso = casos[rnd(0, casos.length-1)];
        const a = await Alerta.create({
          tipo_alerta: tiposAlert[rnd(0, tiposAlert.length-1)],
          descripcion: `Alerta demo ${m+1} asociada a caso ${caso.id_caso}`,
          estado: estadosAlert[rnd(0, estadosAlert.length-1)],
          prioridad: prioridades[rnd(0, prioridades.length-1)],
          caso_id: caso.id_caso,
          usuario_id: demoUser.id_usuario,
          observaciones: 'Observación alerta demo'
        });
        alerts.push(a);
      }

      res.json({ ok: true, pacientes: created.length, casos: casos.length, alertas: alerts.length });
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
