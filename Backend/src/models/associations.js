const User = require('./User');
const Ong = require('./Ong');
const Voluntario = require('./Voluntario');
const Comunidad = require('./Comunidad');
const Familia = require('./Familia');
const Nino = require('./Nino');
const CasoCritico = require('./CasoCritico');
const Alerta = require('./Alerta');

// Relación Usuario a ONG/Voluntario
User.belongsTo(Ong, {
  foreignKey: 'id_referencia',
  constraints: false,
  scope: {
    tipo_referencia: 'ONG'
  },
  as: 'ong'
});

User.belongsTo(Voluntario, {
  foreignKey: 'id_referencia',
  constraints: false,
  scope: {
    tipo_referencia: 'Voluntario'
  },
  as: 'voluntario'
});

// Relaciones principales
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

Alerta.belongsTo(CasoCritico, { 
  foreignKey: 'caso_id',
  as: 'caso' 
});

CasoCritico.hasMany(Alerta, { 
  foreignKey: 'caso_id',
  as: 'alertas' 
});

Alerta.belongsTo(User, { 
  foreignKey: 'id_usuario',
  targetKey: 'id_usuario', // Asegúrate de que coincida con la PK de Usuarios
  as: 'usuario' 
});

User.hasMany(Alerta, { 
  foreignKey: 'id_usuario',
  sourceKey: 'id_usuario', // Debe coincidir con la PK de Usuarios
  as: 'alertas_generadas' 
});

module.exports = {
  setupAssociations: () => {
    console.log('Asociaciones de modelos configuradas');
  }
};