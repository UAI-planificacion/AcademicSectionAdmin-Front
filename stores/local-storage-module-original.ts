import { compressToUTF16, decompressFromUTF16 } from "lz-string";

import type { ModuleOriginal } from '@/models/module.model';

const KEY_MODULE_ORIGINAL = 'moduleOriginals';

export const getModuleOriginalsStorage = (): ModuleOriginal[] => {
    const storedModules = localStorage.getItem( KEY_MODULE_ORIGINAL );

    return storedModules
        ? JSON.parse( decompressFromUTF16( storedModules ))
        : [];
};

export const saveModuleOriginalsStorage = ( modules: ModuleOriginal[] ): void => {
    clearModuleOriginalsStorage();

    localStorage.setItem( KEY_MODULE_ORIGINAL, compressToUTF16( JSON.stringify( modules )));
};

export const saveModuleOriginalStorage = ( module: ModuleOriginal ): void => {
    const modules = getModuleOriginalsStorage();
    const index = modules.findIndex( ( m ) => String(m.id) === String(module.id) );

    if ( index !== -1 ) {
        modules[index] = module;
    } else {
        modules.push( module );
    }

    saveModuleOriginalsStorage( modules );
};

export const deleteModuleOriginalStorage = ( id: string ): void => {
    const modules = getModuleOriginalsStorage();
    const index = modules.findIndex( ( m ) => String(m.id) === String(id) );

    if ( index !== -1 ) {
        modules.splice( index, 1 );
    }

    saveModuleOriginalsStorage( modules );
};

export const clearModuleOriginalsStorage = (): void => {
    localStorage.removeItem( KEY_MODULE_ORIGINAL );
};
