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

    // Obtener ID de la característica
    $id_caracteristica = $_GET['id'] ?? null;
    if (!$id_caracteristica || !is_numeric($id_caracteristica)) {
        throw new Exception("ID de característica requerido", 400);
    }

    // Obtener datos del cuerpo de la solicitud
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    if (empty($input['nombre'])) {
        throw new Exception("Nombre de la característica es requerido", 400);
    }

    $service = new TiposCaracteristicasService($conn);
    $resultado = $service->actualizarCaracteristica($id_caracteristica, $input);

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