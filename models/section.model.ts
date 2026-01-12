import { Difference } from "./module.model";
import { OfferModule, OfferSectionPeriod, OfferSectionSubject, Proffesor } from "./section-session.model";


export enum SessionType {
    C = 'C', // Cátedra
    A = 'A', // Ayudantía
    T = 'T', // Taller
    L = 'L'  // Laboratorio
}

export const sessionLabels = {
    [SessionType.C]: 'Cátedra',
    [SessionType.A]: 'Ayudantía',
    [SessionType.T]: 'Taller',
    [SessionType.L]: 'Laboratorio',
};

// Flattened interface from SectionSession for use in the application
export interface Section {
    // Session fields (from SessionSec)
    id              : string;           // Session ID
    spaceId         : string | null;
    isEnglish       : boolean;
    chairsAvailable : number;
    professor       : Proffesor | null;
    module          : OfferModule;
    date            : Date;
    dayId           : number;
    dayModuleId     : number;
    
    // Section parent fields (from SectionSession)
    sectionId       : string;           // Parent section ID
    code            : number;
    isClosed        : boolean;
    startDate       : Date;
    endDate         : Date;
    subject         : OfferSectionSubject;
    period          : OfferSectionPeriod;
    quota           : number;
    registered      : number;
    
    // Session name/type
    sessionName     : SessionType;      // The session enum value (C, A, T, L)
    
    // Computed/mapped fields for backward compatibility
    professorName   : string;           // = professor?.name || ''
    professorId     : string;           // = professor?.id || ''
    day             : number;           // = dayId
    moduleId        : string;           // = module.id
    subjectName     : string;           // = subject.name
    subjectId       : string;           // = subject.id
    session         : string;           // = sessionName.toString()
}


export interface SessionSec {
    id              : string;
    name            : SessionType;
    spaceId         : string | null;
    isEnglish       : boolean;
    chairsAvailable : number;
    professor       : Proffesor | null;
    module          : OfferModule;
    date            : Date;
    dayId           : number;
    dayModuleId     : number;
}


export interface SectionSession {
    id          : string;
    code        : number;
    isClosed    : boolean;
    startDate   : Date;
    endDate     : Date;
    subject     : OfferSectionSubject;
    period      : OfferSectionPeriod;
    quota       : number;
    registered  : number;
    session     : SessionSec;
}


export interface CreateSection {
    code                    : number;
    session                 : string;
    size                    : string;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    chairsAvailable         : number | null;
    professorId             : string;
    periodId                : string;
    subjectId               : string;
    dayModuleId             : number;
    roomId                  : string;
}


export interface UpdateSection {
    code?                   : number;
    session?                : string;
    size?                   : string;
    correctedRegistrants?   : number;
    realRegistrants?        : number;
    plannedBuilding?        : string;
    chairsAvailable?        : number | null;
    professorId?            : string;
    dayModuleId?            : number;
    roomId?                 : string;
}


