import { compressToUTF16, decompressFromUTF16 } from "lz-string";

import type { Sizes } from '@/models/size.model';

const KEY_SIZES = 'sizes';

export const getSizesStorage = (): Sizes[] => {
    const storedSizes = localStorage.getItem( KEY_SIZES );

    return storedSizes
        ? JSON.parse( decompressFromUTF16( storedSizes ))
        : [];
};

export const saveSizesStorage = ( sizes: Sizes[] ): void => {
    clearSizesStorage();

    localStorage.setItem( KEY_SIZES, compressToUTF16( JSON.stringify( sizes )));
};

export const saveSizeStorage = ( size: Sizes ): void => {
    const sizes = getSizesStorage();
    const index = sizes.findIndex( ( s ) => s.id === size.id );

    if ( index !== -1 ) {
        sizes[index] = size;
    } else {
        sizes.push( size );
    }

    saveSizesStorage( sizes );
};

export const deleteSizeStorage = ( id: string ): void => {
    const sizes = getSizesStorage();
    const index = sizes.findIndex( ( s ) => s.id === id );

    if ( index !== -1 ) {
        sizes.splice( index, 1 );
    }

    saveSizesStorage( sizes );
};

export const clearSizesStorage = (): void => {
    localStorage.removeItem( KEY_SIZES );
};
