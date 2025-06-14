import { Room, Section, Module, Day, Sizes, Periods, Subject, Professor } from './types';

export const saveSectionsToStorage = (sections: Section[]): void => {
    localStorage.setItem('sections', JSON.stringify(sections));
};

export const getSectionsFromStorage = (): Section[] | null => {
    const storedSections = localStorage.getItem('sections');
    return storedSections ? JSON.parse(storedSections) : null;
};

// Funciones para guardar datos en localStorage
export const saveRoomsToStorage = (rooms: Room[]): void => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
};

export const saveProfessorsToStorage = (professors: Professor[]): void => {
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


export const getProfessorsFromStorage = (): Professor[] => {
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

// Days
export const saveDaysToStorage = (days: Day[]): void => {
    localStorage.setItem('days', JSON.stringify(days));
};

export const getDaysFromStorage = (): Day[] | null => {
    const storedDays = localStorage.getItem('days');
    return storedDays ? JSON.parse(storedDays) : null;
};

// Sizes
export const saveSizesToStorage = (sizes: Sizes[]): void => {
    localStorage.setItem('sizes', JSON.stringify(sizes));
};

export const getSizesFromStorage = (): Sizes[] => {
    const storedSizes = localStorage.getItem('sizes');
    return storedSizes ? JSON.parse(storedSizes) : [];
};

// Subjects
export const saveSubjectsToStorage = (subjects: Subject[]): void => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
};

export const getSubjectsFromStorage = (): Subject[] => {
    const storedSubjects = localStorage.getItem('subjects');
    return storedSubjects ? JSON.parse(storedSubjects) : [];
};

// Función para extraer datos únicos de las secciones existentes
// export const extractDataFromSections = (sections: Section[]): void => {
//     // Extraer profesores únicos
//     const professors = sections.map(section => section.professor);
//     const uniqueProfessors = Array.from(new Set(professors));
//     saveProfessorsToStorage(uniqueProfessors);

//     // Extraer periodos únicos
//     const periods = sections.map(section => section.period);
//     const uniquePeriods = Array.from(new Set(periods));
//     savePeriodsToStorage(uniquePeriods);
// };
