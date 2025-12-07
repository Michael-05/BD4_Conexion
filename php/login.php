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
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

try {
    include("con_bd.php");
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $dni = trim($data['dni'] ?? '');
    $contrasena = $data['contrasena'] ?? '';

    if (empty($dni) || empty($contrasena)) {
        throw new Exception('DNI y contraseña son requeridos');
    }

    if (!preg_match('/^\d{8}$/', $dni)) {
        throw new Exception('Formato de DNI inválido');
    }

    $sql = "SELECT id, dni, nombre_completo, contraseña, estado, rol FROM socios WHERE dni = $1";
    $result = pg_query_params($conex, $sql, [$dni]);
    
    if (!$result) {
        throw new Exception('Error en consulta de base de datos');
    }
    
    $usuario = pg_fetch_assoc($result);
    pg_free_result($result);

    if (!$usuario) {
        throw new Exception('DNI o contraseña incorrectos');
    }

    if ($usuario['estado'] !== 'activo') {
        throw new Exception('Cuenta no activa. Contacte al administrador');
    }

    if (!password_verify($contrasena, $usuario['contraseña'])) {
        throw new Exception('DNI o contraseña incorrectos');
    }

    $_SESSION['user_id'] = $usuario['id'];
    $_SESSION['user_rol'] = $usuario['rol'];
    $_SESSION['user_nombre'] = $usuario['nombre_completo'];
    $_SESSION['user_dni'] = $usuario['dni'];

    $redirect = ($usuario['rol'] === 'admin') ? '../HTMLs/admin/dashboard.html' : '../index.html';

    echo json_encode([
        'success' => true,
        'message' => 'Inicio de sesión exitoso',
        'user' => [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre_completo'],
            'rol' => $usuario['rol'],
            'dni' => $usuario['dni']
        ],
        'redirect' => $redirect
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