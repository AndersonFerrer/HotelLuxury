<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'TiposCaracteristicasService.php';

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
    // Verificar autenticación de empleado
    session_start();
    if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'empleado') {
        throw new Exception("Acceso denegado. Solo empleados pueden acceder a esta funcionalidad.", 403);
    }

    // Solo permitir método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido", 405);
    }

    // Obtener ID del tipo de habitación
    $id_tipo_habitacion = $_GET['id'] ?? null;
    if (!$id_tipo_habitacion || !is_numeric($id_tipo_habitacion)) {
        throw new Exception("ID de tipo de habitación requerido", 400);
    }

    // Obtener datos del cuerpo de la solicitud
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    if (empty($input['nombre']) || !isset($input['precio'])) {
        throw new Exception("Nombre y precio son requeridos", 400);
    }

    $service = new TiposCaracteristicasService($conn);
    $resultado = $service->actualizarTipoHabitacion($id_tipo_habitacion, $input);

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