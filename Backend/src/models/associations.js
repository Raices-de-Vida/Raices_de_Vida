const User = require('./User');
const Ong = require('./Ong');
const Voluntario = require('./Voluntarios');
const Comunidad = require('./Comunidad');
const Familia = require('./Familia');
const Nino = require('./Nino');
const CasoCritico = require('./CasoCritico');
const Alerta = require('./Alerta');

const Paciente = require('./Paciente');
const Consulta = require('./Consulta');
const Signos = require('./SignosVitalesHistorial');
const CirugiaPaciente = require('./CirugiaPaciente');
const HistorialMedico = require('./HistorialMedico');
const AlertaMedica = require('./AlertaMedica');

User.belongsTo(Ong, {
  foreignKey: 'id_referencia',
  constraints: false,
  scope: { tipo_referencia: 'ONG' },
  as: 'ong'
});

User.belongsTo(Voluntario, {
  foreignKey: 'id_referencia',
  constraints: false,
  scope: { tipo_referencia: 'Voluntario' },
  as: 'voluntario'
});

User.belongsTo(Comunidad, {
  foreignKey: 'id_referencia',
  constraints: false,
  scope: { tipo_referencia: 'Comunidad' },
  as: 'comunidad'
});

/* Relaciones principales */
Ong.belongsTo(Comunidad, { foreignKey: 'id_comunidad' });
Comunidad.hasMany(Ong, { foreignKey: 'id_comunidad' });

Familia.belongsTo(Comunidad, { foreignKey: 'id_comunidad' });
Comunidad.hasMany(Familia, { foreignKey: 'id_comunidad' });

Nino.belongsTo(Familia, { foreignKey: 'id_familia' });
Familia.hasMany(Nino, { foreignKey: 'id_familia' });

CasoCritico.belongsTo(Familia, { foreignKey: 'id_familia' });
Familia.hasMany(CasoCritico, { foreignKey: 'id_familia' });

CasoCritico.belongsTo(Nino, { foreignKey: 'id_nino' });
Nino.hasMany(CasoCritico, { foreignKey: 'id_nino' });

/* Alertas */
Alerta.belongsTo(CasoCritico, { foreignKey: 'caso_id', as: 'caso' });
CasoCritico.hasMany(Alerta, { foreignKey: 'caso_id', as: 'alertas' });

Alerta.belongsTo(User, { foreignKey: 'usuario_id', targetKey: 'id_usuario', as: 'usuario' });
User.hasMany(Alerta, { foreignKey: 'usuario_id', sourceKey: 'id_usuario', as: 'alertas_generadas' });

/* Paciente y sus módulos */
Paciente.hasMany(Consulta, { foreignKey: 'id_paciente', as: 'consultas' });
Consulta.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

Paciente.hasMany(Signos, { foreignKey: 'id_paciente', as: 'signos' });
Signos.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

Paciente.hasMany(CirugiaPaciente, { foreignKey: 'id_paciente', as: 'cirugias' });
CirugiaPaciente.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

Paciente.hasMany(HistorialMedico, { foreignKey: 'id_paciente', as: 'historial' });
HistorialMedico.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

Paciente.hasMany(AlertaMedica, { foreignKey: 'id_paciente', as: 'alertasMedicas' });
AlertaMedica.belongsTo(Paciente, { foreignKey: 'id_paciente', as: 'paciente' });

AlertaMedica.belongsTo(Alerta, { foreignKey: 'id_alerta', as: 'alerta' });

Paciente.belongsTo(Familia,   { foreignKey: 'id_familia',   as: 'familia' });
Paciente.belongsTo(Comunidad, { foreignKey: 'id_comunidad', as: 'comunidad' });
Paciente.belongsTo(User,      { foreignKey: 'usuario_registro', as: 'registradoPor' });

Signos.belongsTo(User, { foreignKey: 'usuario_registro', as: 'tomadoPor' });

