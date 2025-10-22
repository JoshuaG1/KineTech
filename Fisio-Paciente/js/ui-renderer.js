// js/ui-renderer.js

import { state, exercises, bodyPartNames } from './state.js';
import { 
    views, exerciseSelect, painIndicatorsGroup, logsContainer, 
    noLogsMessage, painModal, confirmModal, modalBodyPartNameSpan,
    painLevelSlider, painLevelValueDiv, painSummaryContainer, subtitleRole,
    setConfirmCallback, humanBodySVG, workTimeInput, restTimeInput, 
    commentsTextarea, fatigueLevelInput, fatigueLevelValueSpan,
    patientDetailName, calendarContainer, sessionDetailOutput
} from './dom-elements.js';
import { loadPhysioPatients, loadLogsFromStorage } from './data-persistence.js'; 

// Objeto para mapear fechas a logs, vital para el calendario
let logsByDate = {}; 
const JOSHUA_ID = 'user-joshua-gongora';

// --- NAVEGACIÓN Y UTILIDADES ---

export function navigateTo(viewKey) {
    Object.values(views).forEach(v => {
        if (v) v.classList.add('hidden');
    });

    const targetView = views[viewKey];
    if (targetView) {
        targetView.classList.remove('hidden');
    } else {
        console.error(`Error de Navegación: La vista '${viewKey}' no existe.`);
    }
    
    // Lógica para mostrar/ocultar el historial del paciente
    const patientHistoryView = document.getElementById('patient-history-view');
    if (patientHistoryView) {
        if (viewKey === 'exercise' || viewKey === 'session' || viewKey === 'pain') {
            patientHistoryView.classList.remove('hidden');
        } else {
            patientHistoryView.classList.add('hidden');
        }
    }

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

// --- RENDERING DEL PACIENTE (Logs, Ejercicios, Dolor) ---

export function populateExercises() {
    exerciseSelect.innerHTML = '';
    exercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex;
        option.textContent = ex;
        exerciseSelect.appendChild(option);
    });
}

export function renderPainSummary() {
    painSummaryContainer.innerHTML = '';
    if (state.painPoints.length === 0) {
        painSummaryContainer.innerHTML = '<p class="text-center text-sm text-gray-500">No se han reportado puntos de dolor.</p>';
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
        painSummaryContainer.appendChild(painElement);
    });
    feather.replace();
}

export function renderPainIndicators() {
    painIndicatorsGroup.innerHTML = '';
    state.painPoints.forEach(point => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const color = `hsl(0, 100%, ${100 - (point.level * 5)}%)`;
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

// --- RENDERING DEL FISIOTERAPEUTA (Dashboard) ---

export function renderPhysioDashboard() {
    subtitleRole.textContent = 'Panel de Gestión de Pacientes';
    const patients = loadPhysioPatients();
    const container = document.getElementById('patient-list-container');
    
    if (!container) return; 
    container.innerHTML = '';

    if (patients.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No hay pacientes asignados.</p>';
        return;
    }

    patients.forEach(patient => {
        const patientElement = document.createElement('div');
        patientElement.className = 'bg-white p-4 rounded-xl border border-blue-200 shadow-md flex justify-between items-center hover:bg-blue-50 transition-colors cursor-pointer patient-card transform hover:translate-y-[-2px]';
        patientElement.setAttribute('data-patient-id', patient.id);
        patientElement.innerHTML = `
            <div class="flex items-center">
                <i data-feather="user" class="text-blue-600 mr-3 w-5 h-5"></i>
                <div>
                    <span class="font-bold text-gray-800">${patient.name}</span>
                    <p class="text-xs text-gray-500 mt-0.5">Última sesión: ${patient.lastSession}</p>
                </div>
            </div>
            <i data-feather="bar-chart-2" class="text-blue-600"></i>
        `;
        container.appendChild(patientElement);
    });
    feather.replace();
}

// --- LÓGICA DE CALENDARIO Y DETALLES (Fisio) ---

function getWeekdays() {
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
}

export function renderCalendar(logs) {
    if (!calendarContainer) return;
    
    // Limpiar y mapear logs: "YYYY-MM-DD" -> [logs de ese día]
    logsByDate = {};
    logs.forEach(log => {
        const dateKey = log.timestamp.substring(0, 10); // Ej: "2023-10-20"
        if (!logsByDate[dateKey]) logsByDate[dateKey] = [];
        logsByDate[dateKey].push(log);
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); 
    
    // Cálculo de días del mes
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let calendarHTML = `
        <div class="text-center text-lg font-bold mb-3">${now.toLocaleString('es', { month: 'long' })} ${year}</div>
        <div class="grid grid-cols-7 gap-1 text-xs font-semibold mb-2">
            ${getWeekdays().map(day => `<div class="text-center text-gray-500">${day}</div>`).join('')}
        </div>
        <div class="grid grid-cols-7 gap-1 text-sm">
    `;

    // Espacios en blanco
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHTML += `<div class="p-2"></div>`;
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasLog = logsByDate[dateString];
        const isToday = day === now.getDate() && month === now.getMonth();
        
        let dayClasses = 'calendar-day p-2 rounded-lg cursor-default';

        if (hasLog) {
            dayClasses += ' has-log bg-green-500 text-white font-bold cursor-pointer transition hover:bg-green-600';
        } else {
            dayClasses += ' bg-gray-100 text-gray-700';
        }
        
        if (isToday) {
            dayClasses += ' ring-2 ring-blue-500';
        }

        calendarHTML += `<div class="${dayClasses}" data-date="${dateString}">${day}</div>`;
    }

    calendarHTML += `</div>`;
    calendarContainer.innerHTML = calendarHTML;
}

// 🛑 EXPORTADA para ser llamada desde el listener del calendario
export function displaySessionDetails(dateString) {
    const logs = logsByDate[dateString];
    
    if (!logs || logs.length === 0) {
        sessionDetailOutput.innerHTML = `<p class="text-gray-500 text-center py-4">No hay registros para el ${dateString.split('-').reverse().join('/')}.</p>`;
        return;
    }

    let detailHTML = `
        <h4 class="text-lg font-bold text-gray-800 mb-3">${logs.length} Registro(s) para el ${dateString.split('-').reverse().join('/')}</h4>
        <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
    `;

    logs.forEach(log => {
        const painSummary = log.painPoints.length > 0
            ? log.painPoints.map(p => `${bodyPartNames[p.partId] || 'Zona Desconocida'} (${p.level}/10)`).join(', ')
            : 'Ningún dolor reportado.';

        detailHTML += `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p class="font-bold text-blue-600 mb-1">${log.exercise}</p>
                <p class="text-xs text-gray-500 mb-2">${new Date(log.timestamp).toLocaleTimeString('es')}</p>
                <ul class="list-disc list-inside text-sm space-y-1">
                    <li>Fatiga: <span class="font-semibold text-yellow-700">${log.fatigueLevel}/10</span></li>
                    <li>Tiempos: ${log.workTime} min (Trabajo) / ${log.restTime} min (Descanso)</li>
                    <li>Dolor Post-Ejercicio: ${painSummary}</li>
                </ul>
                ${log.comments ? `<p class="mt-2 text-sm italic border-t pt-2 text-gray-600">Comentario: ${log.comments}</p>` : ''}
            </div>
        `;
    });

    detailHTML += `</div>`;
    sessionDetailOutput.innerHTML = detailHTML;
}

// --- RENDERING DE MODALES ---

export function showPainModalUI(partId) {
    modalBodyPartNameSpan.textContent = bodyPartNames[partId] || partId;
    const existingPoint = state.painPoints.find(p => p.partId === partId);
    painLevelSlider.value = existingPoint ? existingPoint.level : 5;
    painLevelValueDiv.textContent = painLevelSlider.value;
    painModal.classList.remove('hidden');
}

export function hidePainModalUI() {
    painModal.classList.add('hidden');
    state.selectedBodyPart = null;
    state.clickCoords = null;
}

export function showConfirmModalUI(message, onConfirm) {
    document.getElementById('confirm-modal-message').textContent = message;
    setConfirmCallback(onConfirm);
    confirmModal.classList.remove('hidden');
}

export function hideConfirmModalUI() {
    confirmModal.classList.add('hidden');
    setConfirmCallback(null);
}