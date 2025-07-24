-- SE DEBEN INSERTAR LOS DATOS UNO POR UNO PARA QUE EL SERIAL NO SEA ESCALABLE



-- Insertar 10 datos en tabla Comunidades
INSERT INTO Comunidades (nombre_comunidad, codigo_ine, departamento, municipio, numero_familias, grupo_etnico, tipo_comunidad, fecha_registro, estado, comentarios, proyectos_en_comunidad, recursos_disponibles, necesidades_comunidad, coordenadas_gps) VALUES
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
INSERT INTO ONGs (nombre_ong, direccion, telefono, email, representante, tipo_ong, fecha_fundacion, mision, vision, estado, fecha_registro, sitio_web, comentarios, id_comunidad) VALUES
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
INSERT INTO Familias (nombre_esposo, nombre_esposa, dpi_esposo, dpi_esposa, fecha_nacimiento_esposo, fecha_nacimiento_esposa, embarazada, hijos_0_2, hijos_2_5, hijos_6_17, area_siembra_maiz, rendimiento_maiz, area_siembra_frijol, rendimiento_frijol, id_comunidad) VALUES
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
INSERT INTO Ninos (id_familia, nombre, fecha_nacimiento, genero, peso, talla, estado_nutricional, fecha_evaluacion, alergias, observaciones, estado) VALUES
(1, 'Ana Pérez Gómez', '2019-03-15', 'F', 12.5, 0.85, 'Normal', '2023-06-15', 'Ninguna', 'Desarrollo normal', TRUE),
(1, 'Luis Pérez Gómez', '2012-07-10', 'M', 35.0, 1.40, 'Normal', '2023-06-15', 'Ninguna', 'Activo y saludable', TRUE),
(1, 'Sara Pérez Gómez', '2009-11-22', 'F', 42.3, 1.52, 'Normal', '2023-06-15', 'Polen', 'Rendimiento escolar muy bueno', TRUE),
(2, 'Mario López Hernández', '2022-01-05', 'M', 9.2, 0.72, 'Desnutrición Leve', '2023-06-18', 'Lactosa', 'Necesita seguimiento nutricional', TRUE),
(2, 'Elena López Hernández', '2014-04-12', 'F', 32.1, 1.38, 'Normal', '2023-06-18', 'Ninguna', 'Buena salud general', TRUE),
(2, 'Pedro López Hernández', '2011-08-30', 'M', 34.5, 1.41, 'Normal', '2023-06-18', 'Ninguna', 'Deportista', TRUE),
(2, 'Rosa López Hernández', '2008-05-18', 'F', 45.2, 1.58, 'Normal', '2023-06-18', 'Ninguna', 'Excelente rendimiento escolar', TRUE),
(3, 'Miguel Ramírez Sánchez', '2022-04-10', 'M', 8.5, 0.70, 'Desnutrición Leve', '2023-06-20', 'Ninguna', 'Bajo peso al nacer', TRUE),
(3, 'Sofía Ramírez Sánchez', '2020-09-25', 'F', 10.8, 0.80, 'Normal', '2023-06-20', 'Ninguna', 'Desarrollo normal', TRUE),
(3, 'Gabriel Ramírez Sánchez', '2015-11-14', 'M', 30.0, 1.35, 'Normal', '2023-06-20', 'Maní', 'Activo y saludable', TRUE),
(4, 'Lucía Castro Jiménez', '2010-02-28', 'F', 32.4, 1.40, 'Normal', '2023-06-22', 'Ninguna', 'Muy activa', TRUE),
(4, 'Carlos Castro Jiménez', '2012-05-17', 'M', 33.2, 1.42, 'Normal', '2023-06-22', 'Ninguna', 'Buen estado de salud', TRUE),
(4, 'José Castro Jiménez', '2008-11-09', 'M', 44.5, 1.60, 'Normal', '2023-06-22', 'Ninguna', 'Deportista destacado', TRUE),
(4, 'Andrea Castro Jiménez', '2006-07-23', 'F', 48.3, 1.65, 'Normal', '2023-06-22', 'Penicilina', 'Excelente rendimiento académico', TRUE),
(5, 'Mateo Méndez Torres', '2022-02-15', 'M', 7.8, 0.68, 'Desnutrición Moderada', '2023-06-25', 'Ninguna', 'Requiere intervención nutricional urgente', TRUE),
(5, 'Isabella Méndez Torres', '2020-06-12', 'F', 9.5, 0.78, 'Desnutrición Leve', '2023-06-25', 'Ninguna', 'En programa de suplementación', TRUE),
(6, 'Valentina Ordóñez Salazar', '2020-10-05', 'F', 11.2, 0.84, 'Normal', '2023-06-28', 'Ninguna', 'Desarrollo normal', TRUE),
(6, 'Santiago Ordóñez Salazar', '2019-03-18', 'M', 14.0, 0.95, 'Normal', '2023-06-28', 'Ninguna', 'Muy activo', TRUE),
(6, 'Daniel Ordóñez Salazar', '2015-12-24', 'M', 32.5, 1.38, 'Normal', '2023-06-28', 'Ninguna', 'Buena salud general', TRUE),
(7, 'Camila Morales Cruz', '2008-05-10', 'F', 46.0, 1.62, 'Normal', '2023-07-01', 'Ninguna', 'Deportista', TRUE),
(7, 'Sebastián Morales Cruz', '2010-09-15', 'M', 40.5, 1.48, 'Normal', '2023-07-01', 'Ninguna', 'Buen rendimiento escolar', TRUE);

-- Insertar 10 datos en tabla Voluntarios
INSERT INTO Voluntarios (nombre, apellido, dpi, fecha_nacimiento, telefono, email, direccion, experiencia, disponibilidad, tipo_voluntario, institucion, fecha_registro, estado, comentarios, habilidades) VALUES
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
INSERT INTO Usuarios (nombre, apellido, email, password, rol, fecha_registro, ultimo_acceso, estado, id_referencia, tipo_referencia) VALUES
('María', 'González', 'maria@semillasdeesperanza.org', 'hash_password_123', 'ONG', '2023-01-12', '2023-07-20 14:30:00', TRUE, 1, 'ONG'),
('Carlos', 'Méndez', 'carlos@educacionparatodos.org', 'hash_password_456', 'ONG', '2023-01-22', '2023-07-22 09:15:00', TRUE, 2, 'ONG'),
('José', 'Gutiérrez', 'jose.gutierrez@email.com', 'hash_password_789', 'Voluntario', '2023-01-07', '2023-07-21 16:45:00', TRUE, 1, 'Voluntario'),
('María', 'Rodríguez', 'maria.rodriguez@email.com', 'hash_password_012', 'Voluntario', '2023-01-12', '2023-07-23 10:20:00', TRUE, 2, 'Voluntario'),
('Juan', 'Pérez', 'juan.perez@comunidad.org', 'hash_password_345', 'Líder Comunitario', '2023-01-20', '2023-07-19 11:30:00', TRUE, 1, 'Comunidad'),
('Pedro', 'López', 'pedro.lopez@comunidad.org', 'hash_password_678', 'Líder Comunitario', '2023-01-25', '2023-07-22 15:10:00', TRUE, 1, 'Comunidad'),
('Ana Luisa', 'Pérez', 'ana@saludsinfronteras.org', 'hash_password_901', 'ONG', '2023-02-08', '2023-07-21 13:45:00', TRUE, 3, 'ONG'),
('Roberto', 'Cifuentes', 'roberto@agualimpia.org', 'hash_password_234', 'ONG', '2023-02-18', '2023-07-23 08:30:00', TRUE, 4, 'ONG'),
('Roberto', 'Fernández', 'roberto.fernandez@email.com', 'hash_password_567', 'Voluntario', '2023-01-17', '2023-07-20 17:15:00', TRUE, 3, 'Voluntario'),
('Laura', 'Santos', 'laura.santos@email.com', 'hash_password_890', 'Voluntario', '2023-02-03', '2023-07-23 12:40:00', TRUE, 4, 'Voluntario');

-- Insertar 10 datos en tabla Registros
INSERT INTO Registros (cantidad_ayuda, id_familia, id_voluntario, id_ong, fecha_registro, tipo_ayuda, descripcion_ayuda, estado, comentarios) VALUES
(100.00, 1, 1, 1, '2023-02-15', 'Alimentación', 'Entrega de canasta básica', TRUE, 'Familia con 3 niños en edad escolar'),
(200.00, 2, 2, 1, '2023-02-20', 'Salud', 'Medicamentos para embarazada', TRUE, 'Control prenatal mensual programado'),
(150.00, 3, 3, 2, '2023-03-05', 'Educación', 'Útiles escolares para primaria', TRUE, 'Entregado a tres niños de la familia'),
(300.00, 4, 4, 3, '2023-03-15', 'Salud', 'Consulta médica familiar', TRUE, 'Revisión general para toda la familia'),
(120.00, 5, 5, 3, '2023-03-25', 'Alimentación', 'Suplementos nutricionales', TRUE, 'Para embarazada y niños pequeños'),
(250.00, 6, 6, 2, '2023-04-10', 'Educación', 'Material educativo bilingüe', TRUE, 'Apoyo para educación en casa'),
(180.00, 7, 7, 4, '2023-04-20', 'Otro', 'Sistema de captación de agua', TRUE, 'Instalación de tanque y filtros'),
(220.00, 8, 8, 5, '2023-05-05', 'Otro', 'Materiales de construcción', TRUE, 'Mejoramiento de vivienda'),
(130.00, 9, 9, 6, '2023-05-15', 'Alimentación', 'Semillas para huerto familiar', TRUE, 'Capacitación en huertos incluida'),
(270.00, 10, 10, 7, '2023-06-01', 'Educación', 'Capacitación técnica agrícola', TRUE, 'Curso de manejo de cultivos'),
(140.00, 11, 1, 8, '2023-06-10', 'Salud', 'Vacunación infantil', TRUE, 'Esquema completo de vacunación'),
(190.00, 12, 2, 9, '2023-06-20', 'Otro', 'Reforestación de parcela', TRUE, 'Entrega de 50 árboles nativos');

-- Insertar 10 datos en tabla Evaluaciones
INSERT INTO Evaluaciones (id_familia, fecha_evaluacion, descripcion_evaluacion, resultado, recomendaciones, estado, comentarios, personal_encargado, metodo_evaluacion, tipo_evaluacion, observaciones) VALUES
(1, '2023-02-10', 'Evaluación nutricional familiar', 'Estado nutricional adecuado', 'Mantener dieta balanceada', TRUE, 'Familia con buenos hábitos alimenticios', 'Laura Santos', 'Antropometría y encuesta alimentaria', 'Nutricional', 'Se observa buen acceso a alimentos'),
(2, '2023-02-18', 'Evaluación de salud materna', 'Embarazo de 5 meses con bajo peso', 'Suplementación nutricional y control mensual', TRUE, 'Embarazada requiere seguimiento cercano', 'José Gutiérrez', 'Examen clínico y laboratorio', 'Salud', 'Presenta anemia leve'),
(3, '2023-03-01', 'Evaluación socioeconómica', 'Ingresos familiares insuficientes', 'Capacitación en emprendimiento', TRUE, 'Familia con potencial para microempresa artesanal', 'Ana López', 'Entrevista estructurada', 'Socioeconómica', 'Habilidades artesanales detectadas'),
(4, '2023-03-12', 'Evaluación educativa de niños', 'Buen rendimiento escolar', 'Continuar asistencia regular a escuela', TRUE, 'Niños con apoyo familiar en tareas', 'María Rodríguez', 'Revisión de calificaciones y entrevista', 'Educación', 'Padres comprometidos con educación'),
(5, '2023-03-22', 'Evaluación nutricional infantil', 'Desnutrición leve en 2 niños', 'Programa de alimentación complementaria', TRUE, 'Niños en monitoreo quincenal', 'Laura Santos', 'Antropometría y análisis clínico', 'Nutricional', 'Dieta familiar con deficiencias proteicas'),
(6, '2023-04-05', 'Evaluación de condiciones de vivienda', 'Vivienda con deficiencias estructurales', 'Mejoramiento de techo y piso', TRUE, 'Prioridad en temporada de lluvias', 'Pedro Gálvez', 'Inspección técnica', 'Socioeconómica', 'Riesgo de filtraciones en invierno'),
(7, '2023-04-18', 'Evaluación agrícola', 'Bajo rendimiento de cultivos', 'Implementación de técnicas agroecológicas', TRUE, 'Suelo con potencial de mejora', 'Roberto Fernández', 'Análisis de suelo y cultivos', 'Otro', 'Erosión moderada en parcela'),
(8, '2023-05-03', 'Evaluación psicológica familiar', 'Dinámica familiar saludable', 'Continuar participación en actividades comunitarias', TRUE, 'Familia integrada en la comunidad', 'Miguel Torres', 'Entrevistas y observación', 'Otro', 'Buena comunicación intrafamiliar'),
(9, '2023-05-12', 'Evaluación de salud general', 'Problemas dentales en niños', 'Tratamiento dental y hábitos de higiene', TRUE, 'Programada brigada dental', 'José Gutiérrez', 'Examen clínico', 'Salud', 'Falta de acceso a servicios dentales'),
(10, '2023-05-25', 'Evaluación nutricional familiar', 'Dieta con exceso de carbohidratos', 'Diversificación alimentaria', TRUE, 'Potencial para huerto familiar', 'Laura Santos', 'Recordatorio 24 horas', 'Nutricional', 'Consumo limitado de vegetales');

-- Insertar 10 datos en tabla CResultados
INSERT INTO CResultados (id_familia, resultado_evaluacion, descripcion_capacidad, nivel_capacidad, fecha_registro, estado, comentarios, tipo_capacidad, observaciones, fecha_actualizacion) VALUES
(1, 'Capacidad alta para autogestión', 'Familia organizada con liderazgo claro', 'Alto', '2023-02-12', TRUE, 'Potencial para ser familia modelo', 'Organizativa', 'El padre participa activamente en comité comunitario', '2023-06-15'),
(2, 'Habilidades agrícolas tradicionales', 'Conocimiento de siembra según ciclo lunar', 'Medio', '2023-02-20', TRUE, 'Transmisión de conocimiento ancestral', 'Técnica', 'Interés en combinar técnicas tradicionales y modernas', '2023-06-18'),
(3, 'Capacidad artesanal textil', 'Elaboración de tejidos tradicionales', 'Alto', '2023-03-03', TRUE, 'Potencial para generación de ingresos', 'Productiva', 'La madre enseña técnicas a hijas adolescentes', '2023-06-20'),
(4, 'Gestión efectiva de recursos', 'Administración eficiente del presupuesto familiar', 'Alto', '2023-03-15', TRUE, 'Ahorro sistemático para emergencias', 'Financiera', 'Cuenta con sistema propio de registro de gastos', '2023-06-22'),
(5, 'Limitada capacidad para diversificación alimentaria', 'Desconocimiento de alternativas nutricionales', 'Bajo', '2023-03-25', TRUE, 'Requiere formación en nutrición', 'Nutricional', 'Dependencia de pocos alimentos básicos', '2023-06-25'),
(6, 'Preservación de medicina tradicional', 'Conocimiento de plantas medicinales locales', 'Medio', '2023-04-08', TRUE, 'Combinación con medicina convencional', 'Médica', 'Cultivo de plantas medicinales en el hogar', '2023-06-28'),
(7, 'Capacidad para trabajo comunitario', 'Participación activa en mingas comunitarias', 'Alto', '2023-04-20', TRUE, 'Familia reconocida por su compromiso', 'Social', 'Padre e hijos mayores participan en trabajos comunitarios', '2023-07-01'),
(8, 'Habilidades de construcción local', 'Técnicas tradicionales de construcción', 'Medio', '2023-05-05', TRUE, 'Conocimiento transmitido generacionalmente', 'Técnica', 'Utiliza materiales locales de manera eficiente', '2023-07-05'),
(9, 'Capacidad limitada para gestión del agua', 'Prácticas inadecuadas de almacenamiento', 'Bajo', '2023-05-15', TRUE, 'Necesita capacitación en manejo seguro', 'Sanitaria', 'Riesgo de enfermedades transmitidas por agua', '2023-07-08'),
(10, 'Transmisión cultural sólida', 'Preservación de idioma y tradiciones', 'Alto', '2023-05-28', TRUE, 'Familia mantiene prácticas culturales', 'Cultural', 'Abuelos participan activamente en educación cultural', '2023-07-12');

-- Insertar 10 datos en tabla Actividades
INSERT INTO Actividades (id_familia, descripcion_actividad, fecha_actividad, duracion, responsable, estado, comentarios, tipo_actividad, resultado, fecha_registro, observaciones) VALUES
(1, 'Taller de nutrición balanceada', '2023-02-20', '2 horas', 'Laura Santos', TRUE, 'Participación de toda la familia', 'Capacitación', 'Familia aprendió a balancear dieta con recursos locales', '2023-02-15', 'Interés particular en alimentación infantil'),
(2, 'Control prenatal y nutricional', '2023-02-25', '1 hora', 'José Gutiérrez', TRUE, 'Evaluación de embarazada y suplementación', 'Evaluación', 'Se estableció plan de seguimiento mensual', '2023-02-20', 'Embarazada comprometida con recomendaciones'),
(3, 'Taller de artesanía para mercado turístico', '2023-03-10', '3 horas', 'Sofía Montero', TRUE, 'Capacitación en diseños comerciales', 'Capacitación', 'Elaboración de 5 prototipos para venta', '2023-03-05', 'Alta calidad en productos desarrollados'),
(4, 'Entrega de material educativo', '2023-03-20', '1 hora', 'María Rodríguez', TRUE, 'Libros y materiales para apoyo escolar', 'Entrega de Ayuda', 'Niños recibieron materiales adecuados a su nivel', '2023-03-15', 'Padres recibieron orientación para apoyo en tareas'),
(5, 'Capacitación en huerto familiar', '2023-04-02', '4 horas', 'Roberto Fernández', TRUE, 'Instalación de huerto demostrativo', 'Capacitación', 'Establecimiento de huerto con 10 especies', '2023-03-28', 'Asignación de responsabilidades a cada integrante'),
(6, 'Evaluación y mejora de sistema de agua', '2023-04-15', '5 horas', 'Pedro Gálvez', TRUE, 'Instalación de sistema de captación', 'Otro', 'Mejora en acceso y calidad de agua doméstica', '2023-04-10', 'Sistema con capacidad para época seca'),
(7, 'Jornada de salud familiar', '2023-04-25', '6 horas', 'Luisa Herrera', TRUE, 'Atención médica integral', 'Evaluación', 'Diagnóstico de salud familiar y plan de seguimiento', '2023-04-20', 'Detección de necesidades odontológicas'),
(8, 'Taller de técnicas agrícolas mejoradas', '2023-05-10', '4 horas', 'Roberto Fernández', TRUE, 'Capacitación práctica en parcela', 'Capacitación', 'Implementación de técnicas de conservación de suelo', '2023-05-05', 'Integración de conocimiento tradicional y técnico'),
(9, 'Seguimiento nutricional de niños', '2023-05-20', '2 horas', 'Laura Santos', TRUE, 'Evaluación de estado nutricional', 'Seguimiento', 'Mejora en indicadores nutricionales', '2023-05-15', 'Efectividad de suplementación y consejería'),
(10, 'Taller de preparación para temporada de lluvias', '2023-06-05', '3 horas', 'Carlos Mendoza', TRUE, 'Prevención de riesgos e inundaciones', 'Capacitación', 'Familia preparada con plan de emergencia', '2023-05-30', 'Identificación de zonas de riesgo en vivienda');

-- Insertar 10 datos en tabla Reportes
INSERT INTO Reportes (id_familia, fecha_reporte, descripcion_reporte, estado, comentarios, personal_encargado, tipo_reporte, fecha_registro, observaciones, resultado, nivel_urgencia) VALUES
(1, '2023-03-01', 'Informe trimestral de seguimiento familiar', TRUE, 'Familia con avances significativos', 'Ana López', 'Seguimiento', '2023-03-01', 'Sostenibilidad en cambios implementados', 'Evolución positiva en indicadores', 'Bajo'),
(2, '2023-03-05', 'Alerta por complicaciones en embarazo', TRUE, 'Signos de preeclampsia', 'José Gutiérrez', 'Alerta', '2023-03-05', 'Derivación a hospital departamental', 'Atención hospitalaria oportuna', 'Alto'),
(3, '2023-03-15', 'Evaluación de impacto de capacitación artesanal', TRUE, 'Análisis de generación de ingresos', 'Sofía Montero', 'Evaluación', '2023-03-15', 'Incremento de 20% en ingresos familiares', 'Mejora en economía familiar', 'Bajo'),
(4, '2023-03-25', 'Reporte estadístico educativo', TRUE, 'Análisis de asistencia y rendimiento escolar', 'María Rodríguez', 'Estadístico', '2023-03-25', 'Asistencia del 95% en el trimestre', 'Rendimiento escolar por encima del promedio', 'Bajo'),
(5, '2023-04-05', 'Alerta por desnutrición infantil', TRUE, 'Pérdida de peso significativa', 'Laura Santos', 'Alerta', '2023-04-05', 'Niño menor de 2 años con signos de desnutrición aguda', 'Inclusión en programa de recuperación nutricional', 'Alto'),
(6, '2023-04-15', 'Informe de mejora en condiciones de vivienda', TRUE, 'Evaluación post-mejoramiento', 'Pedro Gálvez', 'Evaluación', '2023-04-15', 'Reducción de factores de riesgo habitacional', 'Vivienda con condiciones mejoradas', 'Bajo'),
(7, '2023-04-25', 'Reporte trimestral de salud familiar', TRUE, 'Consolidado de atenciones y resultados', 'Luisa Herrera', 'Estadístico', '2023-04-25', 'Tendencias positivas en indicadores de salud', 'Reducción de episodios de enfermedades prevenibles', 'Bajo'),
(8, '2023-05-05', 'Evaluación de adopción de técnicas agrícolas', TRUE, 'Seguimiento a implementación en parcela', 'Roberto Fernández', 'Evaluación', '2023-05-05', 'Adopción del 80% de técnicas enseñadas', 'Incremento proyectado de 15% en rendimiento', 'Bajo'),
(9, '2023-05-15', 'Alerta por contaminación de fuente de agua', TRUE, 'Análisis bacteriológico desfavorable', 'Carlos Mendoza', 'Alerta', '2023-05-15', 'Contaminación por coliformes fecales', 'Implementación urgente de sistema de purificación', 'Crítico'),
(10, '2023-05-25', 'Informe de participación comunitaria', TRUE, 'Evaluación de integración social', 'Ana López', 'Seguimiento', '2023-05-25', 'Familia con rol de liderazgo en iniciativas locales', 'Fortalecimiento del tejido social comunitario', 'Bajo');

-- Insertar 1p datos en tabla Donaciones
INSERT INTO Donaciones (id_ong, id_voluntario, fecha_donacion, tipo_donacion, cantidad, unidad_medida, estado, comentarios, destinatario, fecha_entrega, comprobante) VALUES
(1, NULL, '2023-02-01', 'Víveres', 500, 'Kilogramos', TRUE, 'Donación corporativa para programa nutricional', 'Comunidad San Pedro La Laguna', '2023-02-10', 'DON-2023-001'),
(2, NULL, '2023-02-10', 'Efectivo', 5000, 'Otros', TRUE, 'Donación para materiales educativos', 'Escuela Santa Clara', '2023-02-15', 'DON-2023-002'),
(NULL, 3, '2023-02-15', 'Ropa', 200, 'Unidades', TRUE, 'Ropa de abrigo para temporada fría', 'Familias de Nuevo Amanecer', '2023-02-20', 'DON-2023-003'),
(3, NULL, '2023-02-25', 'Efectivo', 3000, 'Otros', TRUE, 'Fondo para medicamentos esenciales', 'Centro de Salud Cobán', '2023-03-01', 'DON-2023-004'),
(NULL, 5, '2023-03-05', 'Víveres', 300, 'Kilogramos', TRUE, 'Alimentos para programa escolar', 'Escuela Las Flores', '2023-03-10', 'DON-2023-005'),
(4, NULL, '2023-03-15', 'Otros', 10, 'Unidades', TRUE, 'Sistemas de filtración de agua', 'Familias de El Progreso', '2023-03-20', 'DON-2023-006'),
(NULL, 7, '2023-03-25', 'Efectivo', 1500, 'Otros', TRUE, 'Donación para materiales de construcción', 'Familias de Nueva Esperanza', '2023-03-30', 'DON-2023-007'),
(5, NULL, '2023-04-05', 'Víveres', 400, 'Kilogramos', TRUE, 'Alimentos para familias vulnerables', 'Comunidad Valle Verde', '2023-04-10', 'DON-2023-008'),
(NULL, 9, '2023-04-15', 'Otros', 5, 'Unidades', TRUE, 'Equipos de cómputo para escuela', 'Escuela San Antonio', '2023-04-20', 'DON-2023-009'),
(6, NULL, '2023-04-25', 'Efectivo', 2000, 'Otros', TRUE, 'Fondo para campañas de vacunación', 'Centro de Salud Buena Vista', '2023-04-30', 'DON-2023-010');

-- Insertar 10 datos en tabla Casos_Criticos
INSERT INTO Casos_Criticos (id_nino, id_familia, fecha_deteccion, descripcion, nivel_urgencia, sintomas, acciones_tomadas, estado, id_responsable, tipo_responsable, fecha_ultima_actualizacion, fecha_resolucion, observaciones, requiere_traslado) VALUES
(5, 2, '2023-03-01', 'Desnutrición aguda con complicaciones', 'Crítico', 'Pérdida severa de peso, deshidratación, apatía', 'Referencia a hospital, inicio de protocolo de recuperación nutricional', 'En Atención', 1, 'Voluntario', '2023-07-10 10:30:00', NULL, 'Madre recibiendo capacitación en nutrición infantil', TRUE),
(8, 3, '2023-03-15', 'Cuadro respiratorio grave', 'Alto', 'Dificultad respiratoria, fiebre alta, tos persistente', 'Tratamiento antibiótico, monitoreo de oxigenación', 'Resuelto', 3, 'ONG', '2023-04-10 14:45:00', '2023-04-01', 'Mejora completa después de tratamiento', FALSE),
(15, 5, '2023-04-05', 'Desnutrición severa', 'Crítico', 'Bajo peso para la edad, retraso en desarrollo, edema', 'Inclusión en programa intensivo de recuperación, suplementación especializada', 'En Atención', 6, 'ONG', '2023-07-15 09:15:00', NULL, 'Mejora lenta pero constante', TRUE),
(NULL, 9, '2023-04-20', 'Brote de enfermedad diarreica', 'Alto', 'Diarrea persistente en varios miembros, deshidratación', 'Tratamiento de rehidratación, análisis de fuente de agua', 'Resuelto', 9, 'ONG', '2023-05-10 16:20:00', '2023-05-05', 'Contaminación de pozo identificada y solucionada', FALSE),
(16, 5, '2023-05-10', 'Anemia severa', 'Alto', 'Palidez extrema, fatiga, taquicardia', 'Suplementación con hierro, modificación dietética, seguimiento hematológico', 'Seguimiento', 1, 'Voluntario', '2023-07-20 11:30:00', NULL, 'Mejora en niveles de hemoglobina', FALSE),
(NULL, 7, '2023-05-25', 'Condiciones insalubres en vivienda', 'Alto', 'Hacinamiento, presencia de vectores, humedad excesiva', 'Plan de mejoramiento habitacional, control de vectores', 'En Atención', 5, 'ONG', '2023-07-18 13:45:00', NULL, 'Primera fase de intervención completada', FALSE),
(11, 4, '2023-06-05', 'Reacción alérgica severa', 'Crítico', 'Erupción cutánea generalizada, dificultad respiratoria', 'Administración de antihistamínicos, identificación de alérgeno', 'Resuelto', 4, 'Voluntario', '2023-06-20 15:10:00', '2023-06-15', 'Alergia a medicamento identificada', TRUE),
(NULL, 10, '2023-06-20', 'Riesgo de deslizamiento en vivienda', 'Crítico', 'Grietas estructurales, terreno inestable post-lluvias', 'Evacuación preventiva, evaluación técnica', 'Derivado', 9, 'Voluntario', '2023-07-05 09:30:00', NULL, 'Caso derivado a autoridades municipales', FALSE),
(NULL, 5, '2023-07-01', 'Embarazo de alto riesgo', 'Alto', 'Hipertensión gestacional, antecedentes de pérdida', 'Control prenatal intensivo, preparación para parto institucional', 'En Atención', 8, 'Voluntario', '2023-07-22 10:45:00', NULL, 'Programada para cesárea en hospital departamental', TRUE),
(20, 7, '2023-07-10', 'Posible caso de tuberculosis', 'Alto', 'Tos crónica, pérdida de peso, sudoración nocturna', 'Exámenes diagnósticos, aislamiento preventivo', 'Detectado', 3, 'ONG', '2023-07-22 16:30:00', NULL, 'Pendiente confirmación diagnóstica', TRUE);

-- Inserción de datos para la Tabla de alertas 
INSERT INTO Alertas (tipo_alerta, descripcion, estado, prioridad, caso_id, usuario_id, observaciones)
VALUES
('Médica', 'Requiere atención urgente por deshidratación', 'Pendiente', 'Alta', 1, 3, 'Niño con signos severos'),
('Nutricional', 'Seguimiento a caso de desnutrición leve', 'Pendiente', 'Media', 2, 7, 'Requiere visita domiciliaria'),
('Psicosocial', 'Apoyo emocional por situación familiar difícil', 'Pendiente', 'Media', 3, 4, 'Madre en estado de estrés'),
('Urgente', 'Condiciones críticas en vivienda durante lluvias', 'Escalada', 'Crítica', 4, 6, 'Inundación reportada'),
('Médica', 'Niño con síntomas respiratorios agudos', 'Atendida', 'Alta', 5, 9, 'Atendido por voluntario con medicamentos');


-- Consultas generales
SELECT * FROM actividades;
SELECT * FROM casos_criticos;
SELECT * FROM comunidades;
SELECT * FROM cresultados;
SELECT * FROM donaciones;
SELECT * FROM evaluaciones;
SELECT * FROM familias;
SELECT * FROM ninos;
SELECT * FROM ongs;
SELECT * FROM registros;
SELECT * FROM reportes;
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

