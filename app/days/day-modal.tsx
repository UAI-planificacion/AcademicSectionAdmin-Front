"use client"

import type React from "react"
import { useState, useEffect } from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { Day } from "@/lib/types"


interface DayModalProps {
    isOpen: boolean
    onClose: () => void
    day: Day | null
    onAdd: (day: Day) => void
    onUpdate: (day: Day) => void
}

export function DayModal({ isOpen, onClose, day, onAdd, onUpdate }: DayModalProps) {
    const [formData, setFormData] = useState<Partial<Day>>({
        name: "",
        shortName: "",
        mediumName: "",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (day) {
        setFormData({
            id: day.id,
            name: day.name,
            shortName: day.shortName,
            mediumName: day.mediumName,
        })
        } else {
        setFormData({
            name: "",
            shortName: "",
            mediumName: "",
        })
        }
        setErrors({})
    }, [day, isOpen])

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.name || formData.name.trim() === "") {
        newErrors.name = "El nombre completo es requerido"
        }

        if (!formData.shortName || formData.shortName.trim() === "") {
        newErrors.shortName = "El nombre corto es requerido"
        }

        if (!formData.mediumName || formData.mediumName.trim() === "") {
        newErrors.mediumName = "El nombre medio es requerido"
        }

        if (formData.shortName && formData.shortName.length > 2) {
        newErrors.shortName = "El nombre corto no debe exceder 2 caracteres"
        }

        if (formData.mediumName && formData.mediumName.length > 4) {
        newErrors.mediumName = "El nombre medio no debe exceder 4 caracteres"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
        return
        }

        if (day) {
        // Actualizar día existente
        onUpdate({
            ...day,
            ...formData,
        } as Day)
        } else {
        // Añadir nuevo día
        // Generar un nuevo ID basado en el último ID existente
        const newId = Math.max(...(JSON.parse(localStorage.getItem("days") || "[]").map((d: Day) => d.id) || [0])) + 1
        onAdd({
            id: newId,
            name: formData.name || "",
            shortName: formData.shortName || "",
            mediumName: formData.mediumName || "",
        } as Day)
        }

        onClose()
    }

    const handleChange = (field: keyof Day, value: any) => {
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
            <DialogTitle>{day ? "Editar Día" : "Añadir Día"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {day && (
                <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input id="id" value={formData.id || ""} disabled />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" value={formData.name || ""} onChange={(e) => handleChange("name", e.target.value)} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="mediumName">Nombre Medio</Label>
                <Input
                    id="mediumName"
                    value={formData.mediumName || ""}
                    onChange={(e) => handleChange("mediumName", e.target.value)}
                    maxLength={4}
                />
                {errors.mediumName && <p className="text-sm text-destructive">{errors.mediumName}</p>}
                </div>

                <div className="space-y-2">
                <Label htmlFor="shortName">Nombre Corto</Label>
                <Input
                    id="shortName"
                    value={formData.shortName || ""}
                    onChange={(e) => handleChange("shortName", e.target.value)}
                    maxLength={2}
                />
                {errors.shortName && <p className="text-sm text-destructive">{errors.shortName}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
                </Button>
                <Button type="submit">{day ? "Actualizar" : "Añadir"}</Button>
            </div>
            </form>
        </DialogContent>
        </Dialog>
    )
}
