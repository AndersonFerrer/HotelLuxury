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
    $sql = "SELECT DISTINCT th.id_tipo_habitacion, th.nombre, th.descripcion, th.precio_noche
            FROM TipoHabitacion th
            JOIN Habitacion h ON th.id_tipo_habitacion = h.id_tipo_habitacion
            WHERE h.estado = 'Disponible'
            ORDER BY th.precio_noche ASC
            LIMIT 4;";
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