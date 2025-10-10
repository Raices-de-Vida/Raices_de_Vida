-- SE DEBEN INSERTAR LOS DATOS UNO POR UNO PARA QUE EL SERIAL NO SEA ESCALABLE



INSERT INTO "Comunidades" (nombre_comunidad, codigo_ine, departamento, municipio, numero_familias, grupo_etnico, tipo_comunidad, fecha_registro, estado, comentarios, proyectos_en_comunidad, recursos_disponibles, necesidades_comunidad, coordenadas_gps) VALUES
('San Pedro La Laguna', 'SP001', 'Sololá', 'San Pedro', 120, 'Maya-Tzutujil', 'Rural', '2023-01-15', TRUE, 'Comunidad a orillas del lago Atitlán', 'Agricultura sostenible, Educación', 'Escuela primaria, Centro de salud', 'Acceso a agua potable, Mejoras en infraestructura', '14.6917° N, 91.2722° W'),
('Santa Clara', 'SC002', 'Sololá', 'Santa Clara La Laguna', 85, 'Maya-Kaqchikel', 'Rural', '2023-02-01', TRUE, 'Comunidad de artesanos', 'Artesanía, Turismo', 'Cooperativa artesanal', 'Capacitación técnica, Acceso a mercados', '14.7142° N, 91.3036° W'),
('Nuevo Amanecer', 'NA003', 'Alta Verapaz', 'Cobán', 65, 'Maya-Q''eqchi', 'Rural', '2023-02-10', TRUE, 'Comunidad agrícola', 'Cultivo de café, Reforestación', 'Tierra fértil, Bosque', 'Sistemas de riego, Carreteras', '15.4722° N, 90.3889° W'),
('Las Flores', 'LF004', 'Quetzaltenango', 'Quetzaltenango', 95, 'Maya-Kiche', 'Semirural', '2023-03-05', TRUE, 'Periferia urbana', 'Educación, Reciclaje', 'Escuela secundaria', 'Mejora en tratamiento de aguas', '14.8333° N, 91.5167° W'),
('El Progreso', 'EP005', 'Chimaltenango', 'Chimaltenango', 110, 'Maya-Kaqchikel', 'Urbana', '2023-03-20', TRUE, 'Comunidad en crecimiento', 'Microempresas, Salud', 'Centro comunitario', 'Empleo, Salud preventiva', '14.6611° N, 90.8194° W'),
('Nueva Esperanza', 'NE006', 'Huehuetenango', 'La Democracia', 75, 'Maya-Mam', 'Rural', '2023-04-10', TRUE, 'Zona fronteriza', 'Seguridad alimentaria', 'Agua de manantial', 'Nutrición, Vivienda', '15.6300° N, 91.8600° W'),
('Valle Verde', 'VV007', 'Sacatepéquez', 'Antigua Guatemala', 55, 'Mestizo', 'Rural', '2023-05-01', TRUE, 'Productores de café', 'Café orgánico', 'Tierra para cultivo', 'Tecnificación agrícola', '14.5586° N, 90.7295° W'),
('San Antonio', 'SA008', 'Totonicapán', 'Totonicapán', 90, 'Maya-Kiche', 'Rural', '2023-05-15', TRUE, 'Tradición textil', 'Textiles, Educación bilingüe', 'Taller comunitario', 'Mercado para productos, Educación', '14.9117° N, 91.3653° W'),
('Buena Vista', 'BV009', 'Petén', 'San Benito', 40, 'Maya-Itzá', 'Rural', '2023-06-10', TRUE, 'Cercana a reservas naturales', 'Ecoturismo, Conservación', 'Biodiversidad', 'Infraestructura turística', '16.9167° N, 89.9000° W'),
('Santa Rosa', 'SR010', 'Izabal', 'Puerto Barrios', 70, 'Garífuna', 'Costera', '2023-07-01', TRUE, 'Comunidad pesquera', 'Pesca sostenible, Cultura', 'Acceso al mar', 'Procesamiento de pescado, Educación', '15.7272° N, 88.5932° W');

-- Insertar 10 datos en tabla ONGs
INSERT INTO "ONGs" (nombre_ong, direccion, telefono, email, representante, tipo_ong, fecha_fundacion, mision, vision, estado, fecha_registro, sitio_web, comentarios, id_comunidad) VALUES
('Semillas de Esperanza', 'Zona 10, Ciudad de Guatemala', '50241234567', 'contacto@semillasdeesperanza.org', 'María González', 'Nutrición', '2010-05-12', 'Combatir la desnutrición infantil', 'Un país sin desnutrición infantil', TRUE, '2023-01-10', 'www.semillasdeesperanza.org', 'Enfoque en primeros 1000 días de vida', 1),
('Educación para Todos', '4a Calle, Zona 1, Quetzaltenango', '50255667788', 'info@educacionparatodos.org', 'Carlos Méndez', 'Educación', '2008-03-15', 'Acceso universal a educación de calidad', 'Comunidades autosuficientes a través de la educación', TRUE, '2023-01-20', 'www.educacionparatodos.org', 'Programas de alfabetización y formación técnica', 4),
('Salud sin Fronteras', 'Avenida Reforma, Zona 9, Guatemala', '50278901234', 'contacto@saludsinfronteras.org', 'Ana Luisa Pérez', 'Salud', '2012-08-10', 'Atención médica para comunidades rurales', 'Servicios de salud accesibles para todos', TRUE, '2023-02-05', 'www.saludsinfronteras.org', 'Brigadas médicas mensuales', 3),
('Agua Limpia', '2a Avenida, Zona 2, Antigua Guatemala', '50245678901', 'info@agualimpia.org', 'Roberto Cifuentes', 'Otro', '2015-04-23', 'Acceso a agua potable', 'Comunidades con infraestructura hídrica sostenible', TRUE, '2023-02-15', 'www.agualimpia.org', 'Especialistas en sistemas de purificación', 7),
('Manos que Construyen', 'Calzada Roosevelt, Zona 7, Guatemala', '50256789012', 'contacto@manosqueconstruyen.org', 'Lucía Ramírez', 'Otro', '2011-11-05', 'Vivienda digna para familias vulnerables', 'Eliminar viviendas precarias en Guatemala', TRUE, '2023-03-01', 'www.manosqueconstruyen.org', 'Construcción con materiales locales', 5),
('Nutrición y Vida', 'Barrio El Centro, Cobán', '50267890123', 'info@nutricionyvida.org', 'Francisco López', 'Nutrición', '2014-07-18', 'Mejorar condiciones nutricionales', 'Erradicar la desnutrición crónica', TRUE, '2023-03-10', 'www.nutricionyvida.org', 'Programas de monitoreo nutricional', 3),
('Senderos de Aprendizaje', '5a Calle, Zona 3, Guatemala', '50234567890', 'contacto@senderosdeaprendizaje.org', 'Marta Jiménez', 'Educación', '2013-02-28', 'Educación integral para comunidades indígenas', 'Preservación cultural y desarrollo educativo', TRUE, '2023-04-01', 'www.senderosdeaprendizaje.org', 'Materiales educativos bilingües', 8),
('Médicos Comunitarios', 'Centro de Totonicapán', '50289012345', 'info@medicoscomunitarios.org', 'Julio Hernández', 'Salud', '2009-09-12', 'Salud preventiva en comunidades indígenas', 'Comunidades saludables y autosuficientes', TRUE, '2023-04-15', 'www.medicoscomunitarios.org', 'Formación de promotores locales de salud', 8),
('Futuro Verde', 'Zona 4, Puerto Barrios', '50290123456', 'contacto@futuroverde.org', 'Elena Castro', 'Otro', '2016-01-30', 'Protección ambiental y desarrollo sostenible', 'Comunidades en armonía con su entorno natural', TRUE, '2023-05-01', 'www.futuroverde.org', 'Programas de reforestación y educación ambiental', 10),
('Cultura y Desarrollo', 'Calzada San Juan, Zona 7, Guatemala', '50201234567', 'info@culturadesarrollo.org', 'Miguel Ordóñez', 'Educación', '2010-10-15', 'Preservación cultural como motor de desarrollo', 'Comunidades que valoran y preservan su identidad', TRUE, '2023-05-10', 'www.culturadesarrollo.org', 'Talleres de arte y cultura tradicional', 2);

-- Insertar 10 datos en tabla Familias
INSERT INTO "Familias" (nombre_esposo, nombre_esposa, dpi_esposo, dpi_esposa, fecha_nacimiento_esposo, fecha_nacimiento_esposa, embarazada, hijos_0_2, hijos_2_5, hijos_6_17, area_siembra_maiz, rendimiento_maiz, area_siembra_frijol, rendimiento_frijol, id_comunidad) VALUES
('Juan Pérez', 'María Gómez', '1234567890123', '2345678901234', '1980-05-15', '1982-08-20', FALSE, 0, 1, 2, 1.5, 2500, 0.5, 800, 1),
('Pedro López', 'Luisa Hernández', '3456789012345', '4567890123456', '1975-11-10', '1978-04-25', TRUE, 1, 0, 3, 2.0, 3000, 0.8, 900, 1),
('Carlos Ramírez', 'Ana Sánchez', '5678901234567', '6789012345678', '1985-02-28', '1987-09-12', FALSE, 1, 1, 1, 1.2, 2200, 0.4, 700, 2),
('Roberto Castro', 'Marta Jiménez', '7890123456789', '8901234567890', '1973-07-05', '1976-12-18', FALSE, 0, 0, 4, 2.5, 3500, 1.0, 1200, 3),
('Francisco Méndez', 'Laura Torres', '9012345678901', '0123456789012', '1982-09-30', '1984-03-22', TRUE, 1, 1, 0, 1.0, 2000, 0.3, 600, 4),
('Miguel Ordóñez', 'Carmen Salazar', '1122334455667', '2233445566778', '1979-04-12', '1981-10-05', FALSE, 0, 2, 1, 1.8, 2800, 0.7, 950, 5),
('Luis Morales', 'Rosa Cruz', '3344556677889', '4455667788990', '1970-08-18', '1972-05-27', FALSE, 0, 0, 2, 3.0, 4000, 1.2, 1500, 6),
('Antonio Díaz', 'Julia García', '5566778899001', '6677889900112', '1984-01-25', '1986-06-14', TRUE, 1, 0, 1, 1.3, 2300, 0.5, 850, 7),
('Javier Vásquez', 'Elena Pérez', '7788990011223', '8899001122334', '1977-12-08', '1980-07-31', FALSE, 0, 1, 3, 2.2, 3200, 0.9, 1100, 8),
('Ernesto Guzmán', 'Patricia Flores', '9900112233445', '0011223344556', '1983-03-17', '1985-11-09', FALSE, 1, 1, 0, 1.5, 2600, 0.6, 900, 9),
('Fernando Reyes', 'Isabel Navarro', '1212343456567', '2323454567678', '1975-06-22', '1978-02-14', TRUE, 0, 1, 2, 2.0, 3100, 0.8, 1000, 10),
('Ricardo Aguilar', 'Silvia Castro', '3434565678789', '4545676789890', '1981-10-11', '1983-04-29', FALSE, 1, 0, 1, 1.7, 2700, 0.7, 950, 1),
('Alejandro Paz', 'Teresa López', '5656787890901', '6767898901012', '1972-09-08', '1975-12-03', FALSE, 0, 0, 3, 2.8, 3800, 1.1, 1400, 2);

-- Insertar 10 datos en tabla Ninos
INSERT INTO "Ninos" (id_familia, nombre, fecha_nacimiento, genero, peso, talla, estado_nutricional, fecha_evaluacion, alergias, observaciones, estado) VALUES
(14, 'Ana Pérez Gómez', '2019-03-15', 'F', 12.5, 0.85, 'Normal', '2023-06-15', 'Ninguna', 'Desarrollo normal', TRUE),
(15, 'Luis Pérez Gómez', '2012-07-10', 'M', 35.0, 1.40, 'Normal', '2023-06-15', 'Ninguna', 'Activo y saludable', TRUE),
(16, 'Sara Pérez Gómez', '2009-11-22', 'F', 42.3, 1.52, 'Normal', '2023-06-15', 'Polen', 'Rendimiento escolar muy bueno', TRUE),
(20, 'Mario López Hernández', '2022-01-05', 'M', 9.2, 0.72, 'Desnutrición Leve', '2023-06-18', 'Lactosa', 'Necesita seguimiento nutricional', TRUE),
(20, 'Elena López Hernández', '2014-04-12', 'F', 32.1, 1.38, 'Normal', '2023-06-18', 'Ninguna', 'Buena salud general', TRUE),
(20, 'Pedro López Hernández', '2011-08-30', 'M', 34.5, 1.41, 'Normal', '2023-06-18', 'Ninguna', 'Deportista', TRUE),
(20, 'Rosa López Hernández', '2008-05-18', 'F', 45.2, 1.58, 'Normal', '2023-06-18', 'Ninguna', 'Excelente rendimiento escolar', TRUE),
(20, 'Miguel Ramírez Sánchez', '2022-04-10', 'M', 8.5, 0.70, 'Desnutrición Leve', '2023-06-20', 'Ninguna', 'Bajo peso al nacer', TRUE),
(21, 'Sofía Ramírez Sánchez', '2020-09-25', 'F', 10.8, 0.80, 'Normal', '2023-06-20', 'Ninguna', 'Desarrollo normal', TRUE)

-- Insertar 10 datos en tabla Voluntarios
INSERT INTO "Voluntarios" (nombre, apellido, dpi, fecha_nacimiento, telefono, email, direccion, experiencia, disponibilidad, tipo_voluntario, institucion, fecha_registro, estado, comentarios, habilidades) VALUES
('José', 'Gutiérrez', '1111222233334', '1990-04-15', '50298765432', 'jose.gutierrez@email.com', 'Zona 10, Guatemala Ciudad', '5 años en proyectos comunitarios', 'Alta', 'Médico', 'Hospital San Juan', '2023-01-05', TRUE, 'Especialista en pediatría', 'Atención médica, Capacitación en salud'),
('María', 'Rodríguez', '2222333344445', '1985-08-22', '50287654321', 'maria.rodriguez@email.com', 'Zona 1, Quetzaltenango', '8 años en educación rural', 'Media', 'Profesor', 'Universidad San Carlos', '2023-01-10', TRUE, 'Experta en educación bilingüe', 'Enseñanza, Desarrollo de materiales educativos'),
('Roberto', 'Fernández', '3333444455556', '1992-03-11', '50276543210', 'roberto.fernandez@email.com', 'Zona 4, Guatemala Ciudad', '3 años en agricultura sostenible', 'Media', 'Agrónomo', 'Ministerio de Agricultura', '2023-01-15', TRUE, 'Especialista en cultivos tradicionales', 'Técnicas agrícolas, Sistemas de riego'),
('Laura', 'Santos', '4444555566667', '1988-11-28', '50265432109', 'laura.santos@email.com', 'Zona 2, Antigua Guatemala', '6 años en nutrición comunitaria', 'Alta', 'Nutricionista', 'Centro de Salud Pública', '2023-02-01', TRUE, 'Experiencia en combate a desnutrición', 'Evaluación nutricional, Diseño de dietas'),
('Carlos', 'Mendoza', '5555666677778', '1995-05-17', '50254321098', 'carlos.mendoza@email.com', 'Zona 1, Cobán', '2 años en logística', 'Baja', 'Logística', 'Empresa Privada', '2023-02-10', TRUE, 'Disponible fines de semana', 'Organización de distribución, Inventario'),
('Ana', 'López', '6666777788889', '1990-09-08', '50243210987', 'ana.lopez@email.com', 'Zona 6, Guatemala Ciudad', '4 años en trabajo social', 'Alta', 'Trabajador Social', 'ONG Internacional', '2023-02-20', TRUE, 'Experiencia en intervención familiar', 'Evaluación socioeconómica, Mediación'),
('Miguel', 'Torres', '7777888899990', '1987-01-25', '50232109876', 'miguel.torres@email.com', 'Zona 3, Quetzaltenango', '7 años en psicología infantil', 'Media', 'Psicólogo', 'Clínica Privada', '2023-03-05', TRUE, 'Especialista en trauma infantil', 'Terapia, Evaluación psicológica'),
('Luisa', 'Herrera', '8888999900001', '1993-07-14', '50221098765', 'luisa.herrera@email.com', 'Zona 5, Guatemala Ciudad', '3 años en enfermería', 'Alta', 'Enfermera', 'Hospital General', '2023-03-15', TRUE, 'Experiencia en brigadas médicas', 'Primeros auxilios, Vacunación'),
('Pedro', 'Gálvez', '9999000011112', '1986-12-03', '50210987654', 'pedro.galvez@email.com', 'Zona 1, Totonicapán', '9 años en ingeniería civil', 'Baja', 'Ingeniero', 'Constructora Nacional', '2023-04-01', TRUE, 'Especialista en infraestructura rural', 'Diseño de proyectos, Supervisión de obras'),
('Sofía', 'Montero', '0000111122223', '1991-06-19', '50209876543', 'sofia.montero@email.com', 'Zona 2, Puerto Barrios', '5 años en educación ambiental', 'Media', 'Ambientalista', 'Organización Ecológica', '2023-04-15', TRUE, 'Experta en conservación costera', 'Educación ambiental, Gestión de residuos');

-- Insertar 10 datos en tabla Usuarios
INSERT INTO "Usuarios" (nombre, apellido, email, password, rol, fecha_registro, ultimo_acceso, estado, id_referencia, tipo_referencia) VALUES
('María', 'González', 'maria@semillasdeesperanza.org', 'hash_password_123', 'ONG', '2023-01-12', '2023-07-20 14:30:00', TRUE, 1, 'ONG'),
('Carlos', 'Méndez', 'carlos@educacionparatodos.org', 'hash_password_456', 'ONG', '2023-01-22', '2023-07-22 09:15:00', TRUE, 2, 'ONG'),
('José', 'Gutiérrez', 'jose.gutierrez@email.com', 'hash_password_789', 'Voluntario', '2023-01-07', '2023-07-21 16:45:00', TRUE, 1, 'Voluntario'),
('María', 'Rodríguez', 'maria.rodriguez@email.com', 'hash_password_012', 'Voluntario', '2023-01-12', '2023-07-23 10:20:00', TRUE, 2, 'Voluntario'),
('Juan', 'Pérez', 'juan.perez@comunidad.org', 'hash_password_345', 'Lider Comunitario', '2023-01-20', '2023-07-19 11:30:00', TRUE, 1, 'Comunidad'),
('Pedro', 'López', 'pedro.lopez@comunidad.org', 'hash_password_678', 'Lider Comunitario', '2023-01-25', '2023-07-22 15:10:00', TRUE, 1, 'Comunidad'),
('Ana Luisa', 'Pérez', 'ana@saludsinfronteras.org', 'hash_password_901', 'ONG', '2023-02-08', '2023-07-21 13:45:00', TRUE, 3, 'ONG'),
('Roberto', 'Cifuentes', 'roberto@agualimpia.org', 'hash_password_234', 'ONG', '2023-02-18', '2023-07-23 08:30:00', TRUE, 4, 'ONG'),
('Roberto', 'Fernández', 'roberto.fernandez@email.com', 'hash_password_567', 'Voluntario', '2023-01-17', '2023-07-20 17:15:00', TRUE, 3, 'Voluntario'),
('Laura', 'Santos', 'laura.santos@email.com', 'hash_password_890', 'Voluntario', '2023-02-03', '2023-07-23 12:40:00', TRUE, 4, 'Voluntario');

INSERT INTO "Ninos" (id_familia, nombre, fecha_nacimiento, genero, peso, talla, estado_nutricional, fecha_evaluacion, alergias, observaciones, estado) VALUES
(1, 'José Antonio López', '2023-03-15', 'M', 10.5, 0.82, 'Desnutrición Leve', '2025-10-01', 'Ninguna', 'Requiere seguimiento nutricional mensual', TRUE),
(1, 'María Guadalupe López', '2021-07-22', 'F', 16.0, 1.02, 'Normal', '2025-09-28', 'Alergia al polen', 'Desarrollo adecuado para su edad', TRUE),
(2, 'Pedro Luis Hernández', '2019-01-10', 'M', 16.5, 1.08, 'Desnutrición Moderada', '2025-10-05', 'Ninguna', 'Familia en programa de recuperación nutricional', TRUE),
(2, 'Ana Sofía Hernández', '2024-08-20', 'F', 9.8, 0.76, 'Normal', '2025-10-08', 'Ninguna', 'Lactancia materna exclusiva hasta los 6 meses', TRUE),
(3, 'Carlos Enrique Ramírez', '2017-05-03', 'M', 18.0, 1.15, 'Desnutrición Severa', '2025-10-10', 'Ninguna', 'URGENTE: Derivado a hospital para tratamiento especializado', TRUE),
(3, 'Luisa Fernanda Ramírez', '2022-11-12', 'F', 14.2, 0.95, 'Normal', '2025-09-25', 'Alergia a mariscos', 'Desarrollo psicomotor adecuado', TRUE),
(4, 'Miguel Ángel Castro', '2020-02-28', 'M', 16.8, 1.05, 'Desnutrición Leve', '2025-10-03', 'Ninguna', 'Participa en programa de alimentación escolar', TRUE),
(5, 'Elena Patricia Méndez', '2018-09-14', 'F', 22.5, 1.20, 'Normal', '2025-09-30', 'Alergia al polvo', 'Excelente rendimiento escolar', TRUE),
(5, 'Roberto José Méndez', '2024-12-15', 'M', 7.5, 0.72, 'Desnutrición Moderada', '2025-10-09', 'Ninguna', 'Madre recibe capacitación en nutrición infantil', TRUE),
(6, 'Carmen Rosa Ordóñez', '2016-04-07', 'F', 28.0, 1.32, 'Normal', '2025-10-02', 'Ninguna', 'Lidera grupo de apoyo infantil en su comunidad', TRUE);

-- Insertar 10 datos en tabla Casos_Criticos
INSERT INTO "Casos_Criticos" (id_nino, id_familia, fecha_deteccion, descripcion, nivel_urgencia, sintomas, acciones_tomadas, estado, id_responsable, tipo_responsable, fecha_ultima_actualizacion, fecha_resolucion, observaciones, requiere_traslado) VALUES
(32, 14, '2023-03-01', 'Desnutrición aguda con complicaciones', 'Crítico', 'Pérdida severa de peso, deshidratación, apatía', 'Referencia a hospital, inicio de protocolo de recuperación nutricional', 'En Atención', 1, 'Voluntario', '2023-07-10 10:30:00', NULL, 'Madre recibiendo capacitación en nutrición infantil', TRUE),
(33, 15, '2023-03-15', 'Cuadro respiratorio grave', 'Alto', 'Dificultad respiratoria, fiebre alta, tos persistente', 'Tratamiento antibiótico, monitoreo de oxigenación', 'Resuelto', 3, 'ONG', '2023-04-10 14:45:00', '2023-04-01', 'Mejora completa después de tratamiento', FALSE),
(34, 16, '2023-04-05', 'Desnutrición severa', 'Crítico', 'Bajo peso para la edad, retraso en desarrollo, edema', 'Inclusión en programa intensivo de recuperación, suplementación especializada', 'En Atención', 6, 'ONG', '2023-07-15 09:15:00', NULL, 'Mejora lenta pero constante', TRUE),
(35, 17, '2023-04-20', 'Brote de enfermedad diarreica', 'Alto', 'Diarrea persistente en varios miembros, deshidratación', 'Tratamiento de rehidratación, análisis de fuente de agua', 'Resuelto', 9, 'ONG', '2023-05-10 16:20:00', '2023-05-05', 'Contaminación de pozo identificada y solucionada', FALSE),
(36, 18, '2023-05-10', 'Anemia severa', 'Alto', 'Palidez extrema, fatiga, taquicardia', 'Suplementación con hierro, modificación dietética, seguimiento hematológico', 'Seguimiento', 1, 'Voluntario', '2023-07-20 11:30:00', NULL, 'Mejora en niveles de hemoglobina', FALSE),
(37, 17, '2023-05-25', 'Condiciones insalubres en vivienda', 'Alto', 'Hacinamiento, presencia de vectores, humedad excesiva', 'Plan de mejoramiento habitacional, control de vectores', 'En Atención', 5, 'ONG', '2023-07-18 13:45:00', NULL, 'Primera fase de intervención completada', FALSE),
(38, 14, '2023-06-05', 'Reacción alérgica severa', 'Crítico', 'Erupción cutánea generalizada, dificultad respiratoria', 'Administración de antihistamínicos, identificación de alérgeno', 'Resuelto', 4, 'Voluntario', '2023-06-20 15:10:00', '2023-06-15', 'Alergia a medicamento identificada', TRUE),
(39, 15, '2023-06-20', 'Riesgo de deslizamiento en vivienda', 'Crítico', 'Grietas estructurales, terreno inestable post-lluvias', 'Evacuación preventiva, evaluación técnica', 'Derivado', 9, 'Voluntario', '2023-07-05 09:30:00', NULL, 'Caso derivado a autoridades municipales', FALSE),
(40, 15, '2023-07-01', 'Embarazo de alto riesgo', 'Alto', 'Hipertensión gestacional, antecedentes de pérdida', 'Control prenatal intensivo, preparación para parto institucional', 'En Atención', 8, 'Voluntario', '2023-07-22 10:45:00', NULL, 'Programada para cesárea en hospital departamental', TRUE),
(32, 17, '2023-07-10', 'Posible caso de tuberculosis', 'Alto', 'Tos crónica, pérdida de peso, sudoración nocturna', 'Exámenes diagnósticos, aislamiento preventivo', 'Detectado', 3, 'ONG', '2023-07-22 16:30:00', NULL, 'Pendiente confirmación diagnóstica', TRUE);

-- Insertar 10 datos en tabla Alertas
INSERT INTO "Alertas" (fecha_alerta, tipo_alerta, descripcion, estado, fecha_respuesta, respuesta, prioridad, caso_id, usuario_id, observaciones) VALUES
('2023-03-02 08:30:00', 'Médica', 'Niño con síntomas de deshidratación severa', 'Atendida', '2023-03-02 10:15:00', 'Paciente trasladado al centro de salud para rehidratación intravenosa', 'Crítica', 61, 1, 'Familia sin acceso a agua potable'),
('2023-03-16 14:20:00', 'Médica', 'Paciente con dificultad respiratoria aguda', 'Atendida', '2023-03-16 15:45:00', 'Administrado tratamiento broncodilatador y oxigenoterapia', 'Alta', 61, 3, 'Antecedentes de asma bronquial'),
('2023-04-06 09:00:00', 'Nutricional', 'Detección de desnutrición severa en niño de 8 años', 'Escalada', '2023-04-06 11:30:00', 'Caso derivado a programa intensivo de recuperación nutricional', 'Crítica', 63, 6, 'Requiere hospitalización y seguimiento especializado'),
('2023-04-21 16:45:00', 'Urgente', 'Brote epidémico de diarrea en comunidad', 'Cerrada', '2023-04-22 09:00:00', 'Implementado plan de acción: tratamiento masivo y mejora de saneamiento', 'Alta', 64, 9, 'Fuente de agua contaminada identificada y clausurada'),
('2023-05-11 07:15:00', 'Médica', 'Caso de anemia severa requiere atención urgente', 'Atendida', '2023-05-11 10:30:00', 'Iniciado tratamiento con hierro y ácido fólico, programado seguimiento mensual', 'Alta', 65, 1, 'Mejora progresiva en niveles de hemoglobina'),
('2023-05-26 13:00:00', 'Psicosocial', 'Situación de riesgo por condiciones habitacionales críticas', 'Atendida', '2023-05-27 08:00:00', 'Evaluación técnica realizada, familia reubicada temporalmente', 'Alta', 66, 5, 'Intervención coordinada con autoridades municipales'),
('2023-06-06 10:20:00', 'Médica', 'Reacción alérgica severa con compromiso respiratorio', 'Cerrada', '2023-06-06 11:00:00', 'Tratamiento de emergencia administrado, paciente estabilizado', 'Crítica', 67, 4, 'Identificado alérgeno específico para prevención futura'),
('2023-06-21 15:30:00', 'Urgente', 'Alerta por riesgo de derrumbe en vivienda', 'Escalada', '2023-06-21 17:00:00', 'Familia evacuada, caso remitido a protección civil', 'Crítica', 68, 9, 'Requiere intervención de ingeniería estructural urgente'),
('2023-07-02 11:45:00', 'Médica', 'Embarazo de alto riesgo detectado en control prenatal', 'Atendida', '2023-07-03 08:30:00', 'Derivada a hospital para control especializado, programada cesárea', 'Alta', 69, 8, 'Paciente con hipertensión gestacional controlada'),
('2023-07-11 09:00:00', 'Médica', 'Sospecha de tuberculosis pulmonar en paciente adulto', 'Pendiente', NULL, NULL, 'Alta', 70, 3, 'Pendiente resultado de baciloscopía y radiografía de tórax');

-- Consultas generales
SELECT * FROM casos_criticos;
SELECT * FROM comunidades;
SELECT * FROM familias;
SELECT * FROM ninos;
SELECT * FROM ongs;
SELECT * FROM registros;
SELECT * FROM usuarios;
SELECT * FROM voluntarios;
SELECT * FROM Alertas;

-- Consulta: Nombre de esposo/a de una comunidad
SELECT f.nombre_esposo, f.nombre_esposa, c.nombre_comunidad 
FROM Familias f
JOIN Comunidades c ON f.id_comunidad = c.id_comunidad;

-- Consulta: Verificar el DPI del esposo 
SELECT nombre_esposo, dpi_esposo FROM Familias;

-- Consulta: Comunidades ordenadas alfabeticamente
SELECT * FROM Comunidades ORDER BY nombre_comunidad ASC;

-- Consulta: Nombre del voluntario y ONG donde brinda su apoyo.
SELECT r.id_registro, v.nombre AS nombre_voluntario, o.nombre_ong, r.tipo_ayuda, r.fecha_registro
FROM Registros r
JOIN Voluntarios v ON r.id_voluntario = v.id_voluntario
JOIN ONGs o ON r.id_ong = o.id_ong;

-- Consulta: Cantidad de familias por cada comunidad
SELECT c.nombre_comunidad, COUNT(f.id_familia) AS total_familias
FROM Comunidades c
LEFT JOIN Familias f ON c.id_comunidad = f.id_comunidad
GROUP BY c.nombre_comunidad
ORDER BY total_familias DESC;

-- Consulta: cantidad de donaciones que ha echo una ong
SELECT o.nombre_ong, COUNT(d.id_donacion) AS total_donaciones
FROM Donaciones d
JOIN ONGs o ON d.id_ong = o.id_ong
GROUP BY o.nombre_ong
ORDER BY total_donaciones DESC;


