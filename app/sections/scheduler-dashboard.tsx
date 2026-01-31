"use client"

import {
    useState,
    useEffect,
    JSX,
    useMemo,
    useCallback,
    useRef
}                   from 'react';
import { toast }    from 'sonner';

import type {
    SpaceData,
    SortDirection,
    SortField,
    SortConfig,
}                                       from '@/lib/types';
import { SectionSession }               from '@/models/section.model';
import { errorToast }                   from '@/config/toast/toast.config';
import { useSections }                  from '@/hooks/use-sections';
import { useSpace }                     from '@/hooks/use-space';
import { useModules }                   from '@/hooks/use-modules';
import { SessionForm }                  from '@/app/sections/session-form';
import { ModuleGrid }                   from '@/app/sections/module-grid';
import TableSkeleton                    from '@/app/sections/TableSkeleton';
import { Sizes }                        from '@/models/size.model';
import { useSizes }                     from '@/hooks/use-sizes';
import { useUpdateSessionsMultiple }    from '@/hooks/use-update-sessions-multiple';
import { CapacityWarningDialog }        from '@/app/sections/capacity-warning-dialog';
import { useSession }                   from '@/hooks/use-session';
import { usePeriodContext }             from '@/contexts/period-context';


interface SessionMove {
    sessionId   : string;
    spaceId     : string;
    dayModuleId : number;
}


const createSizeOrderMap = ( sizes: Sizes[] ): Map<string, number> =>
    new Map( sizes.map( size => [ size?.id || '', size?.order || 0 ]));


function orderSizes( sizeOrderMap: Map<string, number>, a: SpaceData, b: SpaceData ): number {
    const orderA = sizeOrderMap.get( a.size ) || 0;
    const orderB = sizeOrderMap.get( b.size ) || 0;
    return orderA - orderB;
}


export function SchedulerDashboard(): JSX.Element {
    const { selectedPeriodIds } = usePeriodContext();
    const { staff }             = useSession();
    const isAdmin               = staff?.role === 'ADMIN' || staff?.role === 'ADMIN_FACULTY';


    const {
        modules,
        isLoading   : modulesLoading,
        isError     : modulesError
    } = useModules();


    const {
        sections,
        isLoading   : sectionsLoading,
        isError     : sectionsError,
        error       : sectionsErrorMessage
    } = useSections({ periodIds: selectedPeriodIds });


    const {
        spacesData,
        isLoading   : spacesLoading
    } = useSpace();


    const { sizes, loading: sizesLoading } = useSizes();

    // TanStack Query mutation for updating multiple sessions
    const { mutate: updateSessionsMultiple }        = useUpdateSessionsMultiple();
    const [filteredRooms, setFilteredRooms]         = useState<SpaceData[]>( [] );
    const [selectedSection, setSelectedSection]     = useState<SectionSession | null>( null );
    const [isModalOpen, setIsModalOpen]             = useState<boolean>( false );
    const [selectedSections, setSelectedSections]   = useState<SectionSession[]>([]);
    const [isInitialized, setIsInitialized]         = useState<boolean>( false );
    const [isCalculating, setIsCalculating]         = useState<boolean>( false );
    const [sortConfig, setSortConfig]               = useState<SortConfig>({
        field       : "name",
        direction   : "asc",
    });

    // Capacity warning dialog state
    const [capacityWarning, setCapacityWarning] = useState<{
        show: boolean;
        spaceName: string;
        spaceCapacity: number;
        affectedSessions: Array<{
            ssec: string;
            registered: number | null;
            quota: number;
            chairsAvailable: number;
        }>;
        pendingUpdate: {
            spaceId: string;
            updates: SessionMove[];
            updatedSections: SectionSession[];
        } | null;
    }>({
        show: false,
        spaceName: '',
        spaceCapacity: 0,
        affectedSessions: [],
        pendingUpdate: null
    });

    // Ref para cache persistente de sectionsByCellMemo
    const sectionsByCellRef     = useRef<Map<string, SectionSession[]>>(new Map());
    const lastSectionsLengthRef = useRef<number>(0);


    useEffect(() => {
        if ( !modulesLoading && !sectionsLoading && !spacesLoading && !sizesLoading ) {
            if ( modules.length > 0 && !sectionsError ) {
                setFilteredRooms( spacesData );
                setIsInitialized( true );
            }
        }
    }, [spacesData, modules, modulesLoading, sectionsLoading, spacesLoading, sizesLoading, sectionsError]);

    // Calculate sections by cell - always recalculate to ensure consistency
    useEffect(() => {
        if ( !isInitialized ) return;

        const currentLength = sections.length;

        // Show loading indicator for initial large dataset
        if ( currentLength > 100 && lastSectionsLengthRef.current === 0 ) {
            setIsCalculating( true );
        }

        const recalculate = () => {
            const newMap = new Map<string, SectionSession[]>();

            sections.forEach( section => {
                // Skip sections without assigned spaceId or dayModuleId
                if ( !section.session.spaceId || !section.session.dayModuleId ) return;

                const key = `${section.session.spaceId}-${section.session.dayModuleId}`;

                if ( !newMap.has( key )) {
                    newMap.set( key, [] );
                }

                newMap.get( key )!.push( section );
            });

            sectionsByCellRef.current       = newMap;
            lastSectionsLengthRef.current   = currentLength;
            setIsCalculating( false );
        };

        // For initial load with large dataset, defer to avoid blocking UI
        if ( currentLength > 100 && lastSectionsLengthRef.current === 0 ) {
            const timeoutId = setTimeout( recalculate, 0 );
            return () => clearTimeout( timeoutId );
        } else {
            // For all other cases, recalculate immediately
            recalculate();
        }
    }, [sections, isInitialized]);


    const sizeOrderMap      = useMemo(() => createSizeOrderMap( sizes ), [ sizes ]);
    const sortedSpaces      = useMemo(() => {
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


    const handleSectionClick = useCallback(( sectionId: string ) => {
        if ( !isAdmin ) return;
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
                const firstSelectedSpace    = prev[0].session.spaceId;
                const firstDaySelected      = prev[0].session.dayId;

                // Only allow same space
                if ( section.session.spaceId !== firstSelectedSpace ) {
                    return prev; // Return unchanged state - different space
                }

                // Only allow same day
                if ( section.session.dayId !== firstDaySelected ) {
                    return prev; // Return unchanged state - different day
                }
            }

            // All validations passed, add to selection
            return [...prev, section];
        });
    }, []);


    const handleClearSelection = useCallback(() => {
        setSelectedSections( [] );
    }, []);


    useEffect(() => {
        const handleKeyDown = ( e: KeyboardEvent ) => {
            if ( e.key === 'Escape' && selectedSections.length > 0 ) {
                handleClearSelection();
            }
        };

        window.addEventListener( 'keydown', handleKeyDown );
        return () => window.removeEventListener( 'keydown', handleKeyDown );
    }, [selectedSections.length, handleClearSelection]);


    // const getDayModuleId = useCallback((
    //     dayId       : number,
    //     moduleId    : string
    // ): number | undefined =>
    //     modules.find( dayM =>
    //         dayM.id === moduleId &&
    //         dayM.dayId === dayId
    //     )?.dayModuleId,
    // [modules]);


    const onUpdateSectionMultiple = useCallback((
        spaceId: string,
        updates: SessionMove[],
        updatedSections: SectionSession[]
    ): void => {
        // Find the target space
        const targetSpace = sortedSpaces.find(space => space.name === spaceId);

        if (!targetSpace) {
            toast('No se pudo encontrar el espacio destino', errorToast);
            return;
        }

        // Check for capacity issues only for sessions changing spaces
        const affectedSessions: Array<{
            ssec            : string;
            registered      : number | null;
            quota           : number;
            chairsAvailable : number;
        }> = [];

        updates.forEach( update => {
            // Find the session in the current sections
            const section = sections.find( s => s.session.id === update.sessionId );

            if ( !section ) return;

            // Only validate if the space is changing
            if ( section.session.spaceId !== spaceId ) {
                // Calculate students: use registered if not null, otherwise use quota
                const students          = section.registered || section.quota;
                const chairsAvailable   = targetSpace.capacity - students;

                // If capacity would be negative, add to affected sessions
                if ( chairsAvailable < 0 ) {
                    affectedSessions.push({
                        ssec            : `${section.subject.id}-${section.code}`,
                        registered      : section.registered,
                        quota           : section.quota,
                        chairsAvailable
                    });
                }
            }
        });

        // If there are affected sessions, show warning dialog
        if ( affectedSessions.length > 0 ) {
            setCapacityWarning({
                show            : true,
                spaceName       : targetSpace.name,
                spaceCapacity   : targetSpace.capacity,
                affectedSessions,
                pendingUpdate: {
                    spaceId,
                    updates,
                    updatedSections
                }
            });
            return;
        }

        // No capacity issues, proceed with update
        const payload = updates.map( u => ({
            sessionId   : u.sessionId,
            dayModuleId : u.dayModuleId
        }));

        updateSessionsMultiple({
            spaceId,
            updates: payload,
            updatedSections
        });
    }, [sections, sortedSpaces, updateSessionsMultiple]);


    const getSectionsForCell = useCallback(( spaceId: string, dayModuleId: number ) => {
        const key = `${spaceId}-${dayModuleId}`;

        return sectionsByCellRef.current.get(key) || [];
    }, []);


    const handleMultipleSectionMove = useCallback((
        targetRoomId: string,
        targetDayModuleId: number,
        draggedSessionId?: string
    ): boolean => {
        // Determine which sections to move
        let sectionsToMove: SectionSession[];

        if ( selectedSections.length > 0 ) {
            // Use selected sections for multi-selection move
            sectionsToMove = selectedSections;
        } else if ( draggedSessionId ) {
            // Single session drag without selection - find the dragged session
            const draggedSection = sections.find( s => s.session.id === draggedSessionId );

            if ( !draggedSection ) {
                toast( 'No se pudo encontrar la sesión', errorToast );
                return false;
            }

            sectionsToMove = [draggedSection];
        } else {
            // No sections to move
            return false;
        }

        // Find the target module info
        const targetModule = modules.find( m => m.dayModuleId === targetDayModuleId );

        if ( !targetModule ) {
            toast( 'No se pudo encontrar el módulo de destino', errorToast );
            return false;
        }

        // Calculate relative positions based on the first section to move
        const baseSection       = sectionsToMove[0];
        const baseDayModuleId   = baseSection.session.dayModuleId;

        // Find the base module info
        const baseModule = modules.find( m => m.dayModuleId === baseDayModuleId );

        if ( !baseModule ) {
            toast( 'No se pudo encontrar el módulo base', errorToast );
            return false;
        }

        // Calculate all target positions using module ORDER instead of dayModuleId
        const updates = sectionsToMove.map( section => {
            // Find the module for this section
            const sectionModule = modules.find( m => m.dayModuleId === section.session.dayModuleId );

            if ( !sectionModule ) {
                toast( 'No se pudo encontrar el módulo de la sección', errorToast );
                return null;
            }

            // Calculate offset using module order and day
            const orderOffset   = sectionModule.order - baseModule.order;
            const dayOffset     = sectionModule.dayId - baseModule.dayId;

            // Calculate target position
            const targetDayId       = targetModule.dayId + dayOffset;
            const targetModuleOrder = targetModule.order + orderOffset;

            // Find the module with this order on the target day
            let targetModuleForSection = modules.find(m => 
                m.dayId === targetDayId && m.order === targetModuleOrder
            );

            // If not found on the target day, try to handle day wrapping
            if ( !targetModuleForSection ) {
                // Get all modules for the target day sorted by order
                const targetDayModules = modules
                    .filter( m => m.dayId === targetDayId )
                    .sort(( a, b ) => a.order - b.order );

                // If targetModuleOrder is beyond this day, look in next day
                if ( targetModuleOrder >= targetDayModules.length ) {
                    const nextDayId     = targetDayId + 1;
                    const nextDayOrder  = targetModuleOrder - targetDayModules.length;

                    targetModuleForSection = modules.find(m => 
                        m.dayId === nextDayId && m.order === nextDayOrder
                    );
                }
                // If targetModuleOrder is negative, look in previous day
                else if ( targetModuleOrder < 0 ) {
                    const prevDayId         = targetDayId - 1;
                    const prevDayModules    = modules
                        .filter( m => m.dayId === prevDayId )
                        .sort(( a, b ) => a.order - b.order );
                    const prevDayOrder = prevDayModules.length + targetModuleOrder;

                    targetModuleForSection = modules.find( m => 
                        m.dayId === prevDayId && m.order === prevDayOrder
                    );
                }
            }

            if ( !targetModuleForSection ) {
                return null;
            }

            return {
                section,
                sessionId       : section.session.id,
                newDayModuleId  : targetModuleForSection.dayModuleId,
                newRoomId       : targetRoomId,
                dayId           : targetModuleForSection.dayId,
                moduleId        : targetModuleForSection.id
            };
        });

        // Check if any update failed to calculate
        if ( updates.some( u => u === null )) {
            toast( 'No se pudieron calcular todas las posiciones', errorToast );
            return false;
        }

        // Validate that ALL target positions are available
        for ( const update of updates ) {
            if ( !update ) continue;

            const cellSections = getSectionsForCell( update.newRoomId, update.newDayModuleId );
            // A cell is occupied if it has sections that are NOT in our sections to move
            // Use session.id for unique identification
            const isOccupied = cellSections.some( s => 
                !sectionsToMove.some( selected => selected.session.id === s.session.id )
            );

            if ( isOccupied ) {
                toast( 'Una o más sesiones no se pueden mover porque el destino está ocupado', errorToast );
                return false;
            }
        }

        const updatedSections = sections.map( section => {
            const updateInfo = updates.find( u => u?.sessionId === section.session.id );

            if ( updateInfo ) {
                return {
                    ...section,
                    session: {
                        ...section.session,
                        dayId       : updateInfo.dayId,
                        module      : { ...section.session.module, id: updateInfo.moduleId },
                        dayModuleId : updateInfo.newDayModuleId,
                        spaceId     : updateInfo.newRoomId,
                    }
                };
            }

            return section;
        });

        // Send update to backend
        const backendUpdates = updates
            .filter(( u ): u is NonNullable<typeof u> => u !== null )
            .map( u => ({
                sessionId   : u.sessionId,
                spaceId     : u.newRoomId,
                dayModuleId : u.newDayModuleId
            }));

        // Extract the common spaceId (all sessions go to the same room)
        const spaceId = targetRoomId;

        onUpdateSectionMultiple( spaceId, backendUpdates, updatedSections );

        // Clear selection after successful move
        handleClearSelection();

        return true;
    }, [selectedSections, sections, getSectionsForCell, modules, onUpdateSectionMultiple, handleClearSelection]);


    const handleModalClose = useCallback(() => {
        setIsModalOpen( false );
        setSelectedSection( null );
    }, []);


    const handleCapacityWarningConfirm = useCallback(() => {
        if ( capacityWarning.pendingUpdate ) {
            const { spaceId, updates, updatedSections } = capacityWarning.pendingUpdate;

            // Transform updates to remove spaceId (it goes in the URL)
            const payload = updates.map( u => ({
                sessionId   : u.sessionId,
                dayModuleId : u.dayModuleId
            }));

            // Call the mutation with optimistic update and force flag
            updateSessionsMultiple({
                spaceId,
                updates         : payload,
                updatedSections,
                isNegativeChairs: true  // Force update despite negative capacity
            });
        }

        // Reset capacity warning state
        setCapacityWarning({
            show                : false,
            spaceName           : '',
            spaceCapacity       : 0,
            affectedSessions    : [],
            pendingUpdate       : null
        });
    }, [capacityWarning.pendingUpdate, updateSessionsMultiple]);


    const handleCapacityWarningCancel = useCallback(() => {
        // Just close the dialog, don't send the update
        setCapacityWarning({
            show                : false,
            spaceName           : '',
            spaceCapacity       : 0,
            affectedSessions    : [],
            pendingUpdate       : null
        });
    }, []);


    if ( modulesLoading || sectionsLoading || spacesLoading || sizesLoading || !isInitialized ) {
        return <TableSkeleton />;
    }


    return (
        <>
            {selectedPeriodIds.length === 0 ? (
                <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                    <div className="max-w-md w-full mx-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg p-8 border border-blue-200 dark:border-gray-700">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                                    <svg
                                        className="h-8 w-8 text-blue-600 dark:text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Seleccione un Período
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 mb-4">
                                    Para visualizar las sesiones académicas, por favor seleccione un período desde el selector en la parte superior de la página.
                                </p>

                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>

                                    <span>El selector se encuentra en la esquina superior derecha</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <ModuleGrid
                        spaces                  = { sortedSpaces }
                        onSectionClick          = { handleSectionClick }
                        onMultipleSectionMove   = { handleMultipleSectionMove }
                        onSortChange            = { handleSortChange }
                        sortConfig              = { sortConfig }
                        getSectionsForCell      = { getSectionsForCell }
                        isCalculating           = { isCalculating }
                        selectedSections        = { selectedSections }
                        onSectionSelect         = { handleSectionSelect }
                        onClearSelection        = { handleClearSelection }
                    />

                    {/* To Update */}
                    { isAdmin && isModalOpen && selectedSection && (
                        <SessionForm
                            isOpen          = { isModalOpen }
                            onClose         = { handleModalClose }
                            sectionSession  = { selectedSection }
                            onSave          = { handleModalClose }
                        />
                    )}

                    {/* Capacity Warning Dialog */}
                    <CapacityWarningDialog
                        open                = { capacityWarning.show }
                        spaceName           = { capacityWarning.spaceName }
                        spaceCapacity       = { capacityWarning.spaceCapacity }
                        affectedSessions    = { capacityWarning.affectedSessions }
                        onConfirm           = { handleCapacityWarningConfirm }
                        onCancel            = { handleCapacityWarningCancel }
                        onOpenChange        = {( open ) => {
                            if ( !open ) handleCapacityWarningCancel();
                        }}
                    />
                </>
            )}
        </>
    );
}
