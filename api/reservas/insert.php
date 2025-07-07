<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'ReservasService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (ob_get_length()) ob_clean();

try {
    // Verificar que sea método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido", 405);
    }

    // Obtener datos del cuerpo de la solicitud
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos requeridos
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    if (empty($input['id_habitacion']) || empty($input['fecha_checkin']) || 
        empty($input['fecha_checkout']) || !isset($input['total'])) {
        throw new Exception("Datos incompletos: se requiere id_habitacion, fecha_checkin, fecha_checkout y total", 400);
    }

    // Crear servicio y insertar reserva
    $reservasService = new ReservasService($conn);
    $resultado = $reservasService->insertarReserva($input);

    // Enviar respuesta
    if ($resultado['success']) {
        enviarJSON($resultado, 201);
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