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

interface SectionModalProps {
  section: Section
  rooms: Room[]
  onClose: () => void
  onUpdate: (section: Section) => boolean
  onDelete: (sectionId: string) => void
}

export function SectionModal({ section, rooms, onClose, onUpdate, onDelete }: SectionModalProps) {
  const [formData, setFormData] = useState<Section>({
    ...section,
  })
  const [selectedDay, setSelectedDay] = useState<number>(section.day)
  const dayModules = getModulesForDay(selectedDay)

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
    const success = onUpdate(formData)
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
        <DialogHeader>
          <DialogTitle>Detalles de la Sección</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode">Código del Curso</Label>
              <Input id="courseCode" name="courseCode" value={formData.courseCode} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="professor">Profesor</Label>
              <Input id="professor" name="professor" value={formData.professor} onChange={handleChange} required />
            </div>
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="roomId">Sala</Label>
            <Select value={formData.roomId} onValueChange={(value) => handleSelectChange("roomId", value)}>
              <SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
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
            <div className="space-y-2">
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

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
