import { compressToUTF16, decompressFromUTF16 } from "lz-string";

import type { Day } from '@/lib/types';

const KEY_DAY = 'days';

export const getDaysStorage = (): Day[] => {
    const storedDays = localStorage.getItem( KEY_DAY );

    return storedDays
        ? JSON.parse( decompressFromUTF16( storedDays ))
        : [];
};

export const saveDaysStorage = ( days: Day[] ): void => {
    clearDaysStorage();

    localStorage.setItem( KEY_DAY, compressToUTF16( JSON.stringify( days )));
};

export const saveDayStorage = ( day: Day ): void => {
    const days = getDaysStorage();
    const index = days.findIndex( ( d ) => String(d.id) === String(day.id) );

    if ( index !== -1 ) {
        days[index] = day;
    } else {
        days.push( day );
    }

    saveDaysStorage( days );
};

export const deleteDayStorage = ( id: string ): void => {
    const days = getDaysStorage();
    const index = days.findIndex( ( d ) => String(d.id) === String(id) );

    if ( index !== -1 ) {
        days.splice( index, 1 );
    }

    saveDaysStorage( days );
};

export const clearDaysStorage = (): void => {
    localStorage.removeItem( KEY_DAY );
};
