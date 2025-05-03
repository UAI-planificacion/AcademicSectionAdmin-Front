"use client"

import type React from "react"

import { useState } from "react"
import { days, getModulesForDay } from "@/lib/data"
import type { Section, Room, SortConfig } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AlertCircle, ArrowDownAZ, ArrowUpAZ } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModuleGridProps {
  sections: Section[]
  rooms: Room[]
  onSectionClick: (sectionId: string) => void
  onSectionMove: (sectionId: string, newRoomId: string, newDay: number, newModuleId: string) => boolean
  onSortChange: (field: "name" | "building" | "capacityGroup" | "capacity", direction: "asc" | "desc") => void
  sortConfig: SortConfig
}

export function ModuleGrid({
  sections,
  rooms,
  onSectionClick,
  onSectionMove,
  onSortChange,
  sortConfig,
}: ModuleGridProps) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [dragOverCell, setDragOverCell] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Función para obtener las secciones para una sala, día y módulo específicos
  const getSectionsForCell = (roomId: string, day: number, moduleId: string) => {
    return sections.filter(
      (section) => section.roomId === roomId && section.day === day && section.moduleId === moduleId,
    )
  }

  // Manejadores de eventos para drag and drop
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    e.dataTransfer.setData("text/plain", sectionId)
    setDraggedSection(sectionId)
    // Establecer el efecto de arrastre
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, roomId: string, day: number, moduleId: string) => {
    e.preventDefault()
    const cellId = `${roomId}-${day}-${moduleId}`
    setDragOverCell(cellId)

    // Verificar si la celda destino ya está ocupada
    const cellSections = getSectionsForCell(roomId, day, moduleId)
    if (cellSections.length > 0) {
      e.dataTransfer.dropEffect = "none" // Indicar que no se puede soltar aquí
    } else {
      e.dataTransfer.dropEffect = "move" // Indicar que se puede soltar aquí
    }
  }

  const handleDragLeave = () => {
    setDragOverCell(null)
  }

  const handleDrop = (e: React.DragEvent, roomId: string, day: number, moduleId: string) => {
    e.preventDefault()
    const sectionId = e.dataTransfer.getData("text/plain")
    setDraggedSection(null)
    setDragOverCell(null)

    // Verificar si la celda destino ya está ocupada
    const cellSections = getSectionsForCell(roomId, day, moduleId)
    if (cellSections.length > 0) {
      setErrorMessage("No se puede mover la sección porque el destino ya está ocupado")
      setTimeout(() => setErrorMessage(null), 3000)
      return
    }

    // Intentar mover la sección
    const success = onSectionMove(sectionId, roomId, day, moduleId)
    if (!success) {
      setErrorMessage("No se pudo mover la sección")
      setTimeout(() => setErrorMessage(null), 3000)
    }
  }

  // Función para renderizar el encabezado de columna ordenable
  const renderSortableHeader = (
    field: "name" | "building" | "capacityGroup" | "capacity",
    label: string,
    leftPosition: string,
    width: number,
  ) => {
    const isActive = sortConfig.field === field
    const direction = isActive ? sortConfig.direction : "asc"

    return (
      <th className="border p-2 bg-gray-100 sticky z-10" style={{ left: leftPosition, width: `${width}px` }}>
        <div className="flex items-center justify-between">
          <span>{label}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onSortChange(field, direction === "asc" ? "desc" : "asc")}
          >
            {isActive ? (
              direction === "asc" ? (
                <ArrowUpAZ className="h-4 w-4" />
              ) : (
                <ArrowDownAZ className="h-4 w-4" />
              )
            ) : (
              <ArrowUpAZ className="h-4 w-4 opacity-30" />
            )}
          </Button>
        </div>
      </th>
    )
  }

  // Definir anchos y posiciones para las columnas fijas
  const columnWidths = {
    name: 120,
    building: 80,
    capacityGroup: 80,
    capacity: 90,
  }

  // Calcular posiciones left para cada columna
  const leftPositions = {
    name: "0px",
    building: `${columnWidths.name}px`,
    capacityGroup: `${columnWidths.name + columnWidths.building}px`,
    capacity: `${columnWidths.name + columnWidths.building + columnWidths.capacityGroup}px`,
  }

  return (
    <div className="border rounded-lg overflow-auto relative">
      {errorMessage && (
        <div className="absolute top-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex items-center z-20">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errorMessage}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {renderSortableHeader("name", "Sala", leftPositions.name, columnWidths.name)}
              {renderSortableHeader("building", "Edificio", leftPositions.building, columnWidths.building)}
              {renderSortableHeader("capacityGroup", "Talla", leftPositions.capacityGroup, columnWidths.capacityGroup)}
              {renderSortableHeader("capacity", "Capacidad", leftPositions.capacity, columnWidths.capacity)}
              {days.slice(0, 6).map((day) => {
                const dayModules = getModulesForDay(day.id)
                return (
                  <th key={day.id} colSpan={dayModules.length} className="border p-2 text-center">
                    {day.name}
                  </th>
                )
              })}
            </tr>
            <tr className="bg-gray-50">
              <th
                className="border p-2 sticky bg-gray-50 z-10"
                style={{ left: leftPositions.name, width: `${columnWidths.name}px` }}
              ></th>
              <th
                className="border p-2 sticky bg-gray-50 z-10"
                style={{ left: leftPositions.building, width: `${columnWidths.building}px` }}
              ></th>
              <th
                className="border p-2 sticky bg-gray-50 z-10"
                style={{ left: leftPositions.capacityGroup, width: `${columnWidths.capacityGroup}px` }}
              ></th>
              <th
                className="border p-2 sticky bg-gray-50 z-10"
                style={{ left: leftPositions.capacity, width: `${columnWidths.capacity}px` }}
              ></th>
              {days.slice(0, 6).map((day) => {
                const dayModules = getModulesForDay(day.id)
                return dayModules.map((module) => (
                  <th key={`${day.id}-${module.id}`} className="border p-1 text-xs min-w-[80px]">
                    {module.name}
                  </th>
                ))
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td
                  className="border p-2 sticky bg-white z-10"
                  style={{ left: leftPositions.name, width: `${columnWidths.name}px` }}
                >
                  {room.name}
                </td>
                <td
                  className="border p-2 sticky bg-white z-10"
                  style={{ left: leftPositions.building, width: `${columnWidths.building}px` }}
                >
                  {room.building}
                </td>
                <td
                  className="border p-2 sticky bg-white z-10"
                  style={{ left: leftPositions.capacityGroup, width: `${columnWidths.capacityGroup}px` }}
                >
                  {room.capacityGroup}
                </td>
                <td
                  className="border p-2 sticky bg-white z-10"
                  style={{ left: leftPositions.capacity, width: `${columnWidths.capacity}px` }}
                >
                  {room.capacity}
                </td>
                {days.slice(0, 6).map((day) => {
                  const dayModules = getModulesForDay(day.id)
                  return dayModules.map((module) => {
                    const cellSections = getSectionsForCell(room.id, day.id, module.id)
                    const cellId = `${room.id}-${day.id}-${module.id}`
                    const isHovered = hoveredCell === cellId
                    const isDragOver = dragOverCell === cellId
                    const hasSection = cellSections.length > 0
                    const section = hasSection ? cellSections[0] : null

                    return (
                      <td
                        key={`${day.id}-${module.id}`}
                        className={cn(
                          "border p-1 text-center min-w-[80px] h-[40px]",
                          isHovered && "bg-gray-50",
                          isDragOver && !hasSection && "bg-green-50",
                          isDragOver && hasSection && "bg-red-50",
                        )}
                        onMouseEnter={() => setHoveredCell(cellId)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onDragOver={(e) => handleDragOver(e, room.id, day.id, module.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, room.id, day.id, module.id)}
                      >
                        {section && (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, section.id)}
                            className={cn(
                              "bg-blue-100 p-1 rounded cursor-move text-xs",
                              draggedSection === section.id && "opacity-50",
                            )}
                            onDoubleClick={() => onSectionClick(section.id)}
                            title="Doble clic para editar, arrastrar para mover"
                          >
                            {section.courseCode}
                          </div>
                        )}
                      </td>
                    )
                  })
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
