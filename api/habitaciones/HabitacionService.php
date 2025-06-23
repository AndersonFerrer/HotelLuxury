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
     * Obtiene el detalle completo de un tipo de habitación
     */
    public function obtenerDetalleHabitacion($id_o_nombre) {
        try {
            // Determinar si el parámetro es ID o nombre
            $is_id = is_numeric($id_o_nombre);
            
            $sql = "SELECT 
                        th.*,
                        COUNT(h.id_habitacion) AS habitaciones_disponibles,
                        (
                            SELECT STRING_AGG(ch.nombre, ', ')
                            FROM HabitacionCaracteristica hc
                            JOIN CaracteristicaHabitacion ch ON hc.id_caracteristica = ch.id_caracteristica
                            WHERE hc.id_habitacion IN (
                                SELECT id_habitacion FROM Habitacion 
                                WHERE id_tipo_habitacion = th.id_tipo_habitacion
                                LIMIT 1
                            )
                        ) AS caracteristicas
                    FROM TipoHabitacion th
                    LEFT JOIN Habitacion h ON th.id_tipo_habitacion = h.id_tipo_habitacion 
                        AND h.estado = 'Disponible'
                    WHERE th." . ($is_id ? "id_tipo_habitacion = ?" : "nombre ILIKE ?") . "
                    GROUP BY th.id_tipo_habitacion";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([$is_id ? $id_o_nombre : '%'.$id_o_nombre.'%']);
            
            $habitacion = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$habitacion) {
                return [
                    'success' => false,
                    'error' => 'Habitación no encontrada'
                ];
            }
            
            // Obtener imágenes de ejemplo (puedes adaptar esto a tu estructura real)
            $habitacion['imagenes'] = $this->obtenerImagenesHabitacion($habitacion['id_tipo_habitacion']);
            
            return [
                'success' => true,
                'data' => $habitacion,
                'message' => 'Detalle de habitación obtenida.'
            ];
            
        } catch (PDOException $e) {
            error_log("Error al obtener detalle de habitación: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Error al obtener detalle de habitación'
            ];
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