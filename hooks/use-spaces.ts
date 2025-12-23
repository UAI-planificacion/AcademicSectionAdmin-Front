import { useState, useEffect, useCallback } from 'react';

import {
    saveSpacesStorage,
    getSpacesStorage
}                   from '@/stores/local-storage-spaces';
import { Space }    from '@/lib/types';
import { ENV }      from '@/config/envs/env';

// const API_URL = `${ENV.REQUEST_BACK_URL}spaces`;
const API_URL = `${ENV.REQUEST_BACK_URL}spaces`;

interface UseSpacesReturn {
    spaces          : Space[];
    loading         : boolean;
    error           : Error | null;
    refetchSpaces   : () => Promise<void>;
}

export function useSpaces(): UseSpacesReturn {
    const [spaces, setSpaces]   = useState<Space[]>([]);
    const [loading, setLoading] = useState<boolean>( true );
    const [error, setError]     = useState<Error | null>( null );

    const fetchSpaces = useCallback( async () => {
        setLoading( true );
        setError( null );

        const cachedRooms = getSpacesStorage();

        if ( cachedRooms && cachedRooms.length > 0 ) {
            setSpaces( cachedRooms );
            setLoading( false );
            return;
        }

        try {
            const response = await fetch( API_URL );

            if ( !response.ok ) {
                throw new Error( `HTTP error! status: ${ response.status }` );
            }

            const data: Space[] = await response.json();

            setSpaces( data );
            saveSpacesStorage( data );
        } catch ( e ) {
            if ( e instanceof Error ) {
                setError( e );
            } else {
                setError( new Error( 'An unknown error occurred' ));
            }
        } finally {
            setLoading( false );
        }
    }, [] );

    useEffect( () => {
        fetchSpaces();
    }, [ fetchSpaces ]);

    return { spaces, loading, error, refetchSpaces: fetchSpaces };
}
