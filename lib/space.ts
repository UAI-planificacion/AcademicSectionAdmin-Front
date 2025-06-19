import { Room } from "./types";

export const getSpaceTypeName = ( type: Room["type"] ) => ({
    'ROOM'      : 'Sala',
    'AUDITORIO' : 'Auditorio',
    'DIS'       : 'Diseño',
    'LAB'       : 'Laboratorio',
    'LABPC'     : 'Lab. PC',
    'GARAGE'    : 'Garaje',
    'CORE'      : 'Core',
    'COMMUNIC'  : 'Comunicaciones',
}[type]);