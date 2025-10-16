const { fillConsultSummaryPDF, savePDFToFile } = require('./src/services/pdfService');

async function testPDF() {
  console.log('Sistema de Exportacion PDF - Raices de Vida');
  console.log('================================================\n');

  const datosPaciente = {
    date: new Date().toLocaleDateString('en-US'),
    language: 'Spanish',
    patient_name: 'Juan Pérez González',
    phone: '555-1234',
    town: 'Sumpango',
    dob: '05/15/1990',
    age: '35 años',
    gender: 'M',
    
    consult_type: 'Respiratory',
    chief_complaint: 'Tos persistente desde hace 3 días con malestar general',
    
    vitals: {
      bp: '120 / 80',
      hr: '75',
      spo2: '98%',
      bs: '95',
      weight: '70 kg',
      height: '170 cm',
      temp: '36.8°C'
    },
    
    allergies: 'Penicilina',
    vitamins: '2',
    albendazole: '1',
    
    current: {
      tobacco: 'N',
      alcohol: 'N',
      drugs: 'N'
    },
    
    past: {
      tobacco: 'Y',
      alcohol: 'N',
      drugs: 'N'
    },
    
    lmp: '09/15/2025',
    menopause: 'No',
    gravida: '0',
    para: '0',
    miscarriage: '0',
    abortion: '0',
    control_method: 'None',
    
    history: 'Paciente masculino de 35 años refiere tos seca desde hace 3 días, sin fiebre ni dificultad respiratoria significativa. Niega contacto con personas enfermas.',
    medical_dx: 'Sin antecedentes médicos relevantes. Niega enfermedades crónicas.',
    surgeries: 'Apendicectomía hace 10 años sin complicaciones.',
    meds: 'Ninguno actualmente',
    
    physical_exam: {
      heart: 'Ruidos cardíacos rítmicos, sin soplos audibles',
      lungs: 'Murmullo vesicular presente bilateralmente, sin estertores ni sibilancias',
      abdomen: 'Blando, no doloroso, sin masas palpables',
      gyn: 'N/A'
    },
    
    impression: 'Probable infección respiratoria alta de etiología viral',
    plan: 'Manejo sintomático con reposo, hidratación abundante y antipiréticos según necesidad. Control médico en 3 días si persisten los síntomas o aparece fiebre.',
    rx_notes: 'Paracetamol 500mg VO cada 8 horas por 3 días si hay dolor o fiebre',
    
    further_consult: '',
    provider: 'Dr. Roberto García Martínez',
    interpreter: 'María López',
    
    //Página 2
    surgical_notes: 'No aplica para esta consulta. Paciente no requiere evaluación quirúrgica.',
    fasting: 'N',
    taken_med: 'N',
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
