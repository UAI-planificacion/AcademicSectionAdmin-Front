"use client"

import type React   from "react";
import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
}                   from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { useDays }  from '@/hooks/use-days';

import {
    SECTION_BUILDING_PLANNED,
    SECTION_SESSION
}                               from "@/lib/section"
import type { Section, Room }   from "@/lib/types"

import { usePeriods }                   from "@/hooks/use-periods"
import { useSubjects }                  from "@/hooks/use-subjects";
import { useProfessors }                from "@/hooks/use-professors";
import { useModules, getModulesForDay } from '@/hooks/use-modules';


interface SectionModalProps {
    section : Section
    rooms   : Room[]
    onClose : () => void
    onSave  : (section: Section) => boolean
    onDelete: (sectionId: string) => void
    isCreating?: boolean
}


export function SectionModal({ 
    section,
    rooms,
    onClose,
    onSave,
    onDelete,
    isCreating = false
}: SectionModalProps ): React.JSX.Element {
    const [formData, setFormData]       = useState<Section>({ ...section });
    const [selectedDay, setSelectedDay] = useState<number>( section.day );
    const { periods }                   = usePeriods();
    const { days }                      = useDays();
    const { modules }                   = useModules();
    const { professors }                = useProfessors();
    const {subjects}                    = useSubjects();
    const dayModules                    = getModulesForDay( modules, selectedDay );
    const sizes                         = Array.from(new Set(rooms.map(room => room.sizeId )));
    const handleChange                  = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(( prev ) => ({ ...prev, [ name ]: value }))
    }
    const handleSelectChange = ( name: string, value: string | number ) => {
        if ( name === "day" ) {
            setSelectedDay( Number( value ));
            // Reset moduleId when day changes to avoid invalid combinations
            const newDay        = Number( value );
            const newDayModules = getModulesForDay( modules, newDay );
            setFormData(( prev ) => ({
                ...prev,
                day       : newDay,
                moduleId  : newDayModules.length > 0 ? newDayModules[0].id : "",
            }))
        } else {
            setFormData(( prev ) => ({ ...prev, [ name ]: value }))
        }
    }

    const handleSubmit = ( e: React.FormEvent ) => {
        e.preventDefault();
        // const success = onSave( formData );
        console.log('🚀 ~ file: section-modal.tsx:102 ~ formData:', formData)

        // if ( success ) onClose();
    }

    const handleDelete = () => {
        if ( window.confirm( "¿Estás seguro de que deseas eliminar esta sección?" )) {
            onDelete( section.id );
            onClose();
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="space-y-5">
                    <DialogTitle>{isCreating ? 'Crear Nueva Sección' : 'Detalles de la Sección'}</DialogTitle>
                    {!isCreating && (
                        <div className="grid grid-cols-3 gap-2">
                            <p className="text-sm">
                                <span className="font-bold">Código:</span> {formData.code}
                            </p>

                            <p className="text-sm">
                                <span className="font-bold">Asignatura:</span> {formData.subjectId} - {formData.subjectName}
                            </p>

                            <p className="text-sm">
                                <span className="font-bold">Periodo:</span> {formData.period}
                            </p>
                        </div>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isCreating && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="period">Número Sección</Label>

                                <Input
                                    type        = "number"
                                    value       = { formData.code }
                                    onChange    = { handleChange }
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="period">Periodo</Label>
                                <Select value={formData.period} onValueChange={(value) => handleSelectChange("period", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar periodo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((period) => (
                                            <SelectItem key={period.id} value={period.id}>
                                                {period.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label htmlFor="roomId">Sala</Label>

                            <Select value={formData.room} onValueChange={(value) => handleSelectChange("roomId", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar sala" />
                                </SelectTrigger>

                                <SelectContent>
                                    {rooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id}>
                                            {room.id} ({room.type}, {room.sizeId}, {room.capacity})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="roomId">Asignatura</Label>

                            <Select value={formData.subjectId} onValueChange={(value) => handleSelectChange("subjectId", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar asignatura" />
                                </SelectTrigger>

                                <SelectContent>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id}>
                                            {subject.id} - {subject.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="day">Día</Label>

                            <Select
                                value={formData.day.toString()}
                                onValueChange={(value) => handleSelectChange("day", Number.parseInt(value))}
                            >
                                <SelectTrigger id="day">
                                    <SelectValue placeholder="Seleccionar día" />
                                </SelectTrigger>

                                <SelectContent>
                                    {days.slice(0, 6).map((day) => (
                                        <SelectItem key={day.id} value={day.id.toString()}>
                                            {day.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="moduleId">Módulo</Label>

                            <Select value={formData.moduleId} onValueChange={(value) => handleSelectChange("moduleId", value)}>
                                <SelectTrigger id="moduleId">
                                    <SelectValue placeholder="Seleccionar módulo" />
                                </SelectTrigger>

                                <SelectContent>
                                    {dayModules.map((module) => (
                                        <SelectItem key={module.id} value={module.id}>
                                            {module.name} ({module.startTime} - {module.endTime})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="session">Sesión</Label>

                            <Select value={formData.session} onValueChange={(value) => handleSelectChange("session", value)}>
                                <SelectTrigger id="session">
                                    <SelectValue placeholder="Seleccionar sesión" />
                                </SelectTrigger>

                                <SelectContent>
                                    {SECTION_SESSION.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="period">Tamaño</Label>
                            <Select value={formData.size} onValueChange={(value) => handleSelectChange("size", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tamaño" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sizes.map((size, index) => (
                                        <SelectItem key={`${size}-${index}`} value={size}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="period">Registrados corregidos</Label>

                            <Input
                                type        = "number"
                                value       = { formData.correctedRegistrants }
                                onChange    = { handleChange }
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="period">Registrados reales</Label>

                            <Input
                                type        = "number"
                                value       = { formData.realRegistrants }
                                onChange    = { handleChange }
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="plannedBuilding">Edificios planeados</Label>

                            <Select value={formData.plannedBuilding} onValueChange={(value) => handleSelectChange("plannedBuilding", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar edificio(s) planeado(s)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECTION_BUILDING_PLANNED.map((building) => (
                                        <SelectItem key={building.value} value={building.value}>
                                            {building.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="chairsAvailable">Sillas disponibles</Label>

                            <Input
                                type        = "number"
                                value       = { formData.chairsAvailable?.toString() }
                                onChange    = { handleChange }
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                            <Label htmlFor="professor">Profesor</Label>

                            <Select
                                value={formData.professor}
                                onValueChange={(value) => handleSelectChange("professor", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar profesor" />
                                </SelectTrigger>

                                <SelectContent>
                                    {professors.map(( professor ) => (
                                        <SelectItem key={professor.id} value={professor.id}>
                                            {professor.id}-{professor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    <DialogFooter className="grid sm:flex sm:justify-between gap-2 w-full">
                        {!isCreating && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                className="w-full sm:w-auto"
                            >
                                Eliminar
                            </Button>
                        )}

                        <div className="grid sm:flex gap-2 sm:w-auto w-full">
                            <Button
                                type        = "button"
                                variant     = "outline"
                                onClick     = { onClose }
                                className   = "w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                className   = "w-full sm:w-auto"
                            >
                                Guardar
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
