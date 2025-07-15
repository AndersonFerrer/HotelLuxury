<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'HabitacionService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (ob_get_length()) ob_clean();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido", 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    if (empty($input['id_habitacion']) || empty($input['numero']) || empty($input['estado']) || empty($input['id_tipo_habitacion'])) {
        throw new Exception("Todos los campos son requeridos: id_habitacion, numero, estado, id_tipo_habitacion", 400);
    }

    $service = new HabitacionService($conn);
    $resultado = $service->actualizarHabitacion(
        $input['id_habitacion'],
        $input['numero'],
        $input['estado'],
        $input['id_tipo_habitacion']
    );

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