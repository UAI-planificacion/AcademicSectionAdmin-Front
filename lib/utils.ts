import { type ClassValue, clsx }    from "clsx";
import { format }                   from "@formkit/tempo";
import { twMerge }                  from "tailwind-merge";

import {
    BuildingEnum,
    SpaceType
}                       from "@/models/section-session.model";
import { SessionType }  from "@/models/section.model";


export const cn = ( ...inputs: ClassValue[] ): string => 
    twMerge( clsx( inputs ));


export function formatDate( date?: Date | string | null | undefined ): string {
    if ( !date ) return '-';

    return new Intl.DateTimeFormat( "es-ES", {
        day     : "2-digit",
        month   : "2-digit",
        year    : "numeric",
    }).format( new Date( date ));
}


export function generateId( prefix: string ): string {
    const timestamp = Date.now().toString( 36 );
    const randomStr = Math.random().toString( 36 ).substring( 2, 8 );

    return `${ prefix }${ timestamp }${ randomStr }`.toUpperCase().substring( 0, 8 );
}


export function tempoFormat( dateInput: Date | string | undefined ) {
    if ( !dateInput ) return "-";

    return format( dateInput, "ddd DD MMM YYYY" );
}


export const typeOptions: SpaceType[] = [
    SpaceType.ROOM,
    SpaceType.AUDITORIO,
    SpaceType.DIS,
    SpaceType.LAB,
    SpaceType.LABPC,
    SpaceType.STUDY_ROOM,
    SpaceType.MEETING_ROOM,
    SpaceType.POSTGRADUATE_ROOM,
    SpaceType.MULTIPURPOSE,
    SpaceType.CORE,
]



export const getSpaceType = ( spaceType: SpaceType ) => ({
    [SpaceType.ROOM]                : "Sala",
    [SpaceType.LABPC]               : "Laboratorio de Computación",
    [SpaceType.AUDITORIO]           : "Auditorio",
    [SpaceType.STUDY_ROOM]          : "Sala Estudio",
    [SpaceType.MEETING_ROOM]        : "Sala Reuniones",
    [SpaceType.DIS]                 : "Sala Diseño",
    [SpaceType.LAB]                 : "Laboratorio Investigación",
    [SpaceType.CORE]                : "Sala Core",
    [SpaceType.POSTGRADUATE_ROOM]   : "Sala Postgrado",
    [SpaceType.MULTIPURPOSE]        : "Multiuso",
})[spaceType];


export const getBuildingName = ( building: BuildingEnum ) => ({
    [BuildingEnum.PREGRADO_A]    : "Edificio Pregrado A",
    [BuildingEnum.PREGRADO_B]    : "Edificio Pregrado B",
    [BuildingEnum.POSTGRADO_C]   : "Edificio Postgrado C",
    [BuildingEnum.TALLERES_D]    : "Edificio Talleres D",
    [BuildingEnum.TALLERES_E]    : "Edificio Talleres E",
    [BuildingEnum.PREGRADO_F]    : "Edificio Pregrado F",
    [BuildingEnum.ERRAZURIZ]     : "Edificio Errazuriz",
    [BuildingEnum.VITACURA]      : "Edificio Vitacura",
    [BuildingEnum.VINA_A]        : "Edificio A",
    [BuildingEnum.VINA_B]        : "Edificio B",
    [BuildingEnum.VINA_C]        : "Edificio C",
    [BuildingEnum.VINA_D]        : "Edificio D",
    [BuildingEnum.VINA_E]        : "Edificio E",
    [BuildingEnum.VINA_F]        : "Edificio F",
    [BuildingEnum.Z]             : "Z",
})[building] || 'Edificio Desconocido';


export const sessionColors = {
    [SessionType.C]: 'bg-[#1A9850]',
    [SessionType.A]: 'bg-[#F76C3B]',
    [SessionType.T]: 'bg-[#1A9850]',
    [SessionType.L]: 'bg-[#A6D96A]',
};

