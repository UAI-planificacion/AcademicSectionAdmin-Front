interface BasicSection {
    code                    : number;
    session                 : string;
    size                    : string;
    correctedRegistrants    : number;
    realRegistrants         : number;
    plannedBuilding         : string;
    chairsAvailable         : number | null;
    professorId             : string;
}


export interface Section extends BasicSection {
    id              : string;
    room            : string;
    professorName   : string;
    day             : number;
    moduleId        : string;
    subjectName     : string;
    subjectId       : string;
    period          : string;
}


export interface CreateSection extends BasicSection {
    periodId    : string;
    subjectId   : string;
    dayModuleId             : number;
    roomId                  : string;

}


export interface UpdateSection extends BasicSection {
    dayModuleId             : number;
    roomId                  : string;
}
