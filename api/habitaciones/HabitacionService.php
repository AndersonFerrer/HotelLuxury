<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

class HabitacionService {
    private $conn;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    /**
     * Obtiene las habitaciones disponibles
     */
    public function obtenerHabitacionesDisponibles($limit = 4) {
        try {
            $sql = "SELECT DISTINCT th.id_tipo_habitacion, th.nombre, th.descripcion, th.precio_noche
                    FROM TipoHabitacion th
                    JOIN Habitacion h ON th.id_tipo_habitacion = h.id_tipo_habitacion
                    WHERE h.estado = 'Disponible'
                    ORDER BY th.precio_noche ASC
                    LIMIT ?";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$limit]);
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll(),
                'count' => $stmt->rowCount()
            ];
            
        } catch (PDOException $e) {
            error_log("Error al obtener habitaciones: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener habitaciones disponibles'
            ];
        }
    }

    /**
     * Obtiene el detalle completo de una habitación individual (por id de habitación)
     */
    public function obtenerDetalleHabitacionPorId($id_habitacion) {
        try {
            $sql = "SELECT h.id_habitacion, h.numero, h.estado, h.id_tipo_habitacion, th.nombre AS tipo_nombre, th.descripcion AS tipo_descripcion, th.precio_noche, th.aforo
                    FROM Habitacion h
                    INNER JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                    WHERE h.id_habitacion = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$id_habitacion]);
            $habitacion = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$habitacion) {
                return [ 'success' => false, 'error' => 'Habitación no encontrada' ];
            }
            // Características
            $sqlCar = "SELECT cth.nombre FROM TipoHabitacionCaracteristica thc
                        INNER JOIN Caracteristica cth ON thc.id_caracteristica = cth.id_caracteristica
                        WHERE thc.id_tipo_habitacion = ?";
            $stmtCar = $this->conn->prepare($sqlCar);
            $stmtCar->execute([$habitacion['id_tipo_habitacion']]);
            $caracteristicas = $stmtCar->fetchAll(PDO::FETCH_COLUMN);
            $habitacion['caracteristicas'] = $caracteristicas;
            // Imágenes
            $habitacion['imagenes'] = $this->obtenerImagenesHabitacion($habitacion['id_tipo_habitacion']);
            return [
                'success' => true,
                'data' => $habitacion,
                'message' => 'Detalle de habitación obtenida.'
            ];
        } catch (PDOException $e) {
            error_log("Error al obtener detalle de habitación: " . $e->getMessage());
            return [ 'success' => false, 'error' => 'Error al obtener detalle de habitación' ];
        }
    }

    /**
     * Obtiene todas las habitaciones para el panel de administración
     */
    public function getAllHabitaciones() {
        try {
            // Verificar autenticación de empleado
            session_start();
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'empleado') {
                throw new Exception("Acceso denegado. Solo empleados pueden acceder a esta funcionalidad.", 403);
            }

            $sql = "SELECT 
                        h.id_habitacion,
                        h.numero,
                        h.estado,
                        th.nombre AS tipo_habitacion,
                        th.precio_noche,
                        COUNT(DISTINCT thc.id_caracteristica) AS cantidad_caracteristicas,
                        r.id_reserva,
                        r.fecha_checkout,
                        p.nombres AS huesped_nombres,
                        p.apellidos AS huesped_apellidos
                    FROM Habitacion h
                    INNER JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                    LEFT JOIN TipoHabitacionCaracteristica thc ON th.id_tipo_habitacion = thc.id_tipo_habitacion
                    LEFT JOIN Reserva r ON r.id_habitacion = h.id_habitacion AND r.estado IN ('Activa', 'Confirmada')
                    LEFT JOIN Cliente c ON c.id_cliente = r.id_cliente
                    LEFT JOIN Persona p ON p.id_persona = c.id_persona
                    GROUP BY h.id_habitacion, h.numero, h.estado, th.nombre, th.precio_noche, r.id_reserva, r.fecha_checkout, p.nombres, p.apellidos
                    ORDER BY h.numero";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $habitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                "success" => true,
                "message" => "Habitaciones encontradas",
                "data" => $habitaciones
            ];
        } catch (PDOException $e) {
            return [
                "success" => false,
                "message" => "Error al obtener habitaciones",
                "error" => $e->getMessage()
            ];
        }
    }

    /**
     * Obtiene estadísticas de habitaciones
     */
    public function obtenerEstadisticasHabitaciones() {
        try {
            // Verificar autenticación de empleado
            session_start();
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'empleado') {
                throw new Exception("Acceso denegado. Solo empleados pueden acceder a esta funcionalidad.", 403);
            }

            $sql = "SELECT 
                        COUNT(*) as total,
                        COUNT(CASE WHEN estado = 'Disponible' THEN 1 END) as disponibles,
                        COUNT(CASE WHEN estado = 'Ocupado' OR estado = 'Ocupada' THEN 1 END) as ocupadas,
                        COUNT(CASE WHEN estado = 'Mantenimiento' THEN 1 END) as mantenimiento,
                        (COUNT(CASE WHEN estado = 'Ocupado' OR estado = 'Ocupada' THEN 1 END) / COUNT(*)) * 100 as tasa_ocupacion
                    FROM Habitacion";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);

            return [
                'success' => true,
                'stats' => [
                    'total' => (int)$stats['total'],
                    'disponibles' => (int)$stats['disponibles'],
                    'ocupadas' => (int)$stats['ocupadas'],
                    'mantenimiento' => (int)$stats['mantenimiento'],
                    'tasa_ocupacion' => (int)$stats['tasa_ocupacion']
                ]
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Elimina una habitación por ID
     */
    public function eliminarHabitacionPorId($id_habitacion) {
        try {
            // Verificar autenticación de empleado
            session_start();
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'empleado') {
                throw new Exception("Acceso denegado. Solo empleados pueden acceder a esta funcionalidad.", 403);
            }

            // Validación básica
            if (empty($id_habitacion)) {
                throw new Exception("ID de habitación no proporcionado");
            }

            // Verificar existencia primero
            $checkSql = "SELECT id_habitacion FROM Habitacion WHERE id_habitacion = ?";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->execute([$id_habitacion]);
            
            if ($checkStmt->rowCount() === 0) {
                return [
                    "success" => false,
                    "message" => "Habitación no encontrada"
                ];
            }

            // Verificar que no tenga reservas activas
            $checkReservasSql = "SELECT COUNT(*) FROM Reserva WHERE id_habitacion = ? AND estado IN ('Pendiente', 'Confirmada', 'Activa')";
            $checkReservasStmt = $this->conn->prepare($checkReservasSql);
            $checkReservasStmt->execute([$id_habitacion]);
            
            if ($checkReservasStmt->fetchColumn() > 0) {
                return [
                    "success" => false,
                    "message" => "No se puede eliminar la habitación porque tiene reservas activas"
                ];
            }

            // Eliminar la habitación
            $deleteSql = "DELETE FROM Habitacion WHERE id_habitacion = ?";
            $deleteStmt = $this->conn->prepare($deleteSql);
            $deleteStmt->execute([$id_habitacion]);

            return [
                "success" => true,
                "message" => "Habitación eliminada con éxito"
            ];

        } catch (PDOException $e) {
            // Log del error (opcional)
            error_log("Error al eliminar habitación: " . $e->getMessage());
            
            return [
                "success" => false,
                "message" => "Error al eliminar habitación",
                "error" => $e->getMessage()
            ];
        }
    }

    /**
     * Obtiene todos los tipos de habitaciones
     */
    public function obtenerTiposHabitaciones() {
        try {
            $sql = "SELECT id_tipo_habitacion, nombre, precio_noche FROM TipoHabitacion";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute();
            $tiposHabitaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                "success" => true,
                "data" => $tiposHabitaciones,
                "message" => "Tipos de habitaciones obtenidos."
            ];
        } catch (PDOException $e) {
            return [
                "success" => false,
                "message" => "Error al obtener tipos de habitaciones",
                "error" => $e->getMessage()
            ];
        }
    }

    /**
     * Inserta una nueva habitación
     */
    public function insertarHabitacion($numero, $id_tipo_habitacion) {
        try {
            // Verificar autenticación de empleado
            session_start();
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'empleado') {
                throw new Exception("Acceso denegado. Solo empleados pueden acceder a esta funcionalidad.", 403);
            }

            // Validar datos
            if (empty($numero) || empty($id_tipo_habitacion)) {
                throw new Exception("Número de habitación y tipo son requeridos");
            }

            // Validar que el número no esté ya registrado
            $sqlVerificar = "SELECT COUNT(*) FROM Habitacion WHERE numero = ?";
            $stmtVerificar = $this->conn->prepare($sqlVerificar);
            $stmtVerificar->execute([$numero]);

            if ($stmtVerificar->fetchColumn() > 0) {
                return [
                    "success" => false,
                    "message" => "El número de habitación ya existe"
                ];
            }

            // Validar que el tipo de habitación existe
            $sqlVerificarTipo = "SELECT COUNT(*) FROM TipoHabitacion WHERE id_tipo_habitacion = ?";
            $stmtVerificarTipo = $this->conn->prepare($sqlVerificarTipo);
            $stmtVerificarTipo->execute([$id_tipo_habitacion]);

            if ($stmtVerificarTipo->fetchColumn() == 0) {
                return [
                    "success" => false,
                    "message" => "El tipo de habitación seleccionado no existe"
                ];
            }

            // Insertar la nueva habitación
            $sql = "INSERT INTO Habitacion (numero, id_tipo_habitacion, estado) VALUES (?, ?, 'Disponible')";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$numero, $id_tipo_habitacion]);

            return [
                "success" => true,
                "message" => "Habitación registrada correctamente",
                "id_habitacion" => $this->conn->lastInsertId()
            ];
        } catch (Exception $e) {
            error_log("Error al insertar habitación: " . $e->getMessage());
            return [
                "success" => false,
                "message" => "Error al registrar habitación",
                "error" => $e->getMessage()
            ];
        }
    }

    /**
     * Actualiza una habitación existente
     */
    public function actualizarHabitacion($id, $numero, $estado, $id_tipo_habitacion) {
        try {
            // Verificar autenticación de empleado
            session_start();
            if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'empleado') {
                throw new Exception("Acceso denegado. Solo empleados pueden acceder a esta funcionalidad.", 403);
            }

            // Validar datos
            if (empty($id) || empty($numero) || empty($estado) || empty($id_tipo_habitacion)) {
                throw new Exception("Todos los campos son requeridos");
            }

            // Validar existencia
            $stmt = $this->conn->prepare("SELECT id_habitacion FROM Habitacion WHERE id_habitacion = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() === 0) {
                return ["success" => false, "message" => "Habitación no encontrada"];
            }

            // Validar número único (excepto para sí misma)
            $stmt = $this->conn->prepare("SELECT id_habitacion FROM Habitacion WHERE numero = ? AND id_habitacion != ?");
            $stmt->execute([$numero, $id]);
            if ($stmt->rowCount() > 0) {
                return ["success" => false, "message" => "El número de habitación ya existe"];
            }

            // Validar que el tipo de habitación existe
            $stmt = $this->conn->prepare("SELECT COUNT(*) FROM TipoHabitacion WHERE id_tipo_habitacion = ?");
            $stmt->execute([$id_tipo_habitacion]);
            if ($stmt->fetchColumn() == 0) {
                return ["success" => false, "message" => "El tipo de habitación seleccionado no existe"];
            }

            // Validar estado
            $estadosValidos = ['Disponible', 'Ocupada', 'Mantenimiento'];
            if (!in_array($estado, $estadosValidos)) {
                return ["success" => false, "message" => "Estado de habitación no válido"];
            }

            // Actualizar
            $sql = "UPDATE Habitacion SET numero = ?, estado = ?, id_tipo_habitacion = ? WHERE id_habitacion = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$numero, $estado, $id_tipo_habitacion, $id]);
            
            return ["success" => true, "message" => "Habitación actualizada correctamente"];
        } catch (Exception $e) {
            error_log("Error al actualizar habitación: " . $e->getMessage());
            return ["success" => false, "message" => "Error al actualizar habitación", "error" => $e->getMessage()];
        }
    }

    /**
     * Obtiene habitaciones disponibles de un tipo específico
     */
    public function obtenerHabitacionesDisponiblesPorTipo($id_tipo_habitacion) {
        try {
            $sql = "SELECT h.id_habitacion, h.numero, h.estado, th.nombre, th.precio_noche
                    FROM Habitacion h
                    INNER JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
                    WHERE h.id_tipo_habitacion = ? AND h.estado = 'Disponible'
                    ORDER BY h.numero ASC";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$id_tipo_habitacion]);
            
            return [
                'success' => true,
                'data' => $stmt->fetchAll(),
                'count' => $stmt->rowCount()
            ];
            
        } catch (PDOException $e) {
            error_log("Error al obtener habitaciones por tipo: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener habitaciones disponibles'
            ];
        }
    }

    /**
     * Obtiene el detalle de un tipo de habitación por su id, incluyendo imágenes, características y habitaciones disponibles
     */
    public function obtenerDetalleTipoHabitacionPorId($id_tipo_habitacion) {
        try {
            // Obtener datos del tipo de habitación
            $sql = "SELECT id_tipo_habitacion, nombre, descripcion, precio_noche, aforo
                    FROM TipoHabitacion
                    WHERE id_tipo_habitacion = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$id_tipo_habitacion]);
            $tipo = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$tipo) {
                return [ 'success' => false, 'error' => 'Tipo de habitación no encontrado' ];
            }
            // Características
            $sqlCar = "SELECT cth.nombre FROM TipoHabitacionCaracteristica thc
                        INNER JOIN Caracteristica cth ON thc.id_caracteristica = cth.id_caracteristica
                        WHERE thc.id_tipo_habitacion = ?";
            $stmtCar = $this->conn->prepare($sqlCar);
            $stmtCar->execute([$id_tipo_habitacion]);
            $caracteristicas = $stmtCar->fetchAll(PDO::FETCH_COLUMN);
            $tipo['caracteristicas'] = $caracteristicas;
            // Imágenes (puedes adaptar esto según tu modelo)
            $tipo['imagenes'] = $this->obtenerImagenesHabitacion($id_tipo_habitacion);
            // Cantidad de habitaciones disponibles de ese tipo
            $sqlHab = "SELECT COUNT(*) as cantidad FROM Habitacion WHERE id_tipo_habitacion = ? AND estado = 'Disponible'";
            $stmtHab = $this->conn->prepare($sqlHab);
            $stmtHab->execute([$id_tipo_habitacion]);
            $tipo['habitaciones_disponibles'] = $stmtHab->fetch(PDO::FETCH_ASSOC)['cantidad'];
            return [
                'success' => true,
                'data' => $tipo,
                'message' => 'Detalle de tipo de habitación obtenido.'
            ];
        } catch (PDOException $e) {
            error_log("Error al obtener detalle de tipo de habitación: " . $e->getMessage());
            return [ 'success' => false, 'error' => 'Error al obtener detalle de tipo de habitación' ];
        }
    }

    private function obtenerImagenesHabitacion($id_tipo_habitacion) {
        // Aquí puedes implementar la lógica para obtener imágenes
        // Esto es un ejemplo - adapta según tu base de datos
        return [
            "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjo46tYA5IUec3lzC-W-nsXTD2MqXgnF-EqE56mcmTcn1thbyl4wmK22HLxbxBZX-VV8vUZYRjaK7rc1TNgrK-iAztT9jlcxgVaVSp3G-iF6HFDF0N6t5fzWGsfkrLODPKMPgYTR-NdHmqlVSW5_m-2c-k3nVzwBWGdr8f7-aub-S111q5ZX0gafT8Mfg/s16000/hostales%20en%20cusco.jpg",
            "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjo46tYA5IUec3lzC-W-nsXTD2MqXgnF-EqE56mcmTcn1thbyl4wmK22HLxbxBZX-VV8vUZYRjaK7rc1TNgrK-iAztT9jlcxgVaVSp3G-iF6HFDF0N6t5fzWGsfkrLODPKMPgYTR-NdHmqlVSW5_m-2c-k3nVzwBWGdr8f7-aub-S111q5ZX0gafT8Mfg/s16000/hostales%20en%20cusco.jpg"
        ];
    }
}
?>