<?php
session_start();
include("con_bd.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $socio_id = isset($_POST['socio_id']) ? $_POST['socio_id'] : (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null);
    
    if (!$socio_id) {
        die("Error: No se pudo identificar al socio");
    }
    
    // Validar y limpiar datos
    $tipo = pg_escape_string($conex, $_POST['tipo']);
    $monto = floatval($_POST['monto_solicitado']);
    $plazo = intval($_POST['plazo']);
    $ingresos = floatval($_POST['ingresos_mensuales']);
    $deudas = floatval($_POST['deudas_actuales']);
    $obligaciones = floatval($_POST['otras_obligaciones']);
    $autorizo_consulta = isset($_POST['autorizo_consulta']) ? 1 : 0;
    $autorizo_debito = isset($_POST['autorizo_debito']) ? 1 : 0;
    $fecha_reg = date('Y-m-d H:i:s');
    $capacidad_pago = ($ingresos * 0.30) - $deudas - $obligaciones;
    $numero_credito = 'CR-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

    // Manejo de archivos
    $dniFileName = '';
    if (isset($_FILES['dni_file']) && $_FILES['dni_file']['error'] == UPLOAD_ERR_OK) {
        $dniFileName = 'uploads/' . uniqid('dni_') . '.' . pathinfo($_FILES['dni_file']['name'], PATHINFO_EXTENSION);
        move_uploaded_file($_FILES['dni_file']['tmp_name'], $dniFileName);
    }
    
    $payslipFileName = '';
    if (isset($_FILES['payslip_file']) && $_FILES['payslip_file']['error'] == UPLOAD_ERR_OK) {
        $payslipFileName = 'uploads/' . uniqid('payslip_') . '.' . pathinfo($_FILES['payslip_file']['name'], PATHINFO_EXTENSION);
        move_uploaded_file($_FILES['payslip_file']['tmp_name'], $payslipFileName);
    }

    // Consulta parametrizada
    $sql = "INSERT INTO creditos (numero_credito, socio_id, tipo, monto_solicitado, plazo, ingresos_mensuales, deudas_actuales, otras_obligaciones, capacidad_pago, autorizo_consulta, autorizo_debito, fecha_reg, dni_file, payslip_file) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id";
    
    $params = [
        $numero_credito,
        $socio_id,
        $tipo,
        $monto,
        $plazo,
        $ingresos,
        $deudas,
        $obligaciones,
        $capacidad_pago,
        $autorizo_consulta,
        $autorizo_debito,
        $fecha_reg,
        $dniFileName,
        $payslipFileName
    ];
    
    $result = pg_query_params($conex, $sql, $params);
    
    if ($result) {
        $row = pg_fetch_assoc($result);
        $credito_id = $row['id'];
        echo json_encode([
            'success' => true,
            'numero_credito' => $numero_credito,
            'credito_id' => $credito_id
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => pg_last_error($conex)
        ]);
    }
}
?>