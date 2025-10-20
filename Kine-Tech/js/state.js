// js/state.js

/**
 * Mantiene el estado mutable de la aplicación.
 */
export const state = {
    currentExercise: null,
    painPoints: [],
    fatigueLevel: 3,
    workTime: '',
    restTime: '',
    comments: '',
    currentView: 'exercise-selection-view',
    selectedBodyPart: null,
    clickCoords: null,
};

/**
 * Constantes y mapeos (Datos fijos).
 */
export const bodyPartNames = {
    'head': 'cabeza', 'neck': 'cuello', 'torso': 'torso', 
    'shoulder-left': 'hombro izquierdo', 'shoulder-right': 'hombro derecho',
    'arm-left': 'brazo izquierdo', 'arm-right': 'brazo derecho',
    'hand-left': 'mano izquierda', 'hand-right': 'mano derecha',
    'hips': 'caderas', 'leg-left': 'pierna izquierda', 'leg-right': 'pierna derecha',
    'foot-left': 'pie izquierdo', 'foot-right': 'pie derecho'
};

export const exercises = [
    "Sentadillas", "Puente de Glúteos", "Elevación de Talones", "Estiramiento de Isquiotibiales",
    "Plancha Abdominal", "Remo con Banda Elástica", "Rotación Externa de Hombro", "Pájaros"
];

export const LOCAL_STORAGE_KEY = 'fisioTrackLogs';