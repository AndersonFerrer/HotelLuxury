<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'HabitacionService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['id_habitacion'], $input['numero'], $input['estado'], $input['id_tipo_habitacion'])) {
    enviarJSON([
        "success" => false,
        "message" => "Datos incompletos: se requiere id_habitacion, numero, estado, id_tipo_habitacion"
    ], 400);
}

$id = intval($input['id_habitacion']);
$numero = trim($input['numero']);
$estado = trim($input['estado']);
$id_tipo = intval($input['id_tipo_habitacion']);

$habitacionService = new HabitacionService($conn);
$resultado = $habitacionService->actualizarHabitacion($id, $numero, $estado, $id_tipo);

enviarJSON($resultado, $resultado['success'] ? 200 : 400); 