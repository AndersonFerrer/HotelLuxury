<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

class HuespedService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
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
            // Obtener última reserva
            $sqlReserva = "SELECT r.id_reserva, r.fecha_checkin, r.fecha_checkout, r.estado, r.total, h.numero AS habitacion_numero, th.nombre AS habitacion_tipo
                FROM Reserva r
                INNER JOIN Habitacion h ON r.id_habitacion = h.id_habitacion
                INNER JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                WHERE r.id_cliente = ?
                ORDER BY r.fecha_checkout DESC, r.fecha_reserva DESC LIMIT 1";
            $stmtReserva = $this->conn->prepare($sqlReserva);
            $stmtReserva->execute([$id_cliente]);
            $reserva = $stmtReserva->fetch(PDO::FETCH_ASSOC);
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


    /**
     * Obtiene el detalle de un huésped por su id_cliente
     */
    public function getDetalleHuesped($id_cliente) {
        try {
            $sql = "SELECT c.id_cliente, p.id_persona, p.nombres, p.apellidos, td.nombre AS tipo_documento, p.numero_documento, p.telefono, p.correo, p.fecha_nacimiento, d.region, d.provincia, d.distrito, d.direccion_detallada
                    FROM Cliente c
                    INNER JOIN Persona p ON c.id_persona = p.id_persona
                    INNER JOIN TipoDocumento td ON p.id_tipo_documento = td.id_tipo_documento
                    LEFT JOIN Direccion d ON p.id_direccion = d.id_direccion
                    WHERE c.id_cliente = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$id_cliente]);
            $huesped = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$huesped) {
                return [ 'success' => false, 'error' => 'Huésped no encontrado' ];
            }
            return [ 'success' => true, 'data' => $huesped ];
        } catch (PDOException $e) {
            error_log('Error al obtener detalle de huésped: ' . $e->getMessage());
            return [ 'success' => false, 'error' => 'Error al obtener detalle de huésped' ];
        }
    }

    /**
     * Crea un nuevo huésped (cliente)
     */
    public function crearHuesped($data) {
        $this->conn->beginTransaction();
        try {
            // Direccion
            $id_direccion = null;
            if (!empty($data['direccion'])) {
                $sqlDir = "INSERT INTO Direccion (region, provincia, distrito, direccion_detallada) VALUES (?, ?, ?, ?)";
                $stmtDir = $this->conn->prepare($sqlDir);
                $stmtDir->execute([
                    $data['direccion']['region'] ?? '',
                    $data['direccion']['provincia'] ?? '',
                    $data['direccion']['distrito'] ?? '',
                    $data['direccion']['direccion_detallada'] ?? ''
                ]);
                $id_direccion = $this->conn->lastInsertId();
            }
            // Persona
            $sqlPersona = "INSERT INTO Persona (nombres, apellidos, id_tipo_documento, numero_documento, telefono, correo, password, fecha_nacimiento, id_direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmtPersona = $this->conn->prepare($sqlPersona);
            $stmtPersona->execute([
                $data['nombres'],
                $data['apellidos'],
                $data['id_tipo_documento'],
                $data['numero_documento'],
                $data['telefono'] ?? null,
                $data['correo'] ?? null,
                password_hash($data['numero_documento'], PASSWORD_DEFAULT), // default password
                $data['fecha_nacimiento'] ?? null,
                $id_direccion
            ]);
            $id_persona = $this->conn->lastInsertId();
            // Cliente
            $sqlCliente = "INSERT INTO Cliente (id_persona) VALUES (?)";
            $stmtCliente = $this->conn->prepare($sqlCliente);
            $stmtCliente->execute([$id_persona]);
            $id_cliente = $this->conn->lastInsertId();
            $this->conn->commit();
            return [ 'success' => true, 'id_cliente' => $id_cliente ];
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log('Error al crear huésped: ' . $e->getMessage());
            return [ 'success' => false, 'error' => 'Error al crear huésped' ];
        }
    }

    /**
     * Edita un huésped (cliente)
     */
    public function editarHuesped($id_cliente, $data) {
        $this->conn->beginTransaction();
        try {
            // Obtener id_persona
            $sql = "SELECT id_persona FROM Cliente WHERE id_cliente = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$id_cliente]);
            $id_persona = $stmt->fetchColumn();
            if (!$id_persona) throw new Exception('Cliente no encontrado');
            // Actualizar dirección si viene
            if (!empty($data['direccion'])) {
                // Si la persona ya tiene dirección, actualizar, si no, insertar
                $sqlDir = "SELECT id_direccion FROM Persona WHERE id_persona = ?";
                $stmtDir = $this->conn->prepare($sqlDir);
                $stmtDir->execute([$id_persona]);
                $id_direccion = $stmtDir->fetchColumn();
                if ($id_direccion) {
                    $sqlUpdDir = "UPDATE Direccion SET region=?, provincia=?, distrito=?, direccion_detallada=? WHERE id_direccion=?";
                    $this->conn->prepare($sqlUpdDir)->execute([
                        $data['direccion']['region'] ?? '',
                        $data['direccion']['provincia'] ?? '',
                        $data['direccion']['distrito'] ?? '',
                        $data['direccion']['direccion_detallada'] ?? '',
                        $id_direccion
                    ]);
                } else {
                    $sqlInsDir = "INSERT INTO Direccion (region, provincia, distrito, direccion_detallada) VALUES (?, ?, ?, ?)";
                    $this->conn->prepare($sqlInsDir)->execute([
                        $data['direccion']['region'] ?? '',
                        $data['direccion']['provincia'] ?? '',
                        $data['direccion']['distrito'] ?? '',
                        $data['direccion']['direccion_detallada'] ?? ''
                    ]);
                    $id_direccion = $this->conn->lastInsertId();
                    $this->conn->prepare("UPDATE Persona SET id_direccion=? WHERE id_persona=?")->execute([$id_direccion, $id_persona]);
                }
            }
            // Actualizar persona
            $sqlUpdPers = "UPDATE Persona SET nombres=?, apellidos=?, id_tipo_documento=?, numero_documento=?, telefono=?, correo=?, fecha_nacimiento=? WHERE id_persona=?";
            $this->conn->prepare($sqlUpdPers)->execute([
                $data['nombres'],
                $data['apellidos'],
                $data['id_tipo_documento'],
                $data['numero_documento'],
                $data['telefono'] ?? null,
                $data['correo'] ?? null,
                $data['fecha_nacimiento'] ?? null,
                $id_persona
            ]);
            $this->conn->commit();
            return [ 'success' => true ];
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log('Error al editar huésped: ' . $e->getMessage());
            return [ 'success' => false, 'error' => 'Error al editar huésped' ];
        }
    }

    /**
     * Elimina un huésped (cliente)
     */
    public function eliminarHuesped($id_cliente) {
        $this->conn->beginTransaction();
        try {
            // Obtener id_persona
            $sql = "SELECT id_persona FROM Cliente WHERE id_cliente = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$id_cliente]);
            $id_persona = $stmt->fetchColumn();
            if (!$id_persona) throw new Exception('Cliente no encontrado');
            // Eliminar cliente
            $this->conn->prepare("DELETE FROM Cliente WHERE id_cliente = ?")->execute([$id_cliente]);
            // Eliminar persona (solo si no está asociada a empleado ni a otra tabla)
            $sqlCheck = "SELECT COUNT(*) FROM Empleado WHERE id_persona = ?";
            $stmtCheck = $this->conn->prepare($sqlCheck);
            $stmtCheck->execute([$id_persona]);
            if ($stmtCheck->fetchColumn() == 0) {
                $this->conn->prepare("DELETE FROM Persona WHERE id_persona = ?")->execute([$id_persona]);
            }
            $this->conn->commit();
            return [ 'success' => true ];
        } catch (Exception $e) {
            $this->conn->rollBack();
            error_log('Error al eliminar huésped: ' . $e->getMessage());
            return [ 'success' => false, 'error' => 'Error al eliminar huésped' ];
        }
    }
}

