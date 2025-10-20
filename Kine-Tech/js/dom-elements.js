// js/dom-elements.js

export const views = {
    exercise: document.getElementById('exercise-selection-view'),
    session: document.getElementById('session-logging-view'),
    pain: document.getElementById('pain-logging-view')
};
export const exerciseSelect = document.getElementById('exercise-select');
export const painModal = document.getElementById('pain-modal');
export const confirmModal = document.getElementById('confirm-modal');
export const humanBodySVG = document.getElementById('human-body');
export const painIndicatorsGroup = document.getElementById('pain-indicators-group');
export const logsContainer = document.getElementById('logs-container');
export const noLogsMessage = document.getElementById('no-logs-message');
export const fatigueLevelInput = document.getElementById('fatigue-level');
export const fatigueLevelValueSpan = document.getElementById('fatigue-level-value');
export const painLevelSlider = document.getElementById('pain-level-slider');
export const painLevelValueDiv = document.getElementById('pain-level-value');
export const modalBodyPartNameSpan = document.getElementById('modal-body-part-name');
export const workTimeInput = document.getElementById('work-time');
export const restTimeInput = document.getElementById('rest-time');
export const commentsTextarea = document.getElementById('comments');

// Referencia para la lógica de confirmación
export let confirmCallback = null;

export function setConfirmCallback(callback) {
    confirmCallback = callback;
}