// requestcredit.js corregido y mejorado

// Funciones para mostrar/ocultar formularios
function showForm(type) {
    hideForm();
    clearAllErrors(type);  // Limpiar errores al cambiar de formulario
    
    const form = document.getElementById(`form-${type}`);
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
        attachValidationListeners(type);
        if (type === 'vivienda') {
            toggleRUCField();
        }
        // Reiniciar progreso al mostrar nuevo formulario
        updateFormStep(type, 1);
    }
}

function hideForm() {
    const forms = document.querySelectorAll('.credit-form');
    forms.forEach(form => {
        form.style.display = 'none';
    });
}

// Funciones para navegación de pasos (Vivienda)
function nextStep(step) {
    const formType = 'vivienda';
    showValidationMessage('');  // Limpiar mensajes globales
    
    let isValid = true;
    
    switch(step) {
        case 2:
            isValid = validateStep1(formType);
            break;
        case 3:
            isValid = validateStep2(formType);
            break;
        case 4:
            isValid = validateStep3(formType);
            break;
        case 5:
            isValid = validateStep4(formType);
            break;
    }
    
    if (!isValid) {
        showValidationMessage('Por favor, corrija los errores antes de continuar');
        return;
    }
    
    updateFormStep(formType, step);
    if (step === 5) {
        updateSummary(formType);
    }
}

function prevStep(step) {
    showValidationMessage('');  // Limpiar mensajes globales
    updateFormStep('vivienda', step - 1);
}

// Funciones para navegación de pasos (Personal)
function nextStepPersonal(step) {
    const formType = 'personal';
    showValidationMessage('');  // Limpiar mensajes globales
    
    let isValid = true;
    
    switch(step) {
        case 2:
            isValid = validateStep1(formType);
            break;
        case 3:
            isValid = validateStep2(formType);
            break;
        case 4:
            isValid = validateStep3(formType);
            break;
        case 5:
            isValid = validateStep4(formType);
            break;
    }
    
    if (!isValid) {
        showValidationMessage('Por favor, corrija los errores antes de continuar');
        return;
    }
    
    updateFormStep(formType, step);
    if (step === 5) {
        updateSummary(formType);
    }
}

function prevStepPersonal(step) {
    showValidationMessage('');  // Limpiar mensajes globales
    updateFormStep('personal', step - 1);
}

// Función para actualizar pasos del formulario
function updateFormStep(formType, step) {
    const form = document.getElementById(`form-${formType}`);
    if (!form) return;
    
    const steps = form.querySelectorAll('.form-step');
    const progressSteps = form.querySelectorAll('.progress-step');

    // Ocultar todos los pasos
    steps.forEach(s => s.classList.remove('active'));
    progressSteps.forEach(p => p.classList.remove('active', 'completed'));

    // Mostrar paso actual
    const currentStep = form.querySelector(`.form-step[data-step="${step}"]`);
    const currentProgress = form.querySelector(`.progress-step[data-step="${step}"]`);
    
    if (currentStep) currentStep.classList.add('active');
    if (currentProgress) currentProgress.classList.add('active');

    // Marcar pasos anteriores como completados
    progressSteps.forEach(p => {
        const stepNum = parseInt(p.dataset.step);
        if (stepNum < step) {
            p.classList.add('completed');
        }
    });
}

// Función para actualizar resumen
function updateSummary(formType) {
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    const montoInput = document.getElementById(`monto-${prefix}`);
    const plazoSelect = document.getElementById(`plazo-${prefix}`);
    
    if (!montoInput || !plazoSelect) {
        console.error('Elementos de monto o plazo no encontrados');
        return;
    }
    
    const monto = parseFloat(montoInput.value) || 0;
    const plazo = parseInt(plazoSelect.value) || 0;
    
    // Tasas de interés
    const tasaAnual = formType === 'vivienda' ? 0.0855 : 0.105; // 8.55% o 10.5%
    const tasaMensual = tasaAnual / 12;
    
    let cuota = 0;
    let periodos = 0;
    
    if (formType === 'vivienda') {
        periodos = plazo * 12;
        cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -periodos));
        cuota = cuota * 1.015; // Seguro de desgravamen (1.5%)
    } else {
        periodos = plazo;
        cuota = (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -periodos));
    }

    // Actualizar elementos del resumen
    const montoDisplay = document.getElementById(`summary-monto-display-${prefix}`);
    const plazoDisplay = document.getElementById(`summary-plazo-display-${prefix}`);
    const tasaDisplay = document.getElementById(`summary-tasa-display-${prefix}`);
    const cuotaDisplay = document.getElementById(`summary-cuota-display-${prefix}`);
    
    if (montoDisplay) montoDisplay.textContent = `S/ ${monto.toLocaleString('es-PE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (plazoDisplay) plazoDisplay.textContent = `${plazo} ${formType === 'vivienda' ? 'años' : 'meses'}`;
    if (tasaDisplay) tasaDisplay.textContent = `${(tasaAnual * 100).toFixed(2)}%`;
    if (cuotaDisplay) cuotaDisplay.textContent = `S/ ${cuota.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
function validateStep1(formType) {
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    let isValid = true;
    
    clearStep1Errors(formType);

    // Campos básicos según el tipo de formulario
    let basicFields = [];
    if (formType === 'vivienda') {
        basicFields = [
            { id: `monto-${prefix}`, name: 'monto solicitado', type: 'number' },
            { id: `ingresos-${prefix}`, name: 'ingresos mensuales', type: 'number' },
            { id: `trabajo-${prefix}`, name: 'tipo de trabajo', type: 'select' },
            { id: `deudas-${prefix}`, name: 'deudas actuales', type: 'number' },
            { id: `obligaciones-${prefix}`, name: 'otras obligaciones', type: 'number' },
            { id: `direccion-propiedad-${prefix}`, name: 'dirección de la propiedad', type: 'text', minLength: 10 },
            { id: `ciudad-propiedad-${prefix}`, name: 'ciudad de la propiedad', type: 'text', pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/ },
            { id: `valor-propiedad-${prefix}`, name: 'valor de la propiedad', type: 'number' }
        ];
    } else {
        basicFields = [
            { id: `monto-${prefix}`, name: 'monto solicitado', type: 'number' },
            { id: `ingresos-${prefix}`, name: 'ingresos mensuales', type: 'number' },
            { id: `finalidad-${prefix}`, name: 'finalidad del crédito', type: 'select' },
            { id: `deudas-${prefix}`, name: 'deudas actuales', type: 'number' },
            { id: `obligaciones-${prefix}`, name: 'otras obligaciones', type: 'number' }
        ];
    }

    // Validar campos básicos
    for (const field of basicFields) {
        const input = document.getElementById(field.id);
        if (!input) continue;
        
        const value = input.value.trim();
        
        if (!value && field.type !== 'select') {
            showFieldError(input, `El campo ${field.name} es obligatorio`);
            isValid = false;
            continue;
        }
        
        if (field.type === 'select' && value === '') {
            showFieldError(input, `Seleccione una opción para ${field.name}`);
            isValid = false;
        }
        
        if (field.type === 'number') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                showFieldError(input, `El campo ${field.name} debe ser un número válido`);
                isValid = false;
            } else if (numValue < 0) {
                showFieldError(input, `El campo ${field.name} no puede ser negativo`);
                isValid = false;
            }
        }
        
        if (field.pattern && !field.pattern.test(value)) {
            showFieldError(input, `Formato inválido para ${field.name}`);
            isValid = false;
        }
        
        if (field.minLength && value.length < field.minLength) {
            showFieldError(input, `Mínimo ${field.minLength} caracteres`);
            isValid = false;
        }
    }

    // Validar límites de monto
    const montoInput = document.getElementById(`monto-${prefix}`);
    const maxAmount = formType === 'vivienda' ? 500000 : 50000;
    if (montoInput && montoInput.value) {
        const montoValue = parseFloat(montoInput.value);
        if (montoValue > maxAmount) {
            showFieldError(
                montoInput, 
                `El monto máximo permitido es S/ ${maxAmount.toLocaleString('es-PE')}`
            );
            isValid = false;
        } else if (montoValue <= 0) {
            showFieldError(montoInput, 'El monto solicitado debe ser mayor que cero');
            isValid = false;
        }
    }

    // Validar RUC para trabajadores independientes (solo vivienda)
    if (formType === 'vivienda') {
        const trabajoValue = document.getElementById('trabajo-v').value;
        const rucInput = document.getElementById('ruc-v');
        
        if (trabajoValue === 'independiente') {
            const rucValue = rucInput.value.trim();
            
            if (!rucValue) {
                showFieldError(rucInput, 'El RUC es obligatorio para trabajadores independientes');
                isValid = false;
            } else if (rucValue.length !== 11) {
                showFieldError(rucInput, 'El RUC debe tener 11 dígitos');
                isValid = false;
            } else if (!/^\d+$/.test(rucValue)) {
                showFieldError(rucInput, 'El RUC solo debe contener números');
                isValid = false;
            }
        }
    }

    // Validar capacidad de pago
    if (isValid) {
        const ingresos = parseFloat(document.getElementById(`ingresos-${prefix}`).value) || 0;
        const deudas = parseFloat(document.getElementById(`deudas-${prefix}`).value) || 0;
        const obligaciones = parseFloat(document.getElementById(`obligaciones-${prefix}`).value) || 0;
        const monto = parseFloat(document.getElementById(`monto-${prefix}`).value) || 0;
        
        // Las deudas totales no deben superar el 40% de los ingresos
        const totalDeudas = deudas + obligaciones;
        if (totalDeudas > ingresos * 0.4) {
            showValidationMessage('Sus deudas totales superan el 40% de sus ingresos. Por favor revise su capacidad de pago.');
            isValid = false;
        }
        
        // Para crédito vivienda: el monto no debe superar el 80% del valor de la propiedad
        if (formType === 'vivienda') {
            const valorPropiedad = parseFloat(document.getElementById(`valor-propiedad-${prefix}`).value) || 0;
            if (monto > valorPropiedad * 0.8) {
                showValidationMessage('El monto solicitado supera el 80% del valor de la propiedad');
                isValid = false;
            }
        }
    }

    return isValid;
}

function validateStep2(formType) {
    if (formType !== 'vivienda' && formType !== 'personal') return true;
    
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    let isValid = true;
    clearReferenceErrors(prefix);
    
    const referenceFields = [
        { id: `ref1-nombre-${prefix}`, name: 'nombre de referencia 1', pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/ },
        { id: `ref1-telefono-${prefix}`, name: 'teléfono de referencia 1', pattern: /^\d{9}$/ },
        { id: `ref2-nombre-${prefix}`, name: 'nombre de referencia 2', pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,}$/ },
        { id: `ref2-telefono-${prefix}`, name: 'teléfono de referencia 2', pattern: /^\d{9}$/ }
    ];
    
    // Validar que los números no sean iguales
    const tel1 = document.getElementById(`ref1-telefono-${prefix}`).value.trim();
    const tel2 = document.getElementById(`ref2-telefono-${prefix}`).value.trim();
    
    if (tel1 && tel2 && tel1 === tel2) {
        showFieldError(
            document.getElementById(`ref2-telefono-${prefix}`),
            'Los teléfonos de referencia no pueden ser iguales'
        );
        isValid = false;
    }
    
    // Validación de campos individuales
    referenceFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;
        
        const value = input.value.trim();
        
        if (!value) {
            showFieldError(input, `El campo ${field.name} es obligatorio`);
            isValid = false;
        } else if (field.pattern && !field.pattern.test(value)) {
            if (field.id.includes('telefono')) {
                showFieldError(input, 'El teléfono debe tener 9 dígitos');
            } else if (field.id.includes('nombre')) {
                showFieldError(input, 'Solo se permiten letras y espacios (mínimo 3 caracteres)');
            }
            isValid = false;
        }
    });
    
    return isValid;
}

function validateStep3(formType) {
    if (formType !== 'vivienda' && formType !== 'personal') return true;
    
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    let isValid = true;
    clearBankErrors(prefix);
    
    const bankFields = [
        { id: `banco-${prefix}`, name: 'nombre del banco', minLength: 3 },
        { id: `cuenta-${prefix}`, name: 'número de cuenta' }
    ];
    
    // Validar campos bancarios básicos
    bankFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (!input) return;
        
        const value = input.value.trim();
        
        if (!value) {
            showFieldError(input, `El campo ${field.name} es obligatorio`);
            isValid = false;
        }
        
        if (field.minLength && value.length < field.minLength) {
            showFieldError(input, `Mínimo ${field.minLength} caracteres`);
            isValid = false;
        }
    });
    
    // Validar número de cuenta (CCI válido)
    const cuentaInput = document.getElementById(`cuenta-${prefix}`);
    if (cuentaInput && cuentaInput.value) {
        const cuentaValue = cuentaInput.value.replace(/\s/g, '');
        if (!/^\d{10,20}$/.test(cuentaValue)) {
            showFieldError(cuentaInput, 'El número de cuenta debe tener entre 10 y 20 dígitos');
            isValid = false;
        }
    }
    
    // Validar autorización de consulta
    const consentCheckbox = document.getElementById(`consent-credit-${prefix}`);
    if (!consentCheckbox.checked) {
        showFieldError(consentCheckbox, 'Debe autorizar la consulta en centrales de riesgo');
        isValid = false;
    }
    
    return isValid;
}

function validateStep4(formType) {
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    const dniFile = document.getElementById(`dni-file-${prefix}`);
    const payslipFile = document.getElementById(`payslip-file-${prefix}`);
    
    let isValid = true;
    clearFileErrors(prefix);
    
    // Validar DNI
    if (!validateFile(dniFile, `dni-file-info-${prefix}`, ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'], 5)) {
        isValid = false;
    }
    
    // Validar boletas
    if (!validateFile(payslipFile, `payslip-file-info-${prefix}`, ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'], 5)) {
        isValid = false;
    }
    
    return isValid;
}

function validateStep5(formType) {
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    const termsCheckbox = document.getElementById(`terms-${prefix}`);
    
    if (!termsCheckbox.checked) {
        showFieldError(termsCheckbox, 'Debe aceptar los términos y condiciones');
        return false;
    }
    clearCheckboxError(termsCheckbox);
    return true;  
}

// Función para mostrar mensaje de error para un campo
function showFieldError(input, message) {
    // Para campos de checkbox
    if (input.type === 'checkbox') {
        let errorElement = input.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        return;
    }

    // Para otros tipos de campos
    input.classList.add('invalid');

    let errorElement = input.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// Limpiar errores del paso 2
function clearStep1Errors(formType) {
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    const fields = [
        `monto-${prefix}`, `plazo-${prefix}`, `ingresos-${prefix}`,
        `trabajo-${prefix}`, `finalidad-${prefix}`, `deudas-${prefix}`,
        `obligaciones-${prefix}`, `direccion-propiedad-${prefix}`,
        `ciudad-propiedad-${prefix}`, `valor-propiedad-${prefix}`, `ruc-v`
    ];

    fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.remove('invalid');
            let errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.style.display = 'none';
            }
        }
    });
}

// Limpiar errores de referencias
function clearReferenceErrors(prefix) {
    const refFields = [
        `ref1-nombre-${prefix}`, `ref1-telefono-${prefix}`,
        `ref2-nombre-${prefix}`, `ref2-telefono-${prefix}`
    ];
    
    refFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.remove('invalid');
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.style.display = 'none';
            }
        }
    });
}

// Limpiar errores bancarios
function clearBankErrors(prefix) {
    const bankFields = [
        `banco-${prefix}`, `tipo-cuenta-${prefix}`, `cuenta-${prefix}`,
        `consent-credit-${prefix}`
    ];

    bankFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.remove('invalid');
            let errorElement = input.nextElementSibling;
            
            // Para checkboxes
            if (input.type === 'checkbox') {
                errorElement = input.parentNode.querySelector('.error-message');
            }
            
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.style.display = 'none';
            }
        }
    });
}

// Limpiar errores de archivos
function clearFileErrors(prefix) {
    const fileInputs = [
        `dni-file-${prefix}`, `payslip-file-${prefix}`
    ];
    
    fileInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.classList.remove('invalid');
            let errorElement = input.nextElementSibling;
            while (errorElement && !errorElement.classList.contains('error-message')) {
                errorElement = errorElement.nextElementSibling;
            }
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    });
}

// Limpiar todos los errores de un formulario
function clearAllErrors(formType) {
    const form = document.getElementById(`form-${formType}`);
    
    if (!form) return;
    
    // Limpiar errores de campos
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(el => {
        el.style.display = 'none';
    });
    
    // Limpiar clases de error
    const invalidInputs = form.querySelectorAll('.invalid');
    invalidInputs.forEach(input => {
        input.classList.remove('invalid');
    });
    
    // Limpiar mensaje global
    showValidationMessage('');
}

// Limpiar mensajes de error
function clearErrorMessages(formType) {
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    const fields = [
        `nombre-${prefix}`, `dni-${prefix}`, `email-${prefix}`,
        `telefono-${prefix}`, `ciudad-${prefix}`, `direccion-${prefix}`
    ];

    fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.classList.remove('invalid');
            const errorElement = input.nextElementSibling;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.style.display = 'none';
            }
        }
    });
}

// Función mejorada para validar archivos
function validateFile(fileInput, infoElementId, validTypes, maxSizeMB) {
    const file = fileInput.files[0];
    const infoElement = document.getElementById(infoElementId);
    let isValid = true;
    
    // Limpiar validación anterior
    fileInput.classList.remove('invalid');
    
    // Buscar elemento de error
    let errorElement = fileInput.nextElementSibling;
    while (errorElement && !errorElement.classList.contains('error-message')) {
        errorElement = errorElement.nextElementSibling;
    }
    
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    if (!file) {
        showFieldError(fileInput, 'Por favor, seleccione un archivo');
        isValid = false;
    } else {
        // Validar tipo de archivo
        if (!validTypes.includes(file.type)) {
            const allowedTypes = validTypes.map(t => t.split('/')[1]).join(', ');
            showFieldError(fileInput, `Formato no válido. Formatos permitidos: ${allowedTypes}`);
            isValid = false;
        }
        
        // Validar tamaño
        if (file.size > maxSizeMB * 1024 * 1024) {
            showFieldError(fileInput, `El archivo excede ${maxSizeMB}MB`);
            isValid = false;
        }
        
        // Mostrar información del archivo si es válido
        if (isValid && infoElement) {
            infoElement.textContent = `✅ ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`;
            infoElement.style.color = 'green';
        } else if (!isValid && infoElement) {
            infoElement.textContent = '';
        }
    }
    
    return isValid;
}

// Mostrar mensaje de validación global
function showValidationMessage(message) {
    const container = document.getElementById('validation-messages');
    const errorText = document.getElementById('error-text');
    
    if (container && errorText) {
        if (message) {
            errorText.textContent = message;
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
                container.style.display = 'none';
            }, 5000);
        } else {
            container.style.display = 'none';
        }
    }
}

// Mostrar mensaje de confirmación
function showConfirmation() {
    const overlay = document.getElementById('confirmation-overlay');
    if (overlay) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        overlay.style.display = 'flex';
    }
}

// Función para cerrar confirmación
function closeConfirmation() {
    const overlay = document.getElementById('confirmation-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        
        // Limpiar formulario activo
        const activeForm = document.querySelector('.credit-form[style*="block"]');
        if (activeForm) {
            const formType = activeForm.id.replace('form-', '');
            clearForm(formType);
            hideForm();
        }
    }
}

// Limpiar formulario
function clearForm(formType) {
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    const form = document.querySelector(`#form-${formType} form`);
    
    if (form) {
        form.reset();
        clearAllErrors(formType);
    }

    // Limpiar información de archivos
    const fileInfoElements = document.querySelectorAll(`#form-${formType} .file-info`);
    fileInfoElements.forEach(el => {
        el.textContent = '';
        el.style.color = '';
    });

    // Ocultar grupo RUC si es visible
    if (formType === 'vivienda') {
        const rucGroup = document.getElementById('ruc-group');
        if (rucGroup) {
            rucGroup.style.display = 'none';
        }
    }

    // Volver al paso 1
    updateFormStep(formType, 1);
}

// Adjuntar listeners de validación a los campos
function attachValidationListeners(formType) {
    const prefix = formType === 'vivienda' ? 'v' : 'p';
    
    // Obtener todos los campos del formulario
    const inputs = document.querySelectorAll(`#form-${formType} .form-input, 
                                           #form-${formType} input[type="checkbox"],
                                           #form-${formType} input[type="file"]`);
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('invalid');
            let errorElement;
            
            if (this.type === 'checkbox') {
                errorElement = this.parentNode.querySelector('.error-message');
            } else if (this.type === 'file') {
                errorElement = this.nextElementSibling.nextElementSibling;
            } else {
                errorElement = this.nextElementSibling;
            }
            
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.style.display = 'none';
            }
        });
    });
}

// Función para mostrar/ocultar campo RUC
function toggleRUCField() {
    const trabajoSelect = document.getElementById('trabajo-v');
    const rucGroup = document.getElementById('ruc-group');
    
    if (trabajoSelect && rucGroup) {
        if (trabajoSelect.value === 'independiente') {
            rucGroup.style.display = 'block';
        } else {
            rucGroup.style.display = 'none';
            document.getElementById('ruc-v').value = '';
            clearFieldError('ruc-v');
        }
    }
}

// Limpiar error de un campo específico
function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    if (input) {
        input.classList.remove('invalid');
        let errorElement = input.nextElementSibling;
        while (errorElement && !errorElement.classList.contains('error-message')) {
            errorElement = errorElement.nextElementSibling;
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

// Validación de campos numéricos
function validateNumericInputs() {
    const numericFields = [
        'monto-v', 'ingresos-v', 'deudas-v', 'obligaciones-v', 'valor-propiedad-v',
        'monto-p', 'ingresos-p', 'deudas-p', 'obligaciones-p'
    ];
    
    numericFields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', function() {
                // Permitir solo números y un punto decimal
                this.value = this.value.replace(/[^0-9.]/g, '');
                
                // Permitir solo un punto decimal
                if ((this.value.match(/\./g) || []).length > 1) {
                    this.value = this.value.substring(0, this.value.length - 1);
                }
            });
        }
    });
}

// Validación específica para RUC
function validateRUCInput() {
    const rucInput = document.getElementById('ruc-v');
    if (rucInput) {
        rucInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 11);
        });
    }
}

// Cargar parámetros de URL
function loadURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const amount = urlParams.get('amount');
    const term = urlParams.get('term');
    const rate = urlParams.get('rate');

    if (type && (type === 'personal' || type === 'vivienda')) {
        showForm(type);
        
        setTimeout(() => {
            const prefix = type === 'vivienda' ? 'v' : 'p';
            
            // Configurar monto
            if (amount) {
                const amountInput = document.getElementById(`monto-${prefix}`);
                if (amountInput) {
                    amountInput.value = amount;
                }
            }
            
            // Configurar plazo
            if (term) {
                const termSelect = document.getElementById(`plazo-${prefix}`);
                if (termSelect) {
                    let termValue = term;
                    
                    // Para crédito vivienda: convertir años a meses
                    if (type === 'vivienda') {
                        const termNumber = parseInt(term);
                        if (termNumber <= 30) {
                            termValue = (termNumber * 12).toString();
                        }
                    }
                    
                    // Verificar si el valor existe
                    const options = Array.from(termSelect.options);
                    const optionExists = options.some(option => option.value === termValue);
                    
                    if (optionExists) {
                        termSelect.value = termValue;
                    } else if (options.length > 0) {
                        termSelect.value = options[0].value;
                    }
                }
            }

            // Configurar tasa
            if (rate) {
                const rateDisplay = document.querySelector(`#tasa-display-${prefix}`);
                if (rateDisplay) {
                    rateDisplay.textContent = `${rate}%`;
                }
            }
            
            // Actualizar resumen si estamos en paso final
            const currentStep = document.querySelector(`#form-${type} .form-step.active`);
            if (currentStep && 
                (currentStep.dataset.step === '6' || currentStep.dataset.step === '4')) {
                updateSummary(type);
            }
        }, 300);
    }
}

// Enviar formulario
async function submitForm(formType) {
    try {
        showLoadingIndicator();
        
        // Obtener formulario directamente
        const form = document.querySelector(`#form-${formType} form`);
        const formData = new FormData(form);
        
        const endpoint = formType === 'vivienda' ? 
            '../php/guardar_vivienda.php' : '../php/guardar_personal.php';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.text();
        
        hideLoadingIndicator();
        
        if (result.success) {
            showConfirmation();
        } else {
            showValidationMessage('Error al guardar la solicitud: ' + result);
        }
    } catch (error) {
        hideLoadingIndicator();
        showValidationMessage('Error de conexión: ' + error.message);
    }
}

// Mostrar indicador de carga
function showLoadingIndicator() {
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        `;
        
        loadingOverlay.appendChild(spinner);
        document.body.appendChild(loadingOverlay);
        
        // Agregar CSS para la animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    loadingOverlay.style.display = 'flex';
}

// Ocultar indicador de carga
function hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Event listeners para formularios
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners para los formularios
    const forms = document.querySelectorAll('.credit-form form');
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formId = this.closest('.credit-form').id;
            const formType = formId.replace('form-', '');
            
            let allValid = true;
            let currentStep = 1;

            // Validación para crédito vivienda
            if (formType === 'vivienda') {
                if (!validateStep1(formType)) {
                    updateFormStep(formType, 1);
                    showValidationMessage('Por favor, corrija los errores en el Paso 1');
                    allValid = false;
                }
                if (allValid && !validateStep2(formType)) {
                    updateFormStep(formType, 2);
                    showValidationMessage('Por favor, corrija los errores en el Paso 2');
                    allValid = false;
                }
                if (allValid && !validateStep3(formType)) {
                    updateFormStep(formType, 3);
                    showValidationMessage('Por favor, corrija los errores en el Paso 3');
                    allValid = false;
                }
                if (allValid && !validateStep4(formType)) {
                    updateFormStep(formType, 4);
                    showValidationMessage('Por favor, corrija los errores en el Paso 4');
                    allValid = false;
                }
                if (allValid && !validateStep5(formType)) {
                    updateFormStep(formType, 5);
                    showValidationMessage('Por favor, corrija los errores en el Paso 5');
                    allValid = false;
                }
            } 
            // Validación para crédito personal
            else {
                if (!validateStep1(formType)) {
                    updateFormStep(formType, 1);
                    showValidationMessage('Por favor, corrija los errores en el Paso 1');
                    allValid = false;
                }
                if (allValid && !validateStep2(formType)) {
                    updateFormStep(formType, 2);
                    showValidationMessage('Por favor, corrija los errores en el Paso 2');
                    allValid = false;
                }
                if (allValid && !validateStep3(formType)) {
                    updateFormStep(formType, 3);
                    showValidationMessage('Por favor, corrija los errores en el Paso 3');
                    allValid = false;
                }
                if (allValid && !validateStep4(formType)) {
                    updateFormStep(formType, 4);
                    showValidationMessage('Por favor, corrija los errores en el Paso 4');
                    allValid = false;
                }
                if (allValid && !validateStep5(formType)) {
                    updateFormStep(formType, 5);
                    showValidationMessage('Por favor, corrija los errores en el Paso 5');
                    allValid = false;
                }
            }

            if (allValid) {
                await submitForm(formType);
            }
        });
    });

    // Configurar listener para el botón de cerrar confirmación
    const closeConfirmationBtn = document.getElementById('close-confirmation');
    if (closeConfirmationBtn) {
        closeConfirmationBtn.addEventListener('click', closeConfirmation);
    }

    // Configurar listener para el select de trabajo
    const trabajoSelect = document.getElementById('trabajo-v');
    if (trabajoSelect) {
        trabajoSelect.addEventListener('change', toggleRUCField);
    }

    // Configurar validaciones numéricas
    validateNumericInputs();
    validateRUCInput();

    // Configurar validaciones de montos
    const montoV = document.getElementById('monto-v');
    if (montoV) {
        montoV.addEventListener('input', function() {
            validateAmountRange(this, 500000);
        });
    }
    
    const montoP = document.getElementById('monto-p');
    if (montoP) {
        montoP.addEventListener('input', function() {
            validateAmountRange(this, 50000);
        });
    }

    // Configurar patrones para campos DNI y teléfono
    document.querySelectorAll('input[id$="-v"], input[id$="-p"]').forEach(input => {
        if (input.id.includes('dni')) {
            input.pattern = "\\d{8}";
            input.title = "El DNI debe tener 8 dígitos numéricos";
        } else if (input.id.includes('telefono')) {
            input.pattern = "\\d{9}";
            input.title = "El teléfono debe tener 9 dígitos";
        }
    });

    // Cargar parámetros de URL
    loadURLParams();

    // Configurar validación de archivos
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const infoElementId = this.id + '-info';
            validateFile(this, infoElementId, ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'], 5);
        });
    });
});

// Función para validar parámetros URL
function validateURLParams(type, amount, term, rate) {
    const errors = [];
    
    // Validar tipo
    if (!['personal', 'vivienda'].includes(type)) {
        errors.push('Tipo de crédito no válido');
    }
    
    // Validar monto
    if (amount && isNaN(parseFloat(amount))) {
        errors.push('Monto no válido');
    }
    
    // Validar plazo
    if (term && isNaN(parseInt(term))) {
        errors.push('Plazo no válido');
    }
    
    if (errors.length > 0) {
        return false;
    }
    
    return true;
}

// Función para validar montos
function validateAmountRange(input, maxAmount) {
    const value = parseFloat(input.value) || 0;
    if (value > maxAmount) {
        showFieldError(input, `El monto máximo permitido es S/ ${maxAmount.toLocaleString()}`);
        return false;
    }
    return true;
}

// Limpiar error de checkbox
function clearCheckboxError(checkbox) {
    const errorElement = checkbox.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}