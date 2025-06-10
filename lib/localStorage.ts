import { Room, Section, Module } from './types';

// Funciones para guardar datos en localStorage
export const saveRoomsToStorage = (rooms: Room[]): void => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
};

export const saveCourseCodesToStorage = (courseCodes: string[]): void => {
    localStorage.setItem('courseCodes', JSON.stringify(courseCodes));
};

export const saveProfessorsToStorage = (professors: string[]): void => {
    localStorage.setItem('professors', JSON.stringify(professors));
};

export const savePeriodsToStorage = (periods: string[]): void => {
    localStorage.setItem('periods', JSON.stringify(periods));
};

export const saveModulesToStorage = (modules: Module[]): void => {
    localStorage.setItem('modules', JSON.stringify(modules));
};

// Funciones para obtener datos desde localStorage
export const getRoomsFromStorage = (): Room[] => {
    const storedRooms = localStorage.getItem('rooms');
    return storedRooms ? JSON.parse(storedRooms) : [];
};

export const getCourseCodesToStorage = (): string[] => {
    const storedCourseCodes = localStorage.getItem('courseCodes');
    return storedCourseCodes ? JSON.parse(storedCourseCodes) : [];
};

export const getProfessorsFromStorage = (): string[] => {
    const storedProfessors = localStorage.getItem('professors');
    return storedProfessors ? JSON.parse(storedProfessors) : [];
};

export const getPeriodsFromStorage = (): string[] => {
    const storedPeriods = localStorage.getItem('periods');
    return storedPeriods ? JSON.parse(storedPeriods) : ["2025-1", "2025-2", "2026-1", "2026-2"];
};

export const getModulesFromStorage = (): Module[] => {
    const storedModules = localStorage.getItem('modules');
    return storedModules ? JSON.parse(storedModules) : [];
};

// Función para extraer datos únicos de las secciones existentes
export const extractDataFromSections = (sections: Section[]): void => {
    // Extraer códigos de curso únicos
    const courseCodes = sections.map(section => section.id);
    const uniqueCourseCodes = Array.from(new Set(courseCodes));
    saveCourseCodesToStorage(uniqueCourseCodes);

    // Extraer profesores únicos
    const professors = sections.map(section => section.professor);
    const uniqueProfessors = Array.from(new Set(professors));
    saveProfessorsToStorage(uniqueProfessors);

    // Extraer periodos únicos
    const periods = sections.map(section => section.period);
    const uniquePeriods = Array.from(new Set(periods));
    savePeriodsToStorage(uniquePeriods);
};
