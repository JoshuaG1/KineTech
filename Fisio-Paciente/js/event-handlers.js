// js/event-handlers.js

import { state } from './state.js';
import { 
    humanBodySVG, fatigueLevelInput, fatigueLevelValueSpan, painLevelSlider, 
    painLevelValueDiv, workTimeInput, restTimeInput, commentsTextarea, 
    confirmCallback, logsContainer, exerciseSelect, painSummaryContainer,
    loginUsernameInput, loginPasswordInput, loginBtn, loginErrorMsg, subtitleRole,
    homeLink, togglePasswordBtn, togglePasswordIcon,
    patientDetailName, calendarContainer, backToDashboardBtn
} from './dom-elements.js';
import { saveLog, deleteLogFromStorage, loadLogsFromStorage } from './data-persistence.js';
import { 
    navigateTo, renderPainSummary, renderPainIndicators, showToast, renderLogs, 
    showPainModalUI, hidePainModalUI, showConfirmModalUI, hideConfirmModalUI, 
    populateExercises, renderPhysioDashboard, 
    renderCalendar, displaySessionDetails // Importación corregida
} from './ui-renderer.js';

// --- CREDENCIALES DE EJEMPLO (MOCK DATA) ---
const JOSHUA_ID = 'user-joshua-gongora';
const HUGO_ID = 'user-hugo-estrella';

const MOCK_USERS = {
    'hugo': { password: 'Estrella', role: 'physio', id: HUGO_ID, name: 'Hugo' },
    'joshua': { password: 'Gongora', role: 'patient', id: JOSHUA_ID, name: 'Joshua' },
};

// --- LÓGICA DE AUTENTICACIÓN Y FLUJO ---

function handleLogin() {
    const username = loginUsernameInput.value.toLowerCase().trim();
    const password = loginPasswordInput.value.trim();
    
    const user = MOCK_USERS[username];

    if (user && user.password === password) {
        loginErrorMsg.classList.add('hidden');
        state.userId = user.id; 
        state.userName = user.name;
        
        initializeApp(user.role);
        
        loginUsernameInput.value = '';
        loginPasswordInput.value = '';

    } else {
        loginErrorMsg.classList.remove('hidden');
        loginPasswordInput.value = ''; 
    }
}

function togglePasswordVisibility() {
    const isPassword = loginPasswordInput.type === 'password';
    loginPasswordInput.type = isPassword ? 'text' : 'password';
    
    if (togglePasswordIcon) {
        const iconName = isPassword ? 'eye' : 'eye-off';
        togglePasswordIcon.setAttribute('data-feather', iconName);
        feather.replace(); 
    }
}

function initializeApp(role) {
    state.userRole = role;
    
    if (role === 'patient') {
        subtitleRole.textContent = `Bienvenido, ${state.userName}. Diario de recuperación personal`;
        homeLink.classList.remove('hidden'); 
        populateExercises(); 
        renderPainSummary();
        renderLogs(loadLogsFromStorage(state.userId));
        navigateTo('exercise'); 
    } else if (role === 'physio') {
        subtitleRole.textContent = `Bienvenido, ${state.userName}. Panel de Gestión de Pacientes`;
        homeLink.classList.remove('hidden');
        renderPhysioDashboard();
        navigateTo('physioDashboard');
    } else { // 'login'
        subtitleRole.textContent = '';
        homeLink.classList.add('hidden');
        navigateTo('login');
    }
}

// --- LÓGICA DE DETALLE DEL FISIOTERAPEUTA ---

function handlePatientCardClick(patientId, patientName) {
    // 1. Cargamos los logs de Joshua (el único con datos simulados)
    const patientLogs = loadLogsFromStorage(JOSHUA_ID); 
    
    // 2. Actualizamos la cabecera y datos simulados del paciente
    patientDetailName.textContent = `Historial de ${patientName}`;
    document.getElementById('patient-detail-email').textContent = 'joshua@modelo.edu';
    
    // 3. Dibujamos el calendario y limpiamos el detalle
    renderCalendar(patientLogs);
    document.getElementById('session-detail-output').innerHTML = '<p class="text-gray-500 text-center py-4">Selecciona una fecha en el calendario para ver el detalle de la sesión.</p>';
    
    // 4. Navegamos a la vista de detalle
    navigateTo('patientDetail');
}

// --- LÓGICA DE NEGOCIO (Paciente) ---

function resetForm() {
    state.painPoints = [];
    state.fatigueLevel = 3;
    if (fatigueLevelInput) fatigueLevelInput.value = 3;
    if (fatigueLevelValueSpan) fatigueLevelValueSpan.textContent = '3';
    if (workTimeInput) workTimeInput.value = '';
    if (restTimeInput) restTimeInput.value = '';
    if (commentsTextarea) commentsTextarea.value = '';
    
    document.querySelectorAll('.body-part.selected').forEach(el => el.classList.remove('selected'));
    
    renderPainIndicators();
    renderPainSummary();
}

function handleSaveSession() {
    const newLog = {
        id: crypto.randomUUID(),
        exercise: exerciseSelect.value,
        painPoints: state.painPoints.map(({ partId, level, cx, cy }) => ({ partId, level, cx, cy })),
        fatigueLevel: fatigueLevelInput.value || 3,
        workTime: workTimeInput.value || 0,
        restTime: restTimeInput.value || 0,
        comments: commentsTextarea.value,
        timestamp: new Date().toISOString()
    };
    const updatedLogs = saveLog(newLog, state.userId);

    showToast("¡Registro guardado con éxito!");
    renderLogs(updatedLogs);
    resetForm();
    navigateTo('exercise'); 
}

function handleDeleteLog(logId) {
    const updatedLogs = deleteLogFromStorage(logId, state.userId);
    renderLogs(updatedLogs);
    showToast("Registro eliminado.");
}

function handleSubmitPain() {
    if (!state.selectedBodyPart) { hidePainModalUI(); return; }

    const level = parseInt(painLevelSlider.value);
    const { id: partId, element } = state.selectedBodyPart;
    const existingPointIndex = state.painPoints.findIndex(p => p.partId === partId);

    if (level === 0) {
        if (existingPointIndex > -1) { state.painPoints.splice(existingPointIndex, 1); element.classList.remove('selected'); }
    } else if (existingPointIndex > -1) {
        state.painPoints[existingPointIndex].level = level;
        if (state.clickCoords) { state.painPoints[existingPointIndex].cx = state.clickCoords.cx; state.painPoints[existingPointIndex].cy = state.clickCoords.cy; }
    } else {
        state.painPoints.push({ partId, level, ...state.clickCoords });
        element.classList.add('selected');
    }

    renderPainSummary();
    renderPainIndicators();
    hidePainModalUI();
}

// --- CONFIGURACIÓN DE LISTENERS ---

export function setupEventListeners() {
    
    // 1. Manejador de Login
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        if (loginPasswordInput) loginPasswordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
        if (loginUsernameInput) loginUsernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });
    }

    // 2. TOGGLE DE CONTRASEÑA
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
    }

    // 3. Navegación Rápida (Título FisioTrack)
    if (homeLink) {
        homeLink.addEventListener('click', () => {
            initializeApp('login'); 
        });
    }

    // 4. Navegación del Paciente
    const startLoggingBtn = document.getElementById('start-logging-btn');
    if (startLoggingBtn) startLoggingBtn.addEventListener('click', () => { state.currentExercise = exerciseSelect.value; navigateTo('session'); });
    const backToExerciseBtn = document.getElementById('back-to-exercise-btn');
    if (backToExerciseBtn) backToExerciseBtn.addEventListener('click', () => navigateTo('exercise'));
    const goToPainBtn = document.getElementById('go-to-pain-btn');
    if (goToPainBtn) goToPainBtn.addEventListener('click', () => navigateTo('pain'));
    const backToSessionBtn = document.getElementById('back-to-session-btn');
    if (backToSessionBtn) backToSessionBtn.addEventListener('click', () => navigateTo('session'));
    const saveSessionBtn = document.getElementById('save-session-btn');
    if (saveSessionBtn) saveSessionBtn.addEventListener('click', handleSaveSession);

    // 5. Manejo de Inputs, SVG y Dolor
    if (fatigueLevelInput) fatigueLevelInput.addEventListener('input', (e) => { state.fatigueLevel = e.target.value; fatigueLevelValueSpan.textContent = e.target.value; });
    if (humanBodySVG) humanBodySVG.addEventListener('click', (e) => {
        const part = e.target.closest('.body-part');
        if (part) {
            const svgRect = humanBodySVG.getBoundingClientRect();
            const scaleX = humanBodySVG.viewBox.baseVal.width / svgRect.width;
            const scaleY = humanBodySVG.viewBox.baseVal.height / svgRect.height;
            const clickX = (e.clientX - svgRect.left) * scaleX;
            const clickY = (e.clientY - svgRect.top) * scaleY;
            state.clickCoords = { cx: clickX, cy: clickY };
            state.selectedBodyPart = { id: part.id, element: part };
            showPainModalUI(part.id);
        }
    });

    if (painLevelSlider) painLevelSlider.addEventListener('input', (e) => { painLevelValueDiv.textContent = e.target.value; });
    const submitPainBtn = document.getElementById('submit-pain-btn');
    if (submitPainBtn) submitPainBtn.addEventListener('click', handleSubmitPain);
    const cancelPainBtn = document.getElementById('cancel-pain-btn');
    if (cancelPainBtn) cancelPainBtn.addEventListener('click', hidePainModalUI);
    
    if (painSummaryContainer) painSummaryContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-pain-point');
        if (removeBtn) {
            const partIdToRemove = removeBtn.dataset.partId;
            state.painPoints = state.painPoints.filter(p => p.partId !== partIdToRemove);
            document.getElementById(partIdToRemove)?.classList.remove('selected');
            renderPainSummary();
            renderPainIndicators();
        }
    });

    // 6. Gestión del Historial (Eliminación)
    if (logsContainer) logsContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-log-btn');
        if (deleteBtn) {
            const logId = deleteBtn.dataset.logId;
            showConfirmModalUI( '¿Estás seguro de que quieres eliminar este registro?', () => handleDeleteLog(logId) );
        }
    });
    
    // 7. Navegación del FISIOTERAPEUTA
    const patientListContainer = document.getElementById('patient-list-container');
    if (patientListContainer) {
        patientListContainer.addEventListener('click', (e) => {
            const card = e.target.closest('.patient-card');
            if (card && card.dataset.patientId === JOSHUA_ID) {
                const patientName = card.querySelector('.font-bold').textContent;
                handlePatientCardClick(JOSHUA_ID, patientName);
            }
        });
    }
    
    // 8. Botón para volver al Dashboard
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => {
            navigateTo('physioDashboard');
        });
    }
    
    // 9. Listener para el Calendario (selección de fecha)
    if (calendarContainer) {
        calendarContainer.addEventListener('click', (e) => {
            const dateElement = e.target.closest('.calendar-day.has-log');
            if (dateElement) {
                const dateString = dateElement.dataset.date;
                displaySessionDetails(dateString);
            }
        });
    }
}