const User = require('../models/User');
const Ong = require('../models/Ong');
const Voluntario = require('../models/Voluntarios');
const Comunidad = require('../models/Comunidad');

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const user = await User.findOne({ 
      where: { email },
      attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'rol', 'tipo_referencia', 'id_referencia', 'estado']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    };

    let userInfo = user.toJSON();
    if (user.tipo_referencia && user.id_referencia) {
      switch (user.tipo_referencia) {
        case 'ONG': {
          const ong = await Ong.findByPk(user.id_referencia, {
            attributes: ['id_ong', 'nombre_ong', 'tipo_ong', 'direccion', 'telefono']
          });
          if (ong) {
            userInfo.detalles_referencia = {
              tipo: 'ONG',
              id: ong.id_ong,
              nombre: ong.nombre_ong,
              tipo_ong: ong.tipo_ong,
              direccion: ong.direccion,
              telefono: ong.telefono
            };
          }
          break;
        }
        case 'Voluntario': {
          const voluntario = await Voluntario.findByPk(user.id_referencia, {
            attributes: ['id_voluntario', 'nombre', 'apellido', 'tipo_voluntario', 'institucion', 'disponibilidad']
          });
          if (voluntario) {
            userInfo.detalles_referencia = {
              tipo: 'Voluntario',
              id: voluntario.id_voluntario,
              nombre: `${voluntario.nombre} ${voluntario.apellido}`,
              tipo_voluntario: voluntario.tipo_voluntario,
              institucion: voluntario.institucion,
              disponibilidad: voluntario.disponibilidad
            };
          }
          break;
        }
        case 'Comunidad': {
          const comunidad = await Comunidad.findByPk(user.id_referencia, {
            attributes: ['id_comunidad', 'nombre_comunidad', 'direccion', 'telefono']
          });
          if (comunidad) {
            userInfo.detalles_referencia = {
              tipo: 'Comunidad',
              id: comunidad.id_comunidad,
              nombre: comunidad.nombre_comunidad,
              direccion: comunidad.direccion,
              telefono: comunidad.telefono
            };
          }
          break;
        }
        default:
          break;
      }
    }
        return res.json(userInfo);
      } catch (error) {
        return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
      }
    };