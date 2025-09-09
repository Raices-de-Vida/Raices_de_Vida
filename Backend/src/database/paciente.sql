-- Nuevo requisto, realizar un perfil de paciente.

-- ENUMS PARA PACIENTES
CREATE TYPE genero_paciente_enum        AS ENUM ('M', 'F');
CREATE TYPE metodo_anticonceptivo_enum  AS ENUM ('Ninguno', 'Pastillas', 'Inyección', 'DIU', 'Condón', 'Natural', 'Otro');
CREATE TYPE tipo_consulta_enum          AS ENUM ('Diabetes', 'HTN', 'Respiratory', 'Other');
CREATE TYPE tipo_cirugia_enum           AS ENUM ('Abdominal', 'Cardíaca', 'Ginecológica', 'Traumatológica', 'Otra');
CREATE TYPE estado_paciente_enum        AS ENUM ('Activo', 'Inactivo', 'Derivado', 'Fallecido');


-- TABLA PACIENTES
CREATE TABLE Pacientes (
    id_paciente SERIAL PRIMARY KEY,

    -- General
    fecha_registro DATE DEFAULT CURRENT_DATE NOT NULL,
    idioma VARCHAR(100) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    telefono VARCHAR(20) CHECK (LENGTH(telefono) BETWEEN 8 AND 20),
    comunidad_pueblo VARCHAR(255),
    fecha_nacimiento DATE CHECK (fecha_nacimiento <= CURRENT_DATE),
    edad INT CHECK (edad BETWEEN 0 AND 150),
    genero genero_paciente_enum NOT NULL,

    -- Snapshot signos vitales (ultima toma)
    presion_arterial_sistolica INT,
    presion_arterial_diastolica INT,
    frecuencia_cardiaca INT,
    saturacion_oxigeno DECIMAL(5,2),
    glucosa DECIMAL(6,2),
    peso DECIMAL(6,2),
    estatura DECIMAL(5,2),
    temperatura DECIMAL(4,2),
    fecha_signos_vitales TIMESTAMP,

    -- Alergias 
    tiene_alergias BOOLEAN DEFAULT FALSE,
    alergias TEXT,

    -- Habitos actuales
    tabaco_actual BOOLEAN DEFAULT FALSE,
    tabaco_actual_cantidad VARCHAR(100),
    alcohol_actual BOOLEAN DEFAULT FALSE,
    alcohol_actual_cantidad VARCHAR(100),
    drogas_actual BOOLEAN DEFAULT FALSE,
    drogas_actual_cantidad VARCHAR(100),

    -- Habitos pasados
    tabaco_pasado BOOLEAN DEFAULT FALSE,
    tabaco_pasado_cantidad VARCHAR(100),
    alcohol_pasado BOOLEAN DEFAULT FALSE,
    alcohol_pasado_cantidad VARCHAR(100),
    drogas_pasado BOOLEAN DEFAULT FALSE,
    drogas_pasado_cantidad VARCHAR(100),

    -- Salud reproductiva (aplica a F)
    ultima_menstruacion DATE,
    menopausia BOOLEAN DEFAULT FALSE,
    gestaciones INT DEFAULT 0 CHECK (gestaciones >= 0),
    partos INT DEFAULT 0 CHECK (partos >= 0),
    abortos_espontaneos INT DEFAULT 0 CHECK (abortos_espontaneos >= 0),
    abortos_inducidos INT DEFAULT 0 CHECK (abortos_inducidos >= 0),
    usa_anticonceptivos BOOLEAN DEFAULT FALSE,
    metodo_anticonceptivo metodo_anticonceptivo_enum DEFAULT 'Ninguno',

    -- Estado y metadatos
    estado_paciente estado_paciente_enum DEFAULT 'Activo',
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones_generales TEXT,

    -- Relaciones 
    id_comunidad INT REFERENCES Comunidades(id_comunidad),
    id_familia INT REFERENCES Familias(id_familia),
    usuario_registro INT REFERENCES Usuarios(id_usuario),

    -- Coherencias
    CONSTRAINT chk_alergias_coherentes
      CHECK ( (tiene_alergias AND alergias IS NOT NULL) OR (NOT tiene_alergias AND alergias IS NULL) ),
    CONSTRAINT check_edad_nacimiento
      CHECK ( (fecha_nacimiento IS NOT NULL AND edad IS NULL) OR (fecha_nacimiento IS NULL AND edad IS NOT NULL) ),
    CONSTRAINT chk_repro_por_genero
      CHECK (
        genero = 'F' OR
        (gestaciones=0 AND partos=0 AND abortos_espontaneos=0 AND abortos_inducidos=0 AND usa_anticonceptivos=FALSE AND metodo_anticonceptivo='Ninguno' AND ultima_menstruacion IS NULL AND menopausia IS FALSE)
      ),
    CONSTRAINT chk_menopausia_lmp
      CHECK ( NOT menopausia OR ultima_menstruacion IS NULL ),

    -- Rangos razonables para snapshot
    CONSTRAINT chk_snapshot_bp_relacion
      CHECK ( presion_arterial_sistolica IS NULL OR presion_arterial_diastolica IS NULL OR presion_arterial_sistolica > presion_arterial_diastolica ),
    CONSTRAINT chk_snapshot_spo2_rango
      CHECK ( saturacion_oxigeno IS NULL OR (saturacion_oxigeno BETWEEN 50 AND 100) ),
    CONSTRAINT chk_snapshot_hr_rango
      CHECK ( frecuencia_cardiaca IS NULL OR (frecuencia_cardiaca BETWEEN 30 AND 220) ),
    CONSTRAINT chk_snapshot_temp_rango
      CHECK ( temperatura IS NULL OR (temperatura BETWEEN 30 AND 45) )
);


-- CONSULTAS 
CREATE TABLE Consultas (
    id_consulta SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL REFERENCES Pacientes(id_paciente) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    idioma VARCHAR(100),
    tipo_consulta tipo_consulta_enum NOT NULL,
    chief_complaint TEXT NOT NULL,

    -- Historia clinica 
    historia_enfermedad_actual TEXT,
    diagnosticos_previos TEXT,
    medicamentos_actuales TEXT,

    -- Examen fisico
    examen_corazon TEXT,
    examen_pulmones TEXT,
    examen_abdomen TEXT,
    examen_ginecologico TEXT,
    otros_examenes TEXT,

    -- Evaluacion y plan
    impresion TEXT,
    plan TEXT,
    rx_notes TEXT,
    further_consult VARCHAR(100),   -- 'Gen Surg' | 'GYN' | 'Other'
    provider VARCHAR(255),
    interprete VARCHAR(255),

    -- Notas quirurgicas 
    paciente_en_ayuno BOOLEAN,
    medicamentos_tomados BOOLEAN
);

CREATE INDEX IF NOT EXISTS idx_consultas_paciente_fecha ON Consultas(id_paciente, fecha DESC);


-- DISPENSACIONES 
CREATE TABLE Dispensaciones (
    id_dispensacion SERIAL PRIMARY KEY,
    id_consulta INT NOT NULL REFERENCES Consultas(id_consulta) ON DELETE CASCADE,
    vitamin_packets INT DEFAULT 0 CHECK (vitamin_packets >= 0),
    albendazole_tabs INT DEFAULT 0 CHECK (albendazole_tabs >= 0),
    notas TEXT
);


-- SIGNOS VITALES 
CREATE TABLE IF NOT EXISTS Signos_Vitales_Historial (
    id_signos SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL REFERENCES Pacientes(id_paciente) ON DELETE CASCADE,
    id_consulta INT REFERENCES Consultas(id_consulta) ON DELETE SET NULL,
    fecha_toma TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    presion_arterial_sistolica INT CHECK (presion_arterial_sistolica > 0),
    presion_arterial_diastolica INT CHECK (presion_arterial_diastolica > 0),
    frecuencia_cardiaca INT CHECK (frecuencia_cardiaca BETWEEN 30 AND 220),
    saturacion_oxigeno DECIMAL(5,2) CHECK (saturacion_oxigeno BETWEEN 50 AND 100),
    glucosa DECIMAL(6,2) CHECK (glucosa >= 0),
    peso DECIMAL(6,2) CHECK (peso > 0),
    estatura DECIMAL(5,2) CHECK (estatura > 0),
    temperatura DECIMAL(4,2) CHECK (temperatura BETWEEN 30 AND 45),

    usuario_registro INT REFERENCES Usuarios(id_usuario),
    observaciones TEXT
);

ALTER TABLE Signos_Vitales_Historial
  ADD CONSTRAINT chk_bp_relacion
  CHECK (presion_arterial_sistolica > presion_arterial_diastolica);

CREATE INDEX idx_signos_paciente_fecha ON Signos_Vitales_Historial(id_paciente, fecha_toma DESC);



-- CIRUGIAS (historico del paciente)
CREATE TABLE Cirugias_Paciente (
    id_cirugia SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL REFERENCES Pacientes(id_paciente) ON DELETE CASCADE,
    tipo_cirugia tipo_cirugia_enum,
    descripcion_cirugia TEXT NOT NULL,
    fecha_cirugia DATE,
    hospital VARCHAR(255),
    complicaciones TEXT,
    fecha_registro DATE DEFAULT CURRENT_DATE
);


-- HISTORIAL MEDICO general 
CREATE TABLE Historial_Medico (
    id_historial SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL REFERENCES Pacientes(id_paciente) ON DELETE CASCADE,
    historia_enfermedad_actual TEXT,
    diagnosticos_previos TEXT,
    medicamentos_actuales TEXT,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    usuario_registro INT REFERENCES Usuarios(id_usuario)
);


-- ALERTAS MEDICAS 
ALTER TABLE IF EXISTS Alertas
    ADD COLUMN IF NOT EXISTS id_paciente_medico INT;

ALTER TABLE IF EXISTS Alertas
    ADD CONSTRAINT FK_Alertas_Pacientes_Medicos
    FOREIGN KEY (id_paciente_medico) REFERENCES Pacientes(id_paciente) ON DELETE CASCADE;

CREATE TYPE tipo_alerta_medica_enum AS ENUM (
    'Signos Vitales Críticos',
    'Glucosa Descontrolada',
    'Hipertensión Severa',
    'Dificultad Respiratoria',
    'Dolor Torácico',
    'Emergencia Obstétrica',
    'Reacción Alérgica',
    'Deshidratación Severa',
    'Otro'
);

CREATE TABLE Alertas_Medicas (
    id_alerta_medica SERIAL PRIMARY KEY,
    id_paciente INT NOT NULL REFERENCES Pacientes(id_paciente) ON DELETE CASCADE,
    id_alerta INT REFERENCES Alertas(alerta_id) ON DELETE CASCADE,

    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_alerta_medica tipo_alerta_medica_enum NOT NULL,
    descripcion_medica TEXT NOT NULL,

    -- Signos vitales al momento de la alerta
    presion_sistolica_alerta INT,
    presion_diastolica_alerta INT,
    frecuencia_cardiaca_alerta INT,
    saturacion_oxigeno_alerta DECIMAL(5,2),
    glucosa_alerta DECIMAL(6,2),
    temperatura_alerta DECIMAL(4,2),

    sintomas_reportados TEXT,
    acciones_inmediatas TEXT,
    requiere_traslado_urgente BOOLEAN DEFAULT FALSE,
    hospital_derivacion VARCHAR(255),

    estado_alerta estado_alerta_enum DEFAULT 'Pendiente',
    prioridad_medica prioridad_enum DEFAULT 'Alta',

    usuario_genera_alerta INT REFERENCES Usuarios(id_usuario),
    usuario_atiende_alerta INT REFERENCES Usuarios(id_usuario),
    fecha_atencion TIMESTAMP,

    observaciones_medicas TEXT,
    seguimiento_requerido TEXT
);

CREATE INDEX idx_alertas_medicas_fecha  ON Alertas_Medicas(fecha_alerta);
CREATE INDEX idx_alertas_medicas_estado ON Alertas_Medicas(estado_alerta);

-- TRIGGERS

-- FUNCIÓN: calcular edad automáticamente a partir de fecha_nacimiento
CREATE OR REPLACE FUNCTION calcular_edad_paciente()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.fecha_nacimiento IS NOT NULL THEN
        NEW.edad := EXTRACT(YEAR FROM AGE(NEW.fecha_nacimiento));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: calcular edad en INSERT/UPDATE
CREATE OR REPLACE TRIGGER trigger_calcular_edad_paciente
BEFORE INSERT OR UPDATE ON Pacientes
FOR EACH ROW
EXECUTE FUNCTION calcular_edad_paciente();


-- FUNCIÓN: actualizar snapshot de signos vitales en Pacientes
CREATE OR REPLACE FUNCTION actualizar_signos_vitales_paciente()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Pacientes SET
        presion_arterial_sistolica = NEW.presion_arterial_sistolica,
        presion_arterial_diastolica = NEW.presion_arterial_diastolica,
        frecuencia_cardiaca        = NEW.frecuencia_cardiaca,
        saturacion_oxigeno         = NEW.saturacion_oxigeno,
        glucosa                    = NEW.glucosa,
        peso                       = NEW.peso,
        estatura                   = NEW.estatura,
        temperatura                = NEW.temperatura,
        fecha_signos_vitales       = NEW.fecha_toma,
        fecha_ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_paciente = NEW.id_paciente;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER: snapshot al insertar en historial de signos
CREATE OR REPLACE TRIGGER trigger_actualizar_signos_vitales
AFTER INSERT ON Signos_Vitales_Historial
FOR EACH ROW
EXECUTE FUNCTION actualizar_signos_vitales_paciente();


-- INDICES UTILES
CREATE INDEX idx_pacientes_nombre     ON Pacientes(nombre, apellido);
CREATE INDEX idx_pacientes_comunidad  ON Pacientes(comunidad_pueblo);
CREATE INDEX idx_pacientes_estado     ON Pacientes(estado_paciente);
