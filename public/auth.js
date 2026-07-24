// Configuración de Google Sign-In
const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

/**
 * Inicializar Google Sign-In
 */
function initGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID',
        callback: handleCredentialResponse
    });

    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => {
            google.accounts.id.renderButton(
                document.getElementById('googleLoginBtn'),
                { theme: 'outline', size: 'large' }
            );
        });
    }

    checkAuthStatus();
}

/**
 * Manejar respuesta de Google Sign-In
 */
async function handleCredentialResponse(response) {
    try {
        // Enviar token a backend
        const res = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: response.credential })
        });

        const data = await res.json();

        if (data.success) {
            // Guardar token y usuario
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('currentUser', JSON.stringify(data.user));

            authToken = data.token;
            currentUser = data.user;

            updateAuthUI();
            mostrarTab('candidatos');
        }
    } catch (error) {
        console.error('❌ Error en autenticación:', error);
        alert('Error al iniciar sesión');
    }
}

/**
 * Verificar estado de autenticación
 */
function checkAuthStatus() {
    if (authToken && currentUser.email) {
        updateAuthUI();
    }
}

/**
 * Actualizar UI de autenticación
 */
function updateAuthUI() {
    const loginSection = document.getElementById('loginSection');
    const profileSection = document.getElementById('profileSection');
    const tabsNav = document.getElementById('tabsNav');

    if (authToken) {
        loginSection.style.display = 'none';
        profileSection.style.display = 'flex';
        tabsNav.style.display = 'flex';

        document.getElementById('userName').textContent = currentUser.name || currentUser.email;
        if (currentUser.picture) {
            document.getElementById('userPhoto').src = currentUser.picture;
        }

        document.getElementById('logoutBtn').addEventListener('click', logout);

        // Cargar candidatos del usuario
        cargarCandidatos();
    } else {
        loginSection.style.display = 'block';
        profileSection.style.display = 'none';
        tabsNav.style.display = 'none';
    }
}

/**
 * Logout
 */
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    authToken = null;
    currentUser = {};
    location.reload();
}

/**
 * Hacer llamadas autenticadas a la API
 */
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (response.status === 401) {
        logout();
        throw new Error('Sesión expirada');
    }

    return response.json();
}

// Inicializar cuando carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleSignIn);
} else {
    initGoogleSignIn();
}
