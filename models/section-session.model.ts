export enum BuildingEnum {
    PREGRADO_A    = 'PREGRADO_A',
    PREGRADO_B    = 'PREGRADO_B',
    POSTGRADO_C   = 'POSTGRADO_C',
    TALLERES_D    = 'TALLERES_D',
    TALLERES_E    = 'TALLERES_E',
    PREGRADO_F    = 'PREGRADO_F',
    ERRAZURIZ     = 'ERRAZURIZ',
    VITACURA      = 'VITACURA',
    VINA_A        = 'VINA_A',
    VINA_B        = 'VINA_B',
    VINA_C        = 'VINA_C',
    VINA_D        = 'VINA_D',
    VINA_E        = 'VINA_E',
    VINA_F        = 'VINA_F',
    Z             = 'Z'
}


export enum SpaceType {
    ROOM                = "ROOM",
    AUDITORIO           = "AUDITORIO",
    LAB                 = "LAB",
    LABPC               = "LABPC",
    DIS                 = "DIS",
    CORE                = "CORE",
    STUDY_ROOM          = "STUDY_ROOM",
    MEETING_ROOM        = "MEETING_ROOM",
    POSTGRADUATE_ROOM   = "POSTGRADUATE_ROOM",
    MULTIPURPOSE        = "MULTIPURPOSE"
}

export enum Status {
    PENDING     = "PENDING",
    APPROVED    = "APPROVED",
    REJECTED    = "REJECTED",
    REVIEWING   = "REVIEWING",
}



export enum Size {
    XS  = "XS",
    XE  = "XE",
    S   = "S",
    SE  = "SE",
    MS  = "MS",
    M   = "M",
    L   = "L",
    XL  = "XL",
    XXL = "XXL",
}


interface Proffesor {
    id  : string;
    name: string;
}


export interface OfferSectionSubject {
    id  : string;
    name: string;
}


export interface OfferSectionPeriod {
    id          : string;
    name        : string;
    startDate   : Date;
    endDate     : Date;
    openingDate : Date | null;
    closingDate : Date | null;
}


interface OfferModule {
    id          : string;
    code        : string;
    name        : string;
    startHour   : string;
    endHour     : string;
    difference   : 'A' | 'B' | null;
}


export enum Role {
    ADMIN           = 'ADMIN',
    ADMIN_FACULTY   = 'ADMIN_FACULTY',
    EDITOR          = 'EDITOR',
    VIEWER          = 'VIEWER',
}


interface Staff {
    id          : string;
    name        : string;
    email       : string;
    role        : Role;
    facultyId   : string;
}


// interface SectionSeccionPlanningChange {
//     id          : string;
//     code        : number,
//     startDate   : Date;
//     endDate     : Date;
//     subject     : OfferSectionSubject
//     building    : BuildingEnum | null;
// }


interface Module {
    id          : number;
    code        : string;
    difference  : string | null;
    startHour   : string;
    endHour     : string;
    isActive    : boolean;
    createdAt   : string;
    updatedAt   : string;
    name        : string;
    days        : number[];
}


interface SpaceSize {
    id          : string;
    detail      : string;
}


interface SessionDayModule {
    id      : string;
    dayId   : number;
    module  : Module;
}


interface RequestSessionDetail {
    id                  : string;
    session             : Session;
    building            : BuildingEnum;
    spaceId             : string | null;
    isEnglish           : boolean;
    isConsecutive       : boolean;
    isAfternoon         : boolean;
    description         : string | null;
    professor           : Proffesor | null;
    spaceSize           : SpaceSize | null;
    spaceType           : SpaceType | null;
    staffUpdate         : Staff;
    sessionDayModules   : SessionDayModule[];
    createdAt           : Date;
    updatedAt           : Date;
}


export interface RequestSession {
    id              : string;
    title           : string;
    status          : Status;
    staffCreate     : Staff;
    staffUpdated    : Staff;
    createdAt       : Date;
    updatedAt       : Date;
    requestSessions : RequestSessionDetail[];
}


export interface Session {
    id                      : string;
    name                    : Session;
    spaceId                 : string | null;
    isEnglish               : boolean;
    chairsAvailable         : number;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    professor               : Proffesor | null;
    module                  : OfferModule;
    date                    : Date;
    dayId                   : number;
    dayModuleId             : number;
    requestSession?         : RequestSession;
    planningChangeId        : string | null;
    // section                 : SectionSeccionPlanningChange;

    sectionId? : string;
}


export interface Section {
    id              : string;
    code            : number;
    isClosed        : boolean;
    groupId         : string;
    startDate       : Date;
    building        : BuildingEnum | null;
    endDate         : Date;
    spaceSizeId     : Size | null;
    spaceType       : SpaceType | null;
    workshop        : number;
    lecture         : number;
    tutoringSession : number;
    laboratory      : number;
    professor       : Proffesor | null;
    subject         : OfferSectionSubject;
    period          : OfferSectionPeriod;
    sessionsCount   : number;
    haveRequest     : boolean;
    quota           : number;
    registered      : number;
    sessions        : Session[];
}
