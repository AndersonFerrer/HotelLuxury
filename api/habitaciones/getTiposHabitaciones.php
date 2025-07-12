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
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception("Método no permitido", 405);
    }

    $service = new HabitacionService($conn);
    $resultado = $service->obtenerTiposHabitaciones();

    if ($resultado['success']) {
        enviarJSON($resultado);
    } else {
        enviarJSON($resultado, 400);
    }

} catch (Exception $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], $e->getCode() ?: 500);
}
?> 