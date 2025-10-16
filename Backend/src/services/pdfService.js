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
    
    console.log('DEBUG: Primeros 3 campos del mapa:');
    const firstThree = Object.entries(fieldsMap).slice(0, 3);
    firstThree.forEach(([key, config]) => {
      console.log(`  ${key}: x=${config.x}, y=${config.y}, page=${config.page}`);
    });
    
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
    'consult_diabetes': data.consult_type?.toLowerCase().includes('diabetes') || false,
    'consult_htn': data.consult_type?.toLowerCase().includes('htn') || false,
    'consult_respiratory': data.consult_type?.toLowerCase().includes('respiratory') || false,
    'consult_other': data.consult_type?.toLowerCase().includes('other') || false,
    'chief_complaint': data.chief_complaint,
    'vitals_bp': data.vitals?.bp,
    'vitals_hr': data.vitals?.hr,
    'vitals_spo2': data.vitals?.spo2,
    'vitals_bs': data.vitals?.bs,
    'vitals_weight': data.vitals?.weight,
    'vitals_height': data.vitals?.height,
    'vitals_temp': data.vitals?.temp,
    'allergies': data.allergies,
    'vitamins': data.vitamins,
    'albendazole': data.albendazole,
    'current_tobacco': data.current?.tobacco,
    'current_alcohol': data.current?.alcohol,
    'current_drugs': data.current?.drugs,
    'past_tobacco': data.past?.tobacco,
    'past_alcohol': data.past?.alcohol,
    'past_drugs': data.past?.drugs,
    'lmp': data.lmp,
    'menopause': data.menopause,
    'gravida': data.gravida,
    'para': data.para,
    'miscarriage': data.miscarriage,
    'abortion': data.abortion,
    'control_method': data.control_method,
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
    'further_consult_gensurg': data.further_consult?.toLowerCase().includes('gen') || false,
    'further_consult_gyn': data.further_consult?.toLowerCase().includes('gyn') || false,
    'further_consult_other': data.further_consult?.toLowerCase().includes('other') || false,
    'provider': data.provider,
    'interpreter': data.interpreter,
    'surgical_notes': data.surgical_notes,
    'fasting_yes': (data.fasting === 'Y' || data.fasting === 'Yes') ? true : false,
    'fasting_no': (data.fasting === 'N' || data.fasting === 'No') ? true : false,
    'taken_med_yes': (data.taken_med === 'Y' || data.taken_med === 'Yes') ? true : false,
    'taken_med_no': (data.taken_med === 'N' || data.taken_med === 'No') ? true : false,
    'rx_slips_attached': data.rx_slips_attached || false,
  };
  
  return mappings[key];
}

function drawTextInBox(page, text, config, font, boldFont) {
  if (!text || text === 'N/A') return;
  
  const { x, y, width, height, fontSize = 10, maxLines = 1, align = 'left', wrap = false, rotate = 0 } = config;
  const { height: pageHeight, width: pageWidth } = page.getSize();
  
  const yPosition = pageHeight - y;
  
  if (text === new Date().toLocaleDateString('en-US') || text.includes('Juan')) {
    console.log(`DEBUG drawText: texto="${text.substring(0, 20)}", x=${x}, y_original=${y}, y_convertido=${yPosition}, pageHeight=${pageHeight}`);
  }
  
  let textToDraw = String(text);
  let currentFontSize = fontSize;
  const minFontSize = 6;
  
  let lines = [];
  let fitsInBox = false;
  
  while (currentFontSize >= minFontSize && !fitsInBox) {
    if (wrap) {
      lines = wrapText(textToDraw, font, currentFontSize, width);
    } else {
      lines = [textToDraw];
    }
    
    const totalHeight = lines.length * (currentFontSize + 2);
    
    if (lines.length <= maxLines && totalHeight <= height) {
      fitsInBox = true;
    } else {
      currentFontSize -= 0.5;
    }
  }
  
  if (!fitsInBox || lines.length > maxLines) {
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
  
  const actualLineHeight = currentFontSize + 2;
  
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
  
  if (lines.length > maxLines || currentFontSize < fontSize * 0.7) {
    console.log(`Campo ajustado: tamaño ${fontSize}->${currentFontSize.toFixed(1)}, ${lines.length}/${maxLines} lineas`);
  }
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
  
  const { x, y, width = 12, height = 12, rotate = 0 } = config;
  const { height: pageHeight, width: pageWidth } = page.getSize();
  
  const yPosition = pageHeight - y;
  
  const checkSize = Math.min(width, height) * 0.8;
  const checkX = x + (width - font.widthOfTextAtSize('X', checkSize)) / 2;
  const checkY = yPosition - (height / 2) - (checkSize / 4);
  
  try {
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
  } catch (error) {
    console.error(`Error dibujando checkbox en (${checkX}, ${checkY}):`, error.message);
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
