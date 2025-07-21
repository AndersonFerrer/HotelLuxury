<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

class HuespedService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }
    /**
     * Devuelve estadísticas globales de huéspedes y reservas
     */
    public function getStats() {
        try {
            // Total de huéspedes
            $sqlTotal = "SELECT COUNT(*) FROM Cliente";
            $totalHuespedes = (int)$this->conn->query($sqlTotal)->fetchColumn();

            // Total en hotel (huéspedes con reserva activa y checkin <= hoy < checkout)
            $sqlEnHotel = "SELECT COUNT(DISTINCT r.id_cliente) FROM Reserva r WHERE r.estado = 'Activa' AND r.fecha_checkin <= CURRENT_DATE AND r.fecha_checkout > CURRENT_DATE";
            $enHotel = (int)$this->conn->query($sqlEnHotel)->fetchColumn();

            // Reservas activas (clientes con reserva en estado 'Activa')
            $sqlReservasActivas = "SELECT COUNT(DISTINCT r.id_cliente) FROM Reserva r WHERE r.estado = 'Activa'";
            $reservasActivas = (int)$this->conn->query($sqlReservasActivas)->fetchColumn();

            // Total reservas (todas las reservas registradas)
            $sqlTotalReservas = "SELECT COUNT(*) FROM Reserva";
            $totalReservas = (int)$this->conn->query($sqlTotalReservas)->fetchColumn();

            return [
                'success' => true,
                'total_huespedes' => $totalHuespedes,
                'en_hotel' => $enHotel,
                'reservas_activas' => $reservasActivas,
                'total_reservas' => $totalReservas
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Obtiene todos los huéspedes (clientes) con sus datos personales y dirección
     */
    public function getAllHuespedes() {
        try {
            $sql = "SELECT c.id_cliente, p.id_persona, p.nombres, p.apellidos, p.id_tipo_documento, p.numero_documento, p.telefono, p.correo, p.fecha_nacimiento, d.region, d.provincia, d.distrito, d.direccion_detallada
                    FROM Cliente c
                    INNER JOIN Persona p ON c.id_persona = p.id_persona
                    LEFT JOIN Direccion d ON p.id_direccion = d.id_direccion
                    ORDER BY p.apellidos, p.nombres";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $huespedesRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $result = [];
            foreach ($huespedesRaw as $row) {
                $id_cliente = $row['id_cliente'];
                // Obtener reserva actual (Activa), si no hay, la última registrada
                $sqlReservaActiva = "SELECT r.id_reserva, r.fecha_checkin, r.fecha_checkout, r.estado, r.total, h.numero AS habitacion_numero, th.nombre AS habitacion_tipo
                    FROM Reserva r
                    INNER JOIN Habitacion h ON r.id_habitacion = h.id_habitacion
                    INNER JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                    WHERE r.id_cliente = ? AND r.estado = 'Activa'
                    ORDER BY r.fecha_checkout DESC, r.fecha_reserva DESC LIMIT 1";
                $stmtReservaActiva = $this->conn->prepare($sqlReservaActiva);
                $stmtReservaActiva->execute([$id_cliente]);
                $reserva = $stmtReservaActiva->fetch(PDO::FETCH_ASSOC);
                if (!$reserva) {
                    // Si no hay activa, obtener la última registrada
                    $sqlReservaUltima = "SELECT r.id_reserva, r.fecha_checkin, r.fecha_checkout, r.estado, r.total, h.numero AS habitacion_numero, th.nombre AS habitacion_tipo
                        FROM Reserva r
                        INNER JOIN Habitacion h ON r.id_habitacion = h.id_habitacion
                        INNER JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                        WHERE r.id_cliente = ?
                        ORDER BY r.fecha_checkout DESC, r.fecha_reserva DESC LIMIT 1";
                    $stmtReservaUltima = $this->conn->prepare($sqlReservaUltima);
                    $stmtReservaUltima->execute([$id_cliente]);
                    $reserva = $stmtReservaUltima->fetch(PDO::FETCH_ASSOC);
                }
                // Cantidad de reservas
                $sqlHist = "SELECT COUNT(*) FROM Reserva WHERE id_cliente = ?";
                $stmtHist = $this->conn->prepare($sqlHist);
                $stmtHist->execute([$id_cliente]);
                $historial_reservas = (int)$stmtHist->fetchColumn();
                $item = [
                    'id_huesped' => (int)$row['id_cliente'],
                    'nombres' => $row['nombres'],
                    'apellidos' => $row['apellidos'],
                    'id_tipo_documento' => (int)$row['id_tipo_documento'],
                    'numero_documento' => $row['numero_documento'],
                    'reserva' => $reserva ? [
                        'id_reserva' => (int)$reserva['id_reserva'],
                        'fecha_checkin' => $reserva['fecha_checkin'],
                        'fecha_checkout' => $reserva['fecha_checkout'],
                        'estado' => $reserva['estado'],
                        'habitacion' => [
                            'numero' => $reserva['habitacion_numero'],
                            'tipo' => $reserva['habitacion_tipo']
                        ],
                        'total' => (float)$reserva['total'],
                    ] : null,
                    'cliente' => [
                        'persona' => [
                            'telefono' => $row['telefono'],
                            'correo' => $row['correo'],
                            'fecha_nacimiento' => $row['fecha_nacimiento'],
                            'direccion' => [
                                'region' => $row['region'],
                                'provincia' => $row['provincia'],
                                'distrito' => $row['distrito'],
                                'direccion_detallada' => $row['direccion_detallada'],
                            ]
                        ]
                    ],
                    'historial_reservas' => $historial_reservas,
                    'ultima_estancia' => $reserva ? $reserva['fecha_checkout'] : null,
                    'estado_actual' => $reserva ? $reserva['estado'] : 'primera_vez',
                ];
                $result[] = $item;
            }
            return [
                'success' => true,
                'data' => $result
            ];
        } catch (PDOException $e) {
            error_log('Error al obtener huéspedes: ' . $e->getMessage());
            return [ 'success' => false, 'error' => 'Error al obtener huéspedes' ];
        }
    }
}

