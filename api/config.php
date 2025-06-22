<?php
//session_start();

require_once __DIR__ . '/../vendor/autoload.php'; // Ajusta el path si es necesario

// Cargar archivo .env
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..'); // Va al nivel raíz
$dotenv->load();

// Mostrar errores si APP_DEBUG está en true
if ($_ENV['APP_DEBUG'] === 'true') {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

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
    $dsn = "pgsql:host={$_ENV['DB_HOST']};port={$_ENV['DB_PORT']};dbname={$_ENV['DB_NAME']}";
    $conn = new PDO($dsn, $_ENV['DB_USER'], $_ENV['DB_PASS']);
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
date_default_timezone_set($_ENV['TIMEZONE'] ?? 'America/Lima');

?>