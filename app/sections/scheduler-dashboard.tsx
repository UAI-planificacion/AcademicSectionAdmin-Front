"use client"

import {
    useState,
    useEffect,
    JSX,
    useMemo,
    useCallback,
    useRef
}                               from 'react';
import { useRouter }            from 'next/navigation';
import { useQueryClient }       from '@tanstack/react-query';

import { toast } from 'sonner';

import type {
    SpaceData,
    SortDirection,
    SortField,
    Filters,
    SortConfig,
}                                   from '@/lib/types';
import {
    SectionSession,
    UpdateSection
}                                   from '@/models/section.model';
import {
    errorToast,
    successToast
}                                   from '@/config/toast/toast.config';
import { ENV }                      from '@/config/envs/env';
import { useSections }              from '@/hooks/use-sections';
import { useSpace }                 from '@/hooks/use-space';
import { useModules }               from '@/hooks/use-modules';
import { Session as SessionModel }  from '@/models/section-session.model';
import { SessionForm }              from '@/app/sections/session-form';
import { ModuleGrid }               from '@/app/sections/module-grid';
import TableSkeleton                from '@/app/sections/TableSkeleton';
import { Sizes }                    from '@/models/size.model';
import { fetchApi }                 from '@/services/fetch';
import { useSizes }                 from '@/hooks/use-sizes';
// import { KEY_QUERYS }   from '@/lib/key-queries';


const createSizeOrderMap = ( sizes: Sizes[] ): Map<string, number> =>
    new Map(sizes.map( size => [ size?.id || '', size?.order || 0 ]));


function orderSizes( sizeOrderMap: Map<string, number>, a: SpaceData, b: SpaceData ): number {
    const orderA = sizeOrderMap.get( a.size ) || 0;
    const orderB = sizeOrderMap.get( b.size ) || 0;
    return orderA - orderB;
}


export function SchedulerDashboard(): JSX.Element {
    const router        = useRouter();
    const queryClient   = useQueryClient();

    // Hooks de datos
    const {
        modules,
        isLoading   : modulesLoading,
        isError     : modulesError
    } = useModules();

    const {
        sections    : initialSections,
        isLoading   : sectionsLoading,
        isError     : sectionsError,
        error       : sectionsErrorMessage
    } = useSections();

    const {
        spacesData  : initialRooms,
        isLoading   : spacesLoading
    } = useSpace();

    const { sizes, loading: sizesLoading } = useSizes();

    // Estados locales
    const [sections, setSections]                   = useState<SectionSession[]>( [] );
    const [filteredSections, setFilteredSections]   = useState<SectionSession[]>( [] );
    const [rooms, setRooms]                         = useState<SpaceData[]>( [] );
    const [filteredRooms, setFilteredRooms]         = useState<SpaceData[]>( [] );
    const [selectedSection, setSelectedSection]     = useState<SectionSession | null>( null );
    const [isModalOpen, setIsModalOpen]             = useState<boolean>( false );
    const [selectedSections, setSelectedSections]   = useState<SectionSession[]>([]);
    // const [selectionSpaceId, setSelectionSpaceId]   = useState<string | null>(null);
    // const [showLoadExcel, setShowLoadExcel]         = useState<boolean>( false );
    const [isInitialized, setIsInitialized]         = useState<boolean>( false );
    const [isCalculating, setIsCalculating]         = useState<boolean>( false );
    const [sortConfig, setSortConfig]               = useState<SortConfig>({
        field       : "name",
        direction   : "asc",
    });

    // Ref para cache persistente de sectionsByCellMemo
    const sectionsByCellRef     = useRef<Map<string, SectionSession[]>>(new Map());
    const lastSectionsLengthRef = useRef<number>(0);


    const filters: Filters = {
        periods     : [],
        buildings   : [],
        sizes       : [],
        rooms       : [],
        types       : [],
        capacities  : [],
    }


    useEffect(() => {
        if ( !modulesLoading && !modulesError && modules.length === 0 ) {
            toast( 'No se encontraron los módulos, debes cargarlos manualmente.', errorToast );
            router.push( '/modules' );

            return;
        }
    }, [modules, modulesLoading, modulesError, router]);


    useEffect(() => {
        if ( !sectionsLoading && initialSections.length === 0 && !sectionsError ) {
            toast( 'No se encontraron secciones. Debes cargar un archivo Excel.', errorToast );
            // setShowLoadExcel( true );

            return;
        }
    }, [sectionsLoading, initialSections, sectionsError]);


    useEffect(() => {
        if ( !modulesLoading && !sectionsLoading && !spacesLoading && !sizesLoading ) {
            if ( modules.length > 0 && !sectionsError ) {
                setSections( initialSections );
                setFilteredSections( initialSections );
                setRooms( initialRooms );
                setFilteredRooms( initialRooms );
                setIsInitialized( true );
            }
        }
    }, [initialSections, initialRooms, modules, modulesLoading, sectionsLoading, spacesLoading, sizesLoading, sectionsError]);

    // TODO! Aquí revisar el método de cálculo de secciones por celda
    useEffect(() => {
        if ( !isInitialized ) {
            return;
        }

        const currentLength     = sections.length;
        const lastLength        = lastSectionsLengthRef.current;
        const lengthDifference  = Math.abs( currentLength - lastLength );
        const shouldRecalculate = lastLength === 0 || lengthDifference > 5;

        if ( shouldRecalculate ) {
            if ( currentLength > 100 && lastLength === 0 ) {
                setIsCalculating( true );
            }

            if ( lastLength === 0 ) {
                const timeoutId = setTimeout(() => {
                    const newMap = new Map<string, SectionSession[]>();

                    sections.forEach(section => {
                        // Skip sections without assigned spaceId or dayModuleId
                        if (!section.session.spaceId || !section.session.dayModuleId) return;

                        const key = `${section.session.spaceId}-${section.session.dayModuleId}`;

                        if (!newMap.has( key )) {
                            newMap.set( key, [] );
                        }

                        newMap.get( key )!.push( section );
                    });

                    sectionsByCellRef.current       = newMap;
                    lastSectionsLengthRef.current   = currentLength;
                    setIsCalculating(false);
                }, 0);

                return () => clearTimeout(timeoutId);
            } else {
                const newMap = new Map<string, SectionSession[]>();

                sections.forEach(section => {
                    // Skip sections without assigned spaceId or dayModuleId
                    if (!section.session.spaceId || !section.session.dayModuleId) return;

                    const key = `${section.session.spaceId}-${section.session.dayModuleId}`;

                    if (!newMap.has(key)) {
                        newMap.set(key, []);
                    }

                    newMap.get(key)!.push(section);
                });

                sectionsByCellRef.current       = newMap;
                lastSectionsLengthRef.current   = currentLength;
            }
        } else {
            const newMap = new Map<string, SectionSession[]>();

            sections.forEach(section => {
                // Skip sections without assigned spaceId or dayModuleId
                if (!section.session.spaceId || !section.session.dayModuleId) return;

                const key = `${section.session.spaceId}-${section.session.dayModuleId}`;

                if (!newMap.has(key)) {
                    newMap.set(key, []);
                }

                newMap.get(key)!.push(section);
            });

            sectionsByCellRef.current       = newMap;
            lastSectionsLengthRef.current   = currentLength;
        }
    }, [sections, isInitialized]);


    useEffect(() => {
        if ( !isInitialized ) return;

        let filteredSecs = [...sections];

        if ( filters.periods.length > 0 ) {
            filteredSecs = filteredSecs.filter( section => filters.periods.includes( section.period.name ));
        }

        let filteredRms = [...rooms];

        if ( filters.buildings && filters.buildings.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.buildings.includes( room.building ));
        }

        if ( filters.sizes && filters.sizes.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.sizes.includes( room.size ));
        }

        if ( filters.rooms && filters.rooms.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.rooms.includes( room.name ));
        }

        if ( filters.types && filters.types.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.types.includes( room.type ));
        }

        if ( filters.capacities && filters.capacities.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.capacities.includes( room.capacity.toString() ));
        }

        const filteredRoomIds = new Set(filteredRms.map( room => room.name ))

        filteredSecs = filteredSecs.filter( section => section.session.spaceId && filteredRoomIds.has( section.session.spaceId ));

        console.log("************Secciones filtradas:", filteredSecs.length)
        console.log("**********Salas filtradas:", filteredRms.length)

        setFilteredSections( filteredSecs );
        setFilteredRooms( filteredRms );
    }, [ sections, rooms, isInitialized ]);

    const sizeOrderMap      = useMemo(() => createSizeOrderMap( sizes ), [ sizes ]);
    const filteredRoomIds   = useMemo(() => new Set( filteredRooms.map( room => room.name )), [ filteredRooms ]);
    const sortedRooms       = useMemo(() => {
        if ( !filteredRooms.length ) return [];

        return [...filteredRooms].sort(( a, b ) => {
            const comparison = {
                name        : a.name.localeCompare( b.name ),
                type        : a.type.localeCompare( b.type ),
                building    : a.building.localeCompare( b.building ),
                size        : orderSizes( sizeOrderMap, a, b ),
                capacity    : a.capacity - b.capacity,
            }[sortConfig.field] || 0;

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredRooms, sortConfig, sizeOrderMap]);


    const handleSortChange = useCallback(( field: SortField, direction: SortDirection ) => {
        setSortConfig({ field, direction });
    }, []);


    const handleUpdateSection = useCallback(( updatedSection: SectionSession ) : boolean => {
        const overlapping = sections.some(( section : SectionSession ) => {
            if ( section.id                     === updatedSection.id )                     return false;
            if ( section.session.spaceId        !== updatedSection.session.spaceId )        return false;
            if ( section.session.dayId          !== updatedSection.session.dayId )          return false;
            if ( section.session.module.id      !== updatedSection.session.module.id )      return false;

            return true;
        })

        if ( overlapping ) {
            toast( 'No se puede actualizar la sección porque ya existe una en ese módulo y sala.', errorToast );
            return false;
        }

        const updatedSections = sections.map(( section ) => 
            ( section.id === updatedSection.id ? updatedSection : section )
        );

        setSections( updatedSections );

        setFilteredSections( prevFiltered =>
            prevFiltered.map( s => s.id === updatedSection.id ? updatedSection : s )
        );

        return true;
    }, [sections]);


    const handleSaveSection = useCallback(( section: SectionSession ): boolean => {
        const existingSection = sections.find( s => s.id === section.id );

        if ( existingSection ) {
            const result = handleUpdateSection( section );

            if ( result ) {
                setFilteredSections(prevFiltered =>
                    prevFiltered.map(s => s.id === section.id ? section : s)
                );
            }

            return result;
        } else {
            const overlapping = sections.some(( existingSection : SectionSession ) => {
                if ( existingSection.session.spaceId    !== section.session.spaceId )      return false;
                if ( existingSection.session.dayId      !== section.session.dayId )        return false;
                if ( existingSection.session.module.id  !== section.session.module.id )    return false;
                return true;
            });

            if ( overlapping ) {
                toast( 'No se puede crear la sección porque ya existe una en ese módulo y sala.', errorToast );
                return false;
            }

            setSections(prevSections => [ ...prevSections, section ]);

            if ( section.session.spaceId && filteredRoomIds.has( section.session.spaceId )) {
                setFilteredSections(prevFiltered => [...prevFiltered, section]);
            }

            return true;
        }
    }, [sections, filteredRoomIds, handleUpdateSection]);


    const handleDeleteSection = useCallback(( sectionId: string ) => {
        const updatedSections = sections.filter( section => section.id !== sectionId );
        setSections( updatedSections );
        setFilteredSections(prevFiltered =>
            prevFiltered.filter( section => section.id !== sectionId )
        );
    }, [sections]);


    const handleSectionClick = useCallback(( sectionId: string ) => {
        if ( selectedSections.length > 0 ) return; // Don't open if multi-selected

        const sectionSession = sections.find(( s : SectionSession ) => s.id === sectionId );

        if ( !sectionSession ) return;

        setSelectedSection( sectionSession );
        setIsModalOpen( true );
    }, [sections, selectedSections.length]);


    const handleSectionSelect = useCallback(( section: SectionSession | null ) => {
        if ( !section ) return;
        // Use functional update to work with the latest state
        setSelectedSections( prev => {
            // Check if this section is already selected (to deselect it)
            const isCurrentlySelected = prev.some(s => s.session.id === section.session.id);

            if ( isCurrentlySelected ) {
                // Deselect
                const newSelection = prev.filter( s => s.session.id !== section.session.id );
                return newSelection;
            }

            // If we already have selections, check if this section is from the same space
            if ( prev.length > 0 ) {
                const firstSelectedSpace = prev[0].session.spaceId;

                if ( section.session.spaceId !== firstSelectedSpace ) {
                    return prev; // Return unchanged state - different space
                }
            }

            // All validations passed, add to selection
            const newSelection = [...prev, section];
            return newSelection;
        });
    }, []);


    const handleClearSelection = useCallback(() => {
        console.log('Clearing all selections');
        setSelectedSections( [] );
        console.log('Selections cleared');
    }, []);


    useEffect(() => {
        const handleKeyDown = ( e: KeyboardEvent ) => {
            console.log('Key pressed:', e.key, 'Selected count:', selectedSections.length);
            if ( e.key === 'Escape' && selectedSections.length > 0 ) {
                console.log('Clearing selection via ESC');
                handleClearSelection();
            }
        };

        window.addEventListener( 'keydown', handleKeyDown );
        return () => window.removeEventListener( 'keydown', handleKeyDown );
    }, [selectedSections.length, handleClearSelection]);


    const getDayModuleId = useCallback((
        dayId       : number,
        moduleId    : string
    ): number | undefined =>
        modules.find( dayM =>
            dayM.id === moduleId &&
            dayM.dayId === dayId
        )?.dayModuleId,
    [modules]);


    const onUpdateSection = useCallback( async (
        sectionId   : string,
        spaceId     : string,
        dayModuleId : number
    ) => {
        const saveSection: UpdateSection = {
            roomId      : spaceId,
            dayModuleId : dayModuleId
        }

        const url = `${ENV.REQUEST_BACK_URL}sessions/${sectionId}`;

        try {
            const data = await fetchApi<SectionSession | null>( url, "PATCH", saveSection );

            if ( !data ) {
                toast( 'No se pudo actualizar la sección', errorToast );
                return false;
            }

            // Invalidate TanStack Query cache to refresh sections
            // await queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });

            toast( 'Sección actualizada correctamente', successToast );
            return true;
        } catch ( error ) {
            toast( 'No se pudo actualizar la sección', errorToast );
            return false;
        }
    }, [queryClient]);


    const handleSectionMove = useCallback((
        sectionId   : string,
        newRoomId   : string,
        newDay      : number,
        newModuleId : string
    ) : boolean => {
        const targetOccupied = sections
            .some(( section : SectionSession ) =>
                section.id                      !== sectionId   &&
                section.session.spaceId         === newRoomId   &&
                section.session.dayId           === newDay      &&
                section.session.module.id       === newModuleId
            );

        if ( targetOccupied ) {
            toast( 'No se puede mover la sección porque ya existe una en ese módulo y sala.', errorToast );
            return false;
        }

        const sectionToMove = sections.find( section => section.id === sectionId );

        if ( !sectionToMove ) return false;

        // Calculate dayModuleId from newDay and newModuleId
        const dayModuleId = getDayModuleId( newDay, newModuleId );

        if ( !dayModuleId ) {
            toast( 'Error: No se pudo encontrar el módulo del día', errorToast );
            return false;
        }

        const updatedSection: SectionSession = {
            ...sectionToMove,
            session: {
                ...sectionToMove.session,
                dayId       : newDay,
                module      : { ...sectionToMove.session.module, id: newModuleId },
                dayModuleId : dayModuleId,
                spaceId     : newRoomId,
            }
        };

        // Update local state optimistically
        setSections( prevSections =>
            prevSections.map( section =>
                section.id === sectionId ? updatedSection : section
            )
        );

        setFilteredSections( prevFiltered =>
            prevFiltered.map( section =>
                section.id === sectionId ? updatedSection : section
            )
        );

        // Send update to backend
        onUpdateSection( sectionId, newRoomId, dayModuleId );

        return true;
    }, [sections, getDayModuleId, onUpdateSection]);


    const handleModalClose = useCallback(() => {
        setIsModalOpen( false );
        setSelectedSection( null );
    }, []);


    const handleLoadExcelSuccess = useCallback(() => {
        // setShowLoadExcel( false );
        toast( 'Archivo Excel cargado exitosamente. Recargando datos...', successToast );
        window.location.reload();
    }, []);

    // const handleLoadExcelCancel = useCallback(() => {
    //     // setShowLoadExcel( false );
    // }, []);


    const getSectionsForCell = useCallback((spaceId: string, dayModuleId: number) => {
        const key = `${spaceId}-${dayModuleId}`;
        return sectionsByCellRef.current.get(key) || [];
    }, []);


    if (modulesLoading || sectionsLoading || spacesLoading || sizesLoading || !isInitialized) {
        return <TableSkeleton />;
    }

    // if ( sectionsError ) {
    //     return (
    //         <div className="flex items-center justify-center h-64">
    //             <div className="text-center">
    //                 <p className="text-destructive mb-2">Error al cargar secciones</p>

    //                 <p className="text-muted-foreground text-sm">{sectionsErrorMessage?.message}</p>

    //                 <div className="mt-4">
    //                     <p className="text-sm text-muted-foreground mb-2">Debes cargar un archivo Excel con las secciones</p>

    //                     <LoadExcel
    //                         onSuccess   = { handleLoadExcelSuccess }
    //                         onCancel    = { handleLoadExcelCancel }
    //                     />
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    // if ( showLoadExcel ) {
    //     return (
    //         <LoadExcel
    //             onSuccess   = { handleLoadExcelSuccess }
    //             onCancel    = { handleLoadExcelCancel }
    //         />
    //     );
    // }

    return (
        <>
            <ModuleGrid
                sections            = { filteredSections }
                rooms               = { sortedRooms }
                onSectionClick      = { handleSectionClick }
                onSectionMove       = { handleSectionMove }
                onSectionSave       = { handleSaveSection }
                onSortChange        = { handleSortChange }
                sortConfig          = { sortConfig }
                getSectionsForCell  = { getSectionsForCell }
                isCalculating       = { isCalculating }
                selectedSections    = { selectedSections }
                onSectionSelect     = { handleSectionSelect }
                onClearSelection    = { handleClearSelection }
            />

            {isModalOpen && selectedSection && (
                <SessionForm
                    isOpen          = { isModalOpen }
                    onClose         = { handleModalClose }
                    sectionSession  = { selectedSection }
                    onSave          = {( updatedSession: SessionModel ) => {
                        // Handle session update
                        console.log('Session updated:', updatedSession);
                        // TODO: Update the section with the new session data
                        handleModalClose();
                    }}
                />
            )}
        </>
    );
}
