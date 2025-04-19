const User = require('./User');
const Ong = require('./Ong');
const Voluntario = require('./Voluntario');
const Comunidad = require('./Comunidad');
const Familia = require('./Familia');
const Nino = require('./Nino');
const CasoCritico = require('./CasoCritico');

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

module.exports = {
  setupAssociations: () => {
    console.log('Asociaciones de modelos configuradas');
  }
};