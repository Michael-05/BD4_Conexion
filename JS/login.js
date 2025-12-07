document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const dniInput = document.getElementById('dni');
    const contrasenaInput = document.getElementById('contrasena');
    const loginBtn = document.getElementById('login-btn');
    const loading = document.getElementById('loading');
    const mensajeError = document.getElementById('mensajeError');
    const mensajeExito = document.getElementById('mensajeExito');

    function mostrarError(mensaje) {
        mensajeError.innerHTML = `<p style="color: #e74c3c; text-align: center; margin-top: 15px; font-weight: 600;">${mensaje}</p>`;
        mensajeExito.innerHTML = '';
    }

    function mostrarExito(mensaje) {
        mensajeExito.innerHTML = `<p style="color: #27ae60; text-align: center; margin-top: 15px; font-weight: 600;">${mensaje}</p>`;
        mensajeError.innerHTML = '';
    }

    function limpiarMensajes() {
        mensajeError.innerHTML = '';
        mensajeExito.innerHTML = '';
    }

    function validarDNI(dni) {
        const dniRegex = /^[0-9]{8}$/;
        return dniRegex.test(dni);
    }

    function validarContrasena(contrasena) {
        return contrasena.length >= 6;
    }

    // Validaciones en tiempo real
    dniInput.addEventListener('input', function() {
        const dni = this.value.trim();
        const errorElement = document.getElementById('dni-error');
        
        if (dni && !validarDNI(dni)) {
            if (errorElement) {
                errorElement.textContent = 'El DNI debe tener exactamente 8 dígitos';
                errorElement.style.color = '#e74c3c';
            }
            this.style.borderBottom = '2px solid #e74c3c';
        } else {
            if (errorElement) errorElement.textContent = '';
            this.style.borderBottom = '2px solid #27ae60';
        }
    });

    contrasenaInput.addEventListener('input', function() {
        const contrasena = this.value;
        const errorElement = document.getElementById('contrasena-error');
        
        if (contrasena && !validarContrasena(contrasena)) {
            if (errorElement) {
                errorElement.textContent = 'La contraseña debe tener al menos 6 caracteres';
                errorElement.style.color = '#e74c3c';
            }
            this.style.borderBottom = '2px solid #e74c3c';
        } else {
            if (errorElement) errorElement.textContent = '';
            this.style.borderBottom = '2px solid #27ae60';
        }
    });

    function toggleLoading(mostrar) {
        if (loading) {
            loading.style.display = mostrar ? 'block' : 'none';
        }
        if (loginBtn) {
            loginBtn.disabled = mostrar;
            loginBtn.style.opacity = mostrar ? '0.6' : '1';
        }
    }

    async function loginReal(datos) {
        try {
            console.log('Enviando datos:', datos); // Debug
            
            const response = await fetch('../php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos)
            });

            console.log('Response status:', response.status); // Debug
            console.log('Response headers:', response.headers.get('content-type')); // Debug

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Respuesta no JSON:', text);
                throw new Error(`Respuesta del servidor inválida: ${text.substring(0, 200)}`);
            }
            
            const result = await response.json();
            console.log('Respuesta JSON:', result); // Debug
            return result;
            
        } catch (error) {
            console.error('Error en loginReal:', error);
            return {
                success: false,
                message: 'Error de conexión con el servidor: ' + error.message
            };
        }
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const dni = dniInput.value.trim();
        const contrasena = contrasenaInput.value;

        limpiarMensajes();

        // Validaciones básicas
        if (!dni || !contrasena) {
            mostrarError('Por favor, completa todos los campos');
            return;
        }

        if (!validarDNI(dni)) {
            mostrarError('El DNI debe tener exactamente 8 dígitos');
            return;
        }

        if (!validarContrasena(contrasena)) {
            mostrarError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        toggleLoading(true);

        try {
            const datosLogin = {
                dni: dni,
                contrasena: contrasena
            };
            
            const response = await loginReal(datosLogin);

            if (response.success) {
                // Guardar datos en sessionStorage
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('user_id', response.user.id);
                sessionStorage.setItem('user_nombre', response.user.nombre);
                sessionStorage.setItem('user_rol', response.user.rol);
                
                mostrarExito(response.message + ' Redirigiendo...');

                // Redirigir después de 1.5 segundos - RUTA CORREGIDA
                setTimeout(() => {
                    window.location.href = "../index.html";
                }, 1500);
            } else {
                mostrarError(response.message);
            }
        } catch (error) {
            console.error('Error en login:', error);
            mostrarError('Error inesperado. Por favor, intenta nuevamente.');
        } finally {
            toggleLoading(false);
        }
    });

    // Permitir login con Enter
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && (dniInput.value || contrasenaInput.value)) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});