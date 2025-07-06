-- Tabla: TipoDocumento
CREATE TABLE TipoDocumento (
    id_tipo_documento SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla: Direccion
CREATE TABLE Direccion (
    id_direccion SERIAL PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    direccion_detallada VARCHAR(255) NOT NULL
);

-- Tabla: Persona
CREATE TABLE Persona (
    id_persona SERIAL PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    id_tipo_documento INT NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    id_direccion INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tipo_documento) REFERENCES TipoDocumento(id_tipo_documento),
    FOREIGN KEY (id_direccion) REFERENCES Direccion(id_direccion),
    CONSTRAINT uk_persona_num_doc UNIQUE (id_tipo_documento, numero_documento),
    CONSTRAINT uk_persona_correo UNIQUE (correo)
);

-- Tabla: Cliente
CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    id_persona INT NOT NULL,
    FOREIGN KEY (id_persona) REFERENCES Persona(id_persona),
    CONSTRAINT uk_cliente_persona UNIQUE (id_persona)
);

-- Tabla: Puesto
CREATE TABLE Puesto (
    id_puesto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    CONSTRAINT uk_puesto_nombre UNIQUE (nombre)
);

-- Tabla: Empleado
CREATE TABLE Empleado (
    id_empleado SERIAL PRIMARY KEY,
    id_persona INT NOT NULL,
    id_puesto INT NOT NULL,
    FOREIGN KEY (id_persona) REFERENCES Persona(id_persona),
    FOREIGN KEY (id_puesto) REFERENCES Puesto(id_puesto),
    CONSTRAINT uk_empleado_persona UNIQUE (id_persona)
);

-- Tabla: TipoHabitacion
CREATE TABLE TipoHabitacion (
    id_tipo_habitacion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_noche DECIMAL(10,2) NOT NULL,
    aforo INT NOT NULL DEFAULT 4,
    CONSTRAINT uk_tipohab_nombre UNIQUE (nombre)
);

-- Tabla: Habitacion
CREATE TABLE Habitacion (
    id_habitacion SERIAL PRIMARY KEY,
    numero VARCHAR(10) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Disponible',
    id_tipo_habitacion INT NOT NULL,
    FOREIGN KEY (id_tipo_habitacion) REFERENCES TipoHabitacion(id_tipo_habitacion),
    CONSTRAINT uk_habitacion_numero UNIQUE (numero)
);

-- Tabla: Caracteristica
CREATE TABLE Caracteristica (
    id_caracteristica SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    CONSTRAINT uk_caracteristica_nombre UNIQUE (nombre)
);

-- Tabla: HabitacionCaracteristica
CREATE TABLE TipoHabitacionCaracteristica (
    id_habitacion INT NOT NULL,
    id_caracteristica INT NOT NULL,
    PRIMARY KEY (id_tipo_habitacion, id_caracteristica),
    FOREIGN KEY (id_tipo_habitacion) REFERENCES TipoHabitacion(id_tipo_habitacion) ON DELETE CASCADE,
    FOREIGN KEY (id_caracteristica) REFERENCES CaracteristicaTipoHabitacion(id_caracteristica) ON DELETE CASCADE
);

-- Tabla: Reserva
CREATE TABLE Reserva (
    id_reserva SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_habitacion INT NOT NULL,
    fecha_reserva DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_checkin DATE,
    fecha_checkout DATE,
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_habitacion) REFERENCES Habitacion(id_habitacion)
);

-- Tabla: MetodoPago
CREATE TABLE MetodoPago (
    id_metodo_pago SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    CONSTRAINT uk_metodopago_nombre UNIQUE (nombre)
);

-- Tabla: Pago
CREATE TABLE Pago (
    id_pago SERIAL PRIMARY KEY,
    id_reserva INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_metodo_pago INT,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva),
    FOREIGN KEY (id_metodo_pago) REFERENCES MetodoPago(id_metodo_pago)
);

-- Tabla: HistorialReserva
CREATE TABLE HistorialReserva (
    id_historial SERIAL PRIMARY KEY,
    id_reserva INT NOT NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_persona_documento ON Persona(id_tipo_documento, numero_documento);
CREATE INDEX idx_persona_correo ON Persona(correo);
CREATE INDEX idx_habitacion_tipo ON Habitacion(id_tipo_habitacion);
CREATE INDEX idx_reserva_cliente ON Reserva(id_cliente);
CREATE INDEX idx_reserva_habitacion ON Reserva(id_habitacion);
CREATE INDEX idx_reserva_fechas ON Reserva(fecha_checkin, fecha_checkout);