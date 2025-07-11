<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'TiposCaracteristicasService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
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

    // Solo permitir método DELETE
    if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
        throw new Exception("Método no permitido", 405);
    }

    // Obtener ID del tipo de habitación
    $id_tipo_habitacion = $_GET['id'] ?? null;
    if (!$id_tipo_habitacion || !is_numeric($id_tipo_habitacion)) {
        throw new Exception("ID de tipo de habitación requerido", 400);
    }

    $service = new TiposCaracteristicasService($conn);
    $resultado = $service->eliminarTipoHabitacion($id_tipo_habitacion);

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