<?php
require_once 'config.php';

// Configurar cabeceras CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Limpiar buffer de salida
if (ob_get_length()) ob_clean();

try {
    // OBTENER HABITACIONES DISPONIBLES
    $sql = "SELECT 
                h.id_habitacion,
                h.numero,
                th.nombre AS tipo,
                th.precio_noche,
                string_agg(ch.nombre, ', ') AS caracteristicas
            FROM Habitacion h
            JOIN TipoHabitacion th ON h.id_tipo_habitacion = th.id_tipo_habitacion
            LEFT JOIN HabitacionCaracteristica hc ON h.id_habitacion = hc.id_habitacion
            LEFT JOIN CaracteristicaHabitacion ch ON hc.id_caracteristica = ch.id_caracteristica
            WHERE h.estado = 'Disponible'
            GROUP BY h.id_habitacion, th.nombre, th.precio_noche";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $habitaciones = $stmt->fetchAll();

    enviarJSON([
        'success' => true,
        'data' => $habitaciones,
        'count' => count($habitaciones)
    ]);
    
} catch (PDOException $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], 500);
}
?>