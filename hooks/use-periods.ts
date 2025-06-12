"use client"

import { useState, useEffect } from 'react';
import { savePeriodsToStorage } from '@/lib/localStorage';
import { Periods } from '@/lib/types';

export interface UsePeriodsResult {
    periods: Periods[];
    loading: boolean;
    error: Error | null;
}

export function usePeriods(): UsePeriodsResult {
    const [periods, setPeriods] = useState<Periods[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3030/api/v1/periods');
                
                if (!response.ok) {
                    throw new Error(`Error al obtener períodos: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Transform data to add label property
                const transformedData = data.map((period: Omit<Periods, 'label'>) => ({
                    ...period,
                    label: `${period.id}-${period.name}`
                }));
                
                // Save to localStorage
                savePeriodsToStorage(transformedData);
                
                setPeriods(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error al cargar los períodos:', err);
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        };

        fetchPeriods();
    }, []);

    return { periods, loading, error };
}
