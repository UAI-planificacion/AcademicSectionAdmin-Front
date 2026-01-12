"use client"

import React, { useState, memo, useCallback, useMemo } from 'react';

import { PlusCircle } from 'lucide-react';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn, sessionColors }    from '@/lib/utils';
import { SectionSession }       from '@/models/section.model';
import { useModules }           from '@/hooks/use-modules';


const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];


interface Props {
    section             : SectionSession | null;
    dayModuleId         : number;
    dayId               : number;
    moduleId            : string;
    roomId              : string;
    isLastModule        : boolean;
    moduleIndex         : number;
    isDragOver          : boolean;
    hasSection          : boolean;
    draggedSection      : string | null;
    onSectionClick      : ( sectionId: string ) => void;
    onDragStart         : ( e: React.DragEvent, sectionId: string ) => void;
    onDragOver          : ( e: React.DragEvent, roomId: string, dayModuleId: number ) => void;
    onDragLeave         : () => void;
    onDrop              : ( e: React.DragEvent, roomId: string, dayModuleId: number ) => void;
    onCreateSession?    : ( dayId: number, moduleId: string, spaceId: string ) => void;
}


export const SectionCard = memo( function SectionCard({
    section,
    dayModuleId,
    dayId,
    moduleId,
    roomId,
    isLastModule,
    moduleIndex,
    isDragOver,
    hasSection,
    draggedSection,
    onSectionClick,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onCreateSession,
}: Props): React.ReactElement {
    const [isMoving, setIsMoving] = useState<boolean>( false );

    const { modules } = useModules();

    const moduleHours = useMemo(() => {
        const hours = modules.find( module => module.id.split( '-' )[0] === moduleId.split( '-' )[0] );

        if ( !hours ) return '';

        return `${ hours.startHour } - ${ hours.endHour }`;
    }, [modules, moduleId]);


    const handleCreateSection = useCallback(() => {
        if ( onCreateSession ) {
            onCreateSession( dayId, moduleId, roomId );
        }
    }, [onCreateSession, dayId, moduleId, roomId]);

    // const handleCloseModal = useCallback(() => {
    //     setShowCreateModal( false );
    // }, []);

    // const handleSaveSection = useCallback(( newSection: Section ): boolean => {
    //     if ( onSaveSectionFromCard ) {
    //         return onSaveSectionFromCard( newSection );
    //     }
    //     return false;
    // }, [ onSaveSectionFromCard ] );

    // const handleDeleteSection = useCallback(() => {
    //     setShowCreateModal(false);
    // }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        setIsMoving( true );
        onDragOver(e, roomId, dayModuleId);
    }, [onDragOver, roomId, dayModuleId]);


    const handleDrop = useCallback((e: React.DragEvent) => {
        setIsMoving(false);
        onDrop(e, roomId, dayModuleId);
    }, [onDrop, roomId, dayModuleId]);


    const handleSectionClick = useCallback(() => {
        if (section) {
            onSectionClick(section.id);
        }
    }, [section, onSectionClick]);


    const handleDragStart = useCallback((e: React.DragEvent) => {
        if (section) {
            onDragStart(e, section.id);
        }
    }, [section, onDragStart]);


    return (
        <td
            onDragOver  = { handleDragOver }
            onDragLeave = { onDragLeave }
            onDrop      = { handleDrop }
            className   = { cn(
                "border p-0.5 text-center min-w-[80px] h-[40px] transition-none hover:bg-zinc-200/80 dark:hover:bg-zinc-800/50 transition-colors group relative",
                isLastModule && "border-r-zinc-400 dark:border-r-zinc-600 transition-colors",
                !isLastModule && "border-r-zinc-200 dark:border-r-zinc-800 transition-colors",
                moduleIndex % 2 === 0 && "bg-white dark:bg-zinc-900 transition-colors",
                moduleIndex % 2 !== 0 && "bg-zinc-100 dark:bg-zinc-900/60 transition-colors",
                isDragOver && !hasSection && "bg-green-100 dark:bg-green-900 transition-colors",
                isDragOver && hasSection && "bg-red-100 dark:bg-red-900 transition-colors",
            )}
        >
            { !section && !isDragOver && (
                <button 
                    onClick={handleCreateSection}
                    className="w-full z-0 h-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Crear nueva sección"
                >
                    <PlusCircle className="w-4 h-4 text-gray-400" />
                </button>
            )}

            {/* SessionForm has been moved to module-grid.tsx to prevent multiple instances */}


            {/* Placeholder text - only visible when cell is empty */}
            {!section && (
                <span className="absolute inset-0 flex items-center justify-center text-[14px] text-gray-600 dark:text-gray-400 opacity-30 pointer-events-none select-none">
                    { moduleHours }
                </span>
            )}

            {section && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div
                                draggable       
                                onDragStart     = { handleDragStart }
                                onDoubleClick   = { handleSectionClick }
                                title           = "Doble clic para editar, arrastrar para mover"
                                className       = { cn(
                                    "max-w-24 grid grid-rows-2 h-full p-1 rounded cursor-move text-xs text-white",
                                    draggedSection === section.id && "opacity-50",
                                    sessionColors[section.session.name]
                                )}
                            >
                                <span className="truncate">
                                    { section.subject.id }-{ section.code }
                                </span>

                                <span className="truncate">
                                    { section.period.name }
                                </span>

                                <span className="text-xs truncate">
                                    { section.session?.professor?.name || 'Sin profesor' }
                                </span>
                            </div>
                        </TooltipTrigger>

                        { !isMoving && <TooltipContent>
                            <div className="grid">
                                {/* <span className="truncate">
                                    ID: { section.id }
                                </span> */}

                                <span className="truncate">
                                    SSEC: { section.subject.id }-{ section.code }
                                </span>

                                <span className="truncate">
                                    Periodo: { section.period.name }
                                </span>

                                <span className="truncate">
                                    Espacio: { section.session.spaceId }
                                </span>

                                <span className="truncate">
                                    Fecha: { section.session.date.toString().split('T')[0] }
                                </span>

                                <span className="truncate">
                                    Día: { dayNames[ section.session.dayId - 1 ]}
                                </span>

                                <span className="truncate">
                                    Módulo: { section.session.module.name }
                                </span>

                                {/* <span className="truncate">
                                    Tamaño: { section.size }
                                </span> */}

                                <span className="truncate">
                                    Sesión: { section.session.name }
                                </span>

                                <span className="truncate">
                                    Idioma: { section.session.isEnglish ? 'Inglés' : 'Español' }
                                </span>

                                <span className="truncate">
                                    Registrados: { section.quota }
                                </span>

                                <span className="truncate">
                                    Corregidos: { section.registered }
                                </span>

                                <span className="truncate">
                                    Asientos disponibles: { section.session.chairsAvailable }
                                </span>

                                <span className="truncate">
                                    Profesor: {
                                        section.session.professor?.name !== 'Sin profesor'
                                        ? section.session.professor?.id + '-' + section.session.professor?.name
                                        : 'Sin profesor'
                                    }
                                </span>
                            </div>
                        </TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            )}
        </td>
    );
}, ( prevProps, nextProps ) => {
    // Comparar propiedades básicas
    if (
        prevProps.isDragOver        !== nextProps.isDragOver
        || prevProps.hasSection     !== nextProps.hasSection
        || prevProps.draggedSection !== nextProps.draggedSection
    ) {
        return false;
    }

    // Comparar secciones
    const prevSection = prevProps.section;
    const nextSection = nextProps.section;

    // Si una es null y la otra no, son diferentes
    if ( !prevSection && nextSection )  return false;
    if ( prevSection && !nextSection )  return false;
    if ( !prevSection && !nextSection ) return true;

    // En este punto, ambas secciones existen (no son null)
    // Comparar propiedades importantes de la sección
    return (
        prevSection!.id                         === nextSection!.id
        && prevSection!.code                    === nextSection!.code
        && prevSection!.subject.id              === nextSection!.subject.id
        && prevSection!.subject.name            === nextSection!.subject.name
        && prevSection!.period.name             === nextSection!.period.name
        && prevSection!.session.professor?.name === nextSection!.session.professor?.name
        && prevSection!.session.professor?.id   === nextSection!.session.professor?.id
        && prevSection!.session.spaceId         === nextSection!.session.spaceId
        && prevSection!.session.dayId           === nextSection!.session.dayId
        && prevSection!.session.module.id       === nextSection!.session.module.id
        && prevSection!.session.name            === nextSection!.session.name
        && prevSection!.session.chairsAvailable === nextSection!.session.chairsAvailable
    );
});
