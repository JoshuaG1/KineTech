// js/data-persistence.js (MODIFICADO)

import { LOCAL_STORAGE_KEY } from './state.js';

// Usaremos un ID fijo para Joshua para almacenar sus logs.
const JOSHUA_ID = 'user-joshua-gongora';

function getStorageKey(userId) {
    // Si es Hugo (Fisio), solo le devolvemos la clave de Joshua para simular acceso.
    // En un sistema real, el Fisio buscaría logs por el ID del Paciente.
    // Aquí, Hugo siempre verá los logs de Joshua.
    if (userId === 'user-hugo-estrella') {
        return `${LOCAL_STORAGE_KEY}_${JOSHUA_ID}`;
    }
    // Si es Joshua, usamos su clave.
    if (userId === JOSHUA_ID) {
        return `${LOCAL_STORAGE_KEY}_${JOSHUA_ID}`;
    }
    // Clave de respaldo si no está logueado o es otro usuario
    return LOCAL_STORAGE_KEY; 
}


export function loadLogsFromStorage(userId) {
    // Esta función se reemplazará por fetch('/api/user/logs?userId=...')
    const logsJSON = localStorage.getItem(getStorageKey(userId));
    return logsJSON ? JSON.parse(logsJSON) : [];
}

export function saveLogsToStorage(logs, userId) {
    // Esta función se reemplazará por fetch(POST a '/api/session')
    localStorage.setItem(getStorageKey(userId), JSON.stringify(logs));
}

export function saveLog(newLog, userId) {
    const currentLogs = loadLogsFromStorage(userId);
    currentLogs.push(newLog);
    saveLogsToStorage(currentLogs, userId);
    return currentLogs;
}

export function deleteLogFromStorage(logId, userId) {
    let currentLogs = loadLogsFromStorage(userId);
    currentLogs = currentLogs.filter(log => log.id !== logId);
    saveLogsToStorage(currentLogs, userId);
    return currentLogs;
}

export function loadPhysioPatients() {
    // Datos simulados para el panel del fisioterapeuta
    return [
        { id: JOSHUA_ID, name: 'Joshua Góngora (PACIENTE)', lastSession: 'Hoy' },
        { id: 'another-patient-id', name: 'Laura Martinez', lastSession: 'Hace 5 días' },
    ];
}