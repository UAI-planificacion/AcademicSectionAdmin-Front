"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Period, Status } from "@/lib/types"
import { generateId } from "@/lib/utils"

interface PeriodModalProps {
  isOpen: boolean
  onClose: () => void
  period: Period | null
  onAdd: (period: Period) => void
  onUpdate: (period: Period) => void
}

const statusOptions: Status[] = ["Open", "InProgress", "Closed"]

export function PeriodModal({ isOpen, onClose, period, onAdd, onUpdate }: PeriodModalProps) {
  const [formData, setFormData] = useState<Partial<Period>>({
    name: "",
    status: "Open",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (period) {
      setFormData({
        id: period.id,
        name: period.name,
        startDate: period.startDate,
        endDate: period.endDate,
        openingDate: period.openingDate,
        closingDate: period.closingDate,
        status: period.status,
        createdAt: period.createdAt,
        updatedAt: period.updatedAt,
      })
    } else {
      setFormData({
        name: "",
        status: "Open",
      })
    }
    setErrors({})
  }, [period, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "El nombre es requerido"
    }

    if (!formData.status) {
      newErrors.status = "El estado es requerido"
    }

    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio"
    }

    if (
      formData.openingDate &&
      formData.closingDate &&
      new Date(formData.closingDate) < new Date(formData.openingDate)
    ) {
      newErrors.closingDate = "La fecha de cierre debe ser posterior a la fecha de apertura"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const now = new Date()

    if (period) {
      // Actualizar periodo existente
      onUpdate({
        ...period,
        ...formData,
        updatedAt: now,
      } as Period)
    } else {
      // Añadir nuevo periodo
      onAdd({
        id: generateId("PER"),
        name: formData.name || "",
        startDate: formData.startDate,
        endDate: formData.endDate,
        openingDate: formData.openingDate,
        closingDate: formData.closingDate,
        status: formData.status as Status,
        createdAt: now,
        updatedAt: now,
      } as Period)
    }

    onClose()
  }

  const handleChange = (field: keyof Period, value: any) => {
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

  const formatDateForInput = (date?: Date): string => {
    if (!date) return ""
    return new Date(date).toISOString().split("T")[0]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{period ? "Editar Periodo" : "Añadir Periodo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {period && (
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input id="id" value={formData.id || ""} disabled />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "Open" ? "Abierto" : status === "InProgress" ? "En Progreso" : "Cerrado"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de Inicio (Opcional)</Label>
              <Input
                id="startDate"
                type="date"
                // value={formatDateForInput(formData.startDate)}
                value={formData.startDate ? formatDateForInput(formData.startDate) : ""}
                onChange={(e) => handleChange("startDate", e.target.value ? new Date(e.target.value) : undefined)}
              />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de Fin (Opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate ? formatDateForInput(formData.endDate) : ""}
                onChange={(e) => handleChange("endDate", e.target.value ? new Date(e.target.value) : undefined)}
              />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingDate">Fecha de Apertura (Opcional)</Label>
              <Input
                id="openingDate"
                type="date"
                value={formData.openingDate ? formatDateForInput(formData.openingDate) : ""}
                onChange={(e) => handleChange("openingDate", e.target.value ? new Date(e.target.value) : undefined)}
              />
              {errors.openingDate && <p className="text-sm text-destructive">{errors.openingDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingDate">Fecha de Cierre (Opcional)</Label>
              <Input
                id="closingDate"
                type="date"
                value={formData.closingDate ? formatDateForInput(formData.closingDate) : ""}
                onChange={(e) => handleChange("closingDate", e.target.value ? new Date(e.target.value) : undefined)}
              />
              {errors.closingDate && <p className="text-sm text-destructive">{errors.closingDate}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{period ? "Actualizar" : "Añadir"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
