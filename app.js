document.addEventListener('DOMContentLoaded', () => {
    
    // --- ESTADO DE LA APLICACIÓN ---
    const state = {
        currentExercise: null,
        painPoints: [],
        fatigueLevel: 3,
        workTime: '',
        restTime: '',
        comments: '',
        currentView: 'exercise-selection-view',
        selectedBodyPart: null,
        clickCoords: null, // Para guardar las coordenadas de click en el SVG
    };

    const bodyPartNames = {
        'head': 'cabeza', 'neck': 'cuello', 'torso': 'torso', 
        'shoulder-left': 'hombro izquierdo', 'shoulder-right': 'hombro derecho',
        'arm-left': 'brazo izquierdo', 'arm-right': 'brazo derecho',
        'hand-left': 'mano izquierda', 'hand-right': 'mano derecha',
        'hips': 'caderas', 'leg-left': 'pierna izquierda', 'leg-right': 'pierna derecha',
        'foot-left': 'pie izquierdo', 'foot-right': 'pie derecho'
    };
    
    const exercises = [
        "Sentadillas", "Puente de Glúteos", "Elevación de Talones", "Estiramiento de Isquiotibiales",
        "Plancha Abdominal", "Remo con Banda Elástica", "Rotación Externa de Hombro", "Pájaros"
    ];
    
    // --- ELEMENTOS DEL DOM ---
    const views = {
        exercise: document.getElementById('exercise-selection-view'),
        session: document.getElementById('session-logging-view'),
        pain: document.getElementById('pain-logging-view')
    };
    const exerciseSelect = document.getElementById('exercise-select');
    const painModal = document.getElementById('pain-modal');
    const confirmModal = document.getElementById('confirm-modal');
    const humanBodySVG = document.getElementById('human-body');
    const painIndicatorsGroup = document.getElementById('pain-indicators-group');
    const logsContainer = document.getElementById('logs-container');
    const noLogsMessage = document.getElementById('no-logs-message');
    let confirmCallback = null;

    // --- LÓGICA DE ALMACENAMIENTO LOCAL (PERSISTENCIA DE DATOS) ---
    const LOCAL_STORAGE_KEY = 'fisioTrackLogs';

    function loadLogsFromStorage() {
        const logsJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
        return logsJSON ? JSON.parse(logsJSON) : [];
    }

    function saveLogsToStorage(logs) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
    }

    // --- FUNCIONES DE RENDERIZADO Y UI ---
    
    function navigateTo(viewId) {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        views[viewId].classList.remove('hidden');
        state.currentView = viewId;
        window.scrollTo(0, 0);
    }

    function populateExercises() {
        exercises.forEach(ex => {
            const option = document.createElement('option');
            option.value = ex;
            option.textContent = ex;
            exerciseSelect.appendChild(option);
        });
    }
    
    function renderPainSummary() {
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
    
    function renderPainIndicators() {
        painIndicatorsGroup.innerHTML = '';
        state.painPoints.forEach(point => {
            // Re-obtener las coordenadas o usar las guardadas si es necesario (el código original usa las coordenadas de click)
            // Para mantener el comportamiento original (indicador donde se hizo click), usamos state.clickCoords guardado al abrir el modal.
            // Nota: Se asume que point.cx y point.cy se guardaron correctamente en el state.painPoints al presionar Aceptar.
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const color = `hsl(0, 100%, ${100 - (point.level * 5)}%)`; // Color rojo más intenso con más dolor
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
    
    function showPainModal(partId, partElement) {
        state.selectedBodyPart = { id: partId, element: partElement };
        document.getElementById('modal-body-part-name').textContent = bodyPartNames[partId] || partId;
        const existingPoint = state.painPoints.find(p => p.partId === partId);
        const slider = document.getElementById('pain-level-slider');
        slider.value = existingPoint ? existingPoint.level : 5;
        document.getElementById('pain-level-value').textContent = slider.value;
        painModal.classList.remove('hidden');
    }

    function hidePainModal() {
        painModal.classList.add('hidden');
        state.selectedBodyPart = null;
        state.clickCoords = null; // Limpiar las coordenadas al cerrar el modal
    }

    function showConfirmModal(message, onConfirm) {
        document.getElementById('confirm-modal-message').textContent = message;
        confirmCallback = onConfirm;
        confirmModal.classList.remove('hidden');
    }

    function hideConfirmModal() {
        confirmModal.classList.add('hidden');
        confirmCallback = null;
    }
    
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('opacity-0', 'translate-y-10');
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-10');
        }, 3000);
    }

    function renderLogs(logs) {
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

    function resetForm() {
        state.painPoints = [];
        state.fatigueLevel = 3;
        document.getElementById('fatigue-level').value = 3;
        document.getElementById('fatigue-level-value').textContent = '3';
        document.getElementById('work-time').value = '';
        document.getElementById('rest-time').value = '';
        document.getElementById('comments').value = '';
        
        document.querySelectorAll('.body-part.selected').forEach(el => el.classList.remove('selected'));
        renderPainIndicators();
        renderPainSummary();
        navigateTo('exercise');
    }

    // --- LÓGICA DE DATOS Y EVENTOS ---

    function saveLog() {
        const newLog = {
            id: crypto.randomUUID(),
            exercise: state.currentExercise,
            painPoints: state.painPoints.map(({ partId, level }) => ({ partId, level })),
            fatigueLevel: state.fatigueLevel,
            workTime: document.getElementById('work-time').value || 0,
            restTime: document.getElementById('rest-time').value || 0,
            comments: document.getElementById('comments').value,
            timestamp: new Date().toISOString()
        };

        const currentLogs = loadLogsFromStorage();
        currentLogs.push(newLog);
        saveLogsToStorage(currentLogs);

        showToast("¡Registro guardado con éxito!");
        renderLogs(currentLogs);
        resetForm();
    }
    
    function deleteLog(logId) {
        let currentLogs = loadLogsFromStorage();
        currentLogs = currentLogs.filter(log => log.id !== logId);
        saveLogsToStorage(currentLogs);
        renderLogs(currentLogs);
        showToast("Registro eliminado.");
    }

    // --- EVENT LISTENERS ---
    
    document.getElementById('start-logging-btn').addEventListener('click', () => {
        state.currentExercise = exerciseSelect.value;
        navigateTo('session');
    });

    document.getElementById('back-to-exercise-btn').addEventListener('click', () => navigateTo('exercise'));
    document.getElementById('go-to-pain-btn').addEventListener('click', () => navigateTo('pain'));
    document.getElementById('back-to-session-btn').addEventListener('click', () => navigateTo('session'));
    document.getElementById('save-session-btn').addEventListener('click', saveLog);

    humanBodySVG.addEventListener('click', (e) => {
        const part = e.target.closest('.body-part');
        if (part) {
            // Calcula las coordenadas de click dentro del sistema de coordenadas del SVG
            const svgRect = humanBodySVG.getBoundingClientRect();
            // Obtener las coordenadas del punto de click relativas al viewBox del SVG
            // Esto es crucial para colocar el indicador de dolor correctamente
            const scaleX = humanBodySVG.viewBox.baseVal.width / svgRect.width;
            const scaleY = humanBodySVG.viewBox.baseVal.height / svgRect.height;
            const clickX = (e.clientX - svgRect.left) * scaleX;
            const clickY = (e.clientY - svgRect.top) * scaleY;
            state.clickCoords = { cx: clickX, cy: clickY };
            
            showPainModal(part.id, part);
        }
    });

    document.getElementById('pain-level-slider').addEventListener('input', (e) => {
        document.getElementById('pain-level-value').textContent = e.target.value;
    });
    
    document.getElementById('fatigue-level').addEventListener('input', (e) => {
        state.fatigueLevel = e.target.value;
        document.getElementById('fatigue-level-value').textContent = e.target.value;
    });

    document.getElementById('submit-pain-btn').addEventListener('click', () => {
        const level = parseInt(document.getElementById('pain-level-slider').value);
        const { id: partId, element } = state.selectedBodyPart;
        const existingPointIndex = state.painPoints.findIndex(p => p.partId === partId);

        if (level === 0) {
            // Si el dolor es 0, lo eliminamos
            if (existingPointIndex > -1) {
                state.painPoints.splice(existingPointIndex, 1);
                element.classList.remove('selected');
            }
        } else if (existingPointIndex > -1) {
            // Si ya existe y el nivel es > 0, lo actualizamos
            state.painPoints[existingPointIndex].level = level;
            // Actualiza también las coordenadas si se abre el modal y se hace click en un punto diferente (si se desea que se mueva el punto, lo cual no es el comportamiento por defecto)
            if (state.clickCoords) {
                 state.painPoints[existingPointIndex].cx = state.clickCoords.cx;
                 state.painPoints[existingPointIndex].cy = state.clickCoords.cy;
            }
        } else {
            // Si no existe y el nivel es > 0, lo agregamos
            state.painPoints.push({ partId, level, ...state.clickCoords });
            element.classList.add('selected');
        }
        
        renderPainSummary();
        renderPainIndicators();
        hidePainModal();
    });
    
    document.getElementById('cancel-pain-btn').addEventListener('click', hidePainModal);
    
    document.getElementById('confirm-cancel-btn').addEventListener('click', hideConfirmModal);
    document.getElementById('confirm-ok-btn').addEventListener('click', () => {
        if (confirmCallback) confirmCallback();
        hideConfirmModal();
    });

    document.getElementById('pain-points-summary').addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-pain-point');
        if (removeBtn) {
            const partIdToRemove = removeBtn.dataset.partId;
            state.painPoints = state.painPoints.filter(p => p.partId !== partIdToRemove);
            document.getElementById(partIdToRemove)?.classList.remove('selected');
            renderPainSummary();
            renderPainIndicators();
        }
    });
    
    logsContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-log-btn');
        if (deleteBtn) {
            const logId = deleteBtn.dataset.logId;
            showConfirmModal(
                '¿Estás seguro de que quieres eliminar este registro?',
                () => deleteLog(logId)
            );
        }
    });

    // --- INICIALIZACIÓN ---
    populateExercises();
    feather.replace(); // Inicializa los iconos Feather
    renderPainSummary(); // Inicializa el resumen (aunque estará vacío)
    renderLogs(loadLogsFromStorage()); // Carga el historial al iniciar
});