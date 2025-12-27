import { useQuery } from '@tanstack/react-query';

import { 
    Section as FlatSection 
} from '@/models/section.model';

import { 
    Section as ApiSection 
} from '@/models/section-session.model';

import { ENV } from '@/config/envs/env';


async function fetchSections(): Promise<FlatSection[]> {
    const API_URL   = `${ENV.REQUEST_BACK_URL}sections/sessions`;
    const response  = await fetch( API_URL );

    if ( !response.ok ) {
        throw new Error( `HTTP error! status: ${response.status}` );
    }

    const apiSections: ApiSection[] = await response.json();

    // Transform: flatMap Section[] (with sessions) to FlatSection[]
    const flatSections: FlatSection[] = apiSections.flatMap(section => 
        section.sessions.map(session => ({
            // Session fields
            id                      : session.id,
            spaceId                 : session.spaceId,
            isEnglish               : session.isEnglish,
            chairsAvailable         : session.chairsAvailable,
            correctedRegistrants    : session.correctedRegistrants,
            realRegistrants         : session.realRegistrants,
            plannedBuilding         : session.plannedBuilding,
            professor               : session.professor,
            module                  : session.module,
            date                    : session.date,
            dayId                   : session.dayId,
            dayModuleId             : session.dayModuleId,
            
            // Section parent fields
            code                    : section.code,
            isClosed                : section.isClosed,
            groupId                 : section.groupId,
            startDate               : section.startDate,
            endDate                 : section.endDate,
            building                : section.building,
            spaceSizeId             : section.spaceSizeId,
            spaceType               : section.spaceType,
            workshop                : section.workshop,
            lecture                 : section.lecture,
            tutoringSession         : section.tutoringSession,
            laboratory              : section.laboratory,
            subject                 : section.subject,
            period                  : section.period,
            quota                   : section.quota,
            registered              : section.registered,
            
            // Computed/mapped fields for backward compatibility
            room                    : session.spaceId,
            professorName           : session.professor?.name || '',
            professorId             : session.professor?.id || '',
            day                     : session.dayId,
            moduleId                : session.module.id,
            subjectName             : section.subject.name,
            subjectId               : section.subject.id,
            size                    : section.spaceSizeId || '',
            session                 : session.name?.toString() || session.id,
        }))
    );
    
    return flatSections;
}


interface UseSectionsReturn {
    sections        : FlatSection[];
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
