// Hybrid interface combining Section parent data with Session data
export interface Section {
    // Session fields (from new model)
    id                      : string;
    spaceId                 : string | null;  // maps to 'room' in old model
    isEnglish               : boolean;
    chairsAvailable         : number;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    professor               : {
        id      : string;
        name    : string;
    } | null;
    module                  : {
        id          : string;
        code        : string;
        name        : string;
        startHour   : string;
        endHour     : string;
        difference  : 'A' | 'B' | null;
    };
    date                    : Date;
    dayId                   : number;  // maps to 'day' in old model
    dayModuleId             : number;
    
    // Section parent fields
    code                    : number;
    isClosed                : boolean;
    groupId                 : string;
    startDate               : Date;
    endDate                 : Date;
    building                : string | null;
    spaceSizeId             : string | null;
    spaceType               : string | null;
    workshop                : number;
    lecture                 : number;
    tutoringSession         : number;
    laboratory              : number;
    subject                 : {
        id      : string;
        name    : string;
    };
    period                  : {
        id          : string;
        name        : string;
        startDate   : Date;
        endDate     : Date;
    };
    quota                   : number;
    registered              : number;
    
    // Computed/mapped fields for backward compatibility
    room                    : string;  // = spaceId
    professorName           : string;  // = professor?.name || ''
    professorId             : string;  // = professor?.id || ''
    day                     : number;  // = dayId
    moduleId                : string;  // = module.id
    subjectName             : string;  // = subject.name
    subjectId               : string;  // = subject.id
    size                    : string;  // = spaceSizeId || ''
    session                 : string;  // session name/identifier
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


export enum Session {
    C = 'C', // Cátedra
    A = 'A', // Ayudantía
    T = 'T', // Taller
    L = 'L'  // Laboratorio
}