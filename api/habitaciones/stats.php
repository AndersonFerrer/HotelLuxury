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
    $sql = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN estado = 'Disponible' THEN 1 ELSE 0 END) as disponibles,
            SUM(CASE WHEN estado = 'Ocupada' THEN 1 ELSE 0 END) as ocupadas,
            SUM(CASE WHEN estado = 'Mantenimiento' THEN 1 ELSE 0 END) as mantenimiento
            FROM Habitacion";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Calcular porcentaje de ocupación
    $stats['porcentaje_ocupacion'] = $stats['total'] > 0 
        ? round(($stats['ocupadas'] / $stats['total']) * 100) 
        : 0;
    
    enviarJSON([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    enviarJSON([
        'success' => false,
        'error' => $e->getMessage()
    ], 500);
}
?>