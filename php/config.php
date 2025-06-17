<?php
session_start();

$servername = "localhost";
$username = "postgres";
$password = "anderson";
$dbname = "hotel-luxury";

// Configuración de errores
$mostrar_errores = true;

if($mostrar_errores) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

try {
    $conn = new PDO("pgsql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    die(json_encode([
        'error' => true,
        'message' => 'Error de conexión: ' . $e->getMessage()
    ]));
}

// Zona horaria
date_default_timezone_set('America/Lima');

// FUNCION PARA LIMPIAR DATOS DE ENTRADA
function limpiarDatos($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// FUNCION PARA ENVIAR RESPUESTA JSON
function enviarJSON($datos, $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json');
    echo json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}
?>