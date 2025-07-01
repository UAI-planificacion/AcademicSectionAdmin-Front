"use client"

import { useState, useEffect } from 'react';

import {
    getSizesStorage,
    saveSizesStorage
}                   from '@/stores/local-storage-sizes';
import { Size, Sizes }    from '@/models/size.model';
import { ENV }      from '@/config/envs/env';


const API_URL = `${ENV.REQUEST_BACK_URL}sizes`;


export interface UseSizesResult {
    sizes   : Sizes[];
    loading : boolean;
    error   : Error | null;
}

export function useSizes(): UseSizesResult {
    const [sizes, setSizes]     = useState<Sizes[]>( [] );
    const [loading, setLoading] = useState<boolean>( true );
    const [error, setError]     = useState<Error | null>( null );

    useEffect(() => {
        const fetchSizes = async () => {
            setLoading( true );
            setError( null );

            const cachedSizes = getSizesStorage();
            console.log('🚀 ~ file: use-sizes.ts:34 ~ cachedSizes:', cachedSizes)

            if ( cachedSizes && cachedSizes.length > 0 ) {
                setSizes( cachedSizes );
                setLoading( false );
                return;
            }

            try {
                const response = await fetch( API_URL );

                if ( !response.ok ) {
                    throw new Error('Error al obtener tallas');
                }

                const data: Size[] = await response.json();

                const transformedData = data.map((size: Size) => {
                    // Calcular el orden basado en el rango de capacidad
                    let order = 0;
                    
                    switch (size.id) {
                        case 'XS':
                            order = 1; // < 30
                            break;
                        case 'S':
                            order = 2; // 30 - 39
                            break;
                        case 'MS':
                            order = 3; // 40 - 49
                            break;
                        case 'M':
                            order = 4; // 50 - 59
                            break;
                        case 'L':
                            order = 5; // 60 - 69
                            break;
                        case 'XL':
                            order = 6; // > 70
                            break;
                        default:
                            order = 0;
                    }
                    
                    return {
                        ...size,
                        label: `${size.id} (${size.detail})`,
                        order
                    };
                });

                saveSizesStorage( transformedData );
                setSizes( transformedData );
                setError( null );
            } catch ( err ) {
                setError( err instanceof Error ? err : new Error( String( err ) ) );
            } finally {
                setLoading( false );
            }
        };

        fetchSizes();
    }, []);

    return { sizes, loading, error };
}
