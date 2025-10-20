// js/event-handlers.js

import { state } from './state.js';
import { 
    humanBodySVG, fatigueLevelInput, fatigueLevelValueSpan, painLevelSlider, 
    painLevelValueDiv, workTimeInput, restTimeInput, commentsTextarea, 
    setConfirmCallback, confirmCallback, logsContainer 
} from './dom-elements.js';
import { saveLog, deleteLogFromStorage } from './data-persistence.js';
import { 
    navigateTo, renderPainSummary, renderPainIndicators, showPainModal, 
    hidePainModal, showToast, renderLogs, showConfirmModal, hideConfirmModal 
} from './ui-renderer.js';

// --- LÓGICA DE NEGOCIO ---

function resetForm() {
    state.painPoints = [];
    state.fatigueLevel = 3;
    fatigueLevelInput.value = 3;
    fatigueLevelValueSpan.textContent = '3';
    workTimeInput.value = '';
    restTimeInput.value = '';
    commentsTextarea.value = '';
    
    document.querySelectorAll('.body-part.selected').forEach(el => el.classList.remove('selected'));
    renderPainIndicators();
    renderPainSummary();
    navigateTo('exercise');
}

function handleSaveSession() {
    const newLog = {
        id: crypto.randomUUID(),
        exercise: state.currentExercise,
        painPoints: state.painPoints.map(({ partId, level, cx, cy }) => ({ partId, level, cx, cy })),
        fatigueLevel: state.fatigueLevel,
        workTime: workTimeInput.value || 0,
        restTime: restTimeInput.value || 0,
        comments: commentsTextarea.value,
        timestamp: new Date().toISOString()
    };

    const updatedLogs = saveLog(newLog);
    showToast("¡Registro guardado con éxito!");
    renderLogs(updatedLogs);
    resetForm();
}

function handleDeleteLog(logId) {
    const updatedLogs = deleteLogFromStorage(logId);
    renderLogs(updatedLogs);
    showToast("Registro eliminado.");
}

function handleSubmitPain() {
    const level = parseInt(painLevelSlider.value);
    const { id: partId, element } = state.selectedBodyPart;
    const existingPointIndex = state.painPoints.findIndex(p => p.partId === partId);

    if (level === 0) {
        if (existingPointIndex > -1) {
            state.painPoints.splice(existingPointIndex, 1);
            element.classList.remove('selected');
        }
    } else if (existingPointIndex > -1) {
        state.painPoints[existingPointIndex].level = level;
        // Se actualizan las coordenadas del punto para el renderizado del indicador
        if (state.clickCoords) {
             state.painPoints[existingPointIndex].cx = state.clickCoords.cx;
             state.painPoints[existingPointIndex].cy = state.clickCoords.cy;
        }
    } else {
        state.painPoints.push({ partId, level, ...state.clickCoords });
        element.classList.add('selected');
    }
    
    renderPainSummary();
    renderPainIndicators();
    hidePainModal();
}

function handleRemovePainPoint(partIdToRemove) {
    state.painPoints = state.painPoints.filter(p => p.partId !== partIdToRemove);
    document.getElementById(partIdToRemove)?.classList.remove('selected');
    renderPainSummary();
    renderPainIndicators();
}

// --- CONFIGURACIÓN DE LISTENERS ---

export function setupEventListeners() {
    // Navegación
    document.getElementById('start-logging-btn').addEventListener('click', () => {
        state.currentExercise = document.getElementById('exercise-select').value;
        navigateTo('session');
    });
    document.getElementById('back-to-exercise-btn').addEventListener('click', () => navigateTo('exercise'));
    document.getElementById('go-to-pain-btn').addEventListener('click', () => navigateTo('pain'));
    document.getElementById('back-to-session-btn').addEventListener('click', () => navigateTo('session'));
    document.getElementById('save-session-btn').addEventListener('click', handleSaveSession);

    // Fatiga
    fatigueLevelInput.addEventListener('input', (e) => {
        state.fatigueLevel = e.target.value;
        fatigueLevelValueSpan.textContent = e.target.value;
    });

    // SVG Clicks y Modal de Dolor
    humanBodySVG.addEventListener('click', (e) => {
        const part = e.target.closest('.body-part');
        if (part) {
            const svgRect = humanBodySVG.getBoundingClientRect();
            const scaleX = humanBodySVG.viewBox.baseVal.width / svgRect.width;
            const scaleY = humanBodySVG.viewBox.baseVal.height / svgRect.height;
            const clickX = (e.clientX - svgRect.left) * scaleX;
            const clickY = (e.clientY - svgRect.top) * scaleY;
            state.clickCoords = { cx: clickX, cy: clickY };
            state.selectedBodyPart = { id: part.id, element: part };
            showPainModal(part.id);
        }
    });

    painLevelSlider.addEventListener('input', (e) => {
        painLevelValueDiv.textContent = e.target.value;
    });
    document.getElementById('submit-pain-btn').addEventListener('click', handleSubmitPain);
    document.getElementById('cancel-pain-btn').addEventListener('click', hidePainModal);
    
    // Resumen de Puntos de Dolor
    document.getElementById('pain-points-summary').addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-pain-point');
        if (removeBtn) {
            handleRemovePainPoint(removeBtn.dataset.partId);
        }
    });

    // Modales de Confirmación
    document.getElementById('confirm-cancel-btn').addEventListener('click', hideConfirmModal);
    document.getElementById('confirm-ok-btn').addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        setConfirmCallback(null);
        hideConfirmModal();
    });

    // Historial (Eliminar Logs)
    logsContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-log-btn');
        if (deleteBtn) {
            const logId = deleteBtn.dataset.logId;
            showConfirmModal('¿Estás seguro de que quieres eliminar este registro?');
            setConfirmCallback(() => handleDeleteLog(logId));
        }
    });
}