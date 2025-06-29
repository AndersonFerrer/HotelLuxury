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

}
?>