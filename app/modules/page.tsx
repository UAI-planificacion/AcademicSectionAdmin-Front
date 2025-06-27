'use client'

import React, { useEffect, useState } from 'react';

import { Plus } from 'lucide-react';

import TableModules from '@/app/modules/table-modules';
import ModuleDay    from '@/app/modules/module-day';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                       from "@/components/ui/tabs";
import { Button }       from '@/components/ui/button';
import { ModuleModal }  from '@/app/modules/ModuleModal';

import { useModulesOriginal }   from '@/hooks/use-modules-original';
import { useModules }           from '@/hooks/use-modules';

import { ModuleOriginal } from '@/models/module.model';
import type { Module } from '@/models/module.model';
import { AddModuleModal } from './add-module-modal';


const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];


export default function ModulesPage() {
    const { modules: modulesOriginal }      = useModulesOriginal();
    const { modules }                       = useModules();
    const [isModalOpen, setIsModalOpen]     = useState( false );
    const [modulesData, setModulesData]     = useState<ModuleOriginal[]>( [] );
    const [editingModule, setEditingModule] = useState<ModuleOriginal | null>( null );

    const handleAddModule = () => {
        setEditingModule(null);
        setIsModalOpen(true);
    };


    useEffect(() => {
        if ( modulesOriginal && modulesOriginal.length > 0 )
            setModulesData( modulesOriginal );
    }, [ modulesOriginal ]);


    // const handleAddModule = (module: ModuleOriginal) => {
    //     setModulesData([...modulesData, module])
    // }


    const handleUpdateModule = (updatedModule: ModuleOriginal) => {
        setModulesData(modulesData.map((module) => (module.id === updatedModule.id ? updatedModule : module)))
    }


    // const handleSaveModule = (moduleData: Omit<Module, 'id'>) => {
    // const handleSaveModule = (moduleData: ModuleOriginal) => {
    const handleSaveModule = () => {
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


    return (
        <main className="container mx-auto py-10">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    Gestión de Módulos
                </h1>

                <Button 
                    onClick={handleAddModule} 
                    className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                >
                    <Plus className="h-5 w-5" />
                    Agregar Módulo
                </Button>
            </header>

            <Tabs defaultValue="table">
                <TabsList>
                    <TabsTrigger value="table">Tabla</TabsTrigger>

                    <TabsTrigger value="modules">Módulos</TabsTrigger>
                </TabsList>

                <TabsContent value="table">
                    <TableModules modules={ modulesData }/>
                </TabsContent>

                <TabsContent value="modules">
                    <div className="grid grid-cols-3 grid-rows-2 gap-6 h-full">
                        {days.map((day, index) => (
                            <ModuleDay key={day} day={index + 1} days={days} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            <AddModuleModal
                isOpen  = { isModalOpen }
                onClose = { () => setIsModalOpen( false )}
                onSave  = { handleSaveModule }
            />
        </main>
    );
}
