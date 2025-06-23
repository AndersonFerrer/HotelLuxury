<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'HabitacionService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (ob_get_length()) ob_clean();

try {
    if (!isset($_GET['id']) && !isset($_GET['nombre'])) {
        throw new Exception("Se requiere parámetro 'id' o 'nombre'", 400);
    }

    $habitacionService = new HabitacionService($conn);
    
    // Buscar por ID o nombre
    $parametro = isset($_GET['id']) ? $_GET['id'] : $_GET['nombre'];
    $resultado = $habitacionService->obtenerDetalleHabitacion($parametro);
    
    if ($resultado['success']) {
        enviarJSON($resultado);
    } else {
        enviarJSON($resultado, 404);
    }

} catch (Exception $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], $e->getCode() ?: 500);
}
?>