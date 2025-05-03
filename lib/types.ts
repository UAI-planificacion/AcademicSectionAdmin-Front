export interface Section {
  id: string
  courseCode: string
  professor: string
  roomId: string
  day: number // 0-6 (lunes a domingo)
  moduleId: string // Ahora es string para permitir módulos como "2-a", "2-b", etc.
  period: string
}

export interface Room {
  id: string
  name: string
  building: string
  capacity: number
  capacityGroup: "XS" | "S" | "MS" | "M" | "L" | "LAB.PCA" | "AUDITORIO"
}

export interface Module {
  id: string
  name: string
  startTime: string
  endTime: string
  dayId: number // A qué día pertenece este módulo
  order: number // Para ordenar los módulos dentro de un día
}

export interface Day {
  id: number
  name: string
}

export type SortField = "name" | "building" | "capacityGroup" | "capacity"
export type SortDirection = "asc" | "desc"

export interface Filters {
  periods: string[]
  building: string
  capacityGroup: string
}

export interface SortConfig {
  field: SortField
  direction: SortDirection
}
