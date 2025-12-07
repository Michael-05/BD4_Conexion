<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include("con_bd.php");

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $sql = "SELECT id, dni, nombre_completo, correo, telefono, direccion, ciudad, estado, fecha_registro, rol FROM socios ORDER BY fecha_registro DESC";
            $result = pg_query($conex, $sql);
            
            if (!$result) {
                throw new Exception('Error al consultar socios');
            }
            
            $socios = [];
            while ($row = pg_fetch_assoc($result)) {
                $socios[] = $row;
            }
            
            echo json_encode(['success' => true, 'data' => $socios]);
            break;

        case 'POST':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data) {
                throw new Exception('Datos JSON inválidos');
            }

            $dni = trim($data['dni'] ?? '');
            $nombre_completo = trim($data['nombre_completo'] ?? '');
            $correo = trim($data['correo'] ?? '');
            $telefono = trim($data['telefono'] ?? '');
            $direccion = trim($data['direccion'] ?? '');
            $ciudad = trim($data['ciudad'] ?? '');
            $codigo_postal = trim($data['codigo_postal'] ?? '');
            $contrasena = $data['contrasena'] ?? '';
            $rol = $data['rol'] ?? 'socio';
            $estado = 'activo';

            if (empty($dni) || empty($nombre_completo) || empty($correo) || empty($contrasena)) {
                throw new Exception('Campos obligatorios faltantes');
            }

            $contrasenaHash = password_hash($contrasena, PASSWORD_DEFAULT);
            
            $sql = "INSERT INTO socios (dni, nombre_completo, correo, telefono, direccion, ciudad, codigo_postal, contraseña, estado, rol) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id";
            
            $params = [
                $dni,
                $nombre_completo,
                $correo,
                $telefono,
                $direccion,
                $ciudad,
                $codigo_postal,
                $contrasenaHash,
                $estado,
                $rol
            ];
            
            $result = pg_query_params($conex, $sql, $params);
            
            if (!$result) {
                throw new Exception('Error al crear socio');
            }
            
            $row = pg_fetch_assoc($result);
            $id = $row['id'];
            
            echo json_encode([
                'success' => true,
                'message' => 'Socio creado exitosamente',
                'id' => $id
            ]);
            break;

        case 'PUT':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data || !isset($data['id'])) {
                throw new Exception('ID de socio requerido');
            }

            $id = intval($data['id']);
            $updates = [];
            $params = [];
            $i = 1;
            
            $camposPermitidos = ['nombre_completo', 'correo', 'telefono', 'direccion', 'ciudad', 'codigo_postal', 'estado', 'rol'];
            
            foreach ($camposPermitidos as $campo) {
                if (isset($data[$campo])) {
                    $updates[] = "$campo = $" . $i++;
                    $params[] = trim($data[$campo]);
                }
            }

            if (empty($updates)) {
                throw new Exception('No hay campos para actualizar');
            }

            $params[] = $id;
            $setClause = implode(', ', $updates);
            $sql = "UPDATE socios SET $setClause WHERE id = $" . $i;
            
            $result = pg_query_params($conex, $sql, $params);
            
            if (!$result) {
                throw new Exception('Error al actualizar socio');
            }

            echo json_encode(['success' => true, 'message' => 'Socio actualizado exitosamente']);
            break;

        case 'DELETE':
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            if (!$data || !isset($data['id'])) {
                throw new Exception('ID de socio requerido');
            }

            $id = intval($data['id']);
            
            $sql = "DELETE FROM socios WHERE id = $1";
            $result = pg_query_params($conex, $sql, [$id]);
            
            if (!$result) {
                throw new Exception('Error al eliminar socio');
            }

            if (pg_affected_rows($result) === 0) {
                throw new Exception('Socio no encontrado');
            }

            echo json_encode(['success' => true, 'message' => 'Socio eliminado exitosamente']);
            break;

        default:
            throw new Exception('Método no permitido');
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($conex) && $conex) {
        pg_close($conex);
    }
}
?>