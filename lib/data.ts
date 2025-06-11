import type { Section, Room, Module, Day } from "./types"

// Datos iniciales de ejemplo para las secciones
// export const initialSections: Section[] = [
//     {
//         id: "1",
//         code: 1,
//         session: "S1",
//         size: "M",
//         correctedRegistrants: 30,
//         realRegistrants: 28,
//         plannedBuilding: "A",
//         chairsAvailable: 35,
//         professor: "Dr. García",
//         room: "LAB.208-A",
//         day: 1,
//         moduleId: "1",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-1",
//     },
//     {
//         id: "2",
//         code: 2,
//         session: "S1",
//         size: "L",
//         correctedRegistrants: 45,
//         realRegistrants: 40,
//         plannedBuilding: "B",
//         chairsAvailable: 50,
//         professor: "Dra. Martínez",
//         room: "AUDITORIO-001",
//         day: 1, // Lunes
//         moduleId: "2-a",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-1",
//     },
//     {
//         id: "3",
//         code: 3,
//         session: "S2",
//         size: "S",
//         correctedRegistrants: 20,
//         realRegistrants: 18,
//         plannedBuilding: "A",
//         chairsAvailable: 25,
//         professor: "Dr. López",
//         room: "001-A",
//         day: 2, // Martes
//         moduleId: "3",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-1",
//     },
//     {
//         id: "4",
//         code: 1,
//         session: "S1",
//         size: "M",
//         correctedRegistrants: 30,
//         realRegistrants: 30,
//         plannedBuilding: "C",
//         chairsAvailable: 30,
//         professor: "Dr. Rodríguez",
//         room: "002-A (Esp)",
//         day: 2, // Martes
//         moduleId: "4",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-1",
//     },
//     {
//         id: "5",
//         code: 2,
//         session: "S2",
//         size: "L",
//         correctedRegistrants: 50,
//         realRegistrants: 48,
//         plannedBuilding: "B",
//         chairsAvailable: null,
//         professor: "Dra. Sánchez",
//         room: "311-A",
//         day: 3, // Miércoles
//         moduleId: "1",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-1",
//     },
//     {
//         id: "6",
//         code: 1,
//         session: "S1",
//         size: "M",
//         correctedRegistrants: 25,
//         realRegistrants: 22,
//         plannedBuilding: "A",
//         chairsAvailable: 30,
//         professor: "Dr. Pérez",
//         room: "312-A",
//         day: 4, // Jueves
//         moduleId: "1",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-1",
//     },
//     {
//         id: "7",
//         code: 2,
//         session: "S2",
//         size: "S",
//         correctedRegistrants: 15,
//         realRegistrants: 15,
//         plannedBuilding: "C",
//         chairsAvailable: 20,
//         professor: "Dra. González",
//         room: "201-A",
//         day: 5, // Viernes
//         moduleId: "2-b",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-2",
//     },
//     {
//         id: "8",
//         code: 3,
//         session: "S1",
//         size: "L",
//         correctedRegistrants: 60,
//         realRegistrants: 55,
//         plannedBuilding: "B",
//         chairsAvailable: 60,
//         professor: "Dr. Ramírez",
//         room: "211-A",
//         day: 6, // Sábado
//         moduleId: "3",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-2",
//     },
//     {
//         id: "9",
//         code: 1,
//         session: "S2",
//         size: "M",
//         correctedRegistrants: 33,
//         realRegistrants: 30,
//         plannedBuilding: "A",
//         chairsAvailable: 35,
//         professor: "Dra. Torres",
//         room: "301-A",
//         day: 1, // Lunes
//         moduleId: "5",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-2",
//     },
//     {
//         id: "10",
//         code: 2,
//         session: "S1",
//         size: "S",
//         correctedRegistrants: 28,
//         realRegistrants: 25,
//         plannedBuilding: "C",
//         chairsAvailable: null,
//         professor: "Dr. Díaz",
//         room: "108-A",
//         day: 3, // Miércoles
//         moduleId: "6",
//         subjectName: 'Matemáticas',
//         subjectId: 'MAT00123',
//         period: "2025-2",
//     },
//     ]

    // Datos iniciales de ejemplo para las salas
export const initialRooms: Room[] = [
    {
        id: "LAB.208-A",
        building: "A",
        capacity: 80,
        type: "LABPC",
        sizeId: "XL",
    },
    {
        id: "AUDITORIO-001",
        building: "A",
        capacity: 400,
        type: "AUDITORIO",
        sizeId: "XXL",
    },
    {
        id: "001-A",
        building: "A",
        capacity: 30,
        type: "ROOM",
        sizeId: "S",
    },
    {
        id: "002-A (Esp)",
        building: "A",
        capacity: 30,
        type: "ROOM",
        sizeId: "S",
    },
    {
        id: "311-A",
        building: "A",
        capacity: 30,
        type: "ROOM",
        sizeId: "S",
    },
    {
        id: "312-A",
        building: "A",
        capacity: 30,
        type: "ROOM",
        sizeId: "S",
    },
    {
        id: "201-A",
        building: "A",
        capacity: 40,
        type: "ROOM",
        sizeId: "MS",
    },
    {
        id: "211-A",
        building: "A",
        capacity: 40,
        type: "ROOM",
        sizeId: "MS",
    },
    {
        id: "301-A",
        building: "A",
        capacity: 43,
        type: "ROOM",
        sizeId: "MS",
    },
    {
        id: "108-A",
        building: "A",
        capacity: 47,
        type: "ROOM",
        sizeId: "MS",
    },
    {
        id: "210-A",
        building: "A",
        capacity: 50,
        type: "ROOM",
        sizeId: "M",
    },
    {
        id: "304-A",
        building: "A",
        capacity: 50,
        type: "ROOM",
        sizeId: "M",
    },
    {
        id: "307-A",
        building: "A",
        capacity: 65,
        type: "ROOM",
        sizeId: "L",
    },
    {
        id: "308-A",
        building: "A",
        capacity: 65,
        type: "ROOM",
        sizeId: "L",
    },
    {
        id: "102-A",
        building: "A",
        capacity: 70,
        type: "ROOM",
        sizeId: "L",
    },
    {
        id: "103-A",
        building: "A",
        capacity: 70,
        type: "ROOM",
        sizeId: "L",
    },
    {
        id: "LAB.COMP-A",
        building: "A",
        capacity: 80,
        type: "LAB",
        sizeId: "XL",
    },
    {
        id: "309-A",
        building: "A",
        capacity: 55,
        type: "ROOM",
        sizeId: "M",
    }
]

export const periods = ["2025-1", "2025-2", "2026-1", "2026-2"]

export const sizes = [
    { value: "XS", label: "XS (< 30)" },
    { value: "S", label: "S (30-40)" },
    { value: "MS", label: "MS (40-50)" },
    { value: "M", label: "M (50-60)" },
    { value: "L", label: "L (> 60)" },
    { value: "XL", label: "XL (> 70)" },
]

// Módulos por día
// export const modulesByDay: Module[] = [
//   // Lunes
//     { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 1, order: 1 },
//     { id: "2-a", name: "M2-A", startTime: "10:15", endTime: "11:00", dayId: 1, order: 2 },
//     { id: "2-b", name: "M2-B", startTime: "11:00", endTime: "11:45", dayId: 1, order: 3 },
//     { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 1, order: 4 },
//     { id: "4", name: "M4", startTime: "14:30", endTime: "16:00", dayId: 1, order: 5 },
//     { id: "5", name: "M5", startTime: "16:15", endTime: "17:45", dayId: 1, order: 6 },
//     { id: "6", name: "M6", startTime: "18:00", endTime: "19:30", dayId: 1, order: 7 },

//     // Martes
//     { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 2, order: 1 },
//     { id: "2", name: "M2", startTime: "10:15", endTime: "11:45", dayId: 2, order: 2 },
//     { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 2, order: 3 },
//     { id: "4", name: "M4", startTime: "14:30", endTime: "16:00", dayId: 2, order: 4 },
//     { id: "5-a", name: "M5-A", startTime: "16:15", endTime: "17:00", dayId: 2, order: 5 },
//     { id: "5-b", name: "M5-B", startTime: "17:00", endTime: "17:45", dayId: 2, order: 6 },

//     // Miércoles
//     { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 3, order: 1 },
//     { id: "2", name: "M2", startTime: "10:15", endTime: "11:45", dayId: 3, order: 2 },
//     { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 3, order: 3 },
//     { id: "4", name: "M4", startTime: "14:30", endTime: "16:00", dayId: 3, order: 4 },
//     { id: "5", name: "M5", startTime: "16:15", endTime: "17:45", dayId: 3, order: 5 },
//     { id: "6", name: "M6", startTime: "18:00", endTime: "19:30", dayId: 3, order: 6 },

//     // Jueves
//     { id: "1", name: "M1", startTime: "08:30", endTime: "10:00",        dayId: 4, order: 1 },
//     { id: "2-a", name: "M2-A", startTime: "10:15", endTime: "11:00",    dayId: 4, order: 2 },
//     { id: "2-b", name: "M2-B", startTime: "11:00", endTime: "11:45",    dayId: 4, order: 3 },
//     { id: "3", name: "M3", startTime: "12:00", endTime: "13:30",        dayId: 4, order: 4 },
//     { id: "4", name: "M4", startTime: "14:30", endTime: "16:00",        dayId: 4, order: 5 },

//     // Vierne5
//     { id: "1", name: "M1", startTime: "08:30", endTime: "10:00",        dayId: 5, order: 1 },
//     { id: "2-a", name: "M2-A", startTime: "10:15", endTime: "11:00",    dayId: 5, order: 2 },
//     { id: "2-b", name: "M2-B", startTime: "11:00", endTime: "11:45",    dayId: 5, order: 3 },
//     { id: "3", name: "M3", startTime: "12:00", endTime: "13:30",        dayId: 5, order: 4 },

//   // Sábado
//     { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 6, order: 1 },
//     { id: "2", name: "M2", startTime: "10:15", endTime: "11:45", dayId: 6, order: 2 },
//     { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 6, order: 3 },
// ]

// export const days: Day[] = [
//     { id: 1, name: "Lunes", shortName: "L", mediumName: "Lunes" },
//     { id: 2, name: "Martes", shortName: "M", mediumName: "Martes" },
//     { id: 3, name: "Miércoles", shortName: "X", mediumName: "Miércoles" },
//     { id: 4, name: "Jueves", shortName: "J", mediumName: "Jueves" },
//     { id: 5, name: "Viernes", shortName: "V", mediumName: "Viernes" },
//     { id: 6, name: "Sábado", shortName: "S", mediumName: "Sábado" },
//     { id: 7, name: "Domingo", shortName: "D", mediumName: "Domingo" },
// ]

// Función para obtener los módulos de un día específico
// export function getModulesForDay(dayId: number): Module[] {
//     return modulesByDay
//         .filter(( module : Module ) => module.dayId === dayId )
//         .sort(( a : Module, b : Module ) => a.order - b.order )
// }
