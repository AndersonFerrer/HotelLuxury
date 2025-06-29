<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

class DashboardService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function obtenerEstadisticasDashboard() {
        try {
            // Obtener estadísticas en una sola consulta para mejor rendimiento
            $stats = [
                'reservas_totales' => $this->contarReservasTotales(),
                'ingresos_totales' => $this->calcularIngresosTotales(),
                'tasa_ocupacion' => $this->calcularTasaOcupacion(),
                'nuevos_clientes' => $this->contarNuevosClientes(),
                'reservas_recientes' => $this->obtenerReservasRecientes()
            ];

            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    private function contarReservasTotales() {
        $sql = "SELECT COUNT(*) as total FROM Reserva";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }

    private function calcularIngresosTotales() {
        $sql = "SELECT COALESCE(SUM(total), 0) as ingresos FROM Reserva WHERE estado = 'Confirmada' OR estado = 'Completada'";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['ingresos'];
    }

    private function calcularTasaOcupacion() {
        // Calculamos la tasa de ocupación como (noches ocupadas / noches totales) * 100
        $sql = "SELECT 
                (SELECT COUNT(*) FROM Habitacion WHERE estado = 'Ocupada') as ocupadas,
                (SELECT COUNT(*) FROM Habitacion) as total";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            return round(($result['ocupadas'] / $result['total']) * 100);
        }
        return 0;
    }

    private function contarNuevosClientes() {
        // Clientes registrados en los últimos 30 días
        $sql = "SELECT COUNT(*) as nuevos 
                FROM Cliente c
                JOIN Persona p ON c.id_persona = p.id_persona
                WHERE p.created_at >= NOW() - INTERVAL '30 days'";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['nuevos'];
    }

        public function obtenerReservasRecientes($limite = 5) {
        try {
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
                ORDER BY r.fecha_reserva DESC
                LIMIT ?";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$limite]);
            
            $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return $reservas;
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
?>