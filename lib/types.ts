export type Type = 'ROOM' | 'AUDITORIO' | 'DIS' | 'LAB' | 'LABPC' | 'GARAGE' | 'CORE' | 'COMMUNIC';
export type Size = 'XS' | 'XE' | 'S' | 'SE' | 'MS' | 'M' | 'L' | 'XL' | 'XXL';


export interface Space {
    id          : string;
    building    : string;
    capacity    : number;
    type        : Type;
    sizeId      : Size;
    createdAt  : string;
    updatedAt  : string;
}


export interface Module {
    id          : string;
    code        : string;
    isActive    : boolean;
    name        : string;
    difference? : string;
    startHour   : string;
    endHour     : string;
    dayId       : number;
    order       : number;
    dayModuleId : number;
}


export interface Day {
    id          : number;
    name        : string;
    shortName   : string;
    mediumName  : string;
}


export type SortField       = "name" | "type" | "building" | "size" | "capacity"
export type SortDirection   = "asc" | "desc"


export interface Filters {
    periods     : string[];
    buildings   : string[];
    sizes       : string[];
    rooms       : string[];
    types       : string[];
    capacities  : string[];
}


export interface SortConfig {
    field       : SortField;
    direction   : SortDirection;
}


export interface Sizes {
    id              : string;
    detail          : string;
    min?            : number;
    max?            : number;
    lessThan?       : number;
    greaterThan?    : number;
    label : string;
}

export type Status = 'InProgress' | 'Closed' | 'Open';
export interface Period {
    id              : string;
    name            : string;
    startDate       : Date | null;
    endDate         : Date | null;
    openingDate     : Date | null;
    closingDate     : Date | null;
    status          : Status;
    createdAt       : Date;
    updatedAt       : Date;
    label           : string;
}


export interface Subject {
    id          : string;
    name        : string;
    startDate   : Date | null;
    endDate     : Date | null;
    createdAt   : Date;
    updatedAt   : Date;
}


export interface Professor {
    id          : string;
    name        : string;
    email       : string | null;
    createdAt   : Date;
    updatedAt   : Date;
}