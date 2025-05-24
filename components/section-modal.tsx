"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Section, Room, Module } from "@/lib/types"
import { days, getModulesForDay } from "@/lib/data"
import {
    getRoomsFromStorage,
    getCourseCodesToStorage,
    getProfessorsFromStorage,
    getPeriodsFromStorage,
    getModulesFromStorage
} from "@/lib/localStorage";


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
    const [formData, setFormData] = useState<Section>({ ...section });
    const [selectedDay, setSelectedDay] = useState<number>( section.day );
    const [courseCodes, setCourseCodes] = useState<string[]>([]);
    const [professors, setProfessors] = useState<string[]>([]);
    const [periods, setPeriods] = useState<string[]>([]);
    const [allModules, setAllModules] = useState<Module[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[]>(rooms);
    const dayModules = getModulesForDay( selectedDay );
    
    // Cargar datos desde localStorage al montar el componente
    useEffect(() => {
        // Usar las funciones de localStorage para cargar los datos
        setAvailableRooms(getRoomsFromStorage());
        setCourseCodes(getCourseCodesToStorage());
        setProfessors(getProfessorsFromStorage());
        setPeriods(getPeriodsFromStorage());
        setAllModules(getModulesFromStorage());
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string | number) => {
        if (name === "day") {
            setSelectedDay(Number(value))
            // Reset moduleId when day changes to avoid invalid combinations
            const newDay = Number(value)
            const newDayModules = getModulesForDay(newDay)
            setFormData((prev) => ({
                ...prev,
                day: newDay,
                moduleId: newDayModules.length > 0 ? newDayModules[0].id : "",
            }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const success = onSave(formData)
        if (success) {
            onClose()
        }
    }

    const handleDelete = () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta sección?")) {
            onDelete(section.id)
            onClose()
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
                                <span className="font-bold">Código:</span> {formData.id}
                            </p>

                            <p className="text-sm">
                                <span className="font-bold">Sigla:</span> {formData.courseCode}
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
                                <Label htmlFor="courseCode">Sigla</Label>
                                <Select value={formData.courseCode} onValueChange={(value) => handleSelectChange("courseCode", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar sigla" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courseCodes.map((code) => (
                                            <SelectItem key={code} value={code}>
                                                {code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-1">
                                <Label htmlFor="period">Periodo</Label>
                                <Select value={formData.period} onValueChange={(value) => handleSelectChange("period", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar periodo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((period) => (
                                            <SelectItem key={period} value={period}>
                                                {period}
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

                            <Select value={formData.roomId} onValueChange={(value) => handleSelectChange("roomId", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar sala" />
                                </SelectTrigger>

                                <SelectContent>
                                    {availableRooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id}>
                                            {room.name} ({room.building}, {room.capacityGroup}, {room.capacity})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="period">Tipo</Label>

                            <Select value={formData.period} onValueChange={(value) => handleSelectChange("period", value)}>
                                <SelectTrigger id="period">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>

                                <SelectContent>
                                    {periods.map((period) => (
                                    <SelectItem key={period} value={period}>
                                        {period}
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
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* <div className="space-y-1">
                            <Label htmlFor="courseCode">Código del Curso</Label>

                            <Input id="courseCode" name="courseCode" value={formData.courseCode} onChange={handleChange} required />
                        </div> */}

                        <div className="space-y-1">
                            <Label htmlFor="professor">Profesor</Label>

                            {professors.length > 0 ? (
                                <Select value={formData.professor} onValueChange={(value) => handleSelectChange("professor", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar profesor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {professors.map((professor) => (
                                            <SelectItem key={professor} value={professor}>
                                                {professor}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input id="professor" name="professor" value={formData.professor} onChange={handleChange} required />
                            )}
                        </div>
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
