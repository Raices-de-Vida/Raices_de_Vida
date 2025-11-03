const { fillConsultSummaryPDF, savePDFToFile } = require('./src/services/pdfService');

async function testPDF() {
  console.log('Sistema de Exportacion PDF - Raices de Vida');
  console.log('================================================\n');

  const datosPaciente = {
    // Información básica (página 0)
    date: new Date().toLocaleDateString('en-US'),
    language: 'Spanish',
    patient_name: 'Juan Pérez González',
    phone: '555-1234',
    town: 'Sumpango',
    dob: '05/15/1990',
    age: '35 años',
    gender: 'M',
    
    // Tipo de consulta
    consult_type: 'Other',
    consult_other_text: 'Respiratory Issues',
    
    // Motivo de consulta
    chief_complaint: 'Tos persistente desde hace 3 días con malestar general y dificultad para respirar',
    
    // Signos vitales
    vitals: {
      bp: '120 / 80',
      hr: '75',
      spo2: '98%',
      bs: '95',
      weight: '70 kg',
      height: '170 cm',
      temp: '36.8°C'
    },
    
    // Medicamentos tomados para BP y BS
    taken_med_bp: 'N',
    taken_med_bs: 'Y',
    
    // Alergias
    allergies: 'Penicilina',
    
    // Vitaminas y antiparasitarios
    vitamins: '2',
    albendazole: '1',
    
    // Historia social - CURRENT (con círculos Y/N + detalles)
    current: {
      tobacco: 'N',
      tobacco_details: '',
      alcohol: 'Y',
      alcohol_details: '2 beers/week',
      drugs: 'N',
      drugs_details: ''
    },
    
    // Historia social - PAST (con círculos Y/N + detalles)
    past: {
      tobacco: 'Y',
      tobacco_details: '1 pack/day x 5yrs',
      alcohol: 'N',
      alcohol_details: '',
      drugs: 'N',
      drugs_details: ''
    },
    
    // Información obstétrica
    lmp: '09    15    2025',
    menopause: 'Yes',
    gravida: '0',
    para: '0',
    miscarriage: '0',
    abortion: '0',
    
    // Control de natalidad (círculos vacíos)
    uses_birth_control: true,
    control_method: 'Pastillas',
    
    // Fasting (página 0)
    fasting: 'N',
    
    // Historia clínica
    history: 'Paciente masculino de 35 años refiere tos seca desde hace 3 días, sin fiebre ni dificultad respiratoria significativa.',
    medical_dx: 'Sin antecedentes médicos relevantes. Niega enfermedades crónicas.',
    surgeries: 'Apendicectomía hace 10 años sin complicaciones.',
    meds: 'Ninguno actualmente',
    
    // Examen físico
    physical_exam: {
      heart: 'Ruidos cardíacos rítmicos',
      lungs: 'Murmullo vesicular bilateral',
      abdomen: 'Blando, no doloroso',
      gyn: 'N/A'
    },
    
    // Impresión y plan
    impression: 'Probable infección respiratoria alta de etiología viral',
    plan: 'Manejo sintomático con reposo e hidratación',
    rx_notes: 'Paracetamol 500mg VO c/8h x 3 días',
    
    // Consulta adicional
    further_consult: 'Other',
    further_consult_other_text: 'Cardiology if needed',
    
    // Proveedor e intérprete
    provider: 'Dr. Roberto García Martínez',
    interpreter: 'María López',
    
    // ============================================
    // PÁGINA 2 - SURGICAL CONSULT SUMMARY
    // ============================================
    surgical_date: new Date().toLocaleDateString('en-US'),
    surgical_history: 'Paciente con antecedente de apendicectomía. Sin complicaciones postoperatorias.',
    
    // Examen físico quirúrgico
    surgical_exam: 'Heart: Normal rhythm without murmurs. Lungs: Clear bilaterally. Abdomen: Soft, non-tender. Extremities: No edema.',
    
    // Impresión, plan y medicamentos quirúrgicos
    surgical_impression: 'Evaluación prequirúrgica - Paciente estable',
    surgical_plan: 'Continuar con evaluación médica rutinaria',
    surgical_meds: 'Panadol',
    
    // Consulta quirúrgica
    surgical_consult: 'Other',
    surgical_consult_other_text: 'Internal Medicine',
    
    // Proveedor e intérprete quirúrgico
    surgical_surgeon: 'Dr. Ana Morales',
    surgical_interpreter: 'Carlos Ruiz',
    
    // Notas quirúrgicas
    surgical_notes: 'No aplica para esta consulta. Paciente no requiere evaluación quirúrgica en este momento.',
    
    // Recetas adjuntas (página 2)
    rx_slips_attached: false
  };

  try {
    console.log('Datos del paciente:');
    console.log('  - Nombre:', datosPaciente.patient_name);
    console.log('  - Edad:', datosPaciente.age);
    console.log('  - Comunidad:', datosPaciente.town);
    console.log('  - Motivo:', datosPaciente.chief_complaint);
    console.log('');

    console.log('Generando PDF...');
    const startTime = Date.now();
    const pdfBuffer = await fillConsultSummaryPDF(datosPaciente);
    const endTime = Date.now();
    
    console.log('PDF generado en', (endTime - startTime) / 1000, 'segundos');
    console.log('Tamaño del archivo:', Math.round(pdfBuffer.length / 1024), 'KB');
    console.log('');

    console.log('Guardando PDF...');
    const filename = `Patient_Consult_${datosPaciente.patient_name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    const filePath = await savePDFToFile(pdfBuffer, filename);
    
    console.log('PDF guardado exitosamente en:');
    console.log('  ', filePath);
    console.log('');
    console.log('Prueba completada! Abre el archivo PDF para verificar el resultado.');
    
  } catch (error) {
    console.error('Error al generar PDF:');
    console.error(error);
    console.error('');
    console.error('Sugerencias:');
    console.error('  1. Verifica que existe el archivo "Patient Consult Summary.pdf" en la raiz del proyecto');
    console.error('  2. Verifica que pdf-lib esta instalado: npm install pdf-lib');
    console.error('  3. Revisa los logs arriba para mas detalles del error');
  }
}

testPDF();
