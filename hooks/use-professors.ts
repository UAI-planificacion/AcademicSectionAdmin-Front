"use client"

import { useState, useEffect } from 'react';

import { getProfessorsFromStorage, saveProfessorsToStorage } from '@/lib/localStorage';
import { Professor } from '@/lib/types';


const API_URL = 'http://localhost:3030/api/v1/professors';

export interface UseProfessorsResult {
    professors: Professor[];
    loading: boolean;
    error: Error | null;
}


export function useProfessors(): UseProfessorsResult {
    const [professors, setProfessors]   = useState<Professor[]>( [] );
    const [loading, setLoading]         = useState<boolean>( true );
    const [error, setError]             = useState<Error | null>( null );

    useEffect(() => {
        const fetchProfessors = async () => {
            setLoading( true );

            const cachedProfessors = getProfessorsFromStorage();

            if ( cachedProfessors && cachedProfessors.length > 0 ) {
                setProfessors( cachedProfessors );
                setLoading( false );
                return;
            }

            try {
                const response = await fetch( API_URL );

                if ( !response.ok ) {
                    throw new Error( `Error al obtener profesores: ${response.status}` );
                }

                const data = await response.json();

                saveProfessorsToStorage( data );
                setProfessors( data );
                setError( null );
            } catch ( err ) {
                console.error( 'Error al cargar los profesores:', err );
                setError( err instanceof Error ? err : new Error( String( err )));
            } finally {
                setLoading( false );
            }
        };

        fetchProfessors();
    }, []);

    return { professors, loading, error };
}