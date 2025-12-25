import { compressToUTF16, decompressFromUTF16 } from "lz-string";

import type { Space, SpaceData } from '@/lib/types';


const KEY_SPACE = 'spaces';


export const getSpacesStorage = (): SpaceData[] => {
    const storedSpaces = localStorage.getItem( KEY_SPACE );

    return storedSpaces
        ? JSON.parse( decompressFromUTF16( storedSpaces ))
        : [];
};


export const saveSpacesStorage = ( spaces: SpaceData[] ): void => {
    clearSpacesStorage();

    localStorage.setItem( KEY_SPACE, compressToUTF16( JSON.stringify( spaces )));
};


export const saveSpaceStorage = ( space: SpaceData ): void => {
    const spaces = getSpacesStorage();
    const index = spaces.findIndex( ( s ) => s.id === space.id );

    if ( index !== -1 ) {
        spaces[index] = space;
    } else {
        spaces.push( space );
    }

    saveSpacesStorage( spaces );
};


export const deleteSpaceStorage = ( id: string ): void => {
    const spaces = getSpacesStorage();
    const index = spaces.findIndex( ( s ) => s.id === id );

    if ( index !== -1 ) {
        spaces.splice( index, 1 );
    }

    saveSpacesStorage( spaces );
};


export const clearSpacesStorage = (): void => {
    localStorage.removeItem( KEY_SPACE );
};
