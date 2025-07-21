<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/EmpleadoService.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    $empleadoService = new EmpleadoService($conn);
    $empleados = $empleadoService->getAllEmpleados();
    echo json_encode(['success' => true, 'empleados' => $empleados]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor', 'detalle' => $e->getMessage()]);
}
