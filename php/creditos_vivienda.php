<?php
include("con_bd.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $credito_id = intval($_POST['credito_id']);
    $tipo_trabajo = pg_escape_string($conex, $_POST['tipo_trabajo']);
    $ruc = pg_escape_string($conex, $_POST['ruc'] ?? '');
    $direccion = pg_escape_string($conex, $_POST['direccion_propiedad']);
    $ciudad = pg_escape_string($conex, $_POST['ciudad_propiedad']);
    $valor = floatval($_POST['valor_propiedad']);

    $sql = "INSERT INTO creditos_vivienda (credito_id, tipo_trabajo, ruc, direccion_propiedad, ciudad_propiedad, valor_propiedad) 
            VALUES ($1, $2, $3, $4, $5, $6)";
    
    $params = [$credito_id, $tipo_trabajo, $ruc, $direccion, $ciudad, $valor];
    $result = pg_query_params($conex, $sql, $params);
    
    if ($result) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => pg_last_error($conex)]);
    }
}
?>