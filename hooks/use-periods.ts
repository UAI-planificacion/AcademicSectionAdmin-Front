"use client"

import { useState, useEffect } from 'react';

import {
    getPeriodsStorage,
    savePeriodsStorage
} from '@/stores/local-storage-periods';

import { Period }   from '@/lib/types';
import { ENV }      from '@/config/envs/env';


export interface UsePeriodsResult {
    periods : Period[];
    loading : boolean;
    error   : Error | null;
}


const API_URL = `${ENV.REQUEST_BACK_URL}periods`;

/**
 * Format a date to DD/MM/YYYY
 */
function formatPeriodDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}


export function usePeriods(): UsePeriodsResult {
    const [periods, setPeriods] = useState<Period[]>( [] );
    const [loading, setLoading] = useState<boolean>( true );
    const [error, setError]     = useState<Error | null>( null );

    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                setLoading( true );

                const cachedPeriods = getPeriodsStorage();

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

                // Transform data to add label property with date range
                const transformedData = data.map(( period: Omit<Period, 'label'> ) => ({
                    ...period,
                    label: `${period.id}-${period.name} (${formatPeriodDate(period.startDate)}-${formatPeriodDate(period.endDate)})`
                })).sort(( a: Period, b: Period ) => {
                    const nameComparison = a.name.localeCompare( b.name );

                    if ( nameComparison !== 0 ) {
                        return nameComparison;
                    }

                    return new Date( b.startDate ).getTime() - new Date( a.startDate ).getTime();
                });

                // Save to localStorage
                savePeriodsStorage( transformedData );
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
