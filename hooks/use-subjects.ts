"use client"

import { useState, useEffect } from 'react';

// import {
//     getSubjectsFromStorage,
//     saveSubjectsToStorage
// }                   from '@/lib/localStorage';
import { Subject }  from '@/lib/types';


const API_URL = 'http://localhost:3030/api/v1/subjects';

export interface UseSubjectsResult {
    subjects    : Subject[];
    loading     : boolean;
    error       : Error | null;
}

export function useSubjects(): UseSubjectsResult {
    const [subjects, setSubjects]   = useState<Subject[]>([]);
    const [loading, setLoading]     = useState<boolean>( true );
    const [error, setError]         = useState<Error | null>( null );

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoading( true );

            // const cachedSubjects  = getSubjectsFromStorage();

            // if ( cachedSubjects && cachedSubjects.length > 0 ) {
            //     setSubjects( cachedSubjects );
            //     setLoading( false );
            //     return;
            // }

            try {
                const response = await fetch( API_URL );

                if ( !response.ok ) {
                    throw new Error( `Error al obtener materias: ${response.status}` );
                }

                const data = await response.json();

                // saveSubjectsToStorage( data );
                setSubjects( data );
                setError( null );
            } catch ( err ) {
                console.error( 'Error al cargar las materias:', err );
                setError( err instanceof Error ? err : new Error( String( err )));
            } finally {
                setLoading( false );
            }
        };

        fetchSubjects();
    }, []);

    return { subjects, loading, error };
}