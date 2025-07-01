"use client"

import { useQuery } from '@tanstack/react-query';

import { Professor } from '@/lib/types';
import { ENV } from '@/config/envs/env';


async function fetchProfessors(): Promise<Professor[]> {
    const API_URL   = `${ENV.REQUEST_BACK_URL}professors`;
    const response  = await fetch( API_URL );

    if ( !response.ok ) {
        throw new Error( `Error al obtener profesores: ${response.status}` );
    }

    return response.json();
}


export interface UseProfessorsResult {
    professors  : Professor[];
    loading     : boolean;
    error       : Error | null;
    isLoading   : boolean;
    isError     : boolean;
    refetch     : () => void;
}


export function useProfessors(): UseProfessorsResult {
    const {
        data: professors = [],
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : ['professors'],
        queryFn     : fetchProfessors,
    });

    return {
        professors,
        loading: isLoading,
        error: error as Error | null,
        isLoading,
        isError,
        refetch
    };
}
