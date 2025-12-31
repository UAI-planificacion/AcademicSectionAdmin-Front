export type Difference = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | null | undefined;


interface ModuleBase {
    id          : string;
    code        : string;
    isActive    : boolean;
    name        : string;
    difference  : Difference;
    startHour   : string;
    endHour     : string;
}

export interface Module extends ModuleBase {
    dayId       : number;
    order       : number;
    dayModuleId : number;
}


export interface ModuleOriginal extends ModuleBase {
    days        : number[];
    createdAt   : Date;
    updatedAt   : Date;
}


export interface ModuleCreate {
    code        : string;
    startHour   : string;
    endHour     : string;
    dayIds      : number[];
}



export interface DayModule {
    id          : number;
    dayId       : number;
    moduleId    : number;
}


export interface ModuleSession {
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
