"use client"

import React, { useState, useRef } from "react"
import { days, getModulesForDay } from "@/lib/data"
import type { Section, Room, SortConfig } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AlertCircle, ArrowDownAZ, ArrowUpAZ, X } from "lucide-react"
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
    
    // Referencias para sincronizar el scroll
    const fixedTableRef = useRef<HTMLDivElement>(null)
    const scrollableTableRef = useRef<HTMLDivElement>(null)
    
    // Función para sincronizar el scroll vertical
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (e.currentTarget === scrollableTableRef.current && fixedTableRef.current) {
            fixedTableRef.current.scrollTop = e.currentTarget.scrollTop;
        } else if (e.currentTarget === fixedTableRef.current && scrollableTableRef.current) {
            scrollableTableRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    }

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
    ) => {
        const isActive = sortConfig.field === field
        const direction = isActive ? sortConfig.direction : "asc"

        return (
        <th className={cn(
            "border p-2 bg-gray-100 sticky top-0",
            fixedColumnsConfig[field].widthClass,
            fixedColumnsConfig[field].leftClass,
            fixedColumnsConfig[field].zIndexClass
        )}>
            {/* Style fue removido y reemplazado por clases de Tailwind */}
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

    // Configuración de columnas fijas con Tailwind CSS
    const fixedColumnsConfig = {
        name:          { widthClass: "w-[250px]", leftClass: "left-0",       zIndexClass: "z-40" }, // Más alto
        building:      { widthClass: "w-[130px]", leftClass: "left-[120px]",  zIndexClass: "z-30" },
        capacityGroup: { widthClass: "w-[80px]", leftClass: "left-[210px]", zIndexClass: "z-20" },
        capacity:      { widthClass: "w-[140px]", leftClass: "left-[290px]", zIndexClass: "z-10" }, // Más bajo entre los fijos
    };

    return (
        <div className="border rounded-lg">
            {errorMessage && (
                <div className="absolute top-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex items-center z-20">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errorMessage}
                </div>
            )}

            <div className="flex">
                {/* Tabla para columnas fijas */}
                <div className="z-10 overflow-y-auto w-[42rem] max-h-[calc(100vh-200px)]" ref={fixedTableRef} onScroll={handleScroll}>
                    <table className="border-collapse">
                        <thead>
                            <tr className="bg-gray-100 h-20">
                                <th
                                    className={cn("px-2", fixedColumnsConfig.name.widthClass)}
                                    onClick={() => onSortChange("name", sortConfig.field === "name" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-left">Sala</span>

                                        {sortConfig.field === "name" ? (
                                            sortConfig.direction === "asc" ? (
                                                <ArrowUpAZ className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownAZ className="h-4 w-4" />
                                            )
                                        ) : (
                                            <ArrowUpAZ className="h-4 w-4 opacity-30" />
                                        )}
                                    </div>
                                </th>

                                <th
                                    className={cn("border-l px-2", fixedColumnsConfig.building.widthClass)}
                                    onClick={() => onSortChange("building", sortConfig.field === "building" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Edificio</span>

                                        {sortConfig.field === "building" ? (
                                            sortConfig.direction === "asc" ? (
                                                <ArrowUpAZ className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownAZ className="h-4 w-4" />
                                            )
                                        ) : (
                                            <ArrowUpAZ className="h-4 w-4 opacity-30" />
                                        )}
                                    </div>
                                </th>

                                <th
                                    className={cn("border-l px-2", fixedColumnsConfig.capacityGroup.widthClass)}
                                    onClick={() => onSortChange("capacityGroup", sortConfig.field === "capacityGroup" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Talla</span>

                                        {sortConfig.field === "capacityGroup" ? (
                                            sortConfig.direction === "asc" ? (
                                                <ArrowUpAZ className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownAZ className="h-4 w-4" />
                                            )
                                        ) : (
                                            <ArrowUpAZ className="h-4 w-4 opacity-30" />
                                        )}
                                    </div>
                                </th>

                                <th
                                    className={cn("border-x border-r-zinc-400 px-2", fixedColumnsConfig.capacity.widthClass)}
                                    onClick={() => onSortChange("capacity", sortConfig.field === "capacity" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>Capacidad</span>

                                        {sortConfig.field === "capacity" ? (
                                            sortConfig.direction === "asc" ? (
                                                <ArrowUpAZ className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownAZ className="h-4 w-4" />
                                            )
                                        ) : (
                                            <ArrowUpAZ className="h-4 w-4 opacity-30" />
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {rooms.map((room) => (
                                <tr key={`fixed-${room.id}`} className="border-b h-16">
                                    <td className={cn("border-x p-2 bg-white", fixedColumnsConfig.name.widthClass)}>
                                        {room.name}
                                    </td>
                                    <td className={cn("border-x p-2 bg-white", fixedColumnsConfig.building.widthClass)}>
                                        {room.building}
                                    </td>
                                    <td className={cn("border-x p-2 bg-white", fixedColumnsConfig.capacityGroup.widthClass)}>
                                        {room.capacityGroup}
                                    </td>
                                    <td className={cn("border-x border-r-zinc-400 p-2 bg-white relative", fixedColumnsConfig.capacity.widthClass)}>
                                        {room.capacity}
                                        <div className="absolute top-0 bottom-0 right-0 w-[6px] shadow-[2px_0px_4px_rgba(0,0,0,0.15)] pointer-events-none"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Tabla para contenido desplazable */}
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]" ref={scrollableTableRef} onScroll={handleScroll}>
                    <table className="border-collapse">
                        <thead className="sticky top-0 z-50 bg-white">
                            <tr className="bg-gray-100 h-12">
                                {days.slice( 0, 6 ).map(( day ) => {
                                    const dayModules = getModulesForDay( day.id );

                                    return (
                                        <th key={day.id} colSpan={dayModules.length} className="border-x border-b border-x-zinc-400 p-2 text-center">
                                            {day.name}
                                        </th>
                                    )
                                })}
                            </tr>

                            <tr className="bg-gray-50 h-8 sticky top-12 z-40">
                                {days.slice(0, 6).map(( day ) => {
                                    const dayModules = getModulesForDay( day.id );

                                    return dayModules.map(( module, moduleIndex ) => {
                                        return (
                                            <th key={`${day.id}-${module.id}`} className={cn(
                                                "border-x border-l-zinc-400 text-xs min-w-[80px]",
                                                moduleIndex === dayModules.length - 1 && "border-r-zinc-400",
                                                moduleIndex !== dayModules.length - 1 && "border-r-zinc-200"
                                            )}>
                                                {module.name}
                                            </th>
                                        );
                                    });
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {rooms.map((room) => (
                                <tr key={`scroll-${room.id}`} className="border-b h-16">
                                    {days.slice(0, 6).map(( day ) => {
                                        const dayModules = getModulesForDay( day.id )

                                        return dayModules.map((module, moduleIndex) => {
                                            const cellSections  = getSectionsForCell(room.id, day.id, module.id)
                                            const cellId        = `${room.id}-${day.id}-${module.id}`
                                            const isHovered     = hoveredCell === cellId
                                            const isDragOver    = dragOverCell === cellId
                                            const hasSection    = cellSections.length > 0
                                            const section       = hasSection ? cellSections[0] : null
                                            const isLastModule  = moduleIndex === dayModules.length - 1;
                                            let isClick = false;


                                            return (
                                                <td
                                                    key={`${day.id}-${module.id}`}
                                                    className={cn(
                                                        "border p-1 text-center min-w-[80px] h-[40px]",
                                                        isLastModule && "border-r-zinc-400",
                                                        !isLastModule && "border-r-zinc-200",
                                                        isHovered && "bg-gray-50",
                                                        isDragOver && !hasSection && "bg-green-100",
                                                        isDragOver && hasSection && "bg-red-100",
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
                                                                "bg-zinc-300 h-full p-1 rounded cursor-move text-xs truncate relative",
                                                                draggedSection === section.id && "opacity-50",
                                                            )}
                                                            onDoubleClick={() => onSectionClick(section.id)}
                                                            title="Doble clic para editar, arrastrar para mover"
                                                            onClick={() => {isClick = true;}}
                                                        >
                                                            {section.courseCode}

                                                            {/* <div className="absolute rounded-full -right-2 z-50 -top-2 bg-red-500 text-white p-0.5 rounded-br-md">
                                                                <X className="w-3 h-3"/>
                                                            </div> */}
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
        </div>
    )
}
