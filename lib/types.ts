export type Type = 'ROOM' | 'AUDITORIO' | 'DIS' | 'LAB' | 'LABPC' | 'GARAGE' | 'CORE' | 'COMMUNIC';
export type Size = 'XS' | 'XE' | 'S' | 'SE' | 'MS' | 'M' | 'L' | 'XL' | 'XXL';


export interface Space {
    [key: string]: any;
    id          : string;
    building    : string;
    capacity    : number;
    type        : Type;
    sizeId      : Size;
    // createdAt?  : string;
    // updatedAt?  : string;
}


export interface SpaceData {
	id			: string;
	name		: string;
	size		: Size;
	building	: string;
	type		: string;
	capacity	: number;
}


export type Option = {
    id?     : string;
    label   : string;
    value   : string;
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



export type Status = 'InProgress' | 'Closed' | 'Open';


export interface Period {
    id          : string;
    name        : string;
    startDate   : Date | null;
    endDate     : Date | null;
    openingDate : Date | null;
    closingDate : Date | null;
    status      : Status;
    createdAt   : Date;
    updatedAt   : Date;
    label?       : string;
}


export interface Subject {
    id          : string;
    name        : string;
    startDate   : string | null;
    endDate     : string | null;
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