"use client"

import { useState, useEffect } from 'react';

import { Module } from '@/models/module.model';


const API_URL = 'http://localhost:3030/api/v1/modules'
export interface UseModulesResult {
    modules: Module[];
    loading: boolean;
    error: Error | null;
}

export function useModules(): UseModulesResult {
    const [modules, setModules] = useState<Module[]>( [] );
    const [loading, setLoading] = useState<boolean>( true );
    const [error, setError]     = useState<Error | null>( null );

    useEffect( () => {
        const fetchModules = async () => {
            try {
                setLoading( true );
                const response = await fetch( API_URL );

                if ( !response.ok ) {
                    throw new Error( `Error al obtener módulos: ${response.status}` );
                }

                const data = await response.json();

                setModules( data );
                setError( null );
            } catch ( err ) {
                console.error( 'Error al cargar los módulos:', err );
                setError( err instanceof Error ? err : new Error( String( err )));
            } finally {
                setLoading( false );
            }
        };

        fetchModules();
    }, []);

    return { modules, loading, error };
}

// Función para obtener los módulos de un día específico
export const getModulesForDay = (
    modules : Module[],
    dayId   : number
): Module[] => modules
    .filter(( module: Module ) => module.dayId === dayId )
    .sort(( a: Module, b: Module ) => a.order - b.order );