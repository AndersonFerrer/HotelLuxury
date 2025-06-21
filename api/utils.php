<?php
/**
 * Envía una respuesta JSON
 */
function enviarJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Valida y sanitiza datos de entrada
 */
function sanitizarInput($data) {
    if (is_array($data)) {
        return array_map('sanitizarInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}
?>