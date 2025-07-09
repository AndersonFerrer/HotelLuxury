<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'ReservasService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (ob_get_length()) ob_clean();

try {
    // Verificar que sea método GET
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception("Método no permitido", 405);
    }

    // Iniciar sesión si no está activa
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    // Verificar que el usuario esté autenticado y sea cliente
    if (!isset($_SESSION['usuario']) || $_SESSION['usuario']['tipo'] !== 'cliente') {
        throw new Exception("Debe iniciar sesión como cliente para ver sus reservas", 401);
    }

    $id_cliente = $_SESSION['usuario']['id_cliente'];

    // Crear servicio y obtener reservas del cliente
    $reservasService = new ReservasService($conn);
    $resultado = $reservasService->obtenerReservasPorCliente($id_cliente);

    // Enviar respuesta
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