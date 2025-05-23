import type { Section, Room, Module, Day } from "./types"

// Datos iniciales de ejemplo para las secciones
export const initialSections: Section[] = [
    {
        id: "1",
        courseCode: "MAT1000",
        professor: "Dr. García",
        roomId: "room1",
        day: 0, // Lunes
        moduleId: "1",
        period: "2025-1",
    },
    {
        id: "2",
        courseCode: "FIS2000",
        professor: "Dra. Martínez",
        roomId: "room2",
        day: 0, // Lunes
        moduleId: "2-a",
        period: "2025-1",
    },
    {
        id: "3",
        courseCode: "INF3000",
        professor: "Dr. López",
        roomId: "room3",
        day: 1, // Martes
        moduleId: "3",
        period: "2025-1",
    },
    {
        id: "4",
        courseCode: "QUI1000",
        professor: "Dr. Rodríguez",
        roomId: "room4",
        day: 1, // Martes
        moduleId: "4",
        period: "2025-1",
    },
    {
        id: "5",
        courseCode: "BIO2000",
        professor: "Dra. Sánchez",
        roomId: "room5",
        day: 2, // Miércoles
        moduleId: "1",
        period: "2025-1",
    },
    {
        id: "6",
        courseCode: "HIS1000",
        professor: "Dr. Pérez",
        roomId: "room6",
        day: 3, // Jueves
        moduleId: "1",
        period: "2025-1",
    },
    {
        id: "7",
        courseCode: "LIT2000",
        professor: "Dra. González",
        roomId: "room7",
        day: 4, // Viernes
        moduleId: "2-b",
        period: "2025-2",
    },
    {
        id: "8",
        courseCode: "ECO3000",
        professor: "Dr. Ramírez",
        roomId: "room8",
        day: 5, // Sábado
        moduleId: "3",
        period: "2025-2",
    },
    {
        id: "9",
        courseCode: "PSI1000",
        professor: "Dra. Torres",
        roomId: "room1",
        day: 0, // Lunes
        moduleId: "5",
        period: "2025-2",
    },
    {
        id: "10",
        courseCode: "SOC2000",
        professor: "Dr. Díaz",
        roomId: "room2",
        day: 2, // Miércoles
        moduleId: "6",
        period: "2025-2",
    },
    ]

    // Datos iniciales de ejemplo para las salas
export const initialRooms: Room[] = [
    {
        id: "room1",
        name: "LAB.208-A",
        building: "A",
        capacity: 80,
        capacityGroup: "LAB.PCA",
    },
    {
        id: "room2",
        name: "AUDITORIO-001",
        building: "A",
        capacity: 400,
        capacityGroup: "AUDITORIO",
    },
    {
        id: "room3",
        name: "001-A",
        building: "A",
        capacity: 30,
        capacityGroup: "S",
    },
    {
        id: "room4",
        name: "002-A (Esp)",
        building: "A",
        capacity: 30,
        capacityGroup: "S",
    },
    {
        id: "room5",
        name: "311-A",
        building: "A",
        capacity: 30,
        capacityGroup: "S",
    },
    {
        id: "room6",
        name: "312-A",
        building: "A",
        capacity: 30,
        capacityGroup: "S",
    },
    {
        id: "room7",
        name: "201-A",
        building: "A",
        capacity: 40,
        capacityGroup: "MS",
    },
    {
        id: "room8",
        name: "211-A",
        building: "A",
        capacity: 40,
        capacityGroup: "MS",
    },
    {
        id: "room9",
        name: "301-A",
        building: "A",
        capacity: 43,
        capacityGroup: "MS",
    },
    {
        id: "room10",
        name: "108-A",
        building: "A",
        capacity: 47,
        capacityGroup: "MS",
    },
    {
        id: "room11",
        name: "210-A",
        building: "A",
        capacity: 50,
        capacityGroup: "M",
    },
    {
        id: "room12",
        name: "304-A",
        building: "A",
        capacity: 50,
        capacityGroup: "M",
    },
    {
        id: "room13",
        name: "307-A",
        building: "A",
        capacity: 65,
        capacityGroup: "L",
    },
    {
        id: "room14",
        name: "308-A",
        building: "A",
        capacity: 65,
        capacityGroup: "L",
    },
    {
        id: "room15",
        name: "102-A",
        building: "A",
        capacity: 70,
        capacityGroup: "L",
    },
    {
        id: "room16",
        name: "103-A",
        building: "A",
        capacity: 70,
        capacityGroup: "L",
    },
]

export const periods = ["2025-1", "2025-2", "2026-1", "2026-2"]

export const capacityGroups = [
    { value: "XS", label: "XS (< 30)" },
    { value: "S", label: "S (30-40)" },
    { value: "MS", label: "MS (40-50)" },
    { value: "M", label: "M (50-60)" },
    { value: "L", label: "L (> 60)" },
    { value: "LAB.PCA", label: "LAB.PCA" },
    { value: "AUDITORIO", label: "AUDITORIO" },
]

// Módulos por día
export const modulesByDay: Module[] = [
  // Lunes
    { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 0, order: 1 },
    { id: "2-a", name: "M2-A", startTime: "10:15", endTime: "11:00", dayId: 0, order: 2 },
    { id: "2-b", name: "M2-B", startTime: "11:00", endTime: "11:45", dayId: 0, order: 3 },
    { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 0, order: 4 },
    { id: "4", name: "M4", startTime: "14:30", endTime: "16:00", dayId: 0, order: 5 },
    { id: "5", name: "M5", startTime: "16:15", endTime: "17:45", dayId: 0, order: 6 },
    { id: "6", name: "M6", startTime: "18:00", endTime: "19:30", dayId: 0, order: 7 },

    // Martes
    { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 1, order: 1 },
    { id: "2", name: "M2", startTime: "10:15", endTime: "11:45", dayId: 1, order: 2 },
    { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 1, order: 3 },
    { id: "4", name: "M4", startTime: "14:30", endTime: "16:00", dayId: 1, order: 4 },
    { id: "5-a", name: "M5-A", startTime: "16:15", endTime: "17:00", dayId: 1, order: 5 },
    { id: "5-b", name: "M5-B", startTime: "17:00", endTime: "17:45", dayId: 1, order: 6 },

    // Miércoles
    { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 2, order: 1 },
    { id: "2", name: "M2", startTime: "10:15", endTime: "11:45", dayId: 2, order: 2 },
    { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 2, order: 3 },
    { id: "4", name: "M4", startTime: "14:30", endTime: "16:00", dayId: 2, order: 4 },
    { id: "5", name: "M5", startTime: "16:15", endTime: "17:45", dayId: 2, order: 5 },
    { id: "6", name: "M6", startTime: "18:00", endTime: "19:30", dayId: 2, order: 6 },

    // Jueves
    { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 3, order: 1 },
    { id: "2-a", name: "M2-A", startTime: "10:15", endTime: "11:00", dayId: 3, order: 2 },
    { id: "2-b", name: "M2-B", startTime: "11:00", endTime: "11:45", dayId: 3, order: 3 },
    { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 3, order: 4 },
    { id: "4", name: "M4", startTime: "14:30", endTime: "16:00", dayId: 3, order: 5 },

    // Viernes
    { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 4, order: 1 },
    { id: "2-a", name: "M2-A", startTime: "10:15", endTime: "11:00", dayId: 4, order: 2 },
    { id: "2-b", name: "M2-B", startTime: "11:00", endTime: "11:45", dayId: 4, order: 3 },
    { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 4, order: 4 },

  // Sábado
    { id: "1", name: "M1", startTime: "08:30", endTime: "10:00", dayId: 5, order: 1 },
    { id: "2", name: "M2", startTime: "10:15", endTime: "11:45", dayId: 5, order: 2 },
    { id: "3", name: "M3", startTime: "12:00", endTime: "13:30", dayId: 5, order: 3 },
]

export const days: Day[] = [
    { id: 0, name: "Lunes" },
    { id: 1, name: "Martes" },
    { id: 2, name: "Miércoles" },
    { id: 3, name: "Jueves" },
    { id: 4, name: "Viernes" },
    { id: 5, name: "Sábado" },
    { id: 6, name: "Domingo" },
]

// Función para obtener los módulos de un día específico
export function getModulesForDay(dayId: number): Module[] {
    return modulesByDay.filter((module) => module.dayId === dayId).sort((a, b) => a.order - b.order)
}
