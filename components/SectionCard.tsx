"use client"

import React, { useState } from 'react';

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
    section: Section | null
    dayId: number
    moduleId: string
    roomId: string
    isLastModule: boolean
    moduleIndex: number
    isDragOver: boolean
    hasSection: boolean
    cellId: string
    draggedSection: string | null
    onSectionClick: (sectionId: string) => void
    onDragStart: (e: React.DragEvent, sectionId: string) => void
    onDragOver: (e: React.DragEvent, roomId: string, dayId: number, moduleId: string) => void
    onDragLeave: () => void
    onDrop: (e: React.DragEvent, roomId: string, dayId: number, moduleId: string) => void
    onMouseEnter: (cellId: string) => void
    onMouseLeave: () => void
    onSaveSectionFromCard?: (section: Section) => boolean
}

export function SectionCard({
    section,
    dayId,
    moduleId,
    roomId,
    isLastModule,
    moduleIndex,
    isDragOver,
    hasSection,
    cellId,
    draggedSection,
    onSectionClick,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onMouseEnter,
    onMouseLeave,
    onSaveSectionFromCard
}: SectionCardProps): React.ReactElement {
    const [isMoving, setIsMoving] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const handleCreateSection = () => {
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleSaveSection = (newSection: Section): boolean => {
        if (onSaveSectionFromCard) {
            return onSaveSectionFromCard(newSection);
        }
        return false;
    };

    const handleDeleteSection = () => {
        setShowCreateModal(false);
    };

    return (
        <td
            key={`${dayId}-${moduleId}`}
            className={cn(
                "border p-0.5 text-center min-w-[80px] h-[40px] transition-none hover:bg-zinc-200/80 dark:hover:bg-zinc-800/50 transition-colors group",
                isLastModule && "border-r-zinc-400 dark:border-r-zinc-600 transition-colors",
                !isLastModule && "border-r-zinc-200 dark:border-r-zinc-800 transition-colors",
                moduleIndex % 2 === 0 && "bg-white dark:bg-zinc-900 transition-colors",
                moduleIndex % 2 !== 0 && "bg-zinc-100 dark:bg-zinc-900/60 transition-colors",
                isDragOver && !hasSection && "bg-green-100 dark:bg-green-900 transition-colors",
                isDragOver && hasSection && "bg-red-100 dark:bg-red-900 transition-colors",
            )}
            onMouseEnter={() => onMouseEnter( cellId )}
            onMouseLeave={ onMouseLeave }
            onDragOver={(e) => {
                setIsMoving( true );
                onDragOver( e, roomId, dayId, moduleId );
            }}
            onDragLeave={onDragLeave}
            onDrop={(e) => {
                setIsMoving( false );
                onDrop( e, roomId, dayId, moduleId );
            }}
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
                        id          : "",
                        courseCode  : "",
                        professor   : "",
                        roomId      : roomId,
                        day         : dayId,
                        moduleId    : moduleId,
                        period      : "",
                    }}
                />
            )}

            {section && (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger>
                            <div
                                draggable
                                onDragStart={(e) => onDragStart(e, section.id)}
                                className={cn(
                                    "max-w-24 grid grid-rows-2 bg-black text-white h-full p-1 rounded cursor-move text-xs",
                                    draggedSection === section.id && "opacity-50",
                                )}
                                onDoubleClick={() => onSectionClick(section.id)}
                                title="Doble clic para editar, arrastrar para mover"
                            >
                                <span className="truncate">
                                    {section.courseCode}
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
                                    {section.courseCode}
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
    )
}