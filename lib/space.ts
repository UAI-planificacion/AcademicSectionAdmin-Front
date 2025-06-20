import type { Space } from "./types";

export const getSpaceTypeName = ( type: Space["type"] ) => ({
    'ROOM'      : 'Sala',
    'AUDITORIO' : 'Auditorio',
    'DIS'       : 'Diseño',
    'LAB'       : 'Laboratorio',
    'LABPC'     : 'Lab. PC',
    'GARAGE'    : 'Garaje',
    'CORE'      : 'Core',
    'COMMUNIC'  : 'Comunicaciones',
}[type]);