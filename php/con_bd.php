<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

$host = "localhost";
$port = "5432";
$dbname = "scooperativo";
$user = "postgres";
$password = "Pereda202020";

$conex = pg_connect("host=$host port=$port dbname=$dbname user=$user password=$password");

if (!$conex) {
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    die(json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . pg_last_error()
    ]));
}

function conectaMongoDB() {
    try {
        return new MongoDB\Client("mongodb://localhost:27017");
    } catch (Exception $e) {
        error_log("Error al conectar a MongoDB: " . $e->getMessage());
        return null;
    }
}

function conectaCassandra() {
    try {
        $cluster = Cassandra::cluster()
            ->withContactPoints('127.0.0.1')
            ->withPort(9042)
            -withCredentials('cassandra', 'cassandra')
            ->build();
    } catch (Exception $e) {
        error_log("Error al conectar a Cassandra: " . $e->getMessage());
        return null;
    }
}
pg_set_client_encoding($conex, "UTF8");
?>