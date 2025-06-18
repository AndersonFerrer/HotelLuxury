-- Insertar tipos de documento
INSERT INTO TipoDocumento (id_tipo_documento, nombre) VALUES
(1, 'DNI'),
(2, 'Carnet de Extranjería'),
(3, 'Pasaporte'),
(4, 'RUC');

-- Insertar direcciones
INSERT INTO Direccion (id_direccion, region, provincia, distrito, direccion_detallada) VALUES
-- Direcciones en Lima
(1, 'Lima', 'Lima', 'Miraflores', 'Av. Larco 123, apt. 401'),
(2, 'Lima', 'Lima', 'San Isidro', 'Calle Los Pinos 456'),
(3, 'Lima', 'Lima', 'Barranco', 'Jr. Domeyer 234'),
(4, 'Lima', 'Lima', 'Surco', 'Av. Caminos del Inca 3456'),
-- Direcciones en provincias
(5, 'Arequipa', 'Arequipa', 'Yanahuara', 'Calle Jerusalén 101'),
(6, 'Cusco', 'Cusco', 'Cusco', 'Plaza de Armas 222'),
(7, 'Piura', 'Piura', 'Piura', 'Av. Grau 789'),
(8, 'La Libertad', 'Trujillo', 'Trujillo', 'Jr. Pizarro 333'),
-- Direcciones para empleados
(9, 'Lima', 'Lima', 'Lince', 'Av. Arequipa 2345'),
(10, 'Lima', 'Lima', 'Jesus María', 'Jr. Toribio Polo 123'),
(11, 'Lima', 'Lima', 'Breña', 'Av. Venezuela 456'),
(12, 'Lima', 'Lima', 'Magdalena', 'Calle San Martín 678');

-- Insertar personas (clientes y empleados)
INSERT INTO Persona (id_persona, nombres, apellidos, id_tipo_documento, numero_documento, telefono, correo, fecha_nacimiento, id_direccion, created_at, updated_at) VALUES
-- Clientes
(1, 'Juan Carlos', 'Pérez Gómez', 1, '12345678', '987654321', 'juan.perez@email.com', '1985-05-15', 1, NOW(), NOW()),
(2, 'María Elena', 'Rodríguez Vargas', 1, '87654321', '987123456', 'maria.rodriguez@email.com', '1990-08-22', 2, NOW(), NOW()),
(3, 'Luis Alberto', 'García Mendoza', 1, '45678912', '987456123', 'luis.garcia@email.com', '1978-11-30', 3, NOW(), NOW()),
(4, 'Ana Cecilia', 'Torres Llosa', 1, '78912345', '987789123', 'ana.torres@email.com', '1995-03-10', 4, NOW(), NOW()),
(5, 'Carlos Enrique', 'Fernández Ríos', 2, 'X1234567', '987321654', 'carlos.fernandez@email.com', '1982-07-25', 5, NOW(), NOW()),
(6, 'Sofía Alejandra', 'Martínez del Solar', 1, '32165498', '987987654', 'sofia.martinez@email.com', '1993-09-18', 6, NOW(), NOW()),
(7, 'Pedro Pablo', 'Díaz Castillo', 1, '65498732', '987654987', 'pedro.diaz@email.com', '1975-12-05', 7, NOW(), NOW()),
(8, 'Lucía Isabel', 'Vega Morán', 1, '98732165', '987123987', 'lucia.vega@email.com', '1988-04-20', 8, NOW(), NOW()),
-- Empleados
(9, 'Ricardo José', 'Suárez López', 1, '14725836', '987456789', 'ricardo.suarez@hotel.com', '1980-06-12', 9, NOW(), NOW()),
(10, 'Carmen Rosa', 'Gómez Paredes', 1, '25836914', '987789456', 'carmen.gomez@hotel.com', '1987-02-28', 10, NOW(), NOW()),
(11, 'Jorge Luis', 'Ramírez Soto', 1, '36914725', '987654123', 'jorge.ramirez@hotel.com', '1973-10-15', 11, NOW(), NOW()),
(12, 'Patricia María', 'Flores Castro', 1, '47158263', '987123654', 'patricia.flores@hotel.com', '1991-07-08', 12, NOW(), NOW());

-- Insertar clientes
INSERT INTO Cliente (id_cliente, id_persona) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8);

-- Insertar puestos de trabajo
INSERT INTO Puesto (id_puesto, nombre, descripcion) VALUES
(1, 'Recepcionista', 'Atención al cliente, check-in/check-out, reservas'),
(2, 'Gerente', 'Administración general del hotel'),
(3, 'Limpieza', 'Limpieza y mantenimiento de habitaciones'),
(4, 'Conserje', 'Asistencia a huéspedes con equipaje y recomendaciones'),
(5, 'Chef', 'Encargado de la cocina y menú del hotel');

-- Insertar empleados
INSERT INTO Empleado (id_empleado, id_persona, id_puesto) VALUES
(1, 9, 1),
(2, 10, 2),
(3, 11, 3),
(4, 12, 4);

-- Insertar tipos de habitación
INSERT INTO TipoHabitacion (id_tipo_habitacion, nombre, descripcion, precio_noche) VALUES
(1, 'Sencilla', 'Habitación individual con cama matrimonial', 150.00),
(2, 'Doble', 'Habitación con dos camas individuales', 220.00),
(3, 'Suite', 'Habitación amplia con sala de estar separada', 350.00),
(4, 'Familiar', 'Habitación grande con capacidad para 4 personas', 280.00),
(5, 'Presidencial', 'Suite de lujo con todas las comodidades', 500.00);

-- Insertar características de habitaciones
INSERT INTO CaracteristicaHabitacion (id_caracteristica, nombre, descripcion) VALUES
(1, 'Wi-Fi', 'Conexión a internet inalámbrico'),
(2, 'Aire acondicionado', 'Control de temperatura'),
(3, 'TV pantalla plana', 'Televisor con cable'),
(4, 'Minibar', 'Refrigerador pequeño con bebidas'),
(5, 'Caja fuerte', 'Seguridad para objetos valiosos'),
(6, 'Jacuzzi', 'Bañera con hidromasaje'),
(7, 'Vista al mar', 'Vista panorámica al océano'),
(8, 'Balcón', 'Balcón privado con vista'),
(9, 'Room service', 'Servicio de comida a la habitación 24/7'),
(10, 'Escritorio', 'Área de trabajo con escritorio');

-- Insertar habitaciones (más de 10)
INSERT INTO Habitacion (id_habitacion, numero, estado, id_tipo_habitacion) VALUES
-- Habitaciones sencillas
(1, '101', 'Disponible', 1),
(2, '102', 'Disponible', 1),
(3, '103', 'Ocupada', 1),
(4, '104', 'Mantenimiento', 1),
-- Habitaciones dobles
(5, '201', 'Disponible', 2),
(6, '202', 'Disponible', 2),
(7, '203', 'Ocupada', 2),
(8, '204', 'Disponible', 2),
-- Suites
(9, '301', 'Disponible', 3),
(10, '302', 'Ocupada', 3),
-- Habitaciones familiares
(11, '401', 'Disponible', 4),
(12, '402', 'Disponible', 4),
-- Suites presidenciales
(13, '501', 'Disponible', 5),
(14, '502', 'Disponible', 5),
-- Más habitaciones
(15, '105', 'Disponible', 1),
(16, '205', 'Disponible', 2),
(17, '303', 'Disponible', 3),
(18, '403', 'Disponible', 4);

-- Insertar características para las habitaciones
INSERT INTO HabitacionCaracteristica (id_habitacion, id_caracteristica) VALUES
-- Habitación 101 (sencilla)
(1, 1), (1, 2), (1, 3),
-- Habitación 102 (sencilla)
(2, 1), (2, 2), (2, 3),
-- Habitación 103 (sencilla)
(3, 1), (3, 2), (3, 3), (3, 4),
-- Habitación 201 (doble)
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5),
-- Habitación 202 (doble)
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5),
-- Suite 301
(9, 1), (9, 2), (9, 3), (9, 4), (9, 5), (9, 6), (9, 8),
-- Suite 302
(10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 8),
-- Familiar 401
(11, 1), (11, 2), (11, 3), (11, 4), (11, 5),
-- Presidencial 501
(13, 1), (13, 2), (13, 3), (13, 4), (13, 5), (13, 6), (13, 7), (13, 8), (13, 9), (13, 10);

-- Insertar métodos de pago
INSERT INTO MetodoPago (id_metodo_pago, nombre) VALUES
(1, 'Efectivo'),
(2, 'Tarjeta de Crédito'),
(3, 'Tarjeta de Débito'),
(4, 'Transferencia Bancaria'),
(5, 'Yape'),
(6, 'Plin');

-- Insertar reservas
INSERT INTO Reserva (id_reserva, id_cliente, id_habitacion, fecha_reserva, fecha_checkin, fecha_checkout, estado, total) VALUES
-- Reserva actual ocupada (habitación 103)
(1, 1, 3, '2023-05-10', '2023-05-15', '2023-05-20', 'Activa', 750.00),
-- Reserva actual ocupada (habitación 203)
(2, 3, 7, '2023-05-12', '2023-05-18', '2023-05-22', 'Activa', 880.00),
-- Reserva actual ocupada (suite 302)
(3, 5, 10, '2023-05-14', '2023-05-16', '2023-05-21', 'Activa', 1750.00),
-- Reservas futuras
(4, 2, 9, '2023-05-01', '2023-06-01', '2023-06-05', 'Confirmada', 1400.00),
(5, 4, 13, '2023-05-05', '2023-06-10', '2023-06-15', 'Confirmada', 2500.00),
-- Reservas pasadas
(6, 6, 5, '2023-04-20', '2023-04-25', '2023-04-28', 'Finalizada', 660.00),
(7, 7, 11, '2023-04-15', '2023-04-20', '2023-04-25', 'Finalizada', 1400.00),
(8, 8, 1, '2023-04-10', '2023-04-12', '2023-04-15', 'Finalizada', 450.00);

-- Insertar pagos
INSERT INTO Pago (id_pago, id_reserva, monto, fecha_pago, id_metodo_pago) VALUES
-- Pagos para reserva 1
(1, 1, 300.00, '2023-05-10 10:15:00', 2),
(2, 1, 450.00, '2023-05-18 16:30:00', 1),
-- Pago completo para reserva 2
(3, 2, 880.00, '2023-05-12 11:20:00', 2),
-- Pago inicial para reserva 3
(4, 3, 1000.00, '2023-05-14 09:45:00', 4),
-- Pago completo para reserva 4
(5, 4, 1400.00, '2023-05-02 14:10:00', 5),
-- Pago inicial para reserva 5
(6, 5, 1500.00, '2023-05-05 17:25:00', 2),
-- Pagos completos para reservas pasadas
(7, 6, 660.00, '2023-04-20 12:30:00', 3),
(8, 7, 1400.00, '2023-04-15 13:45:00', 4),
(9, 8, 450.00, '2023-04-10 18:20:00', 1);

-- Insertar huéspedes adicionales
INSERT INTO Huesped (id_huesped, id_reserva, nombres, apellidos, id_tipo_documento, numero_documento) VALUES
-- Huéspedes para reserva 1 (habitación doble)
(1, 1, 'Laura Susana', 'Gómez Pérez', 1, '11223344'),
-- Huéspedes para reserva 2 (habitación doble)
(2, 2, 'Carlos Alberto', 'García López', 1, '22334455'),
(3, 2, 'Ana Patricia', 'García López', 1, '33445566'),
-- Huéspedes para reserva 3 (suite)
(4, 3, 'Elena María', 'Fernández Ríos', 2, 'X2345678'),
-- Huéspedes para reserva 7 (familiar)
(5, 7, 'Pedro Antonio', 'Díaz Morán', 1, '44556677'),
(6, 7, 'Lucía Fernanda', 'Díaz Morán', 1, '55667788'),
(7, 7, 'Jorge Luis', 'Díaz Morán', 1, '66778899');

-- Insertar historial de reservas
INSERT INTO HistorialReserva (id_historial, id_reserva, estado_anterior, estado_nuevo, fecha_cambio) VALUES
-- Cambios para reserva 1
(1, 1, 'Pendiente', 'Confirmada', '2023-05-01 09:00:00'),
(2, 1, 'Confirmada', 'Activa', '2023-05-15 14:30:00'),
-- Cambios para reserva 2
(3, 2, 'Pendiente', 'Confirmada', '2023-05-05 10:15:00'),
(4, 2, 'Confirmada', 'Activa', '2023-05-18 15:45:00'),
-- Cambios para reserva 3
(5, 3, 'Pendiente', 'Confirmada', '2023-05-10 11:20:00'),
(6, 3, 'Confirmada', 'Activa', '2023-05-16 16:00:00'),
-- Cambios para reservas pasadas
(7, 6, 'Pendiente', 'Confirmada', '2023-04-18 14:00:00'),
(8, 6, 'Confirmada', 'Activa', '2023-04-25 12:30:00'),
(9, 6, 'Activa', 'Finalizada', '2023-04-28 10:00:00'),
(10, 7, 'Pendiente', 'Confirmada', '2023-04-12 16:45:00'),
(11, 7, 'Confirmada', 'Activa', '2023-04-20 14:15:00'),
(12, 7, 'Activa', 'Finalizada', '2023-04-25 11:00:00');