// js/app.js

import { loadLogsFromStorage } from './data-persistence.js';
import { populateExercises, renderPainSummary, renderLogs } from './ui-renderer.js';
import { setupEventListeners } from './event-handlers.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configurar Listeners (lógica)
    setupEventListeners();

    // 2. Renderizado Inicial (UI)
    populateExercises();
    feather.replace(); // Reemplaza los iconos (llamada a la librería externa)
    renderPainSummary(); 
    renderLogs(loadLogsFromStorage()); 
});