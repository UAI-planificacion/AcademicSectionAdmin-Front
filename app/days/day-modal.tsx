"use client"

import type React               from "react";
import { useState, useEffect }  from "react";

import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import LoaderMini           from "@/icons/LoaderMini";
import type { Day }         from "@/lib/types";
import { saveDayStorage }   from "@/stores/local-storage-days";
import { fetchApi }         from "@/services/fetch";


interface DayModalProps {
    isOpen      : boolean;
    onClose     : () => void;
    day         : Day | null;
    onAdd       : (day: Day) => void;
    onUpdate    : (day: Day) => void;
}

const dayEmpty: Day = {
    id          : 0,
    name        : "Domingo",
    shortName   : "D",
    mediumName  : "Do",
}

export function DayModal({ isOpen, onClose, day, onAdd, onUpdate }: DayModalProps) {
    const [isLoading, setIsLoading] = useState<boolean>( false );
    const [formData, setFormData]   = useState<Day>( dayEmpty );
    const [errors, setErrors]       = useState<Record<string, string>>( {} );

    useEffect(() => {
        const data = day
            ? { ...day }
            : dayEmpty

        setFormData( data );
        setErrors( {} );
    }, [day, isOpen]);


    function validateForm(): boolean {
        const newErrors: Record<string, string> = {}

        if ( !formData.name || formData.name.trim() === "" )
            newErrors.name = "El nombre completo es requerido"

        if ( !formData.shortName || formData.shortName.trim() === "" )
            newErrors.shortName = "El nombre corto es requerido"

        if ( !formData.mediumName || formData.mediumName.trim() === "" )
            newErrors.mediumName = "El nombre medio es requerido"

        if ( formData.shortName && formData.shortName.length > 2 )
            newErrors.shortName = "El nombre corto no debe exceder 2 caracteres"

        if ( formData.mediumName && formData.mediumName.length > 4 )
            newErrors.mediumName = "El nombre medio no debe exceder 4 caracteres"

        setErrors( newErrors );

        return Object.keys( newErrors ).length === 0;
    }


    async function onCreateDay(): Promise<void> {
        try {
            const url = `${ENV.REQUEST_BACK_URL}days`;
            const daySave = await fetchApi<Day>(url, "POST", formData);

            if ( !daySave ) {
                toast( 'Error al crear el día', errorToast );
                return;
            }

            saveDayStorage( daySave );
            onAdd( daySave );
            toast( 'Día creado correctamente', successToast );
        } catch ( error ) {
            toast( 'Error al crear el día', errorToast );
        } finally {
            setIsLoading( false );
        }
    }


    async function onUpdateDay(): Promise<void> {
        try {
            const url = `${ENV.REQUEST_BACK_URL}days/${formData.id}`;
            const daySave = await fetchApi<Day>(url, "PATCH", formData);

            if ( !daySave ) {
                toast( 'Error al actualizar el día', errorToast );
                return;
            }

            saveDayStorage( daySave );
            onUpdate( daySave );
            toast( 'Día actualizado correctamente', successToast );
        } catch ( error ) {
            toast( 'Error al actualizar el día', errorToast );
        } finally {
            setIsLoading( false );
        }
    }


    async function handleSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();

        if ( !validateForm() ) return;

        setIsLoading( true );

        if ( day ) {
            await onUpdateDay();
        } else {
            await onCreateDay();
        }

        onClose();
    }

    const handleChange = (field: keyof Day, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        if ( errors[field] ) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
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

                            {day ? "Actualizar" : "Añadir"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
