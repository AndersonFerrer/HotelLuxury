<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'AuthService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

// Limpiar buffer de salida
if (ob_get_length()) ob_clean();

try {
    // Crear servicio y verificar sesión
    $authService = new AuthService($conn);
    $resultado = $authService->verificarSesion();

    enviarJSON($resultado);

} catch (Exception $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], 500);
}
?>