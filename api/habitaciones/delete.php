<?php

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'HabitacionService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if (ob_get_length()) ob_clean();

try {
    if (!isset($_GET['id_habitacion'])) {
        throw new Exception("Se requiere parámetro 'id_habitacion'", 400);
    }

    $habitacionService = new HabitacionService($conn);
    
    // Obtener el ID de la habitación
    $id_habitacion = $_GET['id_habitacion'];
    
    // Llamar al método correcto (deberías renombrarlo a eliminarHabitacionPorId si usa ID)
    $resultado = $habitacionService->eliminarHabitacionPorId($id_habitacion);
    
    // Enviar respuesta
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
// Devolver la respuesta
echo json_encode($response);
?>