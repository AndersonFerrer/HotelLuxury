<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';
require_once 'HabitacionService.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['numero']) || !isset($input['tipo'])) {
    enviarJSON([
        "success" => false,
        "message" => "Datos incompletos: se requiere 'numero' y 'tipo'"
    ], 400);
}

$numero = trim($input['numero']);
$tipo = intval($input['tipo']);

$habitacionService = new HabitacionService($conn);
$resultado = $habitacionService->insertarHabitacion($numero, $tipo);

enviarJSON($resultado, $resultado['success'] ? 201 : 400);
