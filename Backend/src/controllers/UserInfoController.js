// userInfoController.js
// Controlador para gestión completa de usuarios (CRUD)
// Incluye funciones para crear, leer, actualizar y eliminar usuarios

const User = require('../models/User');
const Ong = require('../models/Ong');
const Voluntario = require('../models/Voluntarios');
const Comunidad = require('../models/Comunidad');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

/**
 * getAllUsers(req, res)
 * Obtiene todos los usuarios del sistema con paginación y filtros opcionales
 * 
 * @query {number} page - Página actual (default: 1)
 * @query {number} limit - Cantidad de usuarios por página (default: 10)
 * @query {string} search - Búsqueda por nombre, apellido o email
 * @query {string} rol - Filtrar por rol específico
 * @query {boolean} activos - Filtrar solo usuarios activos (default: todos)
 * @returns {Object} - Objeto con usuarios, paginación y total
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      rol = '',
      activos = null 
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Construir condiciones de búsqueda
    const whereClause = {};
    
    // Filtro por estado activo/inactivo
    if (activos !== null && activos !== '') {
      whereClause.estado = activos === 'true';
    }
    
    // Filtro por rol
    if (rol) {
      whereClause.rol = rol;
    }
    
    // Búsqueda por nombre, apellido o email
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { apellido: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Consulta con paginación
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { 
        exclude: ['password'] // Excluir contraseña por seguridad
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Enriquecer usuarios con información de referencia
    const usersWithDetails = await Promise.all(
      rows.map(async (user) => {
        const userData = user.toJSON();
        
        // Obtener detalles según el tipo de referencia
        if (user.tipo_referencia && user.id_referencia) {
          try {
            switch (user.tipo_referencia) {
              case 'ONG':
                const ong = await Ong.findByPk(user.id_referencia, {
                  attributes: ['id_ong', 'nombre_ong', 'tipo_ong']
                });
                if (ong) {
                  userData.referencia_nombre = ong.nombre_ong;
                }
                break;
              
              case 'Voluntario':
                const voluntario = await Voluntario.findByPk(user.id_referencia, {
                  attributes: ['id_voluntario', 'nombre', 'apellido']
                });
                if (voluntario) {
                  userData.referencia_nombre = `${voluntario.nombre} ${voluntario.apellido}`;
                }
                break;
              
              case 'Comunidad':
                const comunidad = await Comunidad.findByPk(user.id_referencia, {
                  attributes: ['id_comunidad', 'nombre_comunidad']
                });
                if (comunidad) {
                  userData.referencia_nombre = comunidad.nombre_comunidad;
                }
                break;
            }
          } catch (error) {
            console.warn('Error obteniendo detalles de referencia:', error);
          }
        }
        
        return userData;
      })
    );

    res.json({
      success: true,
      data: usersWithDetails,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor al obtener usuarios' 
    });
  }
};

/**
 * createUser(req, res)
 * Crea un nuevo usuario en el sistema
 * 
 * @body {string} nombre - Nombre del usuario
 * @body {string} apellido - Apellido del usuario
 * @body {string} email - Email único del usuario
 * @body {string} password - Contraseña (será hasheada)
 * @body {string} rol - Rol del usuario (ONG, Voluntario, Lider Comunitario)
 * @body {string} tipo_referencia - Tipo de entidad asociada (opcional)
 * @body {number} id_referencia - ID de la entidad asociada (opcional)
 * @returns {Object} - Usuario creado (sin contraseña)
 */
exports.createUser = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      password,
      rol,
      tipo_referencia,
      id_referencia
    } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos obligatorios deben ser proporcionados'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // Validar rol permitido
    const rolesPermitidos = ['ONG', 'Voluntario', 'Lider Comunitario', 'Administrador'];
    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({
        success: false,
        error: 'Rol no válido. Roles permitidos: ' + rolesPermitidos.join(', ')
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'El email ya está registrado en el sistema'
      });
    }

    // Validar referencia si se proporciona
    if (tipo_referencia && id_referencia) {
      let referenciaValida = false;
      
      switch (tipo_referencia) {
        case 'ONG':
          const ong = await Ong.findByPk(id_referencia);
          referenciaValida = !!ong;
          break;
        
        case 'Voluntario':
          const voluntario = await Voluntario.findByPk(id_referencia);
          referenciaValida = !!voluntario;
          break;
        
        case 'Comunidad':
          const comunidad = await Comunidad.findByPk(id_referencia);
          referenciaValida = !!comunidad;
          break;
        
        default:
          return res.status(400).json({
            success: false,
            error: 'Tipo de referencia no válido'
          });
      }
      
      if (!referenciaValida) {
        return res.status(404).json({
          success: false,
          error: `La referencia ${tipo_referencia} con ID ${id_referencia} no existe`
        });
      }
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await User.create({
      nombre,
      apellido,
      email,
      password: hashedPassword,
      rol,
      tipo_referencia,
      id_referencia,
      estado: true // Por defecto activo
    });

    // Preparar respuesta sin incluir la contraseña
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: userResponse
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al crear usuario'
    });
  }
};

/**
 * updateUser(req, res)
 * Actualiza los datos de un usuario existente
 * 
 * @params {number} id - ID del usuario a actualizar
 * @body {Object} - Campos a actualizar (nombre, apellido, email, rol, etc.)
 * @returns {Object} - Usuario actualizado
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Buscar el usuario
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Si se está actualizando el email, verificar que sea único
    if (updateData.email && updateData.email !== user.email) {
      const emailExists = await User.findOne({ 
        where: { 
          email: updateData.email,
          id_usuario: { [Op.ne]: id }
        }
      });
      
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'El email ya está en uso por otro usuario'
        });
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Validar rol si se está actualizando
    if (updateData.rol) {
      const rolesPermitidos = ['ONG', 'Voluntario', 'Lider Comunitario', 'Administrador'];
      if (!rolesPermitidos.includes(updateData.rol)) {
        return res.status(400).json({
          success: false,
          error: 'Rol no válido'
        });
      }
    }

    // Actualizar el usuario
    await user.update(updateData);

    // Preparar respuesta sin incluir la contraseña
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: userResponse
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al actualizar usuario'
    });
  }
};

/**
 * deleteUser(req, res)
 * Elimina un usuario del sistema (eliminación lógica o física)
 * 
 * @params {number} id - ID del usuario a eliminar
 * @query {boolean} permanent - Si es true, elimina permanentemente. Si es false, solo desactiva
 * @returns {Object} - Confirmación de eliminación
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    // Buscar el usuario
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    if (permanent === 'true') {
      // Eliminación física permanente
      await user.destroy();
      
      res.json({
        success: true,
        message: 'Usuario eliminado permanentemente del sistema'
      });
    } else {
      // Eliminación lógica (desactivar)
      user.estado = false;
      await user.save();
      
      res.json({
        success: true,
        message: 'Usuario desactivado exitosamente',
        data: {
          id: user.id_usuario,
          nombre: user.nombre,
          apellido: user.apellido,
          estado: user.estado
        }
      });
    }

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar usuario'
    });
  }
};

/**
 * getUserByEmail(req, res)
 * Obtiene información completa de un usuario por su email
 * 
 * @query {string} email - Email del usuario a buscar
 * @returns {Object} - Información del usuario incluyendo datos de referencia
 * @throws {404} - Si el usuario no existe
 * @throws {400} - Si no se proporciona email
 */
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Buscar usuario por email
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'rol', 'tipo_referencia', 'id_referencia', 'estado']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Objeto base de respuesta
    const userInfo = {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      tipo_referencia: user.tipo_referencia,
      id_referencia: user.id_referencia,
      estado: user.estado,
      detalles_referencia: null
    };

    // Obtener detalles según el tipo de referencia
    if (user.tipo_referencia && user.id_referencia) {
      try {
        switch (user.tipo_referencia) {
          case 'ONG':
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

          case 'Voluntario':
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

          case 'Comunidad':
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
      } catch (refError) {
        console.warn('Error al obtener detalles de referencia:', refError);
        // Continuar sin los detalles de referencia
      }
    }

    res.json(userInfo);

  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * getUserById(req, res)
 * Obtiene información de un usuario por su ID
 * 
 * @params {number} id - ID del usuario
 * @returns {Object} - Información básica del usuario
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'rol', 'tipo_referencia', 'estado']
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);

  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * getUsersByRole(req, res)
 * Obtiene lista de usuarios filtrados por rol
 * 
 * @query {string} rol - Rol a filtrar (ONG, Voluntario, Lider Comunitario)
 * @returns {Array} - Lista de usuarios con el rol especificado
 */
exports.getUsersByRole = async (req, res) => {
  try {
    const { rol } = req.query;

    const whereClause = { estado: true }; // Solo usuarios activos
    if (rol) {
      whereClause.rol = rol;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id_usuario', 'nombre', 'apellido', 'email', 'rol', 'tipo_referencia'],
      order: [['nombre', 'ASC']]
    });

    res.json(users);

  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * verifyUserExists(req, res)
 * Verifica si un usuario existe y está activo
 * 
 * @query {string} email - Email del usuario a verificar
 * @returns {Object} - Resultado de la verificación
 */
exports.verifyUserExists = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    const user = await User.findOne({
      where: { email },
      attributes: ['id_usuario', 'nombre', 'apellido', 'rol', 'estado']
    });

    const result = {
      exists: !!user,
      active: user ? user.estado : false,
      user_info: user ? {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      } : null
    };

    res.json(result);

  } catch (error) {
    console.error('Error al verificar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * updateUserStatus(req, res)
 * Actualiza el estado de un usuario (activo/inactivo)
 * 
 * @params {number} id - ID del usuario
 * @body {boolean} estado - Nuevo estado del usuario
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (typeof estado !== 'boolean') {
      return res.status(400).json({ error: 'Estado debe ser true o false' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    user.estado = estado;
    await user.save();

    res.json({ 
      message: `Usuario ${estado ? 'activado' : 'desactivado'} correctamente`,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        estado: user.estado
      }
    });

  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * bulkDeleteUsers(req, res)
 * Elimina múltiples usuarios de una sola vez
 * 
 * @body {Array<number>} userIds - Array de IDs de usuarios a eliminar
 * @body {boolean} permanent - Si es true, elimina permanentemente
 * @returns {Object} - Resumen de usuarios eliminados
 */
exports.bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds, permanent = false } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se debe proporcionar un array de IDs de usuarios'
      });
    }

    const users = await User.findAll({
      where: {
        id_usuario: {
          [Op.in]: userIds
        }
      }
    });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron usuarios con los IDs proporcionados'
      });
    }

    if (permanent) {
      // Eliminación física permanente
      await User.destroy({
        where: {
          id_usuario: {
            [Op.in]: userIds
          }
        }
      });

      res.json({
        success: true,
        message: `${users.length} usuarios eliminados permanentemente`,
        deletedCount: users.length
      });
    } else {
      // Eliminación lógica (desactivar)
      await User.update(
        { estado: false },
        {
          where: {
            id_usuario: {
              [Op.in]: userIds
            }
          }
        }
      );

      res.json({
        success: true,
        message: `${users.length} usuarios desactivados exitosamente`,
        deactivatedCount: users.length
      });
    }

  } catch (error) {
    console.error('Error al eliminar usuarios en lote:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al eliminar usuarios'
    });
  }
};

/**
 * getUserStats(req, res)
 * Obtiene estadísticas generales de usuarios
 * 
 * @returns {Object} - Estadísticas de usuarios por rol y estado
 */
exports.getUserStats = async (req, res) => {
  try {
    // Total de usuarios
    const totalUsers = await User.count();
    
    // Usuarios activos
    const activeUsers = await User.count({
      where: { estado: true }
    });
    
    // Usuarios por rol
    const usersByRole = await User.findAll({
      attributes: [
        'rol',
        [User.sequelize.fn('COUNT', User.sequelize.col('id_usuario')), 'count']
      ],
      group: ['rol']
    });
    
    // Usuarios creados en el último mes
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item.rol] = parseInt(item.dataValues.count);
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas de usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al obtener estadísticas'
    });
  }
};