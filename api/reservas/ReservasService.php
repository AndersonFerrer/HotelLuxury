<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

class ReservasService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /**
     * Obtiene el total de reservas, las confirmadas, pendientes, total de ingresos y un array de todas las reservas
     */
    public function obtenerReservas() {
        try {
            $sql = "SELECT COUNT(*) AS total_reservas FROM Reserva";
            $stmt = $this->conn->query($sql);
             $stmt->execute();
            $total_reservas = $stmt->fetch(PDO::FETCH_ASSOC)['total_reservas'];

            $sql = "SELECT COUNT(*) AS total_confirmadas FROM Reserva WHERE estado = 'Confirmada'";
            $stmt = $this->conn->query($sql);
             $stmt->execute();
            $total_confirmadas = $stmt->fetch(PDO::FETCH_ASSOC)['total_confirmadas'];

            $sql = "SELECT COUNT(*) AS total_pendientes FROM Reserva WHERE estado = 'Pendiente'";
            $stmt = $this->conn->query($sql);
             $stmt->execute();
            $total_pendientes = $stmt->fetch(PDO::FETCH_ASSOC)['total_pendientes'];
            
            $sql = "SELECT COALESCE(SUM(total), 0) as ingresos FROM Reserva WHERE estado = 'Confirmada' OR estado = 'Completada'";
            $stmt = $this->conn->query($sql);
             $stmt->execute();
            $ingresos = $stmt->fetch(PDO::FETCH_ASSOC)['ingresos'];

            $sql = "SELECT 
                    r.id_reserva as ID,
                    CONCAT(p.nombres, ' ', p.apellidos) as HUESPED,
                    CONCAT('Habitación #', h.numero, ' - ', th.nombre) as HABITACION,
                    r.total as TOTAL,
                    TO_CHAR(r.fecha_checkin, 'DD/MM/YYYY') as CHECKIN,
                    TO_CHAR(r.fecha_checkout, 'DD/MM/YYYY') as CHECKOUT,
                    r.estado as ESTADO
                FROM Reserva r
                JOIN Cliente c ON r.id_cliente = c.id_cliente
                JOIN Persona p ON c.id_persona = p.id_persona
                JOIN Habitacion h ON r.id_habitacion = h.id_habitacion
                JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                ORDER BY r.fecha_reserva DESC";
            $stmt = $this->conn->query($sql);
             $stmt->execute();
            $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'success' => true,
                'data' => [
                    'total_reservas' => $total_reservas,
                    'total_confirmadas' => $total_confirmadas,
                    'total_pendientes' => $total_pendientes,
                    'total_ingresos' => $ingresos,
                    'reservas' => $reservas
                ],
                'message' => 'Reservas obtenidas.'
            ];
            
        } catch (PDOException $e) {
            error_log("Error al obtener reservas: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener reservas'
            ];
        }
    }

    /**
     * Inserta una nueva reserva
     */
    public function insertarReserva($datos) {
        try {
            // Iniciar sesión si no está activa
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Verificar que el usuario esté autenticado y sea cliente
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'cliente') {
                return [
                    'success' => false,
                    'error' => 'Debe iniciar sesión como cliente para realizar una reserva'
                ];
            }

            $id_cliente = $_SESSION['usuario']['id_cliente'];
            $id_habitacion = $datos['id_habitacion'];
            $fecha_checkin = $datos['fecha_checkin'];
            $fecha_checkout = $datos['fecha_checkout'];
            $total = $datos['total'];

            // Validar fechas
            $fecha_checkin_obj = new DateTime($fecha_checkin);
            $fecha_checkout_obj = new DateTime($fecha_checkout);
            $fecha_actual = new DateTime();

            if ($fecha_checkin_obj < $fecha_actual) {
                return [
                    'success' => false,
                    'error' => 'La fecha de check-in no puede ser anterior a hoy'
                ];
            }

            if ($fecha_checkout_obj <= $fecha_checkin_obj) {
                return [
                    'success' => false,
                    'error' => 'La fecha de check-out debe ser posterior al check-in'
                ];
            }

            // Verificar que la habitación esté disponible
            $stmt = $this->conn->prepare("
                SELECT h.estado, th.nombre as tipo_habitacion, th.precio_noche
                FROM Habitacion h
                INNER JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                WHERE h.id_habitacion = ?
            ");
            $stmt->execute([$id_habitacion]);
            $habitacion = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$habitacion) {
                return [
                    'success' => false,
                    'error' => 'Habitación no encontrada'
                ];
            }

            if ($habitacion['estado'] !== 'Disponible') {
                return [
                    'success' => false,
                    'error' => 'La habitación no está disponible para reserva'
                ];
            }

            // Verificar que no haya conflictos de fechas
            $stmt = $this->conn->prepare("
                SELECT COUNT(*) as conflictos
                FROM Reserva
                WHERE id_habitacion = ? 
                AND estado IN ('Pendiente', 'Confirmada', 'Activa')
                AND (
                    (fecha_checkin <= ? AND fecha_checkout > ?) OR
                    (fecha_checkin < ? AND fecha_checkout >= ?) OR
                    (fecha_checkin >= ? AND fecha_checkout <= ?)
                )
            ");
            $stmt->execute([$id_habitacion, $fecha_checkin, $fecha_checkin, $fecha_checkout, $fecha_checkout, $fecha_checkin, $fecha_checkout]);
            $conflictos = $stmt->fetch(PDO::FETCH_ASSOC)['conflictos'];

            if ($conflictos > 0) {
                return [
                    'success' => false,
                    'error' => 'La habitación ya está reservada para las fechas seleccionadas'
                ];
            }

            // Insertar la reserva
            $stmt = $this->conn->prepare("
                INSERT INTO Reserva (id_cliente, id_habitacion, fecha_reserva, fecha_checkin, fecha_checkout, estado, total)
                VALUES (?, ?, CURRENT_DATE, ?, ?, 'Pendiente', ?)
                RETURNING id_reserva
            ");
            $stmt->execute([$id_cliente, $id_habitacion, $fecha_checkin, $fecha_checkout, $total]);
            $id_reserva = $stmt->fetch(PDO::FETCH_ASSOC)['id_reserva'];

            return [
                'success' => true,
                'message' => 'Reserva creada exitosamente',
                'data' => [
                    'id_reserva' => $id_reserva,
                    'habitacion' => $habitacion['tipo_habitacion'],
                    'fecha_checkin' => $fecha_checkin,
                    'fecha_checkout' => $fecha_checkout,
                    'total' => $total
                ]
            ];

        } catch (PDOException $e) {
            error_log("Error al insertar reserva: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al crear la reserva'
            ];
        }
    }

    /**
     * Cambia el estado de una reserva (método genérico)
     */
    public function cambiarEstadoReserva($id_reserva, $nuevo_estado) {
        try {
            // Iniciar sesión si no está activa
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }

            // Verificar que el usuario esté autenticado y sea empleado
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'empleado') {
                return [
                    'success' => false,
                    'error' => 'Solo los empleados pueden gestionar reservas'
                ];
            }

            // Validar que la reserva existe
            $stmt = $this->conn->prepare("
                SELECT r.*, h.id_habitacion, h.estado as estado_habitacion, th.nombre as tipo_habitacion
                FROM Reserva r
                JOIN Habitacion h ON r.id_habitacion = h.id_habitacion
                JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                WHERE r.id_reserva = ?
            ");
            $stmt->execute([$id_reserva]);
            $reserva = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$reserva) {
                return [
                    'success' => false,
                    'error' => 'Reserva no encontrada'
                ];
            }

            // Validar transición de estado
            $estadosValidos = ['Pendiente', 'Confirmada', 'Cancelada', 'Activa', 'Completada'];
            if (!in_array($nuevo_estado, $estadosValidos)) {
                return [
                    'success' => false,
                    'error' => 'Estado no válido'
                ];
            }

            // Iniciar transacción
            $this->conn->beginTransaction();

            try {
                // Actualizar estado de la reserva
                $stmt = $this->conn->prepare("
                    UPDATE Reserva 
                    SET estado = ? 
                    WHERE id_reserva = ?
                ");
                $stmt->execute([$nuevo_estado, $id_reserva]);

                // Actualizar estado de la habitación según el nuevo estado
                $nuevoEstadoHabitacion = $this->determinarEstadoHabitacion($nuevo_estado);
                
                if ($nuevoEstadoHabitacion) {
                    $stmt = $this->conn->prepare("
                        UPDATE Habitacion 
                        SET estado = ? 
                        WHERE id_habitacion = ?
                    ");
                    $stmt->execute([$nuevoEstadoHabitacion, $reserva['id_habitacion']]);
                }

                // Registrar en historial
                $stmt = $this->conn->prepare("
                    INSERT INTO HistorialReserva (id_reserva, estado_anterior, estado_nuevo, fecha_cambio)
                    VALUES (?, ?, ?, NOW())
                ");
                $stmt->execute([$id_reserva, $reserva['estado'], $nuevo_estado]);

                // Confirmar transacción
                $this->conn->commit();

                return [
                    'success' => true,
                    'message' => "Reserva actualizada a estado: $nuevo_estado",
                    'data' => [
                        'id_reserva' => $id_reserva,
                        'estado_anterior' => $reserva['estado'],
                        'estado_nuevo' => $nuevo_estado,
                        'habitacion' => $reserva['tipo_habitacion'],
                        'estado_habitacion' => $nuevoEstadoHabitacion
                    ]
                ];

            } catch (Exception $e) {
                $this->conn->rollBack();
                throw $e;
            }

        } catch (PDOException $e) {
            error_log("Error al cambiar estado de reserva: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al actualizar la reserva'
            ];
        }
    }

    /**
     * Confirma una reserva (cambia estado a 'Confirmada')
     */
    public function confirmarReserva($id_reserva) {
        return $this->cambiarEstadoReserva($id_reserva, 'Confirmada');
    }

    /**
     * Rechaza una reserva (cambia estado a 'Cancelada')
     */
    public function rechazarReserva($id_reserva) {
        return $this->cambiarEstadoReserva($id_reserva, 'Cancelada');
    }

    /**
     * Cancela una reserva (cambia estado a 'Cancelada')
     */
    public function cancelarReserva($id_reserva) {
        return $this->cambiarEstadoReserva($id_reserva, 'Cancelada');
    }

    /**
     * Marca una reserva como activa (check-in realizado)
     */
    public function activarReserva($id_reserva) {
        return $this->cambiarEstadoReserva($id_reserva, 'Activa');
    }

    /**
     * Marca una reserva como completada (check-out realizado)
     */
    public function completarReserva($id_reserva) {
        return $this->cambiarEstadoReserva($id_reserva, 'Completada');
    }

    /**
     * Determina el estado de la habitación basado en el estado de la reserva
     */
    private function determinarEstadoHabitacion($estadoReserva) {
        switch ($estadoReserva) {
            case 'Confirmada':
            case 'Activa':
                return 'Ocupada';
            case 'Cancelada':
            case 'Completada':
                return 'Disponible';
            case 'Pendiente':
                return 'Disponible'; // Las reservas pendientes no afectan disponibilidad
            default:
                return null;
        }
    }
}
?>