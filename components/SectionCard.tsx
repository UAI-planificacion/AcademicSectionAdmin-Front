"use client"

import React, { useState, memo, useCallback } from 'react';

import { PlusCircle } from 'lucide-react';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
}                               from '@/components/ui/tooltip';
import { SectionModal }         from '@/components/section-modal';
import { Section }              from '@/lib/types';
import { cn }                   from '@/lib/utils';
import { getRoomsFromStorage }  from '@/lib/localStorage';

interface SectionCardProps {
    section                 : Section | null;
    dayId                   : number;
    moduleId                : string;
    roomId                  : string;
    isLastModule            : boolean;
    moduleIndex             : number;
    isDragOver              : boolean;
    hasSection              : boolean;
    draggedSection          : string | null;
    onSectionClick          : ( sectionId: string ) => void;
    onDragStart             : ( e: React.DragEvent, sectionId: string ) => void;
    onDragOver              : ( e: React.DragEvent, roomId: string, dayId: number, moduleId: string ) => void;
    onDragLeave             : () => void;
    onDrop                  : ( e: React.DragEvent, roomId: string, dayId: number, moduleId: string ) => void;
    onSaveSectionFromCard?  : ( section: Section ) => boolean;
}

export const SectionCard = memo(function SectionCard({
    section,
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
    onSaveSectionFromCard
}: SectionCardProps): React.ReactElement {
    const [isMoving, setIsMoving] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCreateSection = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleSaveSection = useCallback((newSection: Section): boolean => {
        if (onSaveSectionFromCard) {
            return onSaveSectionFromCard(newSection);
        }
        return false;
    }, [onSaveSectionFromCard]);

    const handleDeleteSection = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        setIsMoving(true);
        onDragOver(e, roomId, dayId, moduleId);
    }, [onDragOver, roomId, dayId, moduleId]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        setIsMoving(false);
        onDrop(e, roomId, dayId, moduleId);
    }, [onDrop, roomId, dayId, moduleId]);

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
                "border p-0.5 text-center min-w-[80px] h-[40px] transition-none hover:bg-zinc-200/80 dark:hover:bg-zinc-800/50 transition-colors group",
                isLastModule && "border-r-zinc-400 dark:border-r-zinc-600 transition-colors",
                !isLastModule && "border-r-zinc-200 dark:border-r-zinc-800 transition-colors",
                moduleIndex % 2 === 0 && "bg-white dark:bg-zinc-900 transition-colors",
                moduleIndex % 2 !== 0 && "bg-zinc-100 dark:bg-zinc-900/60 transition-colors",
                isDragOver && !hasSection && "bg-green-100 dark:bg-green-900 transition-colors",
                isDragOver && hasSection && "bg-red-100 dark:bg-red-900 transition-colors",
            )}
        >
            {!section && !isDragOver && (
                <button 
                    onClick={handleCreateSection}
                    className="w-full z-0 h-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                    title="Crear nueva sección"
                >
                    <PlusCircle className="w-4 h-4 text-gray-400" />
                </button>
            )}

            {showCreateModal && (
                <SectionModal
                    rooms       = { getRoomsFromStorage() }
                    onClose     = { handleCloseModal }
                    onSave      = { handleSaveSection }
                    onDelete    = { handleDeleteSection }
                    isCreating  = { true }
                    section     = {{
                        id                      : "",
                        code                    : 1,
                        session                 : "",
                        size                    : "",
                        correctedRegistrants    : 0,
                        realRegistrants         : 0,
                        plannedBuilding         : "",
                        chairsAvailable         : 0,
                        professor               : "",
                        room                    : roomId,
                        day                     : dayId,
                        moduleId                : moduleId,
                        subjectName             : "",
                        subjectId               : "",
                        period                  : "",
                    }}
                />
            )}

            {section && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div
                                draggable
                                onDragStart={handleDragStart}
                                className={cn(
                                    "max-w-24 grid grid-rows-2 bg-black text-white h-full p-1 rounded cursor-move text-xs",
                                    draggedSection === section.id && "opacity-50",
                                )}
                                onDoubleClick={handleSectionClick}
                                title="Doble clic para editar, arrastrar para mover"
                            >
                                <span className="truncate">
                                    {section.code}
                                </span>

                                <span className="truncate">
                                    {section.period}
                                </span>

                                <span className="text-xs truncate">
                                    {section.professor}
                                </span>
                            </div>
                        </TooltipTrigger>

                        {!isMoving && <TooltipContent>
                            <div className="grid">
                                <span className="truncate">
                                    {section.code}
                                </span>

                                <span className="truncate">
                                    {section.period}
                                </span>

                                <span className="text-xs truncate">
                                    {section.professor}
                                </span>
                            </div>
                        </TooltipContent>}
                    </Tooltip>
                </TooltipProvider>
            )}
        </td>
    );
}, ( prevProps, nextProps ) => {
    return (
        prevProps.section?.id       === nextProps.section?.id   &&
        prevProps.isDragOver        === nextProps.isDragOver    &&
        prevProps.hasSection        === nextProps.hasSection    &&
        prevProps.draggedSection    === nextProps.draggedSection
    );
});
