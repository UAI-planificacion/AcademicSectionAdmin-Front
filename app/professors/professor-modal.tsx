"use client"

import type React from "react"
import { useState, useEffect, JSX } from "react"

import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";

import type { Professor } from "@/lib/types";

import LoaderMini from "@/icons/LoaderMini";
import { ENV } from "@/config/envs/env";
import { fetchApi } from "@/services/fetch";

import { errorToast, successToast } from "@/config/toast/toast.config";



interface ProfessorModalProps {
    isOpen      : boolean;
    onClose     : () => void;
    professor   : Professor | null;
    onAdd       : ( professor: Professor ) => void;
    onUpdate    : ( professor: Professor ) => void;
}


export function ProfessorModal({
    isOpen,
    onClose,
    professor,
    onAdd,
    onUpdate
}: ProfessorModalProps ): JSX.Element {
    const oldId = professor?.id;
    const [ isLoading, setIsLoading ] = useState<boolean>( false );
    const [ formData, setFormData ] = useState<Partial<Professor>>( {
        name    : "",
        email   : "",
    });

    const [ errors, setErrors ] = useState<Record<string, string>>( {} );

    useEffect(() => {
        if (professor) {
            setFormData({
                id          : professor.id,
                name        : professor.name,
                email       : professor.email,
                createdAt   : professor.createdAt,
                updatedAt   : professor.updatedAt,
            })
        } else {
            setFormData({
                id      : "",
                name    : "",
                email   : "",
            })
        }

        setErrors({})
    }, [professor, isOpen])


    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};

        if ( !formData.id || formData.id.trim() === "" ) {
            newErrors.id = 'El ID es requerido';
        }

        if ( !formData.name || formData.name.trim() === "" ) {
            newErrors.name = 'El nombre es requerido';
        }

        if ( formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( formData.email )) {
            newErrors.email = 'El formato del email no es válido';
        }

        setErrors( newErrors );

        return Object.keys( newErrors ).length === 0;
    }

    async function handleSubmit( e: React.FormEvent ): Promise<void> {
        e.preventDefault();

        if ( !validateForm() ) return;

        setIsLoading( true );

        const professorSave = professor
            ? await onUpdateProfessor()
            : await onCreateProfessor();

        setIsLoading( false );

        if ( !professorSave ) {
            toast( 'No se pudo guardar el profesor', errorToast );
            return;
        }

        toast( 'Profesor guardado correctamente', successToast );
        onClose();
    }


    async function onCreateProfessor(): Promise<Professor | null> {
        const url = `${ENV.REQUEST_BACK_URL}professors`;

        if ( formData.email === '' ) {
            formData.email = null;
        }

        const professorSave = await fetchApi<Professor | null>( url, "POST", formData );

        if ( !professorSave ) {
            return null;
        }

        onAdd( professorSave );
        return professorSave;
    }


    async function onUpdateProfessor(): Promise<Professor | null> {
        const url = `${ENV.REQUEST_BACK_URL}professors/${oldId}`;

        const professorSave = await fetchApi<Professor | null>( url, "PATCH", formData );

        if ( !professorSave ) {
            return null;
        }

        onUpdate( professorSave );
        return professorSave;
    }


    function handleChange( field: keyof Professor, value: any ): void {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        // Limpiar error cuando el usuario corrige el campo
        if ( errors[field] ) {
            setErrors(( prev ) => ({
                ...prev,
                [field]: "",
            }));
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{professor ? "Editar Profesor" : "Añadir Profesor"}</DialogTitle>
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
                            onChange    = {( e ) => handleChange( "name", e.target.value )}
                        />

                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (Opcional)</Label>

                        <Input
                            id          = "email"
                            value       = { formData.email || "" }
                            onChange    = {( e ) => handleChange( "email", e.target.value )}
                        />

                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            { isLoading && <LoaderMini /> }

                            Cancelar
                        </Button>

                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            { isLoading && <LoaderMini /> }
                            {professor ? "Actualizar" : "Añadir"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
