"use client"

import { useState, useEffect } from 'react';
import { Sizes } from '@/lib/types';
import { saveSizesToStorage } from '@/lib/localStorage';

export interface UseSizesResult {
    sizes: Sizes[];
    loading: boolean;
    error: Error | null;
}

export function useSizes(): UseSizesResult {
    const [sizes, setSizes] = useState<Sizes[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchSizes = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3030/api/v1/sizes');
                
                if (!response.ok) {
                    throw new Error(`Error al obtener tallas: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Transform data to add label property
                const transformedData = data.map((size: Omit<Sizes, 'label'>) => ({
                    ...size,
                    label: `${size.id} (${size.detail})`
                }));
                
                // Save to localStorage
                saveSizesToStorage(transformedData);
                
                setSizes(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error al cargar las tallas:', err);
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        };

        fetchSizes();
    }, []);

    return { sizes, loading, error };
}
