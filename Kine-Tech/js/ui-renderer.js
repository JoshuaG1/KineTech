// js/ui-renderer.js

import { state, exercises, bodyPartNames } from './state.js';
import { 
    views, exerciseSelect, painIndicatorsGroup, logsContainer, 
    noLogsMessage, painModal, confirmModal, modalBodyPartNameSpan 
} from './dom-elements.js';

// --- FUNCIONES DE NAVEGACIÓN Y MODALES ---

export function navigateTo(viewKey) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[viewKey].classList.remove('hidden');
    state.currentView = viewKey;
    window.scrollTo(0, 0);
}

export function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'translate-y-10');
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-10');
    }, 3000);
}

export function showPainModal(partId) {
    modalBodyPartNameSpan.textContent = bodyPartNames[partId] || partId;
    const existingPoint = state.painPoints.find(p => p.partId === partId);
    const slider = document.getElementById('pain-level-slider');
    slider.value = existingPoint ? existingPoint.level : 5;
    document.getElementById('pain-level-value').textContent = slider.value;
    painModal.classList.remove('hidden');
}

export function hidePainModal() {
    painModal.classList.add('hidden');
    state.selectedBodyPart = null;
    state.clickCoords = null;
}

export function showConfirmModal(message) {
    document.getElementById('confirm-modal-message').textContent = message;
    confirmModal.classList.remove('hidden');
}

export function hideConfirmModal() {
    confirmModal.classList.add('hidden');
}

// --- FUNCIONES DE RENDERIZADO DE CONTENIDO ---

export function populateExercises() {
    exercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex;
        option.textContent = ex;
        exerciseSelect.appendChild(option);
    });
}

export function renderPainSummary() {
    const summaryContainer = document.getElementById('pain-points-summary');
    summaryContainer.innerHTML = '';

    if (state.painPoints.length === 0) {
        summaryContainer.innerHTML = '<p class="text-center text-sm text-gray-500">No se han reportado puntos de dolor.</p>';
        return;
    }

    state.painPoints.forEach(point => {
        const painElement = document.createElement('div');
        painElement.className = 'flex justify-between items-center bg-gray-100 p-2 rounded-lg';
        painElement.innerHTML = `
            <span class="capitalize font-medium">${bodyPartNames[point.partId] || point.partId}</span>
            <div class="flex items-center">
                <span class="font-bold text-red-500 mr-2">${point.level}/10</span>
                <button data-part-id="${point.partId}" class="remove-pain-point p-1 text-gray-500 hover:text-red-600"><i data-feather="x-circle" class="w-4 h-4"></i></button>
            </div>
        `;
        summaryContainer.appendChild(painElement);
    });
    feather.replace();
}

export function renderPainIndicators() {
    painIndicatorsGroup.innerHTML = '';
    state.painPoints.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const color = `hsl(0, 100%, ${100 - (point.level * 5)}%)`;
        
        // Se asume que point.cx y point.cy existen en el punto de dolor para renderizar el círculo
        circle.setAttribute('cx', point.cx);
        circle.setAttribute('cy', point.cy);
        circle.setAttribute('r', 5);
        circle.setAttribute('fill', color);
        circle.setAttribute('stroke', 'white');
        circle.setAttribute('stroke-width', 1);
        circle.classList.add('pain-indicator');
        painIndicatorsGroup.appendChild(circle);
    });
}

export function renderLogs(logs) {
    logsContainer.innerHTML = '';
    if (!logs || logs.length === 0) {
        noLogsMessage.classList.remove('hidden');
        return;
    }
    noLogsMessage.classList.add('hidden');
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    logs.forEach(log => {
        const logCard = document.createElement('div');
        logCard.className = 'bg-white p-4 rounded-xl border border-gray-200';
        
        const painPointsHTML = log.painPoints.map(p => 
            `<span class="bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full capitalize">${bodyPartNames[p.partId] || p.partId}: ${p.level}/10</span>`
        ).join('');

        logCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-lg text-blue-700">${log.exercise}</p>
                    <p class="text-sm text-gray-500">${new Date(log.timestamp).toLocaleString()}</p>
                </div>
                <button data-log-id="${log.id}" class="delete-log-btn text-gray-400 hover:text-red-500 p-1"><i data-feather="trash-2" class="w-5 h-5"></i></button>
            </div>
            <div class="mt-3">
                <div class="text-sm space-y-2">
                   <p><strong>Dolor Post-Ejercicio:</strong> ${log.painPoints.length > 0 ? painPointsHTML : 'Ninguno'}</p>
                   <p><strong>Fatiga:</strong> <span class="font-semibold">${log.fatigueLevel}/10</span></p>
                   <p><strong>Tiempos:</strong> ${log.workTime} min trabajo / ${log.restTime} min descanso</p>
                   ${log.comments ? `<p class="mt-2 pt-2 border-t text-gray-600"><strong>Comentarios:</strong> <em>${log.comments}</em></p>` : ''}
                </div>
            </div>
        `;
        logsContainer.appendChild(logCard);
    });
    feather.replace();
}