const ImagenPaciente = require('../models/ImagenPaciente');
const Paciente = require('../models/Paciente');
const { Op } = require('sequelize');

exports.subirImagen = async (req, res) => {
  try {
    const { id_paciente } = req.params;
    const { titulo, descripcion, imagen_base64, mime_type } = req.body;

    if (!titulo || !imagen_base64) {
      return res.status(400).json({ 
        error: 'Título e imagen son requeridos' 
      });
    }

    if (titulo.length > 100) {
      return res.status(400).json({ 
        error: 'El título no puede exceder 100 caracteres' 
      });
    }

    if (descripcion && descripcion.length > 200) {
      return res.status(400).json({ 
        error: 'La descripción no puede exceder 200 caracteres' 
      });
    }

    const paciente = await Paciente.findByPk(id_paciente);
    if (!paciente) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    const conteoImagenes = await ImagenPaciente.count({
      where: { id_paciente }
    });

    if (conteoImagenes >= 5) {
      return res.status(400).json({ 
        error: 'Límite de 5 imágenes alcanzado. Elimina una imagen antes de subir otra.' 
      });
    }

    const maxOrden = await ImagenPaciente.max('orden', {
      where: { id_paciente }
    }) || 0;

    const nuevaImagen = await ImagenPaciente.create({
      id_paciente,
      titulo,
      descripcion: descripcion || '',
      imagen_base64,
      mime_type: mime_type || 'image/jpeg',
      orden: maxOrden + 1
    });

    res.status(201).json(nuevaImagen);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

exports.obtenerImagenes = async (req, res) => {
  try {
    const { id_paciente } = req.params;

    const imagenes = await ImagenPaciente.findAll({
      where: { id_paciente },
      order: [['orden', 'ASC'], ['fecha_subida', 'ASC']]
    });

    res.json(imagenes);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    res.status(500).json({ error: 'Error al obtener las imágenes' });
  }
};

exports.obtenerImagen = async (req, res) => {
  try {
    const { id_imagen } = req.params;

    const imagen = await ImagenPaciente.findByPk(id_imagen);
    
    if (!imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    res.json(imagen);
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({ error: 'Error al obtener la imagen' });
  }
};

exports.eliminarImagen = async (req, res) => {
  try {
    const { id_imagen } = req.params;

    const imagen = await ImagenPaciente.findByPk(id_imagen);
    
    if (!imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    await imagen.destroy();

    res.json({ mensaje: 'Imagen eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar la imagen' });
  }
};

exports.actualizarImagen = async (req, res) => {
  try {
    const { id_imagen } = req.params;
    const { titulo, descripcion } = req.body;

    const imagen = await ImagenPaciente.findByPk(id_imagen);
    
    if (!imagen) {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }

    if (titulo && titulo.length > 100) {
      return res.status(400).json({ 
        error: 'El título no puede exceder 100 caracteres' 
      });
    }

    if (descripcion && descripcion.length > 200) {
      return res.status(400).json({ 
        error: 'La descripción no puede exceder 200 caracteres' 
      });
    }

    if (titulo !== undefined) imagen.titulo = titulo;
    if (descripcion !== undefined) imagen.descripcion = descripcion;

    await imagen.save();

    res.json(imagen);
  } catch (error) {
    console.error('Error al actualizar imagen:', error);
    res.status(500).json({ error: 'Error al actualizar la imagen' });
  }
};
