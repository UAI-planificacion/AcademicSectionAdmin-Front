"use client";

import React, { useState, useEffect } from 'react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
}                   from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                   from '@/components/ui/select';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Switch }   from '@/components/ui/switch';
import { Module }   from '@/app/modules/page';

interface ModuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (module: Omit<Module, 'id'>) => void;
    module?: Module | null;
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIFFERENCES = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));


export function ModuleModal({ isOpen, onClose, onSave, module }: ModuleModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        startTime: '',
        endTime: '',
        difference: 'A',
        day: 'Lunes',
        order: 1,
        code: '',
        isActive: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (module) {
            setFormData({
                name: module.name,
                startTime: module.startTime,
                endTime: module.endTime,
                difference: module.difference,
                day: module.day,
                order: module.order,
                code: module.code,
                isActive: module.isActive,
            });
        } else {
            setFormData({
                name: '',
                startTime: '',
                endTime: '',
                difference: 'A',
                day: 'Lunes',
                order: 1,
                code: '',
                isActive: true,
            });
        }

        setErrors({});
    }, [module, isOpen]);

    // Auto-generate module name based on code, day, and difference
    useEffect(() => {
        if (formData.code && formData.day && formData.difference) {
        const dayNumber = DAYS.indexOf(formData.day) + 1;
        const generatedName = `M${formData.code}:${dayNumber}-${formData.difference}`;
        setFormData(prev => ({ ...prev, name: generatedName }));
        }
    }, [formData.code, formData.day, formData.difference]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.startTime) {
        newErrors.startTime = 'La hora de inicio es requerida';
        }

        if (!formData.endTime) {
        newErrors.endTime = 'La hora de fin es requerida';
        }

        if (formData.startTime && formData.endTime) {
        if (formData.startTime >= formData.endTime) {
            newErrors.endTime = 'La hora de fin debe ser posterior a la hora de inicio';
        }
        }

        if (!formData.code.trim()) {
        newErrors.code = 'El código es requerido';
        }

        if (formData.order < 1) {
        newErrors.order = 'El orden debe ser mayor a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
        onSave(formData);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold">
                {module ? 'Editar Módulo' : 'Agregar Nuevo Módulo'}
            </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Generated Module Name Display */}
            <div className="bg-muted/50 border rounded-lg p-4">
                <Label className="text-sm font-medium mb-2 block">
                Nombre del Módulo (Generado Automáticamente)
                </Label>
                <div className="font-mono text-lg font-bold bg-background px-3 py-2 rounded border">
                {formData.name || 'M[código]:[día]-[diferencia]'}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="code">Código del Módulo</Label>
                <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    className={errors.code ? 'border-destructive' : ''}
                    placeholder="Ej: 1, 2, 3..."
                />
                {errors.code && (
                    <p className="text-sm text-destructive">{errors.code}</p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="difference">Diferencia</Label>
                <Select
                    value={formData.difference}
                    onValueChange={(value) => handleChange('difference', value)}
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
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                <Label htmlFor="startTime">Hora Inicio</Label>
                <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className={errors.startTime ? 'border-destructive' : ''}
                />
                {errors.startTime && (
                    <p className="text-sm text-destructive">{errors.startTime}</p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="endTime">Hora Fin</Label>
                <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    className={errors.endTime ? 'border-destructive' : ''}
                />
                {errors.endTime && (
                    <p className="text-sm text-destructive">{errors.endTime}</p>
                )}
                </div>

                <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => handleChange('order', parseInt(e.target.value) || 1)}
                    className={errors.order ? 'border-destructive' : ''}
                />
                {errors.order && (
                    <p className="text-sm text-destructive">{errors.order}</p>
                )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="day">Día de la Semana</Label>
                <Select
                value={formData.day}
                onValueChange={(value) => handleChange('day', value)}
                >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {DAYS.map((day, index) => (
                    <SelectItem key={day} value={day}>
                        {day} (Día {index + 1})
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-3 bg-muted/30 rounded-lg p-4">
                <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked: boolean) => handleChange('isActive', checked)}
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