<?php
require_once 'config.php';
require_once __DIR__ . '/utils.php';

// Configurar cabeceras CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Limpiar buffer de salida
if (ob_get_length()) ob_clean();

try {
    // Parámetros de paginación
    $page = isset($_GET['page']) ? (int)sanitizarInput($_GET['page']) : 1;
    $limit = isset($_GET['limit']) ? (int)sanitizarInput($_GET['limit']) : 5;
    $offset = ($page - 1) * $limit;
    
    // OBTENER HABITACIONES DISPONIBLES
    $sql = "SELECT DISTINCT th.id_tipo_habitacion, th.nombre, th.descripcion, th.precio_noche
            FROM TipoHabitacion th
            JOIN Habitacion h ON th.id_tipo_habitacion = h.id_tipo_habitacion
            WHERE h.estado = 'Disponible'
            ORDER BY th.precio_noche ASC
            LIMIT ? OFFSET ?";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$limit, $offset]);
    $habitaciones = $stmt->fetchAll();
    
    // Obtener el total de habitaciones para la paginación
    $sqlCount = "SELECT COUNT(DISTINCT th.id_tipo_habitacion) as total
                FROM TipoHabitacion th
                JOIN Habitacion h ON th.id_tipo_habitacion = h.id_tipo_habitacion
                WHERE h.estado = 'Disponible'";
    $stmtCount = $conn->prepare($sqlCount);
    $stmtCount->execute();
    $totalCount = $stmtCount->fetch()['total'];
    $totalPages = ceil($totalCount / $limit);

    enviarJSON([
        'success' => true,
        'data' => $habitaciones,
        'count' => count($habitaciones),
        'pagination' => [
            'total' => $totalCount,
            'pages' => $totalPages,
            'current' => $page,
            'limit' => $limit
        ]
    ], 200);
    
} catch (PDOException $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], 500);
}
?>