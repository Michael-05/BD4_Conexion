<?php
include("con_bd.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $credito_id = intval($_POST['credito_id']);
    $nombre = pg_escape_string($conex, $_POST['nombre']);
    $telefono = pg_escape_string($conex, $_POST['telefono']);
    $tipo = pg_escape_string($conex, $_POST['tipo']);

    $sql = "INSERT INTO referencias (credito_id, nombre, telefono, tipo) 
            VALUES ($1, $2, $3, $4)";
    
    $result = pg_query_params($conex, $sql, [$credito_id, $nombre, $telefono, $tipo]);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => pg_last_error($conex)]);
    }
}
?>