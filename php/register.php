<?php
if (!headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Insertamos en MongoDB

function insertarEnMongoDB($datos) {
    try {
        $cliente = new MongoDB\Client("mongodb://localhost:27017");
        $db = $cliente->scooperativo;
        $coleccion = $db->usuarios;

        $documento = [
            'nombre_completo' => $datos['nombre_completo'],
            'dni' => $datos['dni'],
            'correo' => $datos['correo'],
            'telefono' => $datos['telefono'],
            'direccion' => $datos['direccion'],
            'ciudad' => $datos['ciudad'],
            'codigo_postal' => $datos['codigo_postal'],
            'fecha_registro' => new MongoDB\BSON\UTCDateTime()

        ];

        $resultado = $coleccion->insertOne($documento);
        return (string) $resultado->getInsertedId();
    } catch (Exception $e) {
        error_log("Error al insertar en MongoDB: " . $e->getMessage());
        return null;
    }
}

function insertarEnCassandra($datos) {
    try {
        $cluster = Cassandra::cluster()->build();
        $session = $cluster->connect('scooperativo');

        $query = 'INSERT INTO usuarios (nombre_completo, dni, correo, telefono, direccion, ciudad, codigo_postal, fecha_registro) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, toTimestamp(now()))';
        $statement = new Cassandra\SimpleStatement($query);
        $options = new Cassandra\ExecutionOptions([
            'arguments' => [
                $datos['nombre_completo'],
                $datos['dni'],
                $datos['correo'],
                $datos['telefono'],
                $datos['direccion'],
                $datos['ciudad'],
                $datos['codigo_postal']
            ]
        ]);

        $session->execute($statement, $options);
        return true;
    } catch (Exception $e) {
        error_log("Error al insertar en Cassandra: " . $e->getMessage());
        return false;
    }
}

try {
    include("con_bd.php");
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        throw new Exception('Datos JSON inválidos o vacíos');
    }

    $nombre_completo = trim($data['nombre'] ?? '');
    $dni = trim($data['dni'] ?? '');
    $correo = trim($data['email'] ?? '');
    $telefono = trim($data['telefono'] ?? '');
    $direccion = trim($data['direccion'] ?? '');
    $ciudad = trim($data['ciudad'] ?? '');
    $codigo_postal = trim($data['codigoPostal'] ?? '');
    $contrasena = $data['contrasena'] ?? '';

    if (empty($nombre_completo) || empty($dni) || empty($correo) || empty($contrasena)) {
        throw new Exception('Campos obligatorios faltantes');
    }

    if (!preg_match('/^\d{8}$/', $dni)) {
        throw new Exception('DNI debe tener 8 dígitos');
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Formato de email inválido');
    }

    if (!preg_match('/^9\d{8}$/', $telefono)) {
        throw new Exception('Teléfono debe empezar con 9 y tener 9 dígitos');
    }

    if (strlen($contrasena) < 6) {
        throw new Exception('Contraseña debe tener al menos 6 caracteres');
    }

    $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO socios (dni, nombre_completo, correo, telefono, direccion, ciudad, codigo_postal, contraseña, estado, rol) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'activo', 'socio') RETURNING id";
    
    $params = [
        $dni,
        $nombre_completo,
        $correo,
        $telefono,
        $direccion,
        $ciudad,
        $codigo_postal,
        $contrasenaHash
    ];
    
    $result = pg_query_params($conex, $sql, $params);
    
    if (!$result) {
        throw new Exception('Error al registrar usuario: ' . pg_last_error($conex));
    }
    
    $row = pg_fetch_assoc($result);
    $nuevo_id = $row['id'];

    $datos_comunes = [
        'dni' => $dni,
        'nombre_completo' => $nombre_completo,
        'correo' => $correo,
        'telefono' => $telefono,
        'direccion' => $direccion,
        'ciudad' => $ciudad,
        'codigo_postal' => $codigo_postal,
        'contrasena_hash' => $contrasenaHash
    ];

    $mongo_id = insertarEnMongoDB($datos_comunes);

    $cassandra_id = insertarEnCassandra($datos_comunes);
    
    echo json_encode([
        'success' => true, 
        'message' => 'Usuario registrado exitosamente',
        'user_id' => $nuevo_id
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage()
    ]);
} finally {
    if (isset($conex) && $conex) {
        pg_close($conex);
    }
}
?>