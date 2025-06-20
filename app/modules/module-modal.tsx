"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Module } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { useDays } from "@/hooks/use-days"

interface ModuleModalProps {
  isOpen: boolean
  onClose: () => void
  module: Module | null
  onAdd: (module: Module) => void
  onUpdate: (module: Module) => void
}

export function ModuleModal({ isOpen, onClose, module, onAdd, onUpdate }: ModuleModalProps) {

    const { days } = useDays()
  const [formData, setFormData] = useState<Partial<Module>>({
    code: "",
    isActive: true,
    name: "",
    difference: "",
    startHour: "",
    endHour: "",
    dayId: 1,
    order: 1,
    dayModuleId: 1,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (module) {
      setFormData({
        id: module.id,
        code: module.code,
        isActive: module.isActive,
        name: module.name,
        difference: module.difference,
        startHour: module.startHour,
        endHour: module.endHour,
        dayId: module.dayId,
        order: module.order,
        dayModuleId: module.dayModuleId,
      })
    } else {
      setFormData({
        code: "",
        isActive: true,
        name: "",
        difference: "",
        startHour: "",
        endHour: "",
        dayId: 1,
        order: 1,
        dayModuleId: 1,
      })
    }
    setErrors({})
  }, [module, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code || formData.code.trim() === "") {
      newErrors.code = "El código es requerido"
    }

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.startHour) {
      newErrors.startHour = "La hora de inicio es requerida"
    }

    if (!formData.endHour) {
      newErrors.endHour = "La hora de fin es requerida"
    }

    if (formData.startHour && formData.endHour && formData.startHour >= formData.endHour) {
      newErrors.endHour = "La hora de fin debe ser posterior a la hora de inicio"
    }

    if (!formData.dayId || formData.dayId < 1) {
      newErrors.dayId = "El día es requerido"
    }

    if (!formData.order || formData.order < 1) {
      newErrors.order = "El orden debe ser mayor que 0"
    }

    if (!formData.dayModuleId || formData.dayModuleId < 1) {
      newErrors.dayModuleId = "El ID del módulo del día debe ser mayor que 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (module) {
      // Actualizar módulo existente
      onUpdate({
        ...module,
        ...formData,
      } as Module)
    } else {
      // Añadir nuevo módulo
      onAdd({
        id: generateId("MOD"),
        code: formData.code || "",
        isActive: formData.isActive || false,
        name: formData.name || "",
        difference: formData.difference,
        startHour: formData.startHour || "",
        endHour: formData.endHour || "",
        dayId: formData.dayId || 1,
        order: formData.order || 1,
        dayModuleId: formData.dayModuleId || 1,
      } as Module)
    }

    onClose()
  }

  const handleChange = (field: keyof Module, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error cuando el usuario corrige el campo
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{module ? "Editar Módulo" : "Añadir Módulo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {module && (
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input id="id" value={formData.id || ""} disabled />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código</Label>
              <Input id="code" value={formData.code || ""} onChange={(e) => handleChange("code", e.target.value)} />
              {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difference">Diferencia (Opcional)</Label>
            <Input
              id="difference"
              value={formData.difference || ""}
              onChange={(e) => handleChange("difference", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startHour">Hora de Inicio</Label>
              <Input
                id="startHour"
                type="time"
                value={formData.startHour || ""}
                onChange={(e) => handleChange("startHour", e.target.value)}
              />
              {errors.startHour && <p className="text-sm text-destructive">{errors.startHour}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endHour">Hora de Fin</Label>
              <Input
                id="endHour"
                type="time"
                value={formData.endHour || ""}
                onChange={(e) => handleChange("endHour", e.target.value)}
              />
              {errors.endHour && <p className="text-sm text-destructive">{errors.endHour}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dayId">Día</Label>
              <Select
                value={formData.dayId?.toString()}
                onValueChange={(value) => handleChange("dayId", Number(value))}
              >
                <SelectTrigger id="dayId">
                  <SelectValue placeholder="Seleccionar día" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id.toString()}>
                      {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dayId && <p className="text-sm text-destructive">{errors.dayId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Orden</Label>
              <Input
                id="order"
                type="number"
                min="1"
                value={formData.order || ""}
                onChange={(e) => handleChange("order", Number.parseInt(e.target.value))}
              />
              {errors.order && <p className="text-sm text-destructive">{errors.order}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayModuleId">ID Módulo Día</Label>
              <Input
                id="dayModuleId"
                type="number"
                min="1"
                value={formData.dayModuleId || ""}
                onChange={(e) => handleChange("dayModuleId", Number.parseInt(e.target.value))}
              />
              {errors.dayModuleId && <p className="text-sm text-destructive">{errors.dayModuleId}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
            <Label htmlFor="isActive">Módulo activo</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{module ? "Actualizar" : "Añadir"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
