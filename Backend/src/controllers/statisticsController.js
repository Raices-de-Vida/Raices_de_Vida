// Backend/src/controllers/statisticsController.js
const { Op, fn, col, literal } = require('sequelize');
const sequelize = require('../config/database');
const Paciente = require('../models/Paciente');
const Consulta = require('../models/Consulta');
const Signos = require('../models/SignosVitalesHistorial');
const HistorialMedico = require('../models/HistorialMedico');

/**
 * 1. Obtener casos reportados por lugar (municipios/comunidades)
 * Agrupa pacientes que han sido vistos por un doctor en los últimos 4 meses
 */
exports.getCasosPorLugar = async (req, res) => {
  try {
    const { meses = 4 } = req.query;
    
    // Calcular fecha límite (últimos X meses)
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - parseInt(meses));
    
    // Consulta para obtener casos por comunidad
    const casosPorLugar = await Paciente.findAll({
      attributes: [
        'comunidad_pueblo',
        [fn('COUNT', fn('DISTINCT', col('consultas.id_paciente'))), 'pacientes_con_consulta']
      ],
      include: [{
        model: Consulta,
        as: 'consultas',
        attributes: [],
        where: {
          fecha: {
            [Op.gte]: fechaLimite
          }
        },
        required: false
      }],
      group: ['Pacientes.comunidad_pueblo'],
      having: literal('COUNT(DISTINCT "consultas"."id_paciente") > 0'),
      order: [[fn('COUNT', fn('DISTINCT', col('consultas.id_paciente'))), 'DESC']],
      raw: true // <-- ESTO es clave para que no incluya id_paciente automáticamente
    });
    
    // Calcular estadísticas adicionales
    const totalCasos = casosPorLugar.reduce((sum, lugar) => 
      sum + parseInt(lugar.pacientes_con_consulta), 0);
    
    // Formatear respuesta
    const resultado = {
      periodo: `Últimos ${meses} meses`,
      fecha_inicio: fechaLimite.toISOString().split('T')[0],
      fecha_fin: new Date().toISOString().split('T')[0],
      total_casos_reportados: totalCasos,
      total_comunidades: casosPorLugar.length,
      casos_por_comunidad: casosPorLugar.map(lugar => ({
        comunidad: lugar.comunidad_pueblo || 'Sin especificar',
        casos_reportados: parseInt(lugar.pacientes_con_consulta),
        porcentaje: totalCasos > 0 
          ? ((parseInt(lugar.pacientes_con_consulta) / totalCasos) * 100).toFixed(2) + '%'
          : '0%'
      }))
    };
    
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo casos por lugar:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas de casos por lugar',
      detalle: error.message 
    });
  }
};

/**
 * 2. Obtener rangos de edad de pacientes con Hipertensión y Diabetes
 * Analiza pacientes crónicos agrupados por rangos de edad
 */
exports.getRangosEdadCronicos = async (req, res) => {
  try {
    // Definir rangos de edad
    const rangosEdad = [
      { min: 0, max: 17, label: '0-17 años (Pediátrico)' },
      { min: 18, max: 29, label: '18-29 años' },
      { min: 30, max: 39, label: '30-39 años' },
      { min: 40, max: 49, label: '40-49 años' },
      { min: 50, max: 59, label: '50-59 años' },
      { min: 60, max: 69, label: '60-69 años' },
      { min: 70, max: 79, label: '70-79 años' },
      { min: 80, max: 150, label: '80+ años' }
    ];
    
    // Consulta para pacientes con Diabetes
    const pacientesDiabetes = await Consulta.findAll({
      attributes: [
        [col('paciente.edad'), 'edad'],
        [fn('COUNT', fn('DISTINCT', col('Consultas.id_paciente'))), 'total']
      ],
      where: {
        [Op.or]: [
          { tipo_consulta: 'Diabetes' },
          { diagnosticos_previos: { [Op.iLike]: '%diabetes%' } },
          { medicamentos_actuales: { [Op.iLike]: '%metformin%' } },
          { medicamentos_actuales: { [Op.iLike]: '%insulina%' } }
        ]
      },
      include: [{
        model: Paciente,
        as: 'paciente',
        attributes: [],
        required: true
      }],
      group: ['paciente.edad'],
      raw: true
    });
    
    // Consulta para pacientes con Hipertensión
    const pacientesHipertension = await Consulta.findAll({
      attributes: [
        [col('paciente.edad'), 'edad'],
        [fn('COUNT', fn('DISTINCT', col('Consultas.id_paciente'))), 'total']
      ],
      where: {
        [Op.or]: [
          { tipo_consulta: 'HTN' },
          { diagnosticos_previos: { [Op.iLike]: '%hipertens%' } },
          { medicamentos_actuales: { [Op.iLike]: '%losartan%' } },
          { medicamentos_actuales: { [Op.iLike]: '%enalapril%' } },
          { medicamentos_actuales: { [Op.iLike]: '%amlodipino%' } }
        ]
      },
      include: [{
        model: Paciente,
        as: 'paciente',
        attributes: [],
        required: true
      }],
      group: ['paciente.edad'],
      raw: true
    });
    
    // Agrupar por rangos de edad
    const estadisticasPorRango = rangosEdad.map(rango => {
      const diabetesEnRango = pacientesDiabetes
        .filter(p => p.edad >= rango.min && p.edad <= rango.max)
        .reduce((sum, p) => sum + parseInt(p.total), 0);
      
      const hipertensionEnRango = pacientesHipertension
        .filter(p => p.edad >= rango.min && p.edad <= rango.max)
        .reduce((sum, p) => sum + parseInt(p.total), 0);
      
      return {
        rango_edad: rango.label,
        edad_minima: rango.min,
        edad_maxima: rango.max,
        diabetes: {
          cantidad: diabetesEnRango,
          porcentaje: 0 // Se calculará después
        },
        hipertension: {
          cantidad: hipertensionEnRango,
          porcentaje: 0 // Se calculará después
        },
        total_cronicos: diabetesEnRango + hipertensionEnRango
      };
    });
    
    // Calcular totales y porcentajes
    const totalDiabetes = estadisticasPorRango.reduce((sum, r) => sum + r.diabetes.cantidad, 0);
    const totalHipertension = estadisticasPorRango.reduce((sum, r) => sum + r.hipertension.cantidad, 0);
    
    // Actualizar porcentajes
    estadisticasPorRango.forEach(rango => {
      rango.diabetes.porcentaje = totalDiabetes > 0 
        ? ((rango.diabetes.cantidad / totalDiabetes) * 100).toFixed(2) + '%'
        : '0%';
      rango.hipertension.porcentaje = totalHipertension > 0
        ? ((rango.hipertension.cantidad / totalHipertension) * 100).toFixed(2) + '%'
        : '0%';
    });
    
    // Obtener pacientes con ambas condiciones
    const pacientesAmbasCondiciones = await sequelize.query(`
      SELECT COUNT(DISTINCT p.id_paciente) as total
      FROM "Pacientes" p
      WHERE EXISTS (
        SELECT 1 FROM "Consultas" c1 
        WHERE c1.id_paciente = p.id_paciente 
        AND (c1.tipo_consulta = 'Diabetes' OR c1.diagnosticos_previos ILIKE '%diabetes%')
      )
      AND EXISTS (
        SELECT 1 FROM "Consultas" c2 
        WHERE c2.id_paciente = p.id_paciente 
        AND (c2.tipo_consulta = 'HTN' OR c2.diagnosticos_previos ILIKE '%hipertens%')
      )
    `, { type: sequelize.QueryTypes.SELECT });
    
    const resultado = {
      fecha_analisis: new Date().toISOString().split('T')[0],
      resumen: {
        total_pacientes_diabetes: totalDiabetes,
        total_pacientes_hipertension: totalHipertension,
        pacientes_ambas_condiciones: pacientesAmbasCondiciones[0]?.total || 0,
        rango_mas_afectado_diabetes: estadisticasPorRango
          .reduce((max, r) => r.diabetes.cantidad > max.diabetes.cantidad ? r : max).rango_edad,
        rango_mas_afectado_hipertension: estadisticasPorRango
          .reduce((max, r) => r.hipertension.cantidad > max.hipertension.cantidad ? r : max).rango_edad
      },
      distribucion_por_edad: estadisticasPorRango
    };
    
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo rangos de edad crónicos:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas de pacientes crónicos',
      detalle: error.message 
    });
  }
};

/**
 * 3. Obtener relación peso vs edad de niños
 * Analiza el desarrollo ponderal de pacientes pediátricos
 */
exports.getPesoVsEdadNinos = async (req, res) => {
  try {
    const { edad_maxima = 18 } = req.query;
    
    // Obtener datos de niños con peso registrado
    const datosNinos = await Paciente.findAll({
      attributes: [
        'id_paciente',
        'nombre',
        'apellido',
        'edad',
        'fecha_nacimiento',
        'genero',
        'peso',
        'estatura',
        'comunidad_pueblo'
      ],
      where: {
        edad: {
          [Op.lte]: parseInt(edad_maxima)
        },
        peso: {
          [Op.not]: null
        }
      },
      include: [{
        model: Signos,
        as: 'signos',
        attributes: ['peso', 'estatura', 'fecha_toma'],
        order: [['fecha_toma', 'DESC']],
        limit: 5,
        required: false
      }],
      order: [['edad', 'ASC']]
    });
    
    // Calcular percentiles de peso por edad y género
    const calcularPercentil = (peso, edad, genero) => {
      // Valores de referencia de la OMS (simplificados para ejemplo)
      // En producción, usar tablas completas de crecimiento de la OMS
      const referencias = {
        'M': { // Masculino
          percentil_50: 3.3 + (edad * 2.5), // Fórmula simplificada
          percentil_25: 3.0 + (edad * 2.3),
          percentil_75: 3.6 + (edad * 2.7),
          percentil_95: 4.0 + (edad * 3.0)
        },
        'F': { // Femenino
          percentil_50: 3.2 + (edad * 2.4),
          percentil_25: 2.9 + (edad * 2.2),
          percentil_75: 3.5 + (edad * 2.6),
          percentil_95: 3.9 + (edad * 2.9)
        }
      };
      
      const ref = referencias[genero] || referencias['M'];
      
      if (peso <= ref.percentil_25) return 'Bajo peso';
      if (peso <= ref.percentil_50) return 'Peso normal-bajo';
      if (peso <= ref.percentil_75) return 'Peso normal';
      if (peso <= ref.percentil_95) return 'Sobrepeso';
      return 'Obesidad';
    };
    
    // Calcular IMC para niños mayores de 2 años
    const calcularIMCPediatrico = (peso, estatura, edad) => {
      if (!peso || !estatura || edad < 2) return null;
      const imc = peso / Math.pow(estatura / 100, 2);
      return imc.toFixed(1);
    };
    
    // Agrupar por rangos de edad pediátrica
    const gruposEdad = [
      { min: 0, max: 1, label: '0-12 meses' },
      { min: 1, max: 2, label: '1-2 años' },
      { min: 2, max: 5, label: '2-5 años' },
      { min: 5, max: 10, label: '5-10 años' },
      { min: 10, max: 14, label: '10-14 años' },
      { min: 14, max: 18, label: '14-18 años' }
    ];
    
    // Procesar datos por grupo de edad
    const estadisticasPorGrupo = gruposEdad.map(grupo => {
      const ninosEnGrupo = datosNinos.filter(n => 
        n.edad >= grupo.min && n.edad < grupo.max
      );
      
      const pesos = ninosEnGrupo.map(n => parseFloat(n.peso)).filter(p => !isNaN(p));
      const estaturas = ninosEnGrupo.map(n => parseFloat(n.estatura)).filter(e => !isNaN(e));
      
      return {
        grupo_edad: grupo.label,
        cantidad_ninos: ninosEnGrupo.length,
        peso_promedio: pesos.length > 0 
          ? (pesos.reduce((a, b) => a + b, 0) / pesos.length).toFixed(2) + ' kg'
          : 'N/A',
        peso_minimo: pesos.length > 0 ? Math.min(...pesos).toFixed(2) + ' kg' : 'N/A',
        peso_maximo: pesos.length > 0 ? Math.max(...pesos).toFixed(2) + ' kg' : 'N/A',
        estatura_promedio: estaturas.length > 0
          ? (estaturas.reduce((a, b) => a + b, 0) / estaturas.length).toFixed(2) + ' cm'
          : 'N/A',
        distribucion_genero: {
          masculino: ninosEnGrupo.filter(n => n.genero === 'M').length,
          femenino: ninosEnGrupo.filter(n => n.genero === 'F').length
        }
      };
    });
    
    // Identificar niños con posible malnutrición o sobrepeso
    const ninosEnRiesgo = datosNinos.map(nino => {
      const peso = parseFloat(nino.peso);
      const estatura = parseFloat(nino.estatura);
      const imc = calcularIMCPediatrico(peso, estatura, nino.edad);
      const clasificacion = calcularPercentil(peso, nino.edad, nino.genero);
      
      return {
        id: nino.id_paciente,
        nombre: `${nino.nombre} ${nino.apellido || ''}`.trim(),
        edad: nino.edad,
        genero: nino.genero,
        peso: peso.toFixed(2) + ' kg',
        estatura: estatura ? estatura.toFixed(2) + ' cm' : 'N/A',
        imc: imc || 'N/A',
        clasificacion: clasificacion,
        comunidad: nino.comunidad_pueblo || 'Sin especificar',
        requiere_atencion: clasificacion === 'Bajo peso' || clasificacion === 'Obesidad'
      };
    }).filter(n => n.requiere_atencion);
    
    // Tendencias de peso (últimos registros)
    const tendencias = await sequelize.query(`
      SELECT 
        p.id_paciente,
        p.nombre,
        p.edad,
        COUNT(DISTINCT sv.fecha_toma) as mediciones,
        MIN(sv.peso) as peso_minimo,
        MAX(sv.peso) as peso_maximo,
        AVG(sv.peso) as peso_promedio,
        CASE 
          WHEN MAX(sv.peso) > MIN(sv.peso) * 1.1 THEN 'Ganancia de peso'
          WHEN MAX(sv.peso) < MIN(sv.peso) * 0.95 THEN 'Pérdida de peso'
          ELSE 'Peso estable'
        END as tendencia
      FROM "Pacientes" p
      INNER JOIN "Signos_Vitales_Historial" sv ON p.id_paciente = sv.id_paciente
      WHERE p.edad <= :edad_maxima
        AND sv.peso IS NOT NULL
        AND sv.fecha_toma >= NOW() - INTERVAL '6 months'
      GROUP BY p.id_paciente, p.nombre, p.edad
      HAVING COUNT(DISTINCT sv.fecha_toma) >= 2
      ORDER BY p.edad
    `, {
      replacements: { edad_maxima: parseInt(edad_maxima) },
      type: sequelize.QueryTypes.SELECT
    });
    
    const resultado = {
      fecha_analisis: new Date().toISOString().split('T')[0],
      edad_maxima_analizada: edad_maxima + ' años',
      resumen: {
        total_ninos_analizados: datosNinos.length,
        ninos_con_bajo_peso: ninosEnRiesgo.filter(n => n.clasificacion === 'Bajo peso').length,
        ninos_con_sobrepeso: ninosEnRiesgo.filter(n => 
          n.clasificacion === 'Sobrepeso' || n.clasificacion === 'Obesidad').length,
        ninos_requieren_atencion: ninosEnRiesgo.length
      },
      estadisticas_por_grupo_edad: estadisticasPorGrupo,
      ninos_en_riesgo: ninosEnRiesgo,
      tendencias_peso: tendencias.map(t => ({
        id_paciente: t.id_paciente,
        nombre: t.nombre,
        edad: t.edad + ' años',
        mediciones: t.mediciones,
        peso_minimo: parseFloat(t.peso_minimo).toFixed(2) + ' kg',
        peso_maximo: parseFloat(t.peso_maximo).toFixed(2) + ' kg',
        peso_promedio: parseFloat(t.peso_promedio).toFixed(2) + ' kg',
        tendencia: t.tendencia
      }))
    };
    
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo peso vs edad de niños:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas de peso vs edad',
      detalle: error.message 
    });
  }
};

/**
 * Obtener resumen general de estadísticas
 */
exports.getResumenEstadisticas = async (req, res) => {
  try {
    // Total de pacientes
    const totalPacientes = await Paciente.count();
    
    // Total de consultas en los últimos 4 meses
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() - 4);
    
    const consultasRecientes = await Consulta.count({
      where: {
        fecha: {
          [Op.gte]: fechaLimite
        }
      }
    });
    
    // Comunidades atendidas
    const comunidades = await Paciente.findAll({
      attributes: [
        [fn('COUNT', fn('DISTINCT', col('comunidad_pueblo'))), 'total']
      ],
      raw: true
    });
    
    // Pacientes pediátricos
    const pacientesPediatricos = await Paciente.count({
      where: {
        edad: {
          [Op.lte]: 18
        }
      }
    });
    
    // Pacientes con enfermedades crónicas
    const pacientesCronicos = await sequelize.query(`
      SELECT COUNT(DISTINCT p.id_paciente) as total
      FROM "Pacientes" p
      INNER JOIN "Consultas" c ON p.id_paciente = c.id_paciente
      WHERE c.tipo_consulta IN ('Diabetes', 'HTN')
         OR c.diagnosticos_previos ILIKE '%diabetes%'
         OR c.diagnosticos_previos ILIKE '%hipertens%'
    `, { type: sequelize.QueryTypes.SELECT });
    
    const resultado = {
      fecha_generacion: new Date().toISOString(),
      estadisticas_generales: {
        total_pacientes: totalPacientes,
        consultas_ultimos_4_meses: consultasRecientes,
        comunidades_atendidas: comunidades[0]?.total || 0,
        pacientes_pediatricos: pacientesPediatricos,
        pacientes_cronicos: pacientesCronicos[0]?.total || 0,
        porcentaje_pediatricos: ((pacientesPediatricos / totalPacientes) * 100).toFixed(2) + '%',
        porcentaje_cronicos: ((pacientesCronicos[0]?.total / totalPacientes) * 100).toFixed(2) + '%'
      },
      periodos_analisis: {
        casos_por_lugar: '4 meses',
        tendencias_peso: '6 meses'
      }
    };
    
    res.json(resultado);
  } catch (error) {
    console.error('Error obteniendo resumen de estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener resumen de estadísticas',
      detalle: error.message 
    });
  }
};

module.exports = exports;