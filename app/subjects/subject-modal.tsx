"use client"

import { useState, useEffect } from "react";
import type React from "react";

import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                       from "@/components/ui/dialog";
import { Button }       from "@/components/ui/button";
import { Input }        from "@/components/ui/input";
import { Label }        from "@/components/ui/label";
import { DatePicker }   from "@/components/inputs/DatePicker";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import { Subject }  from "@/lib/types";
import LoaderMini   from "@/icons/LoaderMini";
import { fetchApi } from "@/services/fetch";


interface SubjectModalProps {
    isOpen      : boolean;
    onClose     : () => void;
    subject     : Subject | null;
    onAdd       : ( subject: Subject ) => void;
    onUpdate    : ( subject: Subject ) => void;
}


const subjectEmpty = {
    id          : "",
    name        : "",
    startDate   : '',
}

export function SubjectModal({
    isOpen,
    onClose,
    subject,
    onAdd,
    onUpdate
}: SubjectModalProps ) {
    const oldId = subject?.id;
    const [isLoading, setIsLoading] = useState<boolean>( false );
    const [formData, setFormData] = useState<Partial<Subject>>( subjectEmpty );

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setFormData( subject ? { ...subject } : subjectEmpty );
        setErrors({});
    }, [subject, isOpen]);


    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};

        if ( !formData.id || formData.id.trim() === "" ) {
            newErrors.id = "El ID es requerido"
        }

        if ( !formData.name || formData.name.trim() === "" ) {
            newErrors.name = "El nombre es requerido";
        }

        if ( !formData.startDate ) {
            newErrors.startDate = "La fecha de inicio es requerida";
        }

        if ( formData.endDate && formData.startDate && new Date( formData.endDate ) < new Date( formData.startDate )) {
            newErrors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        setErrors( newErrors );
        return Object.keys( newErrors ).length === 0;
    };


    async function handleSubmit( e: React.FormEvent ): Promise<void> {
        e.preventDefault()

        console.log('🚀 ~ file: subject-modal.tsx:106 ~ validateForm:', formData)
        if ( !validateForm() ) return;

        setIsLoading( true );


        const subjetcSave = subject
            ? await onUpdateSubject()
            : await onCreateSubject();

        setIsLoading( false );

        if ( !subjetcSave ) {
            toast( 'No se pudo guardar la asignatura', errorToast );
            return;
        }

        toast( 'Asignatura guardada correctamente', successToast );
        onClose();
    }


    async function onCreateSubject(): Promise<Subject | null> {
        const url = `${ENV.REQUEST_BACK_URL}subjects`;
        console.log('🚀 ~ file: subject-modal.tsx:115 ~ url:', url)

        const subjectSave = await fetchApi<Subject | null>( url, "POST", formData );
        console.log('🚀 ~ file: subject-modal.tsx:117 ~ subjectSave:', subjectSave)

        if ( !subjectSave ) {
            return null;
        }

        onAdd( subjectSave );
        return subjectSave;
    }


    async function onUpdateSubject(): Promise<Subject | null> {
        const url = `${ENV.REQUEST_BACK_URL}subjects/${oldId}`;

        const subjectSave = await fetchApi<Subject | null>( url, "PATCH", formData );

        if ( !subjectSave ) {
            return null;
        }

        onUpdate( subjectSave );
        return subjectSave;
    }


    const handleChange = (field: keyof Subject, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

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
                    <DialogTitle>{subject ? "Editar Asignatura" : "Añadir Asignatura"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="id">ID</Label>

                        <Input
                            id          = "id"
                            value       = { formData.id || "" }
                            onChange    = {( e ) => handleChange( "id", e.target.value )}
                        />

                        {errors.id && <p className="text-sm text-destructive">{errors.id}</p>}
                    </div>

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

                            <DatePicker
                                value       = { formData.startDate ? new Date( formData.startDate ) : undefined }
                                onChange    = {( e ) => handleChange("startDate", e)}
                            />

                            {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">Fecha de Fin (Opcional)</Label>

                            <DatePicker
                                value       = { formData.endDate ? new Date( formData.endDate ) : undefined }
                                onChange    = {( e ) => handleChange( "endDate", e )}
                            />

                            {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type        = "button"
                            variant     = "outline"
                            onClick     = { onClose }
                            disabled    = { isLoading }
                        >
                            { isLoading && <LoaderMini /> }
                            Cancelar
                        </Button>

                        <Button
                            type        = "submit"
                            disabled    = { isLoading }
                        >
                            { isLoading && <LoaderMini /> }
                            {subject ? "Actualizar" : "Añadir"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
