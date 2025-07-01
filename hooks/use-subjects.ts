"use client"

import { useQuery } from '@tanstack/react-query';

import { Subject } from '@/lib/types';
import { ENV } from '@/config/envs/env';


async function fetchSubjects(): Promise<Subject[]> {
    const API_URL   = `${ENV.REQUEST_BACK_URL}subjects`;
    const response  = await fetch( API_URL );

    if ( !response.ok ) {
        throw new Error( `Error al obtener materias: ${response.status}` );
    }

    return response.json();
}


export interface UseSubjectsResult {
    subjects    : Subject[];
    loading     : boolean;
    error       : Error | null;
    isLoading   : boolean;
    isError     : boolean;
    refetch     : () => void;
}


export function useSubjects(): UseSubjectsResult {
    const {
        data: subjects = [],
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : ['subjects'],
        queryFn     : fetchSubjects,
    });

    return {
        subjects,
        loading: isLoading,
        error: error as Error | null,
        isLoading,
        isError,
        refetch
    };
}