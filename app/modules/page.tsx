'use client'

import React, { useEffect, useState } from 'react';

import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import TableModules         from '@/app/modules/table-modules';
import ModuleDay            from '@/app/modules/module-day';
import { AddModuleModal }   from '@/app/modules/add-module-modal';

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
}                   from "@/components/ui/tabs";
import { Button }   from '@/components/ui/button';

import { useModulesOriginal }   from '@/hooks/use-modules-original';
import { useModules }           from '@/hooks/use-modules';

import { ModuleOriginal }   from '@/models/module.model';
import type { Module }      from '@/models/module.model';

import { errorToast }   from '@/config/toast/toast.config';
import { ENV }          from '@/config/envs/env';

import { fetchApi } from '@/services/fetch';
import LoaderMini   from '@/icons/LoaderMini';
import { useDays }  from '@/hooks/use-days';
import { saveModuleOriginalsStorage } from '@/stores/local-storage-module-original';


export default function ModulesPage() {
    const { modules: modulesOriginal }  = useModulesOriginal();
    const [modulesData, setModulesData] = useState<ModuleOriginal[]>( [] );

    const { modules }                   = useModules();
    const [moduleDays, setModuleDays]   = useState<Module[]>( [] );

    const [isModalOpen, setIsModalOpen] = useState( false );
    const [isLoading, setIsLoading]     = useState( false );

    const { days }      = useDays();
    const availableDays = days.map( day => day.id - 1 );


    useEffect(() => {
        if ( modulesOriginal && modulesOriginal.length > 0 )
            setModulesData( modulesOriginal );
    }, [ modulesOriginal ]);


    useEffect(() => {
        if ( modules && modules.length > 0 )
            setModuleDays( modules );
    }, [ modules ]);


    async function handleSaveModule( moduleData: ModuleOriginal[] ): Promise<void> {
        setIsModalOpen( false );
        setIsLoading( true );
        setModulesData( [] );
        setModulesData( moduleData );
        saveModuleOriginalsStorage( moduleData );

        try {
            const url           = `${ENV.REQUEST_BACK_URL}modules`;
            const modulesSave   = await fetchApi<Module[]>( url, "GET" );

            if ( !modulesSave || modulesSave.length === 0 ) {
                toast( 'Error al obtener los módulos', errorToast );
                return;
            }

            setModuleDays( modulesSave );
        } catch (error) {
            toast( 'Error al obtener los módulos', errorToast );
        } finally {
            setIsLoading( false );
        }
    };


    return (
        <main className="container mx-auto py-10">
            <header className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    Gestión de Módulos
                </h1>

                <Button 
                    onClick={ () => setIsModalOpen( true )} 
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
                    <TableModules
                        modules = { modulesData }
                        onSave  = { handleSaveModule }
                        days    = { availableDays }
                    />
                </TabsContent>

                <TabsContent value="modules">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-6 h-full">
                        {isLoading && (
                            availableDays.map( _ => (
                                <div className='h-[30rem] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center'>
                                    <LoaderMini />
                                </div>
                            ))
                        )}

                        {!isLoading && (
                            days.map(( day, index ) => (
                                <ModuleDay
                                    key     = { day.id }
                                    day     = { index + 1 }
                                    days    = { days.map(( day ) => day.name) }
                                    modules = { moduleDays }
                                />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <AddModuleModal
                isOpen  = { isModalOpen }
                onClose = { () => setIsModalOpen( false )}
                onSave  = { handleSaveModule }
                days    = { availableDays }
            />
        </main>
    );
}
