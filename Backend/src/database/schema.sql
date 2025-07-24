-- Se crea una base de datos que soporte todos los caracteres especiales
CREATE DATABASE "Proyecto 1" WITH ENCODING 'UTF8' TEMPLATE template0;

-- Todas las claves primarias se cambiaron a Serial para hacerlas autoincrementales.
-- Las columnas consideradas que estaban en TEXT se actualizan a Varchar de 255 caracteres (incluyendo caracteres especiales) para limitar 

-- Crear tipos de ENUM para reemplazar los CHECK con listas de valores
CREATE TYPE tipo_referencia_enum AS ENUM ('ONG', 'Voluntario', 'Comunidad');
CREATE TYPE rol_enum AS ENUM ('ONG', 'Voluntario', 'Líder Comunitario');
CREATE TYPE estado_nutricional_enum AS ENUM ('Normal', 'Desnutrición Leve', 'Desnutrición Moderada', 'Desnutrición Severa');
CREATE TYPE genero_enum AS ENUM ('M', 'F');
CREATE TYPE disponibilidad_enum AS ENUM ('Baja', 'Media', 'Alta');
CREATE TYPE tipo_ong_enum AS ENUM ('Salud', 'Educación', 'Nutrición', 'Niñez', 'Otro');
CREATE TYPE tipo_ayuda_enum AS ENUM ('Alimentación', 'Salud', 'Educación', 'Otro');
CREATE TYPE tipo_actividad_enum AS ENUM ('Capacitación', 'Evaluación', 'Entrega de Ayuda', 'Seguimiento', 'Otro');
CREATE TYPE tipo_evaluacion_enum AS ENUM ('Nutricional', 'Socioeconómica', 'Salud', 'Educación', 'Otro');
CREATE TYPE tipo_reporte_enum AS ENUM ('Alerta', 'Seguimiento', 'Evaluación', 'Estadístico', 'Otro');
CREATE TYPE nivel_urgencia_enum AS ENUM ('Bajo', 'Medio', 'Alto', 'Crítico');
CREATE TYPE tipo_donacion_enum AS ENUM ('Efectivo', 'Víveres', 'Ropa', 'Otros');
CREATE TYPE unidad_medida_enum AS ENUM ('Kilogramos', 'Libras', 'Onzas', 'Litros', 'Unidades', 'Otros');
CREATE TYPE nivel_urgencia_critico_enum AS ENUM ('Alto', 'Crítico');
CREATE TYPE estado_caso_enum AS ENUM ('Detectado', 'En Atención', 'Derivado', 'Resuelto', 'Seguimiento');
CREATE TYPE tipo_responsable_enum AS ENUM ('Voluntario', 'ONG');
CREATE TYPE tipo_alerta_enum AS ENUM ('Médica', 'Nutricional', 'Psicosocial', 'Urgente');
CREATE TYPE estado_alerta_enum AS ENUM ('Pendiente', 'Atendida', 'Escalada', 'Cerrada');
CREATE TYPE prioridad_enum AS ENUM ('Baja', 'Media', 'Alta', 'Crítica');

-- Nueva tabla usuarios: nueva tabla para gestión de usuarios del sistema
CREATE TABLE Usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (POSITION('@' IN email) > 0),
    password VARCHAR(255) NOT NULL, -- Debe almacenarse encriptada para evitar hackeos
    rol rol_enum,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    ultimo_acceso TIMESTAMP,
    estado BOOLEAN DEFAULT TRUE,
    id_referencia INT, -- ID de la entidad relacionada (ONG, voluntario, lider) segun el tipo_referencia.
    tipo_referencia tipo_referencia_enum
);

-- Nueva tabla niños: para seguimiento detallado de niños en riesgo
CREATE TABLE Ninos (
    id_nino SERIAL PRIMARY KEY,
    id_familia INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL CHECK (fecha_nacimiento <= CURRENT_DATE),
    genero genero_enum,
    peso DOUBLE PRECISION CHECK (peso > 0),
    talla DOUBLE PRECISION CHECK (talla > 0),
    imc DOUBLE PRECISION GENERATED ALWAYS AS (peso / (talla * talla)) STORED,  -- Cálculo automático IMC
    estado_nutricional estado_nutricional_enum,
    fecha_evaluacion DATE DEFAULT CURRENT_DATE,
    alergias TEXT,
    observaciones TEXT,
    estado BOOLEAN DEFAULT TRUE
);

-- Tabla familias: sirve para registrar a las familias de las comunidades.
CREATE TABLE Familias (
    id_familia SERIAL PRIMARY KEY,
    nombre_esposo VARCHAR(255), 
    nombre_esposa VARCHAR(255),
    dpi_esposo VARCHAR(13) UNIQUE CHECK (LENGTH(dpi_esposo) = 13), -- El DPI debe ser único y verificado que sean 13 dígitos.
    dpi_esposa VARCHAR(13) UNIQUE CHECK (LENGTH(dpi_esposa) = 13),
    fecha_nacimiento_esposo DATE CHECK (fecha_nacimiento_esposo <= CURRENT_DATE), -- Verificar que sea fecha.
    fecha_nacimiento_esposa DATE CHECK (fecha_nacimiento_esposa <= CURRENT_DATE),
    embarazada BOOLEAN,
    hijos_0_2 INT CHECK (hijos_0_2 >= 0), -- Verificar que la cantidad de hijos sea 0 o mayor (no #negativos).
    hijos_2_5 INT CHECK (hijos_2_5 >= 0),
    hijos_6_17 INT CHECK (hijos_6_17 >= 0),
    area_siembra_maiz DOUBLE PRECISION CHECK (area_siembra_maiz >= 0), -- Verifica que solo sean #positovos y 0.
    rendimiento_maiz DOUBLE PRECISION  CHECK (rendimiento_maiz >= 0),
    area_siembra_frijol DOUBLE PRECISION CHECK (area_siembra_frijol >= 0),
    rendimiento_frijol DOUBLE PRECISION CHECK (rendimiento_frijol >= 0),
    personal_encargado VARCHAR(255) DEFAULT '100'
);

--Tabla voluntarios: Registara la información de los voluntarios quienes brindarán su apoyo a las comunidades.
CREATE TABLE Voluntarios (
    id_voluntario SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL, -- Obligatorio
    apellido VARCHAR(255) NOT NULL,
    dpi VARCHAR(13) UNIQUE CHECK (LENGTH(dpi) = 13), --Registra que # de DPI sea unico y de 13 dígitos.
    fecha_nacimiento DATE CHECK (fecha_nacimiento <= CURRENT_DATE), --Verifica que sea una fecha.
    telefono VARCHAR(15) CHECK (LENGTH(telefono) BETWEEN 8 AND 15), --Verifica que el largo del # de telefono sea de 8 a 15 dígitos.
    email VARCHAR(255) UNIQUE CHECK (POSITION('@' IN email) > 0), -- Para verificar que es correo electronico debe incluir un arroba.
    direccion VARCHAR(255),
    experiencia TEXT,
    disponibilidad disponibilidad_enum, -- Se agrega valores opciones para indicar el nivel de disponibilidad.
    tipo_voluntario VARCHAR(255),
    institucion VARCHAR(255),
    fecha_registro DATE DEFAULT CURRENT_DATE,
    estado BOOLEAN DEFAULT TRUE,
    comentarios TEXT,
    habilidades TEXT -- Validar cuales son las habilidades de los voluntarios para un mejor impacto en sus labores.
);


CREATE TABLE ONGs (
    id_ong SERIAL PRIMARY KEY NOT NULL,
    nombre_ong VARCHAR(255) NOT NULL, -- Obligatorio
    direccion VARCHAR(255) NOT NULL,
    telefono VARCHAR(15) CHECK (LENGTH(telefono) BETWEEN 8 AND 15), -- verifica que el #telefonico tenga un largo de 8 a 15 digitos.
    email VARCHAR(255) UNIQUE CHECK (POSITION('@' IN email) > 0), -- si es un correo electronico debe tener un arroba.
    representante VARCHAR(255) NOT NULL,
    tipo_ong tipo_ong_enum, -- Brinda opciones más especificas.
    fecha_fundacion DATE CHECK (fecha_fundacion <= CURRENT_DATE), -- verifica que sea fecha.
    mision TEXT,
    vision TEXT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_registro DATE CHECK (fecha_registro<= CURRENT_DATE),
    sitio_web VARCHAR(255) DEFAULT '100',
    comentarios TEXT,
    personal_encargado VARCHAR(255) DEFAULT '100'
);

CREATE TABLE Comunidades (
    id_comunidad SERIAL PRIMARY KEY NOT NULL,
    nombre_comunidad VARCHAR(255) DEFAULT '100',
    codigo_ine VARCHAR(255) DEFAULT '10',
    departamento VARCHAR(255) DEFAULT '100',
    municipio VARCHAR(255) DEFAULT '100',
    numero_familias INT,
    grupo_etnico VARCHAR(255) DEFAULT '50',
    tipo_comunidad VARCHAR(255) DEFAULT '50',
    fecha_registro DATE,
    estado BOOLEAN,
    comentarios TEXT,
    personal_encargado VARCHAR(255) DEFAULT '100',
    proyectos_en_comunidad TEXT,
    recursos_disponibles TEXT,
    necesidades_comunidad TEXT,
    coordenadas_gps VARCHAR(255) -- Nueva columna para una mejor ubicación de la cominidad
);

CREATE TABLE Registros (
    id_registro SERIAL PRIMARY KEY,
    cantidad_ayuda NUMERIC(10,2) CHECK (cantidad_ayuda >= 0), -- Numero positivo.
    id_familia INT REFERENCES Familias(id_familia) ON DELETE CASCADE,
    id_voluntario INT REFERENCES Voluntarios(id_voluntario) ON DELETE SET NULL,
    id_ong INT REFERENCES ONGs(id_ong) ON DELETE SET NULL,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    tipo_ayuda tipo_ayuda_enum, -- Brinda opciones segun el tipo de ayuda.
    descripcion_ayuda TEXT,
    estado BOOLEAN DEFAULT TRUE,
    comentarios TEXT,
    personal_encargado VARCHAR(255) DEFAULT '100'
);

CREATE TABLE CResultados (
    id_capacidad SERIAL PRIMARY KEY NOT NULL,
    id_familia INT REFERENCES Familias(id_familia),
    resultado_evaluacion VARCHAR(255) NOT NULL, --Obligatorio
    descripcion_capacidad TEXT,
    nivel_capacidad VARCHAR(255) DEFAULT '50',
    fecha_registro DATE,
    estado BOOLEAN,
    comentarios TEXT,
    personal_encargado VARCHAR(255) DEFAULT '100',
    tipo_capacidad VARCHAR(255) DEFAULT '50',
    observaciones TEXT,
    fecha_actualizacion DATE,
    metodo_evaluacion TEXT DEFAULT '100',
    recomendaciones TEXT,
    seguimiento TEXT,
    tipo_registro VARCHAR(255) DEFAULT '50'
);

CREATE TABLE Actividades (
    id_actividad SERIAL PRIMARY KEY NOT NULL,
    id_familia INT REFERENCES Familias(id_familia),
    descripcion_actividad TEXT,
    fecha_actividad DATE,
    duracion VARCHAR(255) DEFAULT '50',
    responsable VARCHAR(255) NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    comentarios TEXT,
    personal_encargado VARCHAR(255) DEFAULT '100',
    tipo_actividad tipo_actividad_enum, -- Opciones para el tipo de actividad
    resultado VARCHAR(255),
    fecha_registro DATE,
    metodo_evaluacion VARCHAR(255) DEFAULT '100',
    observaciones TEXT,
    seguimiento TEXT,
    tipo_registro VARCHAR(255) DEFAULT '50'
);

CREATE TABLE Evaluaciones (
    id_evaluacion SERIAL PRIMARY KEY NOT NULL,
    id_familia INT REFERENCES Familias(id_familia),
    fecha_evaluacion DATE DEFAULT CURRENT_DATE,
    descripcion_evaluacion VARCHAR(255) NOT NULL,
    resultado VARCHAR(255) NOT NULL, -- obligatorio
    recomendaciones TEXT,
    estado BOOLEAN DEFAULT TRUE,
    comentarios TEXT,
    personal_encargado VARCHAR(255),
    metodo_evaluacion TEXT,
    fecha_registro DATE DEFAULT CURRENT_DATE,
    tipo_evaluacion tipo_evaluacion_enum, -- Opciones
    observaciones TEXT,
    seguimiento TEXT,
    tipo_registro VARCHAR(255),
    metodo_recoleccion TEXT
);

CREATE TABLE Reportes (
    id_reporte SERIAL PRIMARY KEY NOT NULL,
    id_familia INT REFERENCES Familias(id_familia),
    fecha_reporte DATE DEFAULT CURRENT_DATE,
    descripcion_reporte VARCHAR(255) NOT NULL, -- obligatorio
    estado BOOLEAN DEFAULT TRUE,
    comentarios TEXT,
    personal_encargado VARCHAR(255),
    tipo_reporte tipo_reporte_enum, -- opciones
    fecha_registro DATE DEFAULT CURRENT_DATE,
    metodo_recoleccion VARCHAR(255),
    observaciones TEXT,
    seguimiento TEXT,
    tipo_registro VARCHAR(255),
    resultado VARCHAR(255),
    recomendaciones TEXT,
    metodo_evaluacion VARCHAR(255),
    nivel_urgencia nivel_urgencia_enum  -- Nueva columna para validar la grabedar del afectado
);

CREATE TABLE Donaciones (
    id_donacion SERIAL PRIMARY KEY,
    id_ong INT REFERENCES ONGs(id_ong) ON DELETE SET NULL, -- si se elimina un registro de la tabla se establecera como null.
    id_voluntario INT REFERENCES Voluntarios(id_voluntario) ON DELETE SET NULL,
    fecha_donacion DATE DEFAULT CURRENT_DATE, 
    tipo_donacion tipo_donacion_enum, -- brinda opciones según que donación sea.
    cantidad NUMERIC(10,2) CHECK (cantidad > 0),
    unidad_medida unidad_medida_enum, -- brinda opciones segun la unidad de medida de la donación.
    estado BOOLEAN DEFAULT TRUE,
    comentarios TEXT,
    personal_encargado VARCHAR(255) DEFAULT '100',
    Seguimiento INT,
    Capacitaciones INT,
    Proyectos INT,
    destinatario VARCHAR(255),  
    fecha_entrega DATE,
    comprobante VARCHAR(255)
);

-- Nueva tabla Casos Criticos: sirve para las alertas y seguimiento de casos urgentes
CREATE TABLE Casos_Criticos (
    id_caso SERIAL PRIMARY KEY,
    id_nino INT,                      
    id_familia INT NOT NULL,
    fecha_deteccion DATE DEFAULT CURRENT_DATE,
    descripcion TEXT NOT NULL,
    nivel_urgencia nivel_urgencia_critico_enum NOT NULL,
    sintomas TEXT,
    acciones_tomadas VARCHAR(255),
    estado estado_caso_enum NOT NULL,
    id_responsable INT NOT NULL,      -- ID del responsable (voluntario, ONG)
    tipo_responsable tipo_responsable_enum,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATE,
    observaciones TEXT,
    requiere_traslado BOOLEAN DEFAULT FALSE
);

-- Tabla de alertas
CREATE TABLE Alertas (
  alerta_id SERIAL PRIMARY KEY,
  fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tipo_alerta tipo_alerta_enum NOT NULL,
  descripcion TEXT NOT NULL,
  estado estado_alerta_enum NOT NULL DEFAULT 'Pendiente',
  fecha_respuesta TIMESTAMP,
  respuesta TEXT,
  prioridad prioridad_enum NOT NULL DEFAULT 'Media',
  caso_id INT NOT NULL REFERENCES Casos_Criticos(id_caso) ON DELETE CASCADE,
  usuario_id INT NOT NULL REFERENCES Usuarios(id_usuario) ON DELETE CASCADE,
  observaciones TEXT
);

-- columna id_comunidad a Familias
ALTER TABLE Familias ADD COLUMN id_comunidad INT;
ALTER TABLE Familias ADD CONSTRAINT FK_Familias_Comunidades FOREIGN KEY (id_comunidad) REFERENCES Comunidades(id_comunidad);

-- Claves foráneas
ALTER TABLE Registros ADD CONSTRAINT FK_Registros_Familias FOREIGN KEY (id_familia) REFERENCES Familias(id_familia);
ALTER TABLE Registros ADD CONSTRAINT FK_Registros_Voluntarios FOREIGN KEY (id_voluntario) REFERENCES Voluntarios(id_voluntario);
ALTER TABLE Registros ADD CONSTRAINT FK_Registros_ONGs FOREIGN KEY (id_ong) REFERENCES ONGs(id_ong);

ALTER TABLE CResultados ADD CONSTRAINT FK_CResultados_Familias FOREIGN KEY (id_familia) REFERENCES Familias(id_familia);

ALTER TABLE Actividades ADD CONSTRAINT FK_Actividades_Familias FOREIGN KEY (id_familia) REFERENCES Familias(id_familia);

ALTER TABLE Evaluaciones ADD CONSTRAINT FK_Evaluaciones_Familias FOREIGN KEY (id_familia) REFERENCES Familias(id_familia);

ALTER TABLE Reportes ADD CONSTRAINT FK_Reportes_Familias FOREIGN KEY (id_familia) REFERENCES Familias(id_familia);

ALTER TABLE Donaciones ADD CONSTRAINT FK_Donaciones_ONGs FOREIGN KEY (id_ong) REFERENCES ONGs(id_ong);
ALTER TABLE Donaciones ADD CONSTRAINT FK_Donaciones_Voluntarios FOREIGN KEY (id_voluntario) REFERENCES Voluntarios(id_voluntario);

ALTER TABLE Ninos ADD CONSTRAINT FK_Ninos_Familias 
    FOREIGN KEY (id_familia) REFERENCES Familias(id_familia) ON DELETE CASCADE;

ALTER TABLE Casos_Criticos ADD CONSTRAINT FK_Casos_Criticos_Familias 
    FOREIGN KEY (id_familia) REFERENCES Familias(id_familia) ON DELETE CASCADE;

ALTER TABLE Casos_Criticos ADD CONSTRAINT FK_Casos_Criticos_Ninos 
    FOREIGN KEY (id_nino) REFERENCES Ninos(id_nino) ON DELETE SET NULL;

-- columna id_comunidad a ONGs
ALTER TABLE ONGs ADD COLUMN id_comunidad INT;
ALTER TABLE ONGs ADD CONSTRAINT FK_ONGs_Comunidades FOREIGN KEY (id_comunidad) REFERENCES Comunidades(id_comunidad);


-- Agregar relación de alertas y  Casos_Criticos
ALTER TABLE Alertas
ADD CONSTRAINT fk_alertas_casos
FOREIGN KEY (caso_id)
REFERENCES Casos_Criticos(id_caso)
ON DELETE CASCADE;

-- Agregar relación de alertas y Usuarios
ALTER TABLE Alertas
ADD CONSTRAINT fk_alertas_usuarios
FOREIGN KEY (usuario_id)
REFERENCES Usuarios(id_usuario)
ON DELETE CASCADE;
