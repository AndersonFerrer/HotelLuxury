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
    if (!isset($_GET['id_tipo'])) {
        throw new Exception("Se requiere parámetro 'id_tipo'", 400);
    }
    $habitacionService = new HabitacionService($conn);
    $resultado = $habitacionService->obtenerDetalleTipoConDisponibles($_GET['id_tipo']);
    if ($resultado['success']) {
        enviarJSON($resultado);
    } else {
        enviarJSON($resultado, 404);
    }
} catch (Exception $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], $e->getCode() ?: 500);
}
?>
