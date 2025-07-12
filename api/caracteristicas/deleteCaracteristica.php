<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once '../tipoHabitaciones/TiposCaracteristicasService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (ob_get_length()) ob_clean();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception("Método no permitido", 405);
    }

    $id = $_GET['id'] ?? null;
    if (!$id) {
        throw new Exception("ID de la característica es requerido", 400);
    }

    $service = new TiposCaracteristicasService($conn);
    $resultado = $service->eliminarCaracteristica($id);

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