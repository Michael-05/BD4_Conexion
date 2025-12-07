<?php
include("con_bd.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $credito_id = intval($_POST['credito_id']);
    $finalidad = pg_escape_string($conex, $_POST['finalidad_credito']);

    $sql = "INSERT INTO creditos_personal (credito_id, finalidad_credito) 
            VALUES ($1, $2)";
    
    $result = pg_query_params($conex, $sql, [$credito_id, $finalidad]);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => pg_last_error($conex)]);
    }
}
?>