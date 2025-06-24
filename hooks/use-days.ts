import { useState, useEffect, useCallback } from 'react';

import {
    getDaysStorage,
    saveDaysStorage
}               from '@/stores/local-storage-days';
import { Day }  from '@/lib/types';


const API_URL = 'http://localhost:3030/api/v1/days';

interface UseDaysReturn {
    days        : Day[];
    loading     : boolean;
    error       : Error | null;
    refetchDays : () => Promise<void>;
}


export function useDays(): UseDaysReturn {
    const [days, setDays]       = useState<Day[]>( [] );
    const [loading, setLoading] = useState<boolean>( true );
    const [error, setError]     = useState<Error | null>( null );

    const fetchDays = useCallback( async () => {
        setLoading( true );
        setError( null );

        const cachedDays = getDaysStorage();

        if ( cachedDays && cachedDays.length > 0 ) {
            setDays( cachedDays );
            setLoading( false );
            return;
        }

        try {
            const response = await fetch( API_URL );

            if ( !response.ok ) {
                throw new Error( `HTTP error! status: ${response.status}` );
            }

            const data: Day[] = await response.json();

            setDays( data );
            saveDaysStorage( data );
            setError( null );
        } catch ( e ) {
            if ( e instanceof Error ) {
                setError( e );
            } else {
                setError( new Error( 'An unknown error occurred' ) );
            }
        } finally {
            setLoading( false );
        }
    }, []);

    useEffect( () => {
        fetchDays();
    }, [fetchDays] );

    return { days, loading, error, refetchDays: fetchDays };
}
