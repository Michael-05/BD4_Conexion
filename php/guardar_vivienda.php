<?php
session_start();
include("con_bd.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        die(json_encode(['success' => false, 'error' => 'Usuario no autenticado']));
    }
    
    $socio_id = $_SESSION['user_id'];
    
    // Crear directorio de uploads si no existe
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Procesamiento principal
    $tipo = 'vivienda';
    $monto = floatval($_POST['monto_solicitado']);
    $plazo = intval($_POST['plazo']);
    $ingresos = floatval($_POST['ingresos_mensuales']);
    $deudas = floatval($_POST['deudas_actuales']);
    $obligaciones = floatval($_POST['otras_obligaciones']);
    $autorizo_consulta = isset($_POST['autorizo_consulta']) ? 1 : 0;
    $autorizo_debito = isset($_POST['autorizo_debito']) ? 1 : 0;
    $fecha_reg = date('Y-m-d H:i:s');
    $numero_credito = 'CR-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    $capacidad_pago = ($ingresos * 0.30) - $deudas - $obligaciones;

    // Manejo de archivos
    $dniFileName = '';
    if (isset($_FILES['dni_file']) && $_FILES['dni_file']['error'] == UPLOAD_ERR_OK) {
        $extension = pathinfo($_FILES['dni_file']['name'], PATHINFO_EXTENSION);
        $uniqueName = uniqid('dni_') . '.' . $extension;
        $relativePath = 'uploads/' . $uniqueName;
        $absolutePath = $uploadDir . $uniqueName;

        if (move_uploaded_file($_FILES['dni_file']['tmp_name'], $absolutePath)) {
            $dniFileName = $relativePath;
        }
    }
    
    $payslipFileName = '';
    if (isset($_FILES['payslip_file']) && $_FILES['payslip_file']['error'] == UPLOAD_ERR_OK) {
        $extension = pathinfo($_FILES['payslip_file']['name'], PATHINFO_EXTENSION);
        $uniqueName = uniqid('payslip_') . '.' . $extension;
        $relativePath = 'uploads/' . $uniqueName;
        $absolutePath = $uploadDir . $uniqueName;

        if (move_uploaded_file($_FILES['payslip_file']['tmp_name'], $absolutePath)) {
            $payslipFileName = $relativePath;
        }
    }

    // Transacción PostgreSQL
    pg_query($conex, "BEGIN");

    try {
        // Insertar crédito principal
        $sqlCredito = "INSERT INTO creditos (numero_credito, socio_id, tipo, monto_solicitado, plazo, ingresos_mensuales, deudas_actuales, otras_obligaciones, capacidad_pago, autorizo_consulta, autorizo_debito, fecha_reg, dni_file, payslip_file) 
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
        
        $result = pg_query_params($conex, $sqlCredito, $params);
        
        if (!$result) {
            throw new Exception('Error al guardar crédito: ' . pg_last_error($conex));
        }
        
        $row = pg_fetch_assoc($result);
        $credito_id = $row['id'];

        // Insertar crédito vivienda
        $tipo_trabajo = $_POST['tipo_trabajo'];
        $ruc = $_POST['ruc'] ?? '';
        $direccion_prop = $_POST['direccion_propiedad'];
        $ciudad_prop = $_POST['ciudad_propiedad'];
        $valor_prop = floatval($_POST['valor_propiedad']);
        
        $sqlVivienda = "INSERT INTO creditos_vivienda (credito_id, tipo_trabajo, ruc, direccion_propiedad, ciudad_propiedad, valor_propiedad) 
                        VALUES ($1, $2, $3, $4, $5, $6)";
        $result = pg_query_params($conex, $sqlVivienda, [
            $credito_id, $tipo_trabajo, $ruc, $direccion_prop, $ciudad_prop, $valor_prop
        ]);
        
        if (!$result) {
            throw new Exception('Error al guardar crédito vivienda: ' . pg_last_error($conex));
        }

        // Insertar referencias
        $refs = [
            ['nombre' => $_POST['ref1_nombre'], 'telefono' => $_POST['ref1_telefono'], 'tipo' => 'personal1'],
            ['nombre' => $_POST['ref2_nombre'], 'telefono' => $_POST['ref2_telefono'], 'tipo' => 'personal2']
        ];
        
        foreach ($refs as $ref) {
            $sqlRef = "INSERT INTO referencias (credito_id, nombre, telefono, tipo) 
                       VALUES ($1, $2, $3, $4)";
            $result = pg_query_params($conex, $sqlRef, [
                $credito_id,
                $ref['nombre'],
                $ref['telefono'],
                $ref['tipo']
            ]);
            
            if (!$result) {
                throw new Exception('Error al guardar referencia: ' . pg_last_error($conex));
            }
        }

        // Insertar datos bancarios
        $sqlBanco = "INSERT INTO datos_bancarios (credito_id, banco_nombre, banco_tipo_cuenta, banco_numero_cuenta) 
                     VALUES ($1, $2, $3, $4)";
        $result = pg_query_params($conex, $sqlBanco, [
            $credito_id,
            $_POST['banco_nombre'],
            $_POST['banco_tipo_cuenta'],
            $_POST['banco_numero_cuenta']
        ]);
        
        if (!$result) {
            throw new Exception('Error al guardar datos bancarios: ' . pg_last_error($conex));
        }

        pg_query($conex, "COMMIT");
        
        echo json_encode([
            'success' => true,
            'numero_credito' => $numero_credito
        ]);

    } catch (Exception $e) {
        pg_query($conex, "ROLLBACK");
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}

pg_close($conex);
?>