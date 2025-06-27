'use client'

import { useState } from 'react';

import { Calendar } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
}                   from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';

import ModuleCard       from '@/app/modules/ModuleCard';
import { useModules }   from '@/hooks/use-modules';
import { Module }       from '@/models/module.model';


export default function ModuleDay({
    day,
    days: days,
}: {
    day: number,
    days: string[]
}) {
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

    const getModulesForDay = ( dayId: number ) => modules
        .filter( module => module.dayId === dayId )
        .sort(( a, b ) => a.order - b.order );


    const dayModules = getModulesForDay( day );


    return (
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-center flex items-center justify-center gap-2">
                    {days[day - 1]}

                    <Badge variant="outline" className="ml-2">
                        {dayModules.length} módulos
                    </Badge>
                </CardTitle>
            </CardHeader>

            <CardContent className="p-2 h-[30rem] overflow-y-auto">
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
}
