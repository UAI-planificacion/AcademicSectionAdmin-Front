import type { Space, SpaceData } from "./types";

export const getSpaceTypeName = ( type: Space["type"] | SpaceData["type"] ): string => ({
    'ROOM'      : 'Sala',
    'AUDITORIO' : 'Auditorio',
    'DIS'       : 'Diseño',
    'LAB'       : 'Laboratorio',
    'LABPC'     : 'Lab. PC',
    'GARAGE'    : 'Garaje',
    'CORE'      : 'Core',
    'COMMUNIC'  : 'Comunicaciones',
}[type] ?? type);