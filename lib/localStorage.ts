import { Space, Module, Day, Sizes, Period, Subject, Professor } from './types';




// Funciones para guardar datos en localStorage
export const saveRoomsToStorage = (rooms: Space[]): void => {
    localStorage.setItem('rooms', JSON.stringify(rooms));
};

export const saveProfessorsToStorage = (professors: Professor[]): void => {
    localStorage.setItem('professors', JSON.stringify(professors));
};

export const savePeriodsToStorage = ( periods: Period[] ): void => {
    localStorage.setItem('periods', JSON.stringify( periods ));
};

export const saveModulesToStorage = (modules: Module[]): void => {
    localStorage.setItem('modules', JSON.stringify(modules));
};

// Funciones para obtener datos desde localStorage
export const getRoomsFromStorage = (): Space[] => {
    const storedRooms = localStorage.getItem('rooms');
    return storedRooms ? JSON.parse(storedRooms) : [];
};


export const getProfessorsFromStorage = (): Professor[] => {
    const storedProfessors = localStorage.getItem('professors');
    return storedProfessors ? JSON.parse(storedProfessors) : [];
};

// Periods
export const getPeriodsFromStorage = (): Period[] => {
    const storedPeriods = localStorage.getItem( 'periods' );
    return JSON.parse(storedPeriods || "[]" );

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
