// casoController.js
// Este archivo contiene los controladores para manejar las solicitudes relacionadas con los casos críticos.
// Utiliza el modelo CasoCritico para interactuar con la base de datos.

/**
 * getAllCasos(req, res)
 * Controlador para obtener todos los casos críticos.
 * 
 * @returns {Array<Object>} - Lista de casos críticos almacenados en la base de datos.
 * @throws {500} - Si ocurre un error al obtener los casos críticos.
 * 
 * Proceso:
 * 1. Consulta todos los casos críticos en la base de datos utilizando el modelo CasoCritico.
 * 2. Devuelve la lista de casos críticos al cliente.
 */

/**
 * createCaso(req, res)
 * Controlador para crear un nuevo caso crítico.
 * 
 * @body {Object} req.body - Datos del caso crítico a crear.
 * @returns {Object} - Objeto del caso crítico creado.
 * @throws {400} - Si ocurre un error de validación o al crear el caso crítico.
 * 
 * Proceso:
 * 1. Recibe los datos del caso crítico desde el cuerpo de la solicitud.
 * 2. Crea un nuevo caso crítico en la base de datos utilizando el modelo CasoCritico.
 * 3. Devuelve el objeto del caso crítico creado al cliente.
 */

const CasoCritico = require('../models/CasoCritico');

exports.getAllCasos = async (req, res) => {
  try {
    const casos = await CasoCritico.findAll();
    res.json(casos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener casos críticos' });
  }
};

exports.createCaso = async (req, res) => {
  try {
    const nuevoCaso = await CasoCritico.create(req.body);
    res.status(201).json(nuevoCaso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};