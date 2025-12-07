<?php
// Código CORREGIDO (mysqlI, no mysql1; contraseña correcta)
$con = new mysqli("mysql-rodolfo.alwaysdata.net", "rodolfo", "aonxd20", "rodolfo_scooperativa");
echo $con->connect_errno ? "❌ Error: " . $con->connect_error : "✅ ¡Conectado!";
$con->close();
?>