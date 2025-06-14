"use client"

import { useState, useEffect } from 'react';
import { saveProfessorsToStorage } from '@/lib/localStorage';
import { Professor } from '@/lib/types';

export interface UseProfessorsResult {
    professors: Professor[];
    loading: boolean;
    error: Error | null;
}

export function useProfessors(): UseProfessorsResult {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchProfessors = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:3030/api/v1/professors');
                
                if (!response.ok) {
                    throw new Error(`Error al obtener profesores: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Save to localStorage
                saveProfessorsToStorage(data);
                
                setProfessors(data);
                setError(null);
            } catch (err) {
                console.error('Error al cargar los profesores:', err);
                setError(err instanceof Error ? err : new Error(String(err)));
            } finally {
                setLoading(false);
            }
        };

        fetchProfessors();
    }, []);

    return { professors, loading, error };
}