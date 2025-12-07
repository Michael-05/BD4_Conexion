document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    const mensaje = document.getElementById('mensajeRegistro');

    function mostrarMensaje(texto, tipo = 'error') {
        mensaje.textContent = texto;
        mensaje.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
        mensaje.style.display = 'block';
        
        // Scroll al mensaje
        mensaje.scrollIntoView({ behavior: 'smooth' });
        
        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            mensaje.style.display = 'none';
        }, 5000);
    }

    function validarNombre(nombre) {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
        return regex.test(nombre.trim());
    }

    function validarDNI(dni) {
        const regex = /^\d{8}$/;
        return regex.test(dni.trim());
    }

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email.trim());
    }

    function validarTelefono(telefono) {
        const regex = /^[9]\d{8}$/; 
        return regex.test(telefono.trim());
    }

    function validarDireccion(direccion) {
        return direccion.trim().length >= 5 && direccion.trim().length <= 100;
    }

    function validarCiudad(ciudad) {
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,30}$/;
        return regex.test(ciudad.trim());
    }

    function validarCodigoPostal(codigo) {
        const regex = /^\d{5}$/;
        return regex.test(codigo.trim());
    }

    function validarContrasena(contrasena) {
        return contrasena.length >= 6; // Simplificado para mayor compatibilidad
    }

    // Validación en tiempo real
    const campos = [
        { id: 'nombre', validador: validarNombre },
        { id: 'dni', validador: validarDNI },
        { id: 'email', validador: validarEmail },
        { id: 'telefono', validador: validarTelefono }
    ];

    campos.forEach(campo => {
        const elemento = document.getElementById(campo.id);
        if (elemento) {
            elemento.addEventListener('blur', function() {
                if (this.value.trim() && !campo.validador(this.value)) {
                    this.style.borderColor = '#e74c3c';
                } else if (this.value.trim()) {
                    this.style.borderColor = '#27ae60';
                }
            });

            elemento.addEventListener('input', function() {
                if (this.style.borderColor === 'rgb(231, 76, 60)') { // #e74c3c en RGB
                    this.style.borderColor = '';
                }
            });
        }
    });

    function validarFormulario() {
        const datos = {
            nombre: document.getElementById('nombre').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('telefono').value.trim(),
            direccion: document.getElementById('direccion').value.trim(),
            ciudad: document.getElementById('ciudad').value.trim(),
            codigoPostal: document.getElementById('codigoPostal').value.trim(),
            contrasena: document.getElementById('contrasena').value
        };

        console.log('Datos a validar:', datos); // Para debugging

        // Verificar campos obligatorios
        for (let campo in datos) {
            if (!datos[campo]) {
                mostrarMensaje(`El campo ${campo} es obligatorio`);
                document.getElementById(campo === 'email' ? 'email' : campo).focus();
                return false;
            }
        }

        // Validaciones específicas
        if (!validarNombre(datos.nombre)) {
            mostrarMensaje('Nombre inválido. Solo letras y espacios, 2-50 caracteres');
            document.getElementById('nombre').focus();
            return false;
        }

        if (!validarDNI(datos.dni)) {
            mostrarMensaje('DNI inválido. Debe tener exactamente 8 dígitos');
            document.getElementById('dni').focus();
            return false;
        }

        if (!validarEmail(datos.email)) {
            mostrarMensaje('Email inválido');
            document.getElementById('email').focus();
            return false;
        }

        if (!validarTelefono(datos.telefono)) {
            mostrarMensaje('Teléfono inválido. Debe empezar con 9 y tener 9 dígitos');
            document.getElementById('telefono').focus();
            return false;
        }

        if (!validarDireccion(datos.direccion)) {
            mostrarMensaje('Dirección inválida. Debe tener entre 5 y 100 caracteres');
            document.getElementById('direccion').focus();
            return false;
        }

        if (!validarCiudad(datos.ciudad)) {
            mostrarMensaje('Ciudad inválida. Solo letras y espacios');
            document.getElementById('ciudad').focus();
            return false;
        }

        if (!validarCodigoPostal(datos.codigoPostal)) {
            mostrarMensaje('Código postal inválido. Debe tener 5 dígitos');
            document.getElementById('codigoPostal').focus();
            return false;
        }

        if (!validarContrasena(datos.contrasena)) {
            mostrarMensaje('Contraseña debe tener mínimo 6 caracteres');
            document.getElementById('contrasena').focus();
            return false;
        }

        return datos;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('Formulario enviado'); // Para debugging
        
        // Ocultar mensajes previos
        mensaje.style.display = 'none';
        
        const datos = validarFormulario();
        if (!datos) {
            console.log('Validación fallida');
            return;
        }

        const boton = form.querySelector('button[type="submit"]');
        const textoOriginal = boton.textContent;
        boton.textContent = 'Procesando...';
        boton.disabled = true;

        try {
            console.log('Enviando datos:', datos); // Para debugging
            
            const response = await fetch('../php/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            console.log('Response status:', response.status); // Para debugging

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Respuesta no es JSON válido');
            }

            const resultado = await response.json();
            console.log('Resultado:', resultado); // Para debugging

            if (resultado.success) {
                mostrarMensaje('¡Registro exitoso! Tu cuenta está pendiente de activación. Redirigiendo al login...', 'exito');
                
                // Limpiar formulario
                form.reset();
                
                // Redireccionar después de 3 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                mostrarMensaje(resultado.message || 'Error en el registro. Intenta nuevamente.');
            }

        } catch (error) {
            console.error('Error completo:', error);
            mostrarMensaje('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
        } finally {
            // Restaurar botón
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }
    });
});