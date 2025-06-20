"use client"

import { useState, useEffect } from 'react';

import {
    getPeriodsFromStorage,
    savePeriodsToStorage
}                   from '@/lib/localStorage';
import { Period }  from '@/lib/types';


export interface UsePeriodsResult {
    periods : Period[];
    loading : boolean;
    error   : Error | null;
}


const API_URL = 'http://localhost:3030/api/v1/periods';


export function usePeriods(): UsePeriodsResult {
    const [periods, setPeriods] = useState<Period[]>( [] );
    const [loading, setLoading] = useState<boolean>( true );
    const [error, setError]     = useState<Error | null>( null );

    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                setLoading( true );

                const cachedPeriods = getPeriodsFromStorage();

                if ( cachedPeriods && cachedPeriods.length > 0 ) {
                    setPeriods( cachedPeriods );
                    setLoading( false );
                    return;
                }

                const response = await fetch( API_URL );

                if ( !response.ok ) {
                    throw new Error( `Error al obtener períodos: ${response.status}` );
                }

                const data = await response.json();

                // Transform data to add label property
                const transformedData = data.map(( period: Omit<Period, 'label'> ) => ({
                    ...period,
                    label: `${period.id}-${period.name}`
                }));

                // Save to localStorage
                savePeriodsToStorage( transformedData );
                setPeriods( transformedData );
                setError( null );
            } catch (err) {
                console.error( 'Error al cargar los períodos:', err );
                setError( err instanceof Error ? err : new Error(String( err )));
            } finally {
                setLoading( false );
            }
        };

        fetchPeriods();
    }, []);

    return { periods, loading, error };
}
