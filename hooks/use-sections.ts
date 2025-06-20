import { useState, useEffect, useCallback } from 'react';

import { Section } from '@/models/section.model';

const API_URL = 'http://localhost:3030/api/v1/sections';

interface UseSectionsReturn {
    sections: Section[];
    loading: boolean;
    error: Error | null;
    refetchSections: () => Promise<void>;
}

export function useSections(): UseSectionsReturn {
    const [sections, setSections]   = useState<Section[]>( [] );
    const [loading, setLoading]     = useState<boolean>( true );
    const [error, setError]         = useState<Error | null>( null );

    const fetchSections = useCallback(async () => {
        setLoading( true );
        setError( null );

        try {
            const response = await fetch( API_URL );

            if ( !response.ok ) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: Section[] = await response.json();

            setSections( data );
        } catch ( e ) {
            if ( e instanceof Error ) {
                setError( e );
            } else {
                setError( new Error( 'An unknown error occurred' ));
            }
        } finally {
            setLoading( false );
        }
    }, []);

    useEffect(() => {
        fetchSections();
    }, [fetchSections]);

    return { sections, loading, error, refetchSections: fetchSections };
}
