// js/data-persistence.js

import { LOCAL_STORAGE_KEY } from './state.js';

export function loadLogsFromStorage() {
    // ESTA FUNCIÓN SE CONVERTIRÁ EN UNA LLAMADA fetch() A TU API
    const logsJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
    return logsJSON ? JSON.parse(logsJSON) : [];
}

export function saveLogsToStorage(logs) {
    // ESTA FUNCIÓN SE CONVERTIRÁ EN UNA LLAMADA fetch() POST A TU API
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
}

export function saveLog(newLog) {
    const currentLogs = loadLogsFromStorage();
    currentLogs.push(newLog);
    saveLogsToStorage(currentLogs);
    return currentLogs;
}

export function deleteLogFromStorage(logId) {
    let currentLogs = loadLogsFromStorage();
    currentLogs = currentLogs.filter(log => log.id !== logId);
    saveLogsToStorage(currentLogs);
    return currentLogs;
}