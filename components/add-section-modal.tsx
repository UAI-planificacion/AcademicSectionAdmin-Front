"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Section, Room } from "@/lib/types"
import { periods, days, getModulesForDay } from "@/lib/data"

interface AddSectionModalProps {
    rooms: Room[]
    onClose: () => void
    onAdd: (section: Section) => boolean
}

export function AddSectionModal({ rooms, onClose, onAdd }: AddSectionModalProps) {
    const [selectedDay, setSelectedDay] = useState<number>(0)
    const dayModules = getModulesForDay(selectedDay)

    const [formData, setFormData] = useState<Omit<Section, "id">>({
        code                    : 1,
        session                 : "",
        size                    : "",
        correctedRegistrants    : 0,
        realRegistrants         : 0,
        plannedBuilding         : "",
        chairsAvailable         : 0,
        professor               : "",
        room                    : "",
        day                     : selectedDay,
        moduleId                : dayModules.length > 0 ? dayModules[0].id : "",
        subjectName             : "",
        subjectId               : "",
        period                  : periods[0],
    })

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

        if (!formData.room) {
            alert("Por favor selecciona una sala")
            return
        }

        const success = onAdd(formData as Section)

        if (success) {
            onClose()
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar Nueva Sección</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="period">Periodo</Label>

                        <Select value={formData.period} onValueChange={(value) => handleSelectChange("period", value)}>
                            <SelectTrigger id="period">
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

                    {/* <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="courseCode">Código del Curso</Label>

                            <Input id="courseCode" name="courseCode" value={formData.courseCode} onChange={handleChange} required />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="professor">Profesor</Label>

                            <Input id="professor" name="professor" value={formData.professor} onChange={handleChange} required />
                        </div>
                    </div> */}

                    <div className="space-y-1">
                        <Label htmlFor="roomId">Sigla Asignatura</Label>

                        <Select value={formData.room} onValueChange={(value) => handleSelectChange("roomId", value)}>

                        <SelectTrigger id="roomId">
                            <SelectValue placeholder="Seleccionar sala" />
                        </SelectTrigger>

                        <SelectContent>
                            {rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                    {room.id} ({room.building}, {room.sizeId}, {room.capacity})
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="courseCode">Total inscritos</Label>

                        <Input
                            id="courseCode"
                            name="courseCode"
                            value={formData.realRegistrants.toString()}
                            onChange={handleChange}
                            required
                            type="number"
                        />
                    </div>
                    {/* <div className="space-y-1">
                        <Label htmlFor="roomId">Sala</Label>

                        <Select value={formData.roomId} onValueChange={(value) => handleSelectChange("roomId", value)}>

                        <SelectTrigger id="roomId">
                            <SelectValue placeholder="Seleccionar sala" />
                        </SelectTrigger>

                        <SelectContent>
                            {rooms.map((room) => (
                                <SelectItem key={room.id} value={room.id}>
                                    {room.name} ({room.building}, {room.capacityGroup}, {room.capacity})
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div> */}

                    {/* <div className="grid grid-cols-2 gap-4"> */}
                        {/* <div className="space-y-2">
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
                        </div> */}

                        {/* <div className="space-y-1">
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
                        </div> */}
                    {/* </div> */}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>

                        <Button type="submit">
                            Agregar Sección
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
