"use client"

import type React from "react";
import { useState, useEffect } from "react";

import { toast } from "sonner";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";

import { Size, Space, Type } from "@/lib/types";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import LoaderMini from "@/icons/LoaderMini";

import { fetchApi } from "@/services/fetch";
import { saveSpaceStorage } from "@/stores/local-storage-spaces";


interface SpaceModalProps {
    isOpen      : boolean;
    onClose     : () => void;
    space       : Space | null;
    onAdd       : ( space: Space ) => void;
    onUpdate    : ( space: Space ) => void;
}

const typeOptions: Type[] = ["ROOM", "AUDITORIO", "DIS", "LAB", "LABPC", "GARAGE", "CORE", "COMMUNIC"]
const sizeOptions: Size[] = ["XS", "XE", "S", "SE", "MS", "M", "L", "XL", "XXL"]

export function SpaceModal({ isOpen, onClose, space, onAdd, onUpdate }: SpaceModalProps) {
    const oldId = space?.id;

    const [ isLoading, setIsLoading ] = useState<boolean>( false );

    const [formData, setFormData] = useState<Space>({
        id: "",
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
            });
        } else {
            setFormData({
                id: "",
                capacity: 0,
                type: "ROOM",
                sizeId: "M",
                building: "A",
            });
        }
        setErrors({})
    }, [space, isOpen])


    function validateForm(): boolean {
        const newErrors: Record<string, string> = {}

        if (!formData.id || formData.id.trim() === "") {
            newErrors.id = "El nombre es requerido";
        }

        if (!formData.capacity || formData.capacity <= 0) {
            newErrors.capacity = "La capacidad debe ser mayor que 0";
        }

        if (!formData.type) {
            newErrors.type = "El tipo es requerido";
        }

        if (!formData.sizeId) {
            newErrors.sizeId = "El tamaño es requerido";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }


    async function handleSubmit( e: React.FormEvent ): Promise<void> {
        e.preventDefault()

        if ( !validateForm() ) return;

        setIsLoading( true );

        formData.building = formData.id?.split("-")[1];

        const spaceSave = space
            ? await onUpdateSpace()
            : await onCreateSpace();

        setIsLoading( false );

        if ( !spaceSave ) {
            toast( 'No se pudo guardar el espacio', errorToast );
            return;
        }

        toast( 'Espacio guardado correctamente', successToast );
        onClose();
    }


    async function onCreateSpace(): Promise<Space | null> {
        const url = `${ENV.REQUEST_BACK_URL}spaces`;

        const spaceSave = await fetchApi<Space | null>( url, "POST", formData );

        if ( !spaceSave ) {
            return null;
        }

        onAdd( spaceSave );
        saveSpaceStorage( spaceSave );

        return spaceSave;
    }

    async function onUpdateSpace(): Promise<Space | null> {
        const url = `${ENV.REQUEST_BACK_URL}spaces/${oldId}`;

        const spaceSave = await fetchApi<Space | null>( url, "PATCH", formData );

        if ( !spaceSave ) {
            return null;
        }

        onUpdate( spaceSave );
        saveSpaceStorage( spaceSave );
        return spaceSave;
    }


    function handleChange( field: keyof Space, value: any ): void {
        setFormData(( prev ) => ({
            ...prev,
            [field]: value,
        }));

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
                    <DialogTitle>{space ? "Editar Espacio" : "Crear Espacio"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="id">Nombre</Label>

                            <Input
                                id          = "id"
                                value       = { formData.id || "" }
                                onChange    = {( e ) => handleChange( "id", e.target.value )}
                            />

                            {errors.id && <p className="text-sm text-destructive">{errors.id}</p>}
                        </div>

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

                            {space ? "Actualizar" : "Añadir"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
