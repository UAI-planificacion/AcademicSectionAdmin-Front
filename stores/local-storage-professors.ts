import { compressToUTF16, decompressFromUTF16 } from "lz-string";

import type { Professor } from '@/lib/types';


const KEY_PROFESSOR = 'professors';


export const getProfessorsStorage = (): Professor[] => {
    const storedProfessors = localStorage.getItem( KEY_PROFESSOR );

    return storedProfessors
        ? JSON.parse( decompressFromUTF16( storedProfessors ))
        : [];
};


export const saveProfessorsStorage = ( professors: Professor[] ): void => {
    clearProfessorsStorage();

    localStorage.setItem( KEY_PROFESSOR, compressToUTF16( JSON.stringify( professors )));
};


export const saveProfessorStorage = ( professor: Professor ): void => {
    const professors = getProfessorsStorage();
    const index = professors.findIndex( ( p ) => p.id === professor.id );

    if ( index !== -1 ) {
        professors[index] = professor;
    } else {
        professors.push( professor );
    }

    saveProfessorsStorage( professors );
};


export const deleteProfessorStorage = ( id: string ): void => {
    const professors = getProfessorsStorage();
    const index = professors.findIndex( ( p ) => p.id === id );

    if ( index !== -1 ) {
        professors.splice( index, 1 );
    }

    saveProfessorsStorage( professors );
};


export const clearProfessorsStorage = (): void => {
    localStorage.removeItem( KEY_PROFESSOR );
};
