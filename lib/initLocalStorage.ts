import { initialRooms, initialSections, modulesByDay, periods } from './data';
import { 
  saveRoomsToStorage, 
  saveCourseCodesToStorage, 
  saveProfessorsToStorage, 
  savePeriodsToStorage, 
  saveModulesToStorage,
  extractDataFromSections
} from './localStorage';

// Función para inicializar todos los datos en localStorage
export const initializeLocalStorage = (): void => {
  // Guardar salas
  saveRoomsToStorage(initialRooms);
  
  // Guardar módulos
  saveModulesToStorage(modulesByDay);
  
  // Guardar periodos
  savePeriodsToStorage(periods);
  
  // Extraer y guardar datos de las secciones existentes
  extractDataFromSections(initialSections);
  
  console.log('Datos inicializados en localStorage');
};

// Función para verificar si los datos ya están en localStorage
export const checkLocalStorageData = (): boolean => {
  return localStorage.getItem('rooms') !== null;
};

// Función para inicializar datos solo si no existen
export const initializeLocalStorageIfNeeded = (): void => {
  if (!checkLocalStorageData()) {
    initializeLocalStorage();
  }
};
