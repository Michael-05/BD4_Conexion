// Funcionalidad del menú hamburguesa
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.header__menu-btn');
    const mobileNav = document.querySelector('.nav--mobile');
    const overlay = document.querySelector('.menu-overlay');
    const closeBtn = document.querySelector('.nav__close-btn');
    
    // Abrir menú móvil
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            mobileNav.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Bloquear scroll
        });
    }
    
    // Cerrar menú móvil
    function closeMenu() {
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    // Cerrar menú al hacer clic en un enlace
    const mobileLinks = document.querySelectorAll('.nav__link--mobile');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Esperar un poco antes de cerrar para dar tiempo a la transición
            setTimeout(closeMenu, 300);
        });
    });

    // Función para actualizar la UI de autenticación
    function updateAuthUI() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const userName = sessionStorage.getItem('user_nombre');
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const mobileAuthSection = document.getElementById('mobile-auth-section');
        const mobileUserSection = document.getElementById('mobile-user-section');
        const userNameSpan = document.getElementById('user-name');
        const mobileUserName = document.getElementById('mobile-user-name');
        
        if (isLoggedIn === 'true' && userName) {
            // Header principal
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'block';
            if (userNameSpan) userNameSpan.textContent = userName;
            
            // Menú móvil
            if (mobileAuthSection) mobileAuthSection.style.display = 'none';
            if (mobileUserSection) mobileUserSection.style.display = 'block';
            if (mobileUserName) mobileUserName.textContent = userName;
        } else {
            // Header principal
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            
            // Menú móvil
            if (mobileAuthSection) mobileAuthSection.style.display = 'block';
            if (mobileUserSection) mobileUserSection.style.display = 'none';
        }
    }

    // Llamar a esta función al cargar la página
    updateAuthUI();

    // Función única de logout
    function handleLogout() {
        console.log("Ejecutando cierre de sesión...");
        sessionStorage.clear();
        
        // Determinar la ruta correcta al index según la ubicación actual
        const currentPath = window.location.pathname;
        let indexPath = './index.html'; // Por defecto
        
        if (currentPath.includes('/HTMLs/')) {
            // Si estamos en una subcarpeta HTMLs
            indexPath = '../index.html';
        } else if (currentPath.includes('/js/')) {
            // Si estamos en una subcarpeta js (por si acaso)
            indexPath = '../index.html';
        }
        
        window.location.href = indexPath;
    }

    // Asignar evento de logout a todos los enlaces de logout
    const desktopLogout = document.getElementById('logout-link');
    if (desktopLogout) {
        desktopLogout.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }

    const mobileLogouts = document.querySelectorAll('.logout-link-mobile, .logout-link');
    mobileLogouts.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    });

    // Mejorar visualización del menú de usuario
    const userMenuToggle = document.querySelector('.user-menu__toggle');
    const userMenuDropdown = document.querySelector('.user-menu__dropdown');

    if (userMenuToggle && userMenuDropdown) {
        userMenuToggle.addEventListener('click', function() {
            const isVisible = userMenuDropdown.style.display === 'block';
            userMenuDropdown.style.display = isVisible ? 'none' : 'block';
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            const userMenu = document.getElementById('user-menu');
            if (userMenu && !userMenu.contains(e.target)) {
                userMenuDropdown.style.display = 'none';
            }
        });
    }
});