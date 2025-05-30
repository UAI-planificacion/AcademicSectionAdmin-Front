"use client"

import React, { useState, useRef } from "react"
import { days, getModulesForDay } from "@/lib/data"
import type { Section, Room, SortConfig } from "@/lib/types"
import { cn } from "@/lib/utils"
import { AlertCircle, ArrowDownAZ, ArrowUpAZ } from "lucide-react"
import { SectionCard } from "@/components/SectionCard"

interface ModuleGridProps {
    sections        : Section[]
    rooms           : Room[]
    onSectionClick  : ( sectionId: string ) => void
    onSectionMove   : ( sectionId: string, newRoomId: string, newDay: number, newModuleId: string ) => boolean
    onSortChange    : ( field: "name" | "building" | "capacityGroup" | "capacity", direction: "asc" | "desc" ) => void
    sortConfig      : SortConfig
}

export function ModuleGrid({
    sections,
    rooms,
    onSectionClick,
    onSectionMove,
    onSortChange,
    sortConfig,
}: ModuleGridProps ): React.JSX.Element{
    const [_, setHoveredCell]                   = useState<string | null>( null );
    const [draggedSection, setDraggedSection]   = useState<string | null>( null );
    const [dragOverCell, setDragOverCell]       = useState<string | null>( null );
    const [errorMessage, setErrorMessage]       = useState<string | null>( null );

    // Referencias para sincronizar el scroll
    const fixedTableRef         = useRef<HTMLDivElement>( null );
    const scrollableTableRef    = useRef<HTMLDivElement>( null );

    // Función para sincronizar el scroll vertical
    const handleScroll = ( e: React.UIEvent<HTMLDivElement> ) => {
        if ( e.currentTarget === scrollableTableRef.current && fixedTableRef.current ) {
            fixedTableRef.current.scrollTop = e.currentTarget.scrollTop;
        } else if ( e.currentTarget === fixedTableRef.current && scrollableTableRef.current ) {
            scrollableTableRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    }

    // Función para obtener las secciones para una sala, día y módulo específicos
    const getSectionsForCell = ( roomId: string, day: number, moduleId: string ) => 
        sections.filter(( section ) =>
            section.roomId === roomId && section.day === day && section.moduleId === moduleId
        );

    // Manejadores de eventos para drag and drop
    const handleDragStart = ( e: React.DragEvent, sectionId: string ) => {
        e.dataTransfer.setData( 'text/plain', sectionId );
        setDraggedSection( sectionId );
        // Establecer el efecto de arrastre
        e.dataTransfer.effectAllowed = 'move';
    }

    const handleDragOver = ( e: React.DragEvent, roomId: string, day: number, moduleId: string ) => {
        e.preventDefault();
        const cellId = `${roomId}-${day}-${moduleId}`;
        setDragOverCell( cellId );

        // Verificar si la celda destino ya está ocupada
        const cellSections = getSectionsForCell( roomId, day, moduleId );

        e.dataTransfer.dropEffect = cellSections.length > 0
            ? 'none'
            : 'move';
    }

    const handleDragLeave = () => {
        setDragOverCell( null )
    }

    const handleDrop = ( e: React.DragEvent, roomId: string, day: number, moduleId: string ) => {
        e.preventDefault();
        const sectionId = e.dataTransfer.getData( 'text/plain' );
        setDraggedSection( null );
        setDragOverCell( null );

        // Verificar si la celda destino ya está ocupada
        const cellSections = getSectionsForCell( roomId, day, moduleId );

        if ( cellSections.length > 0 ) {
            setErrorMessage( 'No se puede mover la sección porque el destino ya está ocupado' );
            setTimeout(() => setErrorMessage( null ), 3000 );
            return;
        }

        // Intentar mover la sección
        const success = onSectionMove( sectionId, roomId, day, moduleId );

        if ( !success ) {
            setErrorMessage( 'No se pudo mover la sección' );
            setTimeout(() => setErrorMessage( null ), 3000 );
        }
    }

    const fixedColumnsConfig = {
        name:          { widthClass: "w-[250px]",   leftClass: "left-0",       zIndexClass: "z-40" },
        building:      { widthClass: "w-[130px]",   leftClass: "left-[120px]", zIndexClass: "z-30" },
        capacityGroup: { widthClass: "w-[80px]",    leftClass: "left-[210px]", zIndexClass: "z-20" },
        capacity:      { widthClass: "w-[140px]",   leftClass: "left-[290px]", zIndexClass: "z-10" },
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
                <div className="z-10 overflow-y-auto w-[42rem] max-h-[calc(100vh-222px)] rounded-tl-lg relative hide-vertical-scrollbar" ref={fixedTableRef} onScroll={handleScroll}>
                    <div className="relative hide-vertical-scrollbar">
                        <table className="border-collapse w-full hide-vertical-scrollbar">
                            <thead className="sticky top-0 z-50 bg-black hide-vertical-scrollbar">
                                <tr className="h-20">
                                    <th
                                    className={cn("px-2 bg-black border-r border-zinc-700", fixedColumnsConfig.name.widthClass)}
                                    onClick={() => onSortChange("name", sortConfig.field === "name" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-left text-white">Sala</span>

                                        {sortConfig.field === "name"
                                            ? sortConfig.direction === "asc"
                                                ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                : <ArrowDownAZ className="h-4 w-4 text-white" />
                                            : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                        }
                                    </div>
                                </th>

                                <th
                                    className={cn("border-l px-2 bg-black border-r border-zinc-700", fixedColumnsConfig.building.widthClass)}
                                    onClick={() => onSortChange("building", sortConfig.field === "building" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white">Edificio</span>

                                        {sortConfig.field === "building"
                                            ? sortConfig.direction === "asc"
                                                ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                : <ArrowDownAZ className="h-4 w-4 text-white" />
                                            : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                        }
                                    </div>
                                </th>

                                <th
                                    className={cn("border-l px-2 bg-black border-r border-zinc-700", fixedColumnsConfig.capacityGroup.widthClass)}
                                    onClick={() => onSortChange("capacityGroup", sortConfig.field === "capacityGroup" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white">Talla</span>

                                        {sortConfig.field === "capacityGroup"
                                            ? sortConfig.direction === "asc"
                                                ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                : <ArrowDownAZ className="h-4 w-4 text-white" />
                                            : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                        }
                                    </div>
                                </th>

                                <th
                                    className={cn("border-r border-r-zinc-700 px-2 bg-black", fixedColumnsConfig.capacity.widthClass)}
                                    onClick={() => onSortChange("capacity", sortConfig.field === "capacity" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white">Capacidad</span>

                                        {sortConfig.field === "capacity"
                                            ? sortConfig.direction === "asc"
                                                ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                : <ArrowDownAZ className="h-4 w-4 text-white" />
                                            : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                        }
                                    </div>
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                                {rooms.map((room) => (
                                    <tr key={`fixed-${room.id}`} className="border-b h-16">
                                        {/* Sala */}
                                        <td className={cn("border-x p-2 bg-white dark:bg-zinc-900 transition-colors", fixedColumnsConfig.name.widthClass)}>
                                            {room.name}
                                        </td>

                                        {/* Edificio */}
                                        <td className={cn("border-x p-2 bg-white dark:bg-zinc-900 transition-colors", fixedColumnsConfig.building.widthClass)}>
                                            {room.building}
                                        </td>

                                        {/* Talla */}
                                        <td className={cn("border-x p-2 bg-white dark:bg-zinc-900 transition-colors", fixedColumnsConfig.capacityGroup.widthClass)}>
                                            {room.capacityGroup}
                                        </td>

                                        {/* Capacidad */}
                                        <td className={cn("border-x border-r-zinc-400 dark:border-r-zinc-600 p-2 bg-white dark:bg-zinc-900 transition-colors relative", fixedColumnsConfig.capacity.widthClass)}>
                                            {room.capacity}
                                            <div className="absolute top-0 bottom-0 right-0 w-[6px] shadow-[2px_0px_4px_rgba(0,0,0,0.15)] pointer-events-none"></div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabla para contenido desplazable */}
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]" ref={scrollableTableRef} onScroll={handleScroll}>
                    <table className="border-collapse">
                        <thead className="sticky top-0 z-50 bg-black">
                            <tr className="bg-black text-white h-12">
                                {days.slice( 0, 6 ).map(( day ) => {
                                    const dayModules = getModulesForDay( day.id );

                                    return (
                                        <th key={day.id} colSpan={dayModules.length} className="border-x border-b border-zinc-700 p-2 text-center">
                                            {day.name}
                                        </th>
                                    )
                                })}
                            </tr>

                            <tr className="bg-zinc-800 text-white h-8 sticky top-12 z-40">
                                {days.slice(0, 6).map(( day ) => {
                                    const dayModules = getModulesForDay( day.id );

                                    return dayModules.map(( module, moduleIndex ) => {
                                        return (
                                            <th key={`${day.id}-${module.id}`} className={cn(
                                                "border-x border-l-zinc-700 text-xs min-w-[80px]",
                                                moduleIndex === dayModules.length - 1 && "border-r-zinc-900",
                                                moduleIndex !== dayModules.length - 1 && "border-r-zinc-700"
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
                                            const cellSections  = getSectionsForCell(room.id, day.id, module.id);
                                            const cellId        = `${room.id}-${day.id}-${module.id}`;
                                            const isDragOver    = dragOverCell === cellId;
                                            const hasSection    = cellSections.length > 0;
                                            const section       = hasSection ? cellSections[0] : null;
                                            const isLastModule  = moduleIndex === dayModules.length - 1;

                                            return (
                                                <SectionCard
                                                    key             = { `${day.id}-${module.id}` }
                                                    section         = { section }
                                                    dayId           = { day.id }
                                                    moduleId        = { module.id }
                                                    roomId          = { room.id }
                                                    isLastModule    = { isLastModule }
                                                    moduleIndex     = { moduleIndex }
                                                    isDragOver      = { isDragOver }
                                                    hasSection      = { hasSection }
                                                    cellId          = { cellId }
                                                    draggedSection  = { draggedSection }
                                                    onSectionClick  = { onSectionClick }
                                                    onDragStart     = { handleDragStart }
                                                    onDragOver      = { handleDragOver }
                                                    onDragLeave     = { handleDragLeave }
                                                    onDrop          = { handleDrop }
                                                    onMouseEnter    = { setHoveredCell }
                                                    onMouseLeave    = { () => setHoveredCell(null) }
                                                />
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
