"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateId } from "@/lib/utils"
import { Size, Space, Type } from "@/lib/types"

interface SpaceModalProps {
  isOpen: boolean
  onClose: () => void
  space: Space | null
  onAdd: (space: Space) => void
  onUpdate: (space: Space) => void
}

const typeOptions: Type[] = ["ROOM", "AUDITORIO", "DIS", "LAB", "LABPC", "GARAGE", "CORE", "COMMUNIC"]
const sizeOptions: Size[] = ["XS", "XE", "S", "SE", "MS", "M", "L", "XL", "XXL"]
const buildingOptions: string[] = ["A", "B", "C", "D", "E", "F", "Z"]

export function SpaceModal({ isOpen, onClose, space, onAdd, onUpdate }: SpaceModalProps) {
  const [formData, setFormData] = useState<Partial<Space>>({
    capacity: 0,
    type: "ROOM",
    sizeId: "M",
    building: "A",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (space) {
      setFormData({
        id: space.id,
        capacity: space.capacity,
        type: space.type,
        sizeId: space.sizeId,
        building: space.building,
        createdAt: space.createdAt,
        updatedAt: space.updatedAt,
      })
    } else {
      setFormData({
        capacity: 0,
        type: "ROOM",
        sizeId: "M",
        building: "A",
      })
    }
    setErrors({})
  }, [space, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.capacity || formData.capacity <= 0) {
      newErrors.capacity = "La capacidad debe ser mayor que 0"
    }

    if (!formData.type) {
      newErrors.type = "El tipo es requerido"
    }

    if (!formData.sizeId) {
      newErrors.sizeId = "El tamaño es requerido"
    }

    if (!formData.building) {
      newErrors.building = "El edificio es requerido"
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

    if (space) {
      // Actualizar espacio existente
      onUpdate({
        ...space,
        ...formData,
        capacity: formData.capacity,
        updatedAt: now.toISOString(),
      } as Space)
    } else {
      // Añadir nuevo espacio
      onAdd({
        id: generateId("SP"),
        capacity: formData.capacity,
        type: formData.type as Type,
        sizeId: formData.sizeId as Size,
        building: formData.building as string,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      } as Space)
    }

    onClose()
  }

  const handleChange = (field: keyof Space, value: any) => {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{space ? "Editar Espacio" : "Añadir Espacio"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {space && (
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input id="id" value={formData.id || ""} disabled />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity || ""}
                onChange={(e) => handleChange("capacity", Number.parseInt(e.target.value))}
              />
              {errors.capacity && <p className="text-sm text-destructive">{errors.capacity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="building">Edificio</Label>
              <Select value={formData.building} onValueChange={(value) => handleChange("building", value)}>
                <SelectTrigger id="building">
                  <SelectValue placeholder="Seleccionar edificio" />
                </SelectTrigger>
                <SelectContent>
                  {buildingOptions.map((building) => (
                    <SelectItem key={building} value={building}>
                      {building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.building && <p className="text-sm text-destructive">{errors.building}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sizeId">Tamaño</Label>
              <Select value={formData.sizeId} onValueChange={(value) => handleChange("sizeId", value)}>
                <SelectTrigger id="sizeId">
                  <SelectValue placeholder="Seleccionar tamaño" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.sizeId && <p className="text-sm text-destructive">{errors.sizeId}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{space ? "Actualizar" : "Añadir"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
