import { useQuery } from '@tanstack/react-query';

import { Section }  from '@/models/section.model';
import { ENV }      from '@/config/envs/env';


async function fetchSections(): Promise<Section[]> {
    const API_URL   = `${ENV.REQUEST_BACK_URL}Sections`;
    const response  = await fetch( API_URL );

    if ( !response.ok ) {
        throw new Error( `HTTP error! status: ${response.status}` );
    }

    return response.json();
}


interface UseSectionsReturn {
    sections        : Section[];
    loading         : boolean;
    error           : Error | null;
    isLoading       : boolean;
    isError         : boolean;
    refetch         : () => void;
    refetchSections : () => void;
}


export function useSections(): UseSectionsReturn {
    const {
        data: sections = [],
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : ['sections'],
        queryFn     : fetchSections,
    });

    return {
        sections,
        loading: isLoading,
        error: error as Error | null,
        isLoading,
        isError,
        refetch,
        refetchSections: refetch
    };
}
