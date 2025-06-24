"use client"

import type React from "react"
import { useState, useEffect } from "react"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                   from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                   from "@/components/ui/tabs";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";

import type { Size, SizeId, Sizes } from "@/models/size.model";
import { saveSizeStorage } from "@/stores/local-storage-sizes";
import { toast } from "sonner";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { fetchApi } from "@/services/fetch";
import { ENV } from "@/config/envs/env";


interface SizeModalProps {
    isOpen          : boolean;
    onClose         : () => void;
    size            : Size | null;
    onAdd           : ( size: Size ) => void;
    onUpdate        : ( size: Size ) => void;
    existingSizes   : Size[];
}


function getAvailableSizeIds( existingSizes: Size[] ): SizeId[] {
    const allSizeIds: SizeId[] = ["XS", "XE", "S", "SE", "MS", "M", "L", "XL", "XXL"];
    const usedIds = existingSizes.map(( size ) => size.id );

    return allSizeIds.filter(( id ) => !usedIds.includes( id ));
}


function generateSizeDetail( size: Partial<Size> ): string {
    if ( size.min !== undefined && size.max !== undefined ) {
        return `Entre ${size.min} y ${size.max}`;
    }

    if ( size.greaterThan !== undefined ) {
        return `Mayor que ${size.greaterThan}`;
    }

    if ( size.lessThan !== undefined ) {
        return `Menor que ${size.lessThan}`;
    }

    return "";
}


type RangeType = "minMax" | "greaterThan" | "lessThan";


export function SizeModal({ isOpen, onClose, size, onAdd, onUpdate, existingSizes }: SizeModalProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<Partial<Size>>({
        id: undefined,
        detail: "",
        min: undefined,
        max: undefined,
        greaterThan: undefined,
        lessThan: undefined,
    })

    const [rangeType, setRangeType] = useState<RangeType>("minMax")
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (size) {
            setFormData({
                id: size.id,
                detail: size.detail,
                min: size.min,
                max: size.max,
                greaterThan: size.greaterThan,
                lessThan: size.lessThan,
            })

            // Determinar el tipo de rango
            if (size.min !== undefined && size.max !== undefined) {
                setRangeType("minMax")
            }
            else if (size.greaterThan !== undefined) {
                setRangeType("greaterThan")
            }
            else if (size.lessThan !== undefined) {
                setRangeType("lessThan")
            }
        } else {
            setFormData({
                id: undefined,
                detail: "",
                min: undefined,
                max: undefined,
                greaterThan: undefined,
                lessThan: undefined,
            })
            setRangeType("minMax")
        }
        setErrors({})
    }, [size, isOpen, formData.lessThan, formData.greaterThan, formData.max, formData.min])

    useEffect(() => {
        const newDetail = generateSizeDetail(formData);

        setFormData((prev) => ({
            ...prev,
            detail: newDetail,
        }));
    }, [formData.min, formData.max, formData.greaterThan, formData.lessThan]);


    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};

        if ( !formData.id ) {
            newErrors.id = "El ID es requerido";
        }

        if ( rangeType === "minMax" ) {
            if ( formData.min === undefined || formData.min < 0 ) {
                newErrors.min = "El valor mínimo es requerido y debe ser mayor o igual a 0"
            }

            if ( formData.max === undefined || formData.max < 0 ) {
                newErrors.max = "El valor máximo es requerido y debe ser mayor o igual a 0";
            }

            if ( formData.min !== undefined && formData.max !== undefined && formData.min >= formData.max ) {
                newErrors.max = "El valor máximo debe ser mayor que el mínimo";
            }
        } else if ( rangeType === "greaterThan" ) {
            if ( formData.greaterThan === undefined || formData.greaterThan < 0 ) {
                newErrors.greaterThan = "El valor 'mayor que' es requerido y debe ser mayor o igual a 0";
            }
        } else if ( rangeType === "lessThan" ) {
            if ( formData.lessThan === undefined || formData.lessThan <= 0 ) {
                newErrors.lessThan = "El valor 'menor que' es requerido y debe ser mayor que 0";
            }
        }

        setErrors( newErrors );
        return Object.keys( newErrors ).length === 0;
    }


    async function onCreateSize(): Promise<void> {
        try {
            setIsLoading(true);
            const url = `${ENV.REQUEST_BACK_URL}sizes`;
            const sizeSave = await fetchApi<Sizes>(url, "POST", formData);

            if (!sizeSave) {
                toast("Error al crear la talla", errorToast);
                return;
            }

            saveSizeStorage(sizeSave);
            onAdd(sizeSave);
            toast("Talla creada correctamente", successToast);
        } catch (error) {
            toast("Error al crear la talla", errorToast);
        } finally {
            setIsLoading(false);
            onClose();
        }
    }

    async function onUpdateSize(): Promise<void> {
        try {
            const url = `${ENV.REQUEST_BACK_URL}sizes/${formData.id}`;
            const sizeSave = await fetchApi<Sizes>(url, "PUT", formData);

            if (!sizeSave) {
                toast("Error al actualizar la talla", errorToast);
                return;
            }

            saveSizeStorage(sizeSave);
            onUpdate(sizeSave);
            toast("Talla actualizada correctamente", successToast);
        } catch (error) {
            toast("Error al actualizar la talla", errorToast);
        } finally {
            setIsLoading(false);
            onClose();
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        const cleanedData: Size = {
            id: formData.id as SizeId,
            detail: formData.detail || "",
        }

        if ( rangeType === "minMax" ) {
            cleanedData.min = formData.min;
            cleanedData.max = formData.max;
        } else if ( rangeType === "greaterThan" ) {
            cleanedData.greaterThan = formData.greaterThan;
        } else if ( rangeType === "lessThan" ) {
            cleanedData.lessThan = formData.lessThan;
        }

        if (size) {
            await onUpdateSize();
        } else {
            await onCreateSize();
        }

        onClose()
    }


    function handleChange( field: keyof Size, value: any ) {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))

        if ( errors[field] ) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }))
        }
    }


    function handleRangeTypeChange( newRangeType: RangeType ) {
        setRangeType( newRangeType );

        setFormData((prev) => ({
            ...prev,
            min: undefined,
            max: undefined,
            greaterThan: undefined,
            lessThan: undefined,
        }));

        setErrors({});
    }


    const availableSizeIds = getAvailableSizeIds(
        size
            ? existingSizes.filter(( s ) => s.id !== size.id )
            : existingSizes
    );


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{size ? "Editar Tamaño" : "Añadir Tamaño"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="id">ID</Label>

                        {size ? (
                            <Input id="id" value={formData.id || ""} disabled />
                        ) : (
                            <Select value={formData.id} onValueChange={(value) => handleChange("id", value as SizeId)}>
                                <SelectTrigger id="id">
                                    <SelectValue placeholder="Seleccionar ID" />
                                </SelectTrigger>

                                <SelectContent>
                                    {availableSizeIds.map((sizeId) => (
                                        <SelectItem key={sizeId} value={sizeId}>
                                            {sizeId}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {errors.id && <p className="text-sm text-destructive">{errors.id}</p>}
                    </div>


                    <div className="space-y-2">
                        <Label>Tipo de Rango</Label>

                        <Tabs defaultValue="minMax"
                            className       = "w-full"
                            value           = { rangeType }
                            onValueChange   = {( value ) => handleRangeTypeChange( value as RangeType )}
                        >
                            <TabsList>
                                <TabsTrigger value="minMax">Rango</TabsTrigger>

                                <TabsTrigger value="greaterThan">Mayor que</TabsTrigger>

                                <TabsTrigger value="lessThan">Menor que</TabsTrigger>
                            </TabsList>

                            <TabsContent value="minMax">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="min">Mínimo</Label>

                                        <Input
                                            id="min"
                                            type="number"
                                            min="0"
                                            value={formData.min ?? ""}
                                            onChange={(e) => handleChange("min", e.target.value ? Number.parseInt(e.target.value) : undefined)}
                                        />

                                        {errors.min && <p className="text-sm text-destructive">{errors.min}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max">Máximo</Label>

                                        <Input
                                            id="max"
                                            type="number"
                                            min="0"
                                            value={formData.max ?? ""}
                                            onChange={(e) => handleChange("max", e.target.value ? Number.parseInt(e.target.value) : undefined)}
                                        />

                                        {errors.max && <p className="text-sm text-destructive">{errors.max}</p>}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="greaterThan">
                                <div className="space-y-2">
                                    <Label htmlFor="greaterThan">Mayor que</Label>

                                    <Input
                                        id="greaterThan"
                                        type="number"
                                        min="0"
                                        value={formData.greaterThan ?? ""}
                                        onChange={(e) => handleChange("greaterThan", e.target.value ? Number.parseInt(e.target.value) : undefined )}
                                    />

                                    {errors.greaterThan && <p className="text-sm text-destructive">{errors.greaterThan}</p>}
                                </div>
                            </TabsContent>

                            <TabsContent value="lessThan">
                                <div className="space-y-2">
                                    <Label htmlFor="lessThan">Menor que</Label>

                                    <Input
                                        id="lessThan"
                                        type="number"
                                        min="1"
                                        value={formData.lessThan ?? ""}
                                        onChange={(e) => handleChange("lessThan", e.target.value ? Number.parseInt(e.target.value) : undefined)}
                                    />

                                    {errors.lessThan && <p className="text-sm text-destructive">{errors.lessThan}</p>}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div> 

                    <div className="space-y-2">
                        <Label htmlFor="detail">Detalle (Generado automáticamente)</Label>

                        <Input id="detail" value={formData.detail || ""} disabled className="bg-muted" />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>

                        <Button type="submit">{size ? "Actualizar" : "Añadir"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
