import { compressToUTF16, decompressFromUTF16 } from "lz-string";

import type { Period } from '@/lib/types';


const KEY_PERIOD = 'periods';


export const getPeriodsStorage = (): Period[] => {
    const storedPeriods = localStorage.getItem( KEY_PERIOD );

    return storedPeriods
        ? JSON.parse( decompressFromUTF16( storedPeriods ))
        : [];
};


export const savePeriodsStorage = ( periods: Period[] ): void => {
    clearPeriodsStorage();

    localStorage.setItem( KEY_PERIOD, compressToUTF16( JSON.stringify( periods )));
};


export const savePeriodStorage = ( period: Period ): void => {
    const periods = getPeriodsStorage();
    const index = periods.findIndex( ( p ) => p.id === period.id );

    if ( index !== -1 ) {
        periods[index] = period;
    } else {
        periods.push( period );
    }

    savePeriodsStorage( periods );
};


export const deletePeriodStorage = ( id: string ): void => {
    const periods = getPeriodsStorage();
    const index = periods.findIndex( ( p ) => p.id === id );

    if ( index !== -1 ) {
        periods.splice( index, 1 );
    }

    savePeriodsStorage( periods );
};


export const clearPeriodsStorage = (): void => {
    localStorage.removeItem( KEY_PERIOD );
};
