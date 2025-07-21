<?php
require_once __DIR__ . '/HuespedService.php';
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../utils.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $service = new HuespedService($conn);
    $result = $service->getAllHuespedes();
    echo json_encode($result);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
