// js/dom-elements.js

export const views = {
    login: document.getElementById('login-view'), 
    physioDashboard: document.getElementById('physio-dashboard-view'),
    patientDetail: document.getElementById('patient-detail-view'), // NUEVO
    exercise: document.getElementById('exercise-selection-view'),
    session: document.getElementById('session-logging-view'),
    pain: document.getElementById('pain-logging-view')
};

// CONTROLES DE LOGIN
export const loginUsernameInput = document.getElementById('login-username');
export const loginPasswordInput = document.getElementById('login-password');
export const loginBtn = document.getElementById('login-btn');
export const loginErrorMsg = document.getElementById('login-error-message');
export const togglePasswordBtn = document.getElementById('toggle-password');
export const togglePasswordIcon = document.getElementById('toggle-icon');

// Controles de cabecera y navegación
export const homeLink = document.getElementById('home-link');
export const subtitleRole = document.getElementById('subtitle-role');

// Controles de Paciente
export const exerciseSelect = document.getElementById('exercise-select');
export const logsContainer = document.getElementById('logs-container');
export const noLogsMessage = document.getElementById('no-logs-message');

// Controles de Sesión
export const fatigueLevelInput = document.getElementById('fatigue-level');
export const fatigueLevelValueSpan = document.getElementById('fatigue-level-value');
export const workTimeInput = document.getElementById('work-time');
export const restTimeInput = document.getElementById('rest-time');
export const commentsTextarea = document.getElementById('comments');

// Controles de Dolor (SVG y Modales)
export const humanBodySVG = document.getElementById('human-body');
export const painIndicatorsGroup = document.getElementById('pain-indicators-group');
export const painModal = document.getElementById('pain-modal');
export const modalBodyPartNameSpan = document.getElementById('modal-body-part-name');
export const painLevelSlider = document.getElementById('pain-level-slider');
export const painLevelValueDiv = document.getElementById('pain-level-value');
export const painSummaryContainer = document.getElementById('pain-points-summary');

// CONTROLES DE DETALLE DEL PACIENTE (NUEVOS)
export const patientDetailName = document.getElementById('patient-detail-name');
export const calendarContainer = document.getElementById('calendar-container');
export const sessionDetailOutput = document.getElementById('session-detail-output');
export const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');

// Controles de Modales Globales
export const confirmModal = document.getElementById('confirm-modal');
export let confirmCallback = null;

export function setConfirmCallback(callback) {
    confirmCallback = callback;
}