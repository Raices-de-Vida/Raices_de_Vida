const fs = require('fs').promises;
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const fieldsMap = require('../config/pdfFieldsMap.json');

async function fillConsultSummaryPDF(datosPaciente) {
  try {
    const templatePath = path.join(__dirname, '../../..', 'Patient Consult Summary.pdf');
    const existingPdfBytes = await fs.readFile(templatePath);
    
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const pages = pdfDoc.getPages();
    
    let fieldCount = 0;
    let checkboxCount = 0;
    let textCount = 0;
    
    for (const [fieldKey, fieldConfig] of Object.entries(fieldsMap)) {
      const pageIndex = fieldConfig.page || 0;
      const page = pages[pageIndex];
      
      if (!page) {
        console.warn(`Pagina ${pageIndex} no existe para campo: ${fieldKey}`);
        continue;
      }
      
      const value = extractValueByKey(datosPaciente, fieldKey);
      
      if (value === null || value === undefined || value === '') {
        continue;
      }
      
      if (fieldConfig.type === 'checkbox') {
        drawCheckbox(page, fieldConfig, value, helveticaBold);
        checkboxCount++;
      } else {
        drawTextInBox(page, value, fieldConfig, helveticaFont, helveticaBold);
        textCount++;
      }
      
      fieldCount++;
    }
    
    const pdfBytes = await pdfDoc.save();
    
    console.log(`Procesados ${fieldCount} campos (${textCount} textos, ${checkboxCount} checkboxes)`);
    console.log(`PDF generado: ${Math.round(pdfBytes.length / 1024)} KB`);
    
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
}

function extractValueByKey(data, key) {
  const mappings = {
    'date': data.date,
    'language': data.language,
    'patient_name': data.patient_name,
    'phone': data.phone,
    'town': data.town,
    'dob': data.dob,
    'age': data.age,
    'gender_m': (data.gender === 'M' || data.gender === 'Male') ? true : false,
    'gender_f': (data.gender === 'F' || data.gender === 'Female') ? true : false,
    
    // Consult Type con texto para "Other"
    'consult_diabetes': data.consult_type?.toLowerCase().includes('diabetes') || false,
    'consult_htn': data.consult_type?.toLowerCase().includes('htn') || false,
    'consult_respiratory': data.consult_type?.toLowerCase().includes('respiratory') || false,
    'consult_other': data.consult_type?.toLowerCase().includes('other') || false,
    'consult_other_text': data.consult_other_text || '',
    
    'chief_complaint': data.chief_complaint,
    'vitals_bp': data.vitals?.bp,
    'vitals_hr': data.vitals?.hr,
    'vitals_spo2': data.vitals?.spo2,
    'vitals_bs': data.vitals?.bs,
    'vitals_weight': data.vitals?.weight,
    'vitals_height': data.vitals?.height,
    'vitals_temp': data.vitals?.temp,
    
    // Allergies con checkbox NKA
    'allergies_nka': (!data.allergies || data.allergies === 'NKA' || data.allergies === 'N/A') ? true : false,
    'allergies': (data.allergies && data.allergies !== 'NKA' && data.allergies !== 'N/A') ? data.allergies : '',
    
    'vitamins': data.vitamins,
    'albendazole': data.albendazole,
    
    // Current: tobacco, alcohol, drugs con círculos Y/N + texto para detalles
    'current_tobacco_yes': (data.current?.tobacco === 'Y' || data.current?.tobacco === 'Yes') ? true : false,
    'current_tobacco_no': (data.current?.tobacco === 'N' || data.current?.tobacco === 'No') ? true : false,
    'current_tobacco_details': data.current?.tobacco_details || '',
    'current_alcohol_yes': (data.current?.alcohol === 'Y' || data.current?.alcohol === 'Yes') ? true : false,
    'current_alcohol_no': (data.current?.alcohol === 'N' || data.current?.alcohol === 'No') ? true : false,
    'current_alcohol_details': data.current?.alcohol_details || '',
    'current_drugs_yes': (data.current?.drugs === 'Y' || data.current?.drugs === 'Yes') ? true : false,
    'current_drugs_no': (data.current?.drugs === 'N' || data.current?.drugs === 'No') ? true : false,
    'current_drugs_details': data.current?.drugs_details || '',
    
    // Past: tobacco, alcohol, drugs con círculos Y/N + texto para detalles
    'past_tobacco_yes': (data.past?.tobacco === 'Y' || data.past?.tobacco === 'Yes') ? true : false,
    'past_tobacco_no': (data.past?.tobacco === 'N' || data.past?.tobacco === 'No') ? true : false,
    'past_tobacco_details': data.past?.tobacco_details || '',
    'past_alcohol_yes': (data.past?.alcohol === 'Y' || data.past?.alcohol === 'Yes') ? true : false,
    'past_alcohol_no': (data.past?.alcohol === 'N' || data.past?.alcohol === 'No') ? true : false,
    'past_alcohol_details': data.past?.alcohol_details || '',
    'past_drugs_yes': (data.past?.drugs === 'Y' || data.past?.drugs === 'Yes') ? true : false,
    'past_drugs_no': (data.past?.drugs === 'N' || data.past?.drugs === 'No') ? true : false,
    'past_drugs_details': data.past?.drugs_details || '',
    
    'lmp': data.lmp,
    // Menopause - solo 1 checkbox: Yes = X, No = null
    'menopause': (data.menopause === 'Yes' || data.menopause === 'Y' || data.menopause === true) ? true : false,
    
    'gravida': data.gravida,
    'para': data.para,
    'miscarriage': data.miscarriage,
    'abortion': data.abortion,
    
    // Control Method con checkboxes N/Y
    'control_method_yes': data.uses_birth_control ? true : false,
    'control_method_no': !data.uses_birth_control ? true : false,
    'control_method': data.control_method && data.control_method !== 'None' && data.control_method !== 'Ninguno' ? data.control_method : '',
    
    'history': data.history,
    'medical_dx': data.medical_dx,
    'surgeries': data.surgeries,
    'meds': data.meds,
    'physical_exam_heart': data.physical_exam?.heart,
    'physical_exam_lungs': data.physical_exam?.lungs,
    'physical_exam_abdomen': data.physical_exam?.abdomen,
    'physical_exam_gyn': data.physical_exam?.gyn,
    'impression': data.impression,
    'plan': data.plan,
    'rx_notes': data.rx_notes,
    
    // Further Consult con texto para "Other"
    'further_consult_gensurg': data.further_consult?.toLowerCase().includes('gen') || false,
    'further_consult_gyn': data.further_consult?.toLowerCase().includes('gyn') || false,
    'further_consult_other': data.further_consult?.toLowerCase().includes('other') || false,
    'further_consult_other_text': data.further_consult_other_text || '',
    
    'provider': data.provider,
    'interpreter': data.interpreter,
    
    // Página 2 - Surgical Consult Summary (nuevos campos)
    'surgical_date': data.surgical_date || '',
    'surgical_history': data.surgical_history || '',
    'surgical_exam': data.surgical_exam || '',
    'surgical_impression': data.surgical_impression || '',
    'surgical_plan': data.surgical_plan || '',
    'surgical_meds': data.surgical_meds || '',
    'surgical_consult_gensurg': data.surgical_consult?.toLowerCase().includes('gen') || false,
    'surgical_consult_gyn': data.surgical_consult?.toLowerCase().includes('gyn') || false,
    'surgical_consult_other': data.surgical_consult?.toLowerCase().includes('other') || false,
    'surgical_consult_other_text': data.surgical_consult_other_text || '',
    'surgical_surgeon': data.surgical_surgeon || '',
    'surgical_interpreter': data.surgical_interpreter || '',
    'surgical_notes': data.surgical_notes,
    
    // Checkboxes con círculos (página 0 - primera hoja)
    'fasting_yes': (data.fasting === 'Y' || data.fasting === 'Yes') ? true : false,
    'fasting_no': (data.fasting === 'N' || data.fasting === 'No') ? true : false,
    
    // Taken med - separado para BP y BS
    'taken_med_bp_yes': (data.taken_med_bp === 'Y' || data.taken_med_bp === 'Yes') ? true : false,
    'taken_med_bp_no': (data.taken_med_bp === 'N' || data.taken_med_bp === 'No') ? true : false,
    'taken_med_bs_yes': (data.taken_med_bs === 'Y' || data.taken_med_bs === 'Yes') ? true : false,
    'taken_med_bs_no': (data.taken_med_bs === 'N' || data.taken_med_bs === 'No') ? true : false,
    
    'rx_slips_attached_yes': data.rx_slips_attached ? true : false,
    'rx_slips_attached_no': !data.rx_slips_attached ? true : false,
  };
  
  return mappings[key];
}

function drawTextInBox(page, text, config, font, boldFont) {
  if (!text || text === 'N/A') return;
  
  const { 
    x, y, width, height, 
    fontSize = 10, 
    maxLines = 1, 
    maxChars = null,
    lineHeight = 1.2,
    align = 'left', 
    wrap = false, 
    rotate = 0 
  } = config;
  
  const { height: pageHeight, width: pageWidth } = page.getSize();
  const yPosition = pageHeight - y;
  
  // Aplicar restricción de caracteres
  let textToDraw = String(text);
  if (maxChars && textToDraw.length > maxChars) {
    textToDraw = textToDraw.substring(0, maxChars - 3) + '...';
  }
  
  // NO reducir fontSize - mantener tamaño fijo
  const currentFontSize = fontSize;
  
  let lines = [];
  if (wrap) {
    lines = wrapText(textToDraw, font, currentFontSize, width);
  } else {
    lines = [textToDraw];
  }
  
  // Limitar al número máximo de líneas
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      const maxWidth = width - font.widthOfTextAtSize('...', currentFontSize);
      let truncated = lastLine;
      
      while (font.widthOfTextAtSize(truncated, currentFontSize) > maxWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      
      lines[lines.length - 1] = truncated + '...';
    }
  }
  
  // Calcular interlineado
  const actualLineHeight = currentFontSize * lineHeight;
  
  lines.forEach((line, index) => {
    const lineY = yPosition - (index * actualLineHeight);
    
    let lineX = x;
    if (align === 'center') {
      const lineWidth = font.widthOfTextAtSize(line, currentFontSize);
      lineX = x + (width - lineWidth) / 2;
    } else if (align === 'right') {
      const lineWidth = font.widthOfTextAtSize(line, currentFontSize);
      lineX = x + width - lineWidth;
    }
    
    try {
      if (rotate === 180) {
        page.drawText(line, {
          x: pageWidth - lineX,
          y: pageHeight - lineY,
          size: currentFontSize,
          font,
          color: rgb(0, 0, 0),
          rotate: { type: 'degrees', angle: 180 },
        });
      } else {
        page.drawText(line, {
          x: lineX,
          y: lineY,
          size: currentFontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }
    } catch (error) {
      console.error(`Error dibujando texto en (${lineX}, ${lineY}):`, error.message);
    }
  });
}

function wrapText(text, font, size, maxWidth) {
  const paragraphs = text.split('\n');
  const lines = [];
  
  paragraphs.forEach(paragraph => {
    const words = paragraph.split(' ');
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      
      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
  });
  
  return lines;
}

function drawCheckbox(page, config, checked, font) {
  if (!checked) return;
  
  const { x, y, width = 12, height = 12, rotate = 0, style = 'x' } = config;
  const { height: pageHeight, width: pageWidth } = page.getSize();
  
  const yPosition = pageHeight - y;
  
  try {
    if (style === 'circle') {
      // Dibujar círculo VACÍO con bordes delgados (no relleno)
      const centerX = x + (width / 2);
      const centerY = yPosition - (height / 2);
      const radius = Math.min(width, height) * 0.35;
      
      if (rotate === 180) {
        page.drawCircle({
          x: pageWidth - centerX,
          y: pageHeight - centerY,
          size: radius,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
          opacity: 1,
        });
      } else {
        page.drawCircle({
          x: centerX,
          y: centerY,
          size: radius,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
          opacity: 1,
        });
      }
    } else {
      // Dibujar X (comportamiento por defecto)
      const checkSize = Math.min(width, height) * 0.8;
      const checkX = x + (width - font.widthOfTextAtSize('X', checkSize)) / 2;
      const checkY = yPosition - (height / 2) - (checkSize / 4);
      
      if (rotate === 180) {
        page.drawText('X', {
          x: pageWidth - checkX,
          y: pageHeight - checkY,
          size: checkSize,
          font,
          color: rgb(0, 0, 0),
          rotate: { type: 'degrees', angle: 180 },
        });
      } else {
        page.drawText('X', {
          x: checkX,
          y: checkY,
          size: checkSize,
          font,
          color: rgb(0, 0, 0),
        });
      }
    }
  } catch (error) {
    console.error(`Error dibujando checkbox en (${x}, ${y}):`, error.message);
  }
}

async function savePDFToFile(pdfBuffer, filename = 'Patient_Consult_Filled.pdf') {
  const exportsDir = path.join(__dirname, '../../exports');
  
  try {
    await fs.access(exportsDir);
  } catch {
    await fs.mkdir(exportsDir, { recursive: true });
  }
  
  const filePath = path.join(exportsDir, filename);
  await fs.writeFile(filePath, pdfBuffer);
  
  return filePath;
}

module.exports = {
  fillConsultSummaryPDF,
  savePDFToFile,
};
