"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Professor } from "@/lib/types"
import { generateId } from "@/lib/utils"

interface ProfessorModalProps {
  isOpen: boolean
  onClose: () => void
  professor: Professor | null
  onAdd: (professor: Professor) => void
  onUpdate: (professor: Professor) => void
}

export function ProfessorModal({ isOpen, onClose, professor, onAdd, onUpdate }: ProfessorModalProps) {
  const [formData, setFormData] = useState<Partial<Professor>>({
    name: "",
    email: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (professor) {
      setFormData({
        id: professor.id,
        name: professor.name,
        email: professor.email,
        createdAt: professor.createdAt,
        updatedAt: professor.updatedAt,
      })
    } else {
      setFormData({
        name: "",
        email: "",
      })
    }
    setErrors({})
  }, [professor, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "El nombre es requerido"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido"
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

    if (professor) {
      // Actualizar profesor existente
      onUpdate({
        ...professor,
        ...formData,
        updatedAt: now,
      } as Professor)
    } else {
      // Añadir nuevo profesor
      onAdd({
        id: generateId("PROF"),
        name: formData.name || "",
        email: formData.email,
        createdAt: now,
        updatedAt: now,
      } as Professor)
    }

    onClose()
  }

  const handleChange = (field: keyof Professor, value: any) => {
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
          <DialogTitle>{professor ? "Editar Profesor" : "Añadir Profesor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {professor && (
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
            <Label htmlFor="email">Email (Opcional)</Label>
            <Input id="email" value={formData.email || ""} onChange={(e) => handleChange("email", e.target.value)} />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{professor ? "Actualizar" : "Añadir"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
