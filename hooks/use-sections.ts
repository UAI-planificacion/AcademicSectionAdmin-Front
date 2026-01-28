import { useQuery } from '@tanstack/react-query';

import { SectionSession, SessionType }  from '@/models/section.model';
import { Section as ApiSection }        from '@/models/section-session.model';

import { ENV }          from '@/config/envs/env';
import { KEY_QUERYS }   from '@/lib/key-queries';


async function fetchSections(periodId?: string): Promise<SectionSession[]> {
    // If no periodId is provided, return empty array
    if (!periodId) {
        return [];
    }

    const API_URL   = `${ENV.REQUEST_BACK_URL}sections/sessions?canConsecutiveId=true&periodId=${periodId}`;
    const response  = await fetch( API_URL );

    if ( !response.ok ) {
        throw new Error( `HTTP error! status: ${response.status}` );
    }

    const apiSections: ApiSection[] = await response.json();

    // Transform: flatMap Section[] (with sessions) to SectionSession[]
    const sectionSessions: SectionSession[] = apiSections.flatMap(apiSection => 
        apiSection.sessions.map( sessionItem => ({
            // Section parent fields
            id          : apiSection.id,
            code        : apiSection.code,
            isClosed    : apiSection.isClosed,
            startDate   : apiSection.startDate,
            endDate     : apiSection.endDate,
            subject     : apiSection.subject,
            period      : apiSection.period,
            quota       : apiSection.quota,
            registered  : apiSection.registered,

            // Nested session object
            session: {
                id              : sessionItem.id,
                name            : sessionItem.name as any as SessionType,
                spaceId         : sessionItem.spaceId,
                isEnglish       : sessionItem.isEnglish,
                chairsAvailable : sessionItem.chairsAvailable,
                professor       : sessionItem.professor,
                module          : sessionItem.module,
                date            : sessionItem.date,
                dayId           : sessionItem.dayId,
                dayModuleId     : sessionItem.dayModuleId,
                consecutiveId   : sessionItem.consecutiveId
            }
        }))
    );

    return sectionSessions;
}


interface UseSectionsReturn {
    sections        : SectionSession[];
    loading         : boolean;
    error           : Error | null;
    isLoading       : boolean;
    isError         : boolean;
    refetch         : () => void;
    refetchSections : () => void;
}

interface UseSectionsParams {
    periodId?: string;
}


export function useSections({ periodId }: UseSectionsParams = {}): UseSectionsReturn {
    const {
        data: sections = [],
        isLoading,
        error,
        isError,
        refetch
    } = useQuery({
        queryKey    : [KEY_QUERYS.SECTIONS, periodId],
        queryFn     : () => fetchSections(periodId),
        enabled     : !!periodId, // Only fetch when periodId is provided
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
