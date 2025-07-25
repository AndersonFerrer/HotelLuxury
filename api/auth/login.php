<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'AuthService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Limpiar buffer de salida
if (ob_get_length()) ob_clean();

try {
    // Solo permitir método POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Método no permitido", 405);
    }

    // Obtener datos del cuerpo de la solicitud
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar datos
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("JSON inválido: " . json_last_error_msg());
    }

    if (empty($input['correo']) || empty($input['password'])) {
        throw new Exception("Correo y contraseña son requeridos", 400);
    }

    // Crear servicio e iniciar sesión
    $authService = new AuthService($conn);
    $resultado = $authService->iniciarSesion($input['correo'], $input['password']);

    // Enviar respuesta
    enviarJSON($resultado, $resultado['success'] ? 200 : 401);

} catch (Exception $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], $e->getCode() ?: 500);
}
?>