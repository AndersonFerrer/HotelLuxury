<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once '../tipoHabitaciones/TiposCaracteristicasService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (ob_get_length()) ob_clean();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido", 405);
    }

    $id = $_GET['id'] ?? null;
    if (!$id) {
        throw new Exception("ID de la característica es requerido", 400);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    $service = new TiposCaracteristicasService($conn);
    $resultado = $service->actualizarCaracteristica($id, $input);

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