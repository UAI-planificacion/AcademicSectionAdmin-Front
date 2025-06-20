"use client"

import { useState, useEffect } from "react";
import type React from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";

import { generateId }   from "@/lib/utils";
import { Subject } from "@/lib/types";

interface SubjectModalProps {
    isOpen      : boolean;
    onClose     : () => void;
    subject     : Subject | null;
    onAdd       : ( subject: Subject ) => void;
    onUpdate    : ( subject: Subject ) => void;
}

export function SubjectModal({
    isOpen,
    onClose,
    subject,
    onAdd,
    onUpdate
}: SubjectModalProps ) {
    const [formData, setFormData] = useState<Partial<Subject>>({
        name        : "",
        startDate   : new Date(),
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (subject) {
            setFormData({
                id          : subject.id,
                name        : subject.name,
                startDate   : subject.startDate,
                endDate     : subject.endDate,
                createdAt   : subject.createdAt,
                updatedAt   : subject.updatedAt,
            })
        } else {
            setFormData({
                name        : "",
                startDate   : new Date(),
            })
        }

        setErrors({});
    }, [subject, isOpen]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name || formData.name.trim() === "") {
            newErrors.name = "El nombre es requerido"
        }

        if (!formData.startDate) {
            newErrors.startDate = "La fecha de inicio es requerida"
        }

        if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
            newErrors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio"
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if ( !validateForm() ) return;

        const now = new Date()

        if (subject) {
            // Actualizar asignatura existente
            onUpdate({
                ...subject,
                ...formData,
                updatedAt: now,
            } as Subject)
        } else {
            // Añadir nueva asignatura
            onAdd({
                id: generateId("SUB"),
                name: formData.name || "",
                startDate: formData.startDate || new Date(),
                endDate: formData.endDate,
                createdAt: now,
                updatedAt: now,
            } as Subject)
        }

        onClose()
    }

    const handleChange = (field: keyof Subject, value: any) => {
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

    const formatDateForInput = (date?: Date | null ): string => {
        if (!date) return ""
        return new Date(date).toISOString().split("T")[0]
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{subject ? "Editar Asignatura" : "Añadir Asignatura"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    {subject && (
                        <div className="space-y-2">
                        <Label htmlFor="id">ID</Label>
                        <Input id="id" value={formData.id || ""} disabled />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>

                        <Input
                            id          = "name"
                            value       = { formData.name || "" }
                            onChange    = {(e) => handleChange( "name", e.target.value )}
                        />

                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Fecha de Inicio</Label>

                            <Input
                                id          = "startDate"
                                type        = "date"
                                value       = { formatDateForInput( formData.startDate )}
                                onChange    = {( e ) => handleChange("startDate", new Date( e.target.value ))}
                            />

                            {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha de Fin (Opcional)</Label>

                            <Input
                                id          = "endDate"
                                type        = "date"
                                value       = { formatDateForInput( formData.endDate )}
                                onChange    = {( e ) => handleChange( "endDate", e.target.value ? new Date( e.target.value ) : undefined )}
                            />

                            {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>

                        <Button type="submit">{subject ? "Actualizar" : "Añadir"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
