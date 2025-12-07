<?php
include("con_bd.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $credito_id = intval($_POST['credito_id']);
    $banco_nombre = pg_escape_string($conex, $_POST['banco_nombre']);
    $banco_tipo_cuenta = pg_escape_string($conex, $_POST['banco_tipo_cuenta']);
    $banco_numero_cuenta = pg_escape_string($conex, $_POST['banco_numero_cuenta']);

    $sql = "INSERT INTO datos_bancarios (credito_id, banco_nombre, banco_tipo_cuenta, banco_numero_cuenta) 
            VALUES ($1, $2, $3, $4)";
    
    $params = [$credito_id, $banco_nombre, $banco_tipo_cuenta, $banco_numero_cuenta];
    $result = pg_query_params($conex, $sql, $params);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => pg_last_error($conex)]);
    }
}
?>