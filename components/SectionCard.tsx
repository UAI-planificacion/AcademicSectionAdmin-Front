import { Section } from "@/lib/types"
import React from "react"

import { cn } from "@/lib/utils"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface SectionCardProps {
    section: Section | null
    dayId: number
    moduleId: string
    roomId: string
    isLastModule: boolean
    moduleIndex: number
    isHovered: boolean
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
}

export function SectionCard({
    section,
    dayId,
    moduleId,
    roomId,
    isLastModule,
    moduleIndex,
    isHovered,
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
    onMouseLeave
}: SectionCardProps): React.ReactElement {
    return (
        <td
            key={`${dayId}-${moduleId}`}
            className={cn(
                "border p-0.5 text-center min-w-[80px] h-[40px]",
                isLastModule && "border-r-zinc-400",
                !isLastModule && "border-r-zinc-200",
                moduleIndex % 2 === 0 && "bg-white",
                moduleIndex % 2 !== 0 && "bg-zinc-50",
                isHovered && "bg-zinc-100",
                isDragOver && !hasSection && "bg-green-100",
                isDragOver && hasSection && "bg-red-100",
            )}
            onMouseEnter={() => onMouseEnter(cellId)}
            onMouseLeave={onMouseLeave}
            onDragOver={(e) => onDragOver(e, roomId, dayId, moduleId)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, roomId, dayId, moduleId)}
        >
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

                        <TooltipContent>
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
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </td>
    )
}