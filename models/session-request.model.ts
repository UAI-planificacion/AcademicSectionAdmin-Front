import { SessionType } from './section.model';


export interface SessionBase {
	spaceId?                : string    | null;
	isEnglish?              : boolean   | null;
	chairsAvailable?        : number    | null;
	correctedRegistrants?   : number    | null;
	realRegistrants?        : number    | null;
	plannedBuilding?        : string    | null;
	professorId?            : string    | null;
	dayModuleId?            : number    | null;
	date?                   : Date      | null;
}


export interface CreateSessionRequest extends SessionBase {
	name        : SessionType;
    sectionId   : string;
}


export interface UpdateSessionRequest extends SessionBase {
	id      : string;
	name?   : SessionType | null;
}


export interface UpdateMassiveSessionRequest extends SessionBase {
	name?   : SessionType | null;
    ids     : string[];
}
