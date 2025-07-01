"use client"

import { useQuery } from '@tanstack/react-query';

import { ModuleOriginal } from '@/models/module.model';
import { ENV } from '@/config/envs/env';


async function fetchModulesOriginal(): Promise<ModuleOriginal[]> {
    const API_URL   = `${ENV.REQUEST_BACK_URL}modules/original`;
    const response  = await fetch( API_URL );

    if ( !response.ok ) {
        throw new Error( `Error al obtener módulos originales: ${response.status}` );
    }

    return response.json();
}


export interface UseModulesOriginalResult {
    modules     : ModuleOriginal[];
    loading     : boolean;
    error       : Error | null;
    isLoading   : boolean;
    isError     : boolean;
    refetch     : () => void;
}


export function useModulesOriginal(): UseModulesOriginalResult {
    const {
        data: modules = [],
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : ['modules-original'],
        queryFn     : fetchModulesOriginal,
    });

    return {
        modules,
        loading: isLoading,
        error: error as Error | null,
        isLoading,
        isError,
        refetch
    };
}
