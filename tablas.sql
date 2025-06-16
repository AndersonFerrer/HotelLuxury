-- Tabla: TipoDocumento
CREATE TABLE TipoDocumento (
    id_tipo_documento INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla: Direccion
CREATE TABLE Direccion (
    id_direccion INT PRIMARY KEY,
    region VARCHAR(100) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    direccion_detallada VARCHAR(255) NOT NULL
);

-- Tabla: Persona
CREATE TABLE Persona (
    id_persona INT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    id_tipo_documento INT NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    telefono VARCHAR(20),
    correo VARCHAR(100),
    fecha_nacimiento DATE,
    id_direccion INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (id_tipo_documento) REFERENCES TipoDocumento(id_tipo_documento),
    FOREIGN KEY (id_direccion) REFERENCES Direccion(id_direccion)
);

-- Tabla: Cliente
CREATE TABLE Cliente (
    id_cliente INT PRIMARY KEY,
    id_persona INT NOT NULL,
    FOREIGN KEY (id_persona) REFERENCES Persona(id_persona)
);

-- Tabla: Puesto
CREATE TABLE Puesto (
    id_puesto INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla: Empleado
CREATE TABLE Empleado (
    id_empleado INT PRIMARY KEY,
    id_persona INT NOT NULL,
    id_puesto INT NOT NULL,
    FOREIGN KEY (id_persona) REFERENCES Persona(id_persona),
    FOREIGN KEY (id_puesto) REFERENCES Puesto(id_puesto)
);

-- Tabla: TipoHabitacion
CREATE TABLE TipoHabitacion (
    id_tipo_habitacion INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio_noche DECIMAL(10,2) NOT NULL
);

-- Tabla: Habitacion
CREATE TABLE Habitacion (
    id_habitacion INT PRIMARY KEY,
    numero VARCHAR(10) NOT NULL,
    estado VARCHAR(50), -- Enum sugerido
    id_tipo_habitacion INT NOT NULL,
    FOREIGN KEY (id_tipo_habitacion) REFERENCES TipoHabitacion(id_tipo_habitacion)
);

-- Tabla: CaracteristicaHabitacion
CREATE TABLE CaracteristicaHabitacion (
    id_caracteristica INT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- Tabla: HabitacionCaracteristica
CREATE TABLE HabitacionCaracteristica (
    id_habitacion INT NOT NULL,
    id_caracteristica INT NOT NULL,
    PRIMARY KEY (id_habitacion, id_caracteristica),
    FOREIGN KEY (id_habitacion) REFERENCES Habitacion(id_habitacion),
    FOREIGN KEY (id_caracteristica) REFERENCES CaracteristicaHabitacion(id_caracteristica)
);

-- Tabla: Reserva
CREATE TABLE Reserva (
    id_reserva INT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_habitacion INT NOT NULL,
    fecha_reserva DATE NOT NULL,
    fecha_checkin DATE,
    fecha_checkout DATE,
    estado VARCHAR(50), -- Enum sugerido
    total DECIMAL(10,2),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_habitacion) REFERENCES Habitacion(id_habitacion)
);

-- Tabla: MetodoPago
CREATE TABLE MetodoPago (
    id_metodo_pago INT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- Tabla: Pago
CREATE TABLE Pago (
    id_pago INT PRIMARY KEY,
    id_reserva INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP,
    id_metodo_pago INT,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva),
    FOREIGN KEY (id_metodo_pago) REFERENCES MetodoPago(id_metodo_pago)
);

-- Tabla: Huesped
CREATE TABLE Huesped (
    id_huesped INT PRIMARY KEY,
    id_reserva INT NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    id_tipo_documento INT NOT NULL,
    numero_documento VARCHAR(20) NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva),
    FOREIGN KEY (id_tipo_documento) REFERENCES TipoDocumento(id_tipo_documento)
);

-- Tabla: HistorialReserva
CREATE TABLE HistorialReserva (
    id_historial INT PRIMARY KEY,
    id_reserva INT NOT NULL,
    estado_anterior VARCHAR(50), -- Enum sugerido
    estado_nuevo VARCHAR(50), -- Enum sugerido
    fecha_cambio TIMESTAMP,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva)
);
