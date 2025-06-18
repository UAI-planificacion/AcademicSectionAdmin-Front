'use client'

import React, { useState } from 'react';

import { Plus, Edit, Trash2, Clock, Hash, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModuleModal } from '@/components/modules/ModuleModal';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';


export interface Module {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    difference: string; // A-Z
    day: string;
    order: number;
    code: string;
    isActive: boolean;
}


const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];


const initialModules: Module[] = [
    {
        id: '1',
        name: 'M1:1-A',
        startTime: '08:00',
        endTime: '09:30',
        difference: 'A',
        day: 'Lunes',
        order: 1,
        code: '1',
        isActive: true,
    },
    {
        id: '2',
        name: 'M2:1-B',
        startTime: '09:45',
        endTime: '11:15',
        difference: 'B',
        day: 'Lunes',
        order: 2,
        code: '2',
        isActive: true,
    },
    {
        id: '3',
        name: 'M3:2-A',
        startTime: '08:00',
        endTime: '09:30',
        difference: 'A',
        day: 'Martes',
        order: 1,
        code: '3',
        isActive: false,
    },
    {
        id: '4',
        name: 'M4:3-C',
        startTime: '10:00',
        endTime: '11:30',
        difference: 'C',
        day: 'Miércoles',
        order: 1,
        code: '4',
        isActive: true,
    },
];


export default function ModulesPage() {
    const [modules, setModules] = useState<Module[]>(initialModules);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [deleteModule, setDeleteModule] = useState<Module | null>(null);

    const handleAddModule = () => {
        setEditingModule(null);
        setIsModalOpen(true);
    };

    const handleEditModule = (module: Module) => {
        setEditingModule(module);
        setIsModalOpen(true);
    };

    const handleDeleteModule = (module: Module) => {
        setDeleteModule(module);
    };

    const confirmDelete = () => {
        if (deleteModule) {
        setModules(modules.filter(m => m.id !== deleteModule.id));
        setDeleteModule(null);
        }
    };

    const handleSaveModule = (moduleData: Omit<Module, 'id'>) => {
        if (editingModule) {
        // Edit existing module
        setModules(modules.map(m => 
            m.id === editingModule.id 
            ? { ...moduleData, id: editingModule.id }
            : m
        ));
        } else {
        // Add new module
        const newModule: Module = {
            ...moduleData,
            id: Date.now().toString(),
        };
        setModules([...modules, newModule]);
        }
        setIsModalOpen(false);
    };

    const getModulesForDay = (day: string) => {
        return modules
        .filter(module => module.day === day)
        .sort((a, b) => a.order - b.order);
    };

    const getDayIcon = (day: string) => {
        const icons = {
        'Lunes': '🌅',
        'Martes': '⚡',
        'Miércoles': '🎯',
        'Jueves': '🚀',
        'Viernes': '🎉',
        'Sábado': '🌟',
        };
        return icons[day as keyof typeof icons] || '📅';
    };

    const ModuleTable = ({ day }: { day: string }) => {
        const dayModules = getModulesForDay(day);
        const dayIcon = getDayIcon(day);

        return (
        <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                <span className="text-xl">{dayIcon}</span>
                {day}
                <Badge variant="outline" className="ml-2">
                {dayModules.length} módulos
                </Badge>
            </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
            <div className="min-h-[280px]">
                {dayModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
                    <Calendar className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-sm font-medium">No hay módulos</p>
                    <p className="text-xs opacity-70">programados para este día</p>
                </div>
                ) : (
                <div className="space-y-3">
                    {dayModules.map((module, index) => (
                    <div
                        key={module.id}
                        className="group relative bg-card rounded-xl p-4 border hover:bg-accent/50 hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                    >
                        {/* Status indicator */}
                        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                        module.isActive ? 'bg-green-500 shadow-lg' : 'bg-muted-foreground/50'
                        }`} />
                        
                        {/* Module header */}
                        <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1 font-mono tracking-wide">
                            {module.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm">
                            <Badge variant={module.isActive ? "default" : "secondary"} className="text-xs px-2 py-1">
                                {module.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                            <span className="bg-muted px-2 py-1 rounded-md font-mono text-xs">
                                Orden: {module.order}
                            </span>
                            </div>
                        </div>
                        </div>

                        {/* Module details */}
                        <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-primary" />
                            <span className="font-semibold">
                            {module.startTime} - {module.endTime}
                            </span>
                            <div className="ml-auto flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">Diferencia:</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded-md font-bold">
                                {module.difference}
                            </span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                            <Hash className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Código:</span>
                            <span className="font-mono bg-muted px-2 py-1 rounded-md font-semibold">
                            {module.code}
                            </span>
                        </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditModule(module)}
                            className="flex-1 h-8 text-xs"
                        >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(module)}
                            className="flex-1 h-8 text-xs text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                        </Button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            </CardContent>
        </Card>
        );
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">
                            Gestión de Módulos
                        </h1>

                        <p className="text-muted-foreground text-lg">
                            Administra los módulos de horarios organizados por día de la semana
                        </p>
                    </div>

                    <Button 
                        onClick={handleAddModule} 
                        className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                    >
                        <Plus className="h-5 w-5" />
                        Agregar Módulo
                    </Button>
                </div>

                {/* Module tables grid */}
                <div className="grid grid-cols-3 grid-rows-2 gap-6 h-[calc(100vh-220px)]">
                    {DAYS.map((day) => (
                        <ModuleTable key={day} day={day} />
                    ))}
                </div>

                {/* Modals */}
                <ModuleModal
                    isOpen  = { isModalOpen }
                    onClose = { () => setIsModalOpen( false )}
                    onSave  = { handleSaveModule }
                    module  = { editingModule }
                />

                <DeleteConfirmDialog
                    isOpen      = { !!deleteModule }
                    onClose     = { () => setDeleteModule( null )}
                    onConfirm   = { confirmDelete }
                    name        = { deleteModule?.name || '' }
                    type        = "el Módulo"
                />
            </div>
        </div>
    );
}