"use client"

import type React   from "react";
import { useState, useEffect } from "react";

import { toast } from "sonner"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
}                               from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
}                               from "@/components/ui/select"
import { Button }               from "@/components/ui/button"
import { Input }                from "@/components/ui/input"
import { Label }                from "@/components/ui/label"
import MultiSelectCombobox      from "@/components/inputs/Combobox";
import { Badge }                from "@/components/ui/badge";
import { DeleteConfirmDialog }  from "@/components/dialogs/DeleteConfirmDialog";

import {
    SECTION_BUILDING_PLANNED,
    SECTION_SESSION
}                           from "@/lib/section";
import type { SpaceData }   from "@/lib/types";
import { cn }               from "@/lib/utils";
import { getSpaceTypeName } from "@/lib/space";

import { usePeriods }                   from "@/hooks/use-periods"
import { useSubjects }                  from "@/hooks/use-subjects";
import { useProfessors }                from "@/hooks/use-professors";
import { useModules, getModulesForDay } from '@/hooks/use-modules';
import { useDays }                      from '@/hooks/use-days';

import type {
    CreateSection,
    UpdateSection,
    Section
} from '@/models/section.model';

import LoaderMini from "@/icons/LoaderMini";

import { errorToast, successToast } from "@/config/toast/toast.config";
import { ENV } from "@/config/envs/env";


interface SectionModalProps {
    section     : Section;
    rooms       : SpaceData[];
    onClose     : () => void;
    onSave      : ( section: Section ) => boolean;
    onDelete    : ( sectionId: string ) => void;
    isCreating? : boolean;
}


export function SectionModal({ 
    section,
    rooms,
    onClose,
    onSave,
    onDelete,
    isCreating = false
}: SectionModalProps ): React.JSX.Element {
    const [formData, setFormData]       = useState<Section>({ ...section });
    const [selectedDay, setSelectedDay] = useState<number>( section.day );
    const [isLoading, setIsLoading]     = useState<boolean>( false );
    const [isDelete, setDeleteModule]   = useState<boolean>( false );
    const [errors, setErrors]           = useState<Record<string, string>>( {} );
    const { periods }                   = usePeriods();
    const { days }                      = useDays();
    const { modules }                   = useModules();
    const { professors }                = useProfessors();
    const { subjects }                  = useSubjects();
    const dayModules                    = getModulesForDay( modules, selectedDay );
    const sizes                         = Array.from( new Set( rooms.map( room => room.size )));


    useEffect(() => {
        setErrors({});
    }, [section]);


    function handleChange ( e: React.ChangeEvent<HTMLInputElement> ) {
        const { name, value } = e.target;

        setFormData(( prev ) => ({ ...prev, [ name ]: value }));
    }


    function handleSelectChange ( name: string, value: string | number ): void {
        if ( name === "day" ) {
            setSelectedDay( Number( value ));
            // Reset moduleId when day changes to avoid invalid combinations
            const newDay        = Number( value );
            const newDayModules = getModulesForDay( modules, newDay );
            setFormData(( prev ) => ({
                ...prev,
                day       : newDay,
                moduleId  : newDayModules.length > 0 ? newDayModules[0].id : "",
            }))
        } else {
            setFormData(( prev ) => ({ ...prev, [ name ]: value }))
        }
    }


    function getDayModuleId(): number {
        return dayModules.find( dayM =>
            dayM.id === formData.moduleId &&
            dayM.dayId === formData.day
        )?.dayModuleId!;
    }


    async function onCreateSection(): Promise<Section | null> {
        const saveSection: CreateSection = {
            code                    : formData.code,
            session                 : formData.session,
            size                    : formData.size,
            correctedRegistrants    : formData.correctedRegistrants,
            realRegistrants         : formData.realRegistrants,
            plannedBuilding         : formData.plannedBuilding,
            chairsAvailable         : formData.chairsAvailable,
            professorId             : formData.professorId,
            roomId                  : formData.room,
            periodId                : formData.period,
            subjectId               : formData.subjectId,
            dayModuleId             : getDayModuleId()
        }

        console.log('🚀 ~ file: section-modal.tsx:102 ~ formData:', saveSection)

        try {
            const data = await fetch( `${ENV.REQUEST_BACK_URL}sections`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( saveSection )
        });

        if ( !data.ok ) {
            toast( 'No se pudo crear la sección', errorToast );
            return null;
        }

        const response = await data.json();

        toast( 'Sección creada correctamente', successToast );

        console.log('🚀 ~ file: section-modal.tsx:123 ~ response:', response)

        return response;
        } catch ( error ) {
            toast( 'No se pudo crear la sección', errorToast );
            return null;
        } finally {
            setIsLoading( false );
        }
    }


    async function onUpdateSection(): Promise<Section | null> {
        const saveSection: UpdateSection = {
            code                    : formData.code,
            session                 : formData.session,
            size                    : formData.size,
            correctedRegistrants    : formData.correctedRegistrants,
            realRegistrants         : formData.realRegistrants,
            plannedBuilding         : formData.plannedBuilding,
            chairsAvailable         : formData.chairsAvailable,
            professorId             : formData.professorId,
            roomId                  : formData.room,
            dayModuleId             : getDayModuleId()
        }

        console.log('🚀 ~ file: section-modal.tsx:102 ~ formData:', saveSection)

        try {
            const data = await fetch( `${ENV.REQUEST_BACK_URL}sections/${formData.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify( saveSection )
            });
    
            if ( !data.ok ) {
                toast( 'No se pudo actualizar la sección', errorToast );
    
                return null;
            }
    
            const response = await data.json();
    
            toast( 'Sección actualizada correctamente', successToast );
    
            return response;
        } catch (error) {
            toast( 'No se pudo actualizar la sección', errorToast );
            return null;
        }
        finally {
            setIsLoading( false );
        }
    }


    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};

        if (!formData.code || formData.code <= 0) {
            newErrors.code = 'El código de la sección es requerido y debe ser mayor a 0';
        }

        if (!formData.session || formData.session.trim() === '') {
            newErrors.session = 'La sesión es requerida';
        }

        if (!formData.size || formData.size.trim() === '') {
            newErrors.size = 'El tamaño es requerido';
        }

        if (!formData.period || formData.period.trim() === '') {
            newErrors.period = 'El período es requerido';
        }

        if (!formData.subjectId || formData.subjectId.trim() === '') {
            newErrors.subjectId = 'La materia es requerida';
        }

        if (!formData.day || formData.day <= 0) {
            newErrors.day = 'El día es requerido';
        }

        if (!formData.moduleId || formData.moduleId.trim() === '') {
            newErrors.moduleId = 'El módulo es requerido';
        }

        if (!formData.room || formData.room.trim() === '') {
            newErrors.room = 'La sala es requerida';
        }

        const dayModuleId = getDayModuleId();
        if (!dayModuleId || dayModuleId <= 0) {
            newErrors.dayModule = 'La combinación de día y módulo no es válida';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }


    async function handleSubmit( e: React.FormEvent ): Promise<void> {
        e.preventDefault();

        // Validar formulario
        if (!validateForm()) return;

        setIsLoading( true );

        const onSaveSection = isCreating
            ? await onCreateSection()
            : await onUpdateSection();

        if ( !onSaveSection ) return;

        onSave( onSaveSection );
        setIsLoading( false );
        onClose();
    }


    async function handleDelete(): Promise<void> {
        setIsLoading( true );

        try {
            const data = await fetch( `${ENV.REQUEST_BACK_URL}sections/${section.id}`, {
                method: 'DELETE'
            })

            console.log('🚀 ~ file: section-modal.tsx:195 ~ data:', data)

            if ( !data.ok ) {
                toast("No se pudo eliminar la sección", errorToast);

                return;
            }

            const response = await data.json();

            console.log('🚀 ~ file: section-modal.tsx:123 ~ response:', response)

            toast("Sección eliminada correctamente", successToast);

            setDeleteModule( false );
            onDelete( section.id );
            onClose();
        } catch ( error ) {
            toast( 'No se pudo eliminar la sección', errorToast );
        }
        finally {
            setIsLoading( false );
        }
    }


    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader className="space-y-5">
                    <DialogTitle>{isCreating ? 'Crear Nueva Sección' : 'Detalles de la Sección'}</DialogTitle>
                    {!isCreating && (
                        <div className="rounded-lg border border-border bg-background text-foreground">
                            <div className="flex justify-between py-3 px-4 border-b border-border bg-zinc-100 dark:bg-zinc-900/50">
                                <Badge variant="secondary">Código</Badge>

                                <div className="text-sm">{formData.code}</div>
                            </div>

                            <div className="flex justify-between py-3 px-4 border-b border-border">
                                <Badge variant="secondary">Periodo</Badge>

                                <div className="text-sm">{formData.period}</div>
                            </div>

                            <div className="flex justify-between py-3 px-4 last:border-b-0 bg-zinc-100 dark:bg-zinc-900/50">
                                <Badge variant="secondary">Asignatura</Badge>

                                <div className="text-sm">{formData.subjectName}</div>
                            </div>
                        </div>
                    )}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isCreating && (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="period">Número Sección</Label>

                                <Input
                                    name        = "code"
                                    type        = "number"
                                    value       = { formData.code }
                                    onChange    = { handleChange }
                                />

                                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="period">Periodo</Label>
                                <Select value={formData.period} onValueChange={(value) => handleSelectChange("period", value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar periodo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {periods.map((period) => (
                                            <SelectItem key={period.id} value={period.id}>
                                                {period.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.period && <p className="text-sm text-destructive">{errors.period}</p>}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-3 grid-cols-2">
                        <div className={cn(
                            "space-y-1 col-span-2",
                            isCreating ? "col-span-1" : "col-span-2"
                        )}>
                            <Label htmlFor="roomId">Sala</Label>

                            <MultiSelectCombobox
                                placeholder         = "Seleccionar sala"
                                onSelectionChange   = {( value ) => handleSelectChange( "room", value as string )}
                                defaultValues       = { formData.room ? [formData.room] : [] }
                                isOpen              = { false }
                                multiple            = { false }
                                options             = { rooms.map(( room ) => ({
                                    label: `${room.name} (${getSpaceTypeName(room.type)}, ${room.size}, ${room.capacity})`,
                                    value: room.name
                                }))}
                            />

                            {errors.room && <p className="text-sm text-destructive">{errors.room}</p>}
                        </div>

                        {isCreating && (
                            <div className="space-y-1">
                                <Label htmlFor="roomId">Asignatura</Label>

                                <MultiSelectCombobox
                                    placeholder         = "Seleccionar asignatura"
                                    onSelectionChange   = {( value ) => handleSelectChange( "subjectId", value as string )}
                                    defaultValues       = { formData.subjectId ? [formData.subjectId] : [] }
                                    isOpen              = { false }
                                    multiple            = { false }
                                    options             = { subjects.map(( subject ) => ({
                                        label: `${subject.id} - ${subject.name}`,
                                        value: subject.id
                                    }))}
                                />

                                {errors.subjectId && <p className="text-sm text-destructive">{errors.subjectId}</p>}
                            </div>
                        )}

                        <div className="space-y-1">
                            <Label htmlFor="day">Día</Label>

                            <Select
                                value={formData.day.toString()}
                                onValueChange={(value) => handleSelectChange("day", Number.parseInt(value))}
                            >
                                <SelectTrigger id="day">
                                    <SelectValue placeholder="Seleccionar día" />
                                </SelectTrigger>

                                <SelectContent>
                                    {days.slice(0, 6).map((day) => (
                                        <SelectItem key={day.id} value={day.id.toString()}>
                                            {day.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.day && <p className="text-sm text-destructive">{errors.day}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="moduleId">Módulo</Label>

                            <Select value={formData.moduleId} onValueChange={(value) => handleSelectChange("moduleId", value)}>
                                <SelectTrigger id="moduleId">
                                    <SelectValue placeholder="Seleccionar módulo" />
                                </SelectTrigger>

                                <SelectContent>
                                    {dayModules.map((module) => (
                                        <SelectItem key={module.id} value={module.id.toString()}>
                                            {module.name} ({module.startHour}:{module.endHour})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.moduleId && <p className="text-sm text-destructive">{errors.moduleId}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="session">Sesión</Label>

                            <Select value={formData.session} onValueChange={(value) => handleSelectChange("session", value)}>
                                <SelectTrigger id="session">
                                    <SelectValue placeholder="Seleccionar sesión" />
                                </SelectTrigger>

                                <SelectContent>
                                    {SECTION_SESSION.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.session && <p className="text-sm text-destructive">{errors.session}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="period">Tamaño</Label>
                            <Select value={formData.size} onValueChange={(value) => handleSelectChange("size", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar tamaño" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sizes.map((size, index) => (
                                        <SelectItem key={`${size}-${index}`} value={size}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.size && <p className="text-sm text-destructive">{errors.size}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="period">Registrados corregidos</Label>

                            <Input
                                name        = "correctedRegistrants"
                                type        = "number"
                                value       = { formData.correctedRegistrants }
                                onChange    = { handleChange }
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="period">Registrados reales</Label>

                            <Input
                                name        = "realRegistrants"
                                type        = "number"
                                value       = { formData.realRegistrants }
                                onChange    = { handleChange }
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="plannedBuilding">Edificios planeados</Label>

                            <Select value={formData.plannedBuilding} onValueChange={(value) => handleSelectChange("plannedBuilding", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar edificio(s) planeado(s)" />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECTION_BUILDING_PLANNED.map((building) => (
                                        <SelectItem key={building.value} value={building.value}>
                                            {building.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="chairsAvailable">Sillas disponibles</Label>

                            <Input
                                name        = "chairsAvailable"
                                type        = "number"
                                value       = { formData.chairsAvailable?.toString() }
                                onChange    = { handleChange }
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="professor">Profesor</Label>

                        <MultiSelectCombobox
                            placeholder         = "Seleccionar profesor"
                            onSelectionChange   = {( value ) => handleSelectChange( "professorId", value as string )}
                            defaultValues       = { formData.professorId ? [formData.professorId] : [] }
                            isOpen              = { false }
                            multiple            = { false }
                            options             = { professors.map(( professor ) => ({
                                label: `${professor.id}-${professor.name}`,
                                value: professor.id
                            }))}
                        />
                    </div>

                    {errors.dayModule && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                            {errors.dayModule}
                        </div>
                    )}

                    <DialogFooter className={cn(
                        "grid sm:flex gap-2 w-full",
                        isCreating ? "sm:justify-end" : "sm:justify-between"
                    )}>
                        {!isCreating && (
                            <Button
                                type        = "button"
                                variant     = "destructive"
                                onClick     = { () => setDeleteModule( true )}
                                className   = "w-full sm:w-auto"
                                disabled    = { isLoading }
                            >
                                { isLoading && <LoaderMini /> }
                                Eliminar
                            </Button>
                        )}

                        <div className="grid sm:flex gap-2 sm:w-auto w-full">
                            <Button
                                type        = "button"
                                variant     = "outline"
                                onClick     = { onClose }
                                className   = "w-full sm:w-auto"
                                disabled    = { isLoading }
                            >
                                { isLoading && <LoaderMini /> }

                                Cancelar
                            </Button>

                            <Button
                                type        = "submit"
                                className   = "w-full sm:w-auto"
                                disabled    = { isLoading }
                            >
                                { isLoading && <LoaderMini /> }

                                Guardar
                            </Button>
                        </div>
                    </DialogFooter>
                </form>

                <DeleteConfirmDialog
                    isOpen      = { isDelete }
                    onClose     = { () => { setDeleteModule( false )}}
                    onConfirm   = { handleDelete }
                    name        = { 'Sección' }
                    type        = "la Sección"
                />
            </DialogContent>
        </Dialog>
    )
}
