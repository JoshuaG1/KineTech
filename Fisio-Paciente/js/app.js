// js/app.js

import { setupEventListeners } from './event-handlers.js';
import { navigateTo } from './ui-renderer.js';
import { homeLink, subtitleRole } from './dom-elements.js';

/**
 * Establece el estado visual inicial de la cabecera cuando el usuario no está logueado.
 */
function initializeHeader() {
    // El título principal (home-link) debe estar oculto al iniciar en la vista de login.
    if (homeLink) homeLink.classList.add('hidden');
    if (subtitleRole) subtitleRole.textContent = ''; // Limpiar el "Cargando..."
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa los Listeners
    setupEventListeners();

    // 2. Ejecuta feather.replace() una vez que los listeners estén adjuntos.
    // Esto es crucial para que los iconos (como el de la contraseña) funcionen.
    feather.replace();

    // 3. Inicializa la cabecera y el estado de la vista
    initializeHeader();
    navigateTo('login');
});