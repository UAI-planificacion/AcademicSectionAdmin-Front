export interface Section {
    id                      : string;
    code                    : number;
    session                 : string;
    size                    : string;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    chairsAvailable         : number | null;
    room                    : string;
    professor               : string;
    day                     : number;
    moduleId                : string;
    subjectName             : string;
    subjectId               : string;
    period                  : string;
}


export type Type = 'ROOM' | 'AUDITORIO' | 'DIS' | 'LAB' | 'LABPC' | 'GARAGE' | 'CORE' | 'COMMUNIC';
export type Size = 'XS' | 'XE' | 'S' | 'SE' | 'MS' | 'M' | 'L' | 'XL' | 'XXL';


export interface Room {
    id          : string;
    building    : string;
    capacity    : number;
    type        : Type;
    sizeId      : Size;
}


export interface Module {
    id          : string;
    name        : string;
    startTime   : string;
    endTime     : string;
    dayId       : number;
    order       : number;
}


export interface Day {
    id      : number;
    name    : string;
}


export type SortField       = "name" | "type" | "building" | "size" | "capacity"
export type SortDirection   = "asc" | "desc"


export interface Filters {
    periods         : string[];
    buildings       : string[];
    capacityGroups  : string[];
}


export interface SortConfig {
    field       : SortField;
    direction   : SortDirection;
}
