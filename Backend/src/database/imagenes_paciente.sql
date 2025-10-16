CREATE TABLE IF NOT EXISTS ImagenesPaciente (
    id_imagen SERIAL PRIMARY KEY,
    id_paciente INTEGER NOT NULL REFERENCES Pacientes(id_paciente) ON DELETE CASCADE,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200),
    imagen_base64 TEXT NOT NULL,
    mime_type VARCHAR(50) DEFAULT 'image/jpeg',
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orden INTEGER DEFAULT 0
);

CREATE INDEX idx_imagenes_paciente ON ImagenesPaciente(id_paciente);
CREATE INDEX idx_imagenes_fecha ON ImagenesPaciente(fecha_subida DESC);
