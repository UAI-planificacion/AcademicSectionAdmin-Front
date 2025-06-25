"use client"

import { useState, useEffect } from 'react';

import {
    getModuleOriginalsStorage,
    saveModuleOriginalsStorage
}                   from '@/stores/local-storage-module-original';
import { ModuleOriginal }   from '@/models/module.model';
import { ENV }      from '@/config/envs/env';


const API_URL = `${ENV.REQUEST_BACK_URL}modules/original`;


export interface UseModulesOriginalResult {
    modules : ModuleOriginal[];
    loading : boolean;
    error   : Error | null;
}


export function useModulesOriginal(): UseModulesOriginalResult {
    const [modules, setModules] = useState<ModuleOriginal[]>( [] );
    const [loading, setLoading] = useState<boolean>( true );
    const [error, setError]     = useState<Error | null>( null );

    useEffect( () => {
        ( async () => {
            try {
                const cachedModules = getModuleOriginalsStorage();

                if ( cachedModules.length > 0 ) {
                    setModules( cachedModules );
                    setLoading( false );
                    return;
                }

                setLoading( true );
                const response = await fetch( API_URL );

                if ( !response.ok ) {
                    setLoading( false );
                    setModules( [] );
                    setError( new Error( `Error al obtener módulos originales: ${response.status}` ));
                    return;
                }

                const data = await response.json();

                setModules( data );
                saveModuleOriginalsStorage( data );
                setError( null );
            } catch ( err ) {
                console.error( 'Error al cargar los módulos originales:', err );
                setError( err instanceof Error ? err : new Error( String( err )));
            } finally {
                setLoading( false );
            }
        })();
    }, []);

    return { modules, loading, error };
}
