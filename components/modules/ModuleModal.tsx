"use client";

import React, { useState, useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                       from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                       from '@/components/ui/select';
import { Button }       from '@/components/ui/button';
import { Input }        from '@/components/ui/input';
import { Label }        from '@/components/ui/label';
import { Switch }       from '@/components/ui/switch';
import {DaySelector}    from '@/components/inputs/DaySelector';
import { Time }         from '@/components/inputs/Time';

import { Difference, ModuleOriginal } from '@/models/module.model';

interface ModuleModalProps {
    isOpen  : boolean;
    onClose : () => void;
    onSave  : ( module: Omit<ModuleOriginal, 'id'> ) => void;
    module? : ModuleOriginal | null;
}


const DIFFERENCES = Array.from({ length: 26 }, (_, i) => String.fromCharCode( 65 + i ));


const moduleEmpty: ModuleOriginal = {
    id          : '',
    name        : '',
    startHour   : '',
    endHour     : '',
    difference  : null,
    code        : '',
    isActive    : true,
    days        : [],
    createdAt   : new Date(),
    updatedAt   : new Date(),
}


export function ModuleModal({ isOpen, onClose, onSave, module }: ModuleModalProps) {
    const [formData, setFormData]   = useState<ModuleOriginal>( moduleEmpty );
    const [errors, setErrors]       = useState<Record<string, string>>( {} );

    useEffect(() => {
        const data = module ? { ...module }: moduleEmpty;
        setFormData( data );
        setErrors( {} );
    }, [module, isOpen]);

    // Auto-generate module name based on code, day, and difference
    useEffect(() => {
        const diferrence    = formData.difference ? `-${formData.difference}` :'';
        const dayNumber     = `[${formData.days.join('-')}]`;
        // const generatedName = `M${formData.code}:${dayNumber}${diferrence}`;
        const generatedName = `M${formData.code}${diferrence}`;
        setFormData(prev => ({ ...prev, name: generatedName }));
    // }, [formData.code, formData.days, formData.difference]);
    }, [formData.code, formData.difference]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = 'El código es requerido';
        }

        if (!formData.startHour) {
            newErrors.startHour = 'La hora de inicio es requerida';
        }

        if (!formData.endHour) {
            newErrors.endHour = 'La hora de fin es requerida';
        }

        if (formData.startHour && formData.endHour) {
            if (formData.startHour >= formData.endHour) {
                newErrors.endHour = 'La hora de fin debe ser posterior a la hora de inicio';
            }
        }

        if (!formData.days || formData.days.length === 0) {
            newErrors.days = 'Al menos debe seleccionar un día';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    async function handleSubmit( e: React.FormEvent ): Promise<void> {
        e.preventDefault();

        if ( !validateForm() ) return;
        // formData.days = formData.days.map( day => day + 1 );

        console.log('🚀 ~ handleSubmit ~ formData:', formData)
        // onSave( formData );
        // onClose();
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const availableDays = [0, 1, 2, 3, 4, 5];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader className="pb-6">
                    <DialogTitle className="text-2xl font-bold">
                        {module ? 'Editar Módulo' : 'Agregar Nuevo Módulo'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium mb-2 block">
                            Nombre del Módulo (Generado Automáticamente)
                        </Label>

                        <div className="h-10 flex items-center font-mono text-lg font-bold bg-background px-3 py-2 rounded border">
                            { formData.name }
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Código del Módulo</Label>

                            <Input
                                id          = "code"
                                value       = { formData.code }
                                onChange    = {( e ) => handleChange( 'code', e.target.value )}
                                className   = { errors.code ? 'border-destructive' : '' }
                                placeholder = "Ej: 1, 2, 3..."
                                type        = "number"
                                min         = "1"
                                max         = "99999"
                            />

                            {errors.code && (
                                <p className="text-sm text-destructive">{errors.code}</p>
                            )}
                        </div>

                        {/* <div className="space-y-2">
                            <Label htmlFor="difference">Diferencia</Label>

                            <Select
                                value           = { formData.difference || '' }
                                onValueChange   = {( value ) => handleChange( 'difference', value )}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {DIFFERENCES.map((diff) => (
                                        <SelectItem key={diff} value={diff}>
                                            {diff}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div> */}

                        <div className="space-y-2">
                            <Label htmlFor="startTime">Hora Inicio</Label>

                            <Time
                                value       = { formData.startHour }
                                onChange    = {( value: string ) => handleChange( 'startHour', value )}
                                startHour   = { 6 }
                                endHour     = { 22 }
                                minuteJump  = { 5 }
                            />

                            {errors.startHour && (
                                <p className="text-sm text-destructive">{errors.startHour}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endTime">Hora Fin</Label>

                            <Time
                                value       = { formData.endHour }
                                onChange    = {( value: string ) => handleChange( 'endHour', value )}
                                startHour   = { 6 }
                                endHour     = { 22 }
                                minuteJump  = { 5 }
                            />

                            {errors.endHour && (
                                <p className="text-sm text-destructive">{errors.endHour}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endTime">Días en los que estará el módulo</Label>

                        <DaySelector
                            days        = { availableDays }
                            value       = { formData.days }
                            onChange    = {( days: number[] ) => handleChange( 'days', days )}
                        />

                        {errors.days && (
                            <p className="text-sm text-destructive">{errors.days}</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-3 bg-muted/30 rounded-lg p-4">
                        <Switch
                            id              = "isActive"
                            checked         = { formData.isActive }
                            onCheckedChange = {( checked: boolean ) => handleChange( 'isActive', checked )}
                        />

                        <Label htmlFor="isActive" className="font-medium">
                            Módulo activo
                        </Label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>

                        <Button type="submit">
                            {module ? 'Actualizar' : 'Crear'} Módulo
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}