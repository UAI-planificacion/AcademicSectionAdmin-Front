"use client"

import { useQuery } from '@tanstack/react-query';

import { Module }   from '@/models/module.model';
import { ENV }      from '@/config/envs/env';


async function fetchModules(): Promise<Module[]> {
    const API_URL   = `${ ENV.REQUEST_BACK_URL }modules`;
    const response  = await fetch( API_URL );

    if ( !response.ok ) {
        throw new Error( `Error al obtener módulos: ${ response.status }` );
    }

    return response.json();
}


export interface UseModulesResult {
    modules     : Module[];
    loading     : boolean;
    error       : Error | null;
    isLoading   : boolean;
    isError     : boolean;
    refetch     : () => void;
}


export function useModules(): UseModulesResult {
    const {
        data: modules = [],
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : ['modules'],
        queryFn     : fetchModules,
    });

    return {
        modules,
        loading : isLoading,
        error   : error as Error | null,
        isLoading,
        isError,
        refetch
    };
}

// Función para obtener los módulos de un día específico
export const getModulesForDay = (
    modules : Module[],
    dayId   : number
): Module[] => modules
    .filter(( module: Module ) => module.dayId === dayId )
    .sort(( a: Module, b: Module ) => a.order - b.order );
