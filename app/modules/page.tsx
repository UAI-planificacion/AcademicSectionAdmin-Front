'use client'

import React, { useState } from 'react';

import { Plus, Calendar } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                               from '@/components/ui/card';
import { Button }               from '@/components/ui/button';
import { Badge }                from '@/components/ui/badge';
import { ModuleModal }          from '@/components/modules/ModuleModal';
import { DeleteConfirmDialog }  from '@/components/dialogs/DeleteConfirmDialog';
import ModuleCard               from '@/components/modules/ModuleCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useModules } from '@/hooks/use-modules';
import { Module } from '@/lib/types';
import TableModules from './table-modules';


const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];


export default function ModulesPage() {
    const { modules }                       = useModules();
    const [isModalOpen, setIsModalOpen]     = useState( false );
    const [editingModule, setEditingModule] = useState<Module | null>( null );
    const [deleteModule, setDeleteModule]   = useState<Module | null>( null );

    const handleAddModule = () => {
        setEditingModule( null );
        setIsModalOpen( true );
    };

    const handleEditModule = ( module: Module ) => {
        setEditingModule( module );
        setIsModalOpen( true );
    };

    const handleDeleteModule = ( module: Module ) => {
        setDeleteModule( module );
    };

    const confirmDelete = () => {
        if ( deleteModule ) {
            // setModules( modules.filter( m => m.id !== deleteModule.id ) );
            setDeleteModule(null);
        }
    };

    const handleSaveModule = (moduleData: Omit<Module, 'id'>) => {
        if (editingModule) {
        // Edit existing module
        // setModules(modules.map(m => 
        //     m.id === editingModule.id 
        //     ? { ...moduleData, id: editingModule.id }
        //     : m
        // ));
        } else {
        // Add new module
        // const newModule: Module = {
        //     ...moduleData,
        //     id: Date.now().toString(),
        // };
        // setModules([...modules, newModule]);
        }
        setIsModalOpen(false);
    };

    const getModulesForDay = (dayId: number) => {
        return modules
        .filter(module => module.dayId === dayId)
        .sort((a, b) => a.order - b.order);
    };

    const ModuleTable = ({ day }: { day: number }) => {
        const dayModules = getModulesForDay( day );

        return (
            <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                        {DAYS[day - 1]}

                        <Badge variant="outline" className="ml-2">
                            {dayModules.length} módulos
                        </Badge>
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-2 h-[31rem] overflow-y-auto">
                    {dayModules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
                            <Calendar className="h-12 w-12 mb-3 opacity-50" />

                            <p className="text-sm font-medium">No hay módulos</p>

                            <p className="text-xs opacity-70">programados para este día</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dayModules.map( module => (
                                <ModuleCard
                                    key                 = { module.id }
                                    module              = { module }
                                    handleEditModule    = { handleEditModule }
                                    handleDeleteModule  = { handleDeleteModule }
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto grid">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight">
                            Gestión de Módulos
                        </h1>
                    </div>

                    <Button 
                        onClick={handleAddModule} 
                        className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                    >
                        <Plus className="h-5 w-5" />
                        Agregar Módulo
                    </Button>
                </div>

                <Tabs defaultValue="table" className="">
                    <TabsList>
                        <TabsTrigger value="table">Tabla</TabsTrigger>
                        <TabsTrigger value="modules">Módulos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="table">
                        <TableModules />
                    </TabsContent>

                    <TabsContent value="modules">
                        <div className="grid grid-cols-3 grid-rows-2 gap-6 h-[calc(100vh-220px)]">
                            {DAYS.map((day, index) => (
                                <ModuleTable key={day} day={index + 1} />
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

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
