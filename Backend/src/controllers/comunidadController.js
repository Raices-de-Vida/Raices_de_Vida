//información relevante para miembros
exports.getComunidadesMiembros = async (req, res) => {
  try {
    const comunidades = await Comunidad.findAll({
      where: { estado: true },
      attributes: ['id_comunidad', 'nombre_comunidad', 'municipio', 'departamento']
    });
    
    res.json(comunidades);
  } catch (error) {
    console.error('Error al obtener comunidades para miembros:', error);
    res.status(500).json({ error: 'Error al obtener la lista de comunidades' });
  }
};