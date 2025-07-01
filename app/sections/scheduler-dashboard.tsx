"use client"

import {
    useState,
    useEffect,
    JSX,
    useMemo,
    useCallback,
    useRef
}                       from 'react';
import { useRouter }    from 'next/navigation';

import { toast } from 'sonner';

import type {
    Space,
    SortDirection,
    SortField,
    Filters,
    SortConfig,
} from '@/lib/types';

import { useSections }  from '@/hooks/use-sections';
import { useSpaces }    from '@/hooks/use-spaces';
import { useModules }   from '@/hooks/use-modules';

import { SectionModal } from '@/app/sections/section-modal';
import { ModuleGrid }   from '@/app/sections/module-grid';
import LoadExcel        from '@/app/sections/LoadExcel';
import TableSkeleton    from '@/app/sections/TableSkeleton';

import { Section, UpdateSection }   from '@/models/section.model';
import { Sizes }                    from '@/models/size.model';

import {
    errorToast,
    successToast
}               from '@/config/toast/toast.config';
import { ENV }  from '@/config/envs/env';

import { fetchApi } from '@/services/fetch';
import { useSizes } from '@/hooks/use-sizes';


const createSizeOrderMap = ( sizes: Sizes[] ): Map<string, number> =>
    new Map(sizes.map( size => [ size.id, size.order ]));


function orderSizes( sizeOrderMap: Map<string, number>, a: Space, b: Space ): number {
    const orderA = sizeOrderMap.get( a.sizeId ) || 0;
    const orderB = sizeOrderMap.get( b.sizeId ) || 0;
    return orderA - orderB;
}


export function SchedulerDashboard(): JSX.Element {
    const router = useRouter();

    // Hooks de datos
    const { modules, isLoading: modulesLoading, isError: modulesError } = useModules();
    const {
        sections    : initialSections,
        isLoading   : sectionsLoading,
        isError     : sectionsError,
        error       : sectionsErrorMessage
    } = useSections();
    const { spaces: initialRooms, loading: spacesLoading } = useSpaces();
    const { sizes, loading: sizesLoading } = useSizes();

    // Estados locales
    const [sections, setSections]                   = useState<Section[]>( [] );
    const [filteredSections, setFilteredSections]   = useState<Section[]>( [] );
    const [rooms, setRooms]                         = useState<Space[]>( [] );
    const [filteredRooms, setFilteredRooms]         = useState<Space[]>( [] );
    const [selectedSection, setSelectedSection]     = useState<Section | null>( null );
    const [isModalOpen, setIsModalOpen]             = useState<boolean>( false );
    const [showLoadExcel, setShowLoadExcel]         = useState<boolean>( false );
    const [isInitialized, setIsInitialized]         = useState<boolean>( false );
    const [isCalculating, setIsCalculating]         = useState<boolean>( false );
    const [sortConfig, setSortConfig]               = useState<SortConfig>({
        field       : "name",
        direction   : "asc",
    });
    
    // Ref para cache persistente de sectionsByCellMemo
    const sectionsByCellRef     = useRef<Map<string, Section[]>>(new Map());
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
            setShowLoadExcel( true );

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


    useEffect(() => {
        if ( !isInitialized ) return;

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
                    const newMap = new Map<string, Section[]>();

                    sections.forEach(section => {
                        const key = `${section.room}-${section.day}-${section.moduleId}`;

                        if (!newMap.has( key )) {
                            newMap.set( key, [] );
                        }

                        newMap.get( key )!.push( section );
                    });

                    sectionsByCellRef.current = newMap;
                    lastSectionsLengthRef.current = currentLength;
                    setIsCalculating(false);
                }, 0);

                return () => clearTimeout(timeoutId);
            } else {
                const newMap = new Map<string, Section[]>();

                sections.forEach(section => {
                    const key = `${section.room}-${section.day}-${section.moduleId}`;

                    if (!newMap.has(key)) {
                        newMap.set(key, []);
                    }

                    newMap.get(key)!.push(section);
                });

                sectionsByCellRef.current = newMap;
                lastSectionsLengthRef.current = currentLength;
            }
        } else {
            const newMap = new Map<string, Section[]>();

            sections.forEach(section => {
                const key = `${section.room}-${section.day}-${section.moduleId}`;

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

        console.log("Aplicando filtros:", filters);

        let filteredSecs = [...sections];

        if ( filters.periods.length > 0 ) {
            filteredSecs = filteredSecs.filter( section => filters.periods.includes( section.period ));
        }

        let filteredRms = [...rooms];

        if ( filters.buildings && filters.buildings.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.buildings.includes( room.building ));
        }

        if ( filters.sizes && filters.sizes.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.sizes.includes( room.sizeId ));
        }

        if ( filters.rooms && filters.rooms.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.rooms.includes( room.id ));
        }

        if ( filters.types && filters.types.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.types.includes( room.type ));
        }

        if ( filters.capacities && filters.capacities.length > 0 ) {
            filteredRms = filteredRms.filter( room => filters.capacities.includes( room.capacity.toString() ));
        }

        const filteredRoomIds = new Set(filteredRms.map( room => room.id ))
        filteredSecs = filteredSecs.filter( section => filteredRoomIds.has( section.room ));

        console.log("************Secciones filtradas:", filteredSecs.length)
        console.log("**********Salas filtradas:", filteredRms.length)

        setFilteredSections( filteredSecs );
        setFilteredRooms( filteredRms );
    }, [ sections, rooms, isInitialized ]);

    const sizeOrderMap      = useMemo(() => createSizeOrderMap( sizes ), [ sizes ]);
    const filteredRoomIds   = useMemo(() => new Set( filteredRooms.map( room => room.id )), [ filteredRooms ]);
    const sortedRooms       = useMemo(() => {
        if ( !filteredRooms.length ) return [];

        return [...filteredRooms].sort(( a, b ) => {
            const comparison = {
                name        : a.id.localeCompare( b.id ),
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


    const handleUpdateSection = useCallback(( updatedSection: Section ) : boolean => {
        const overlapping = sections.some(( section : Section ) => {
            if ( section.id         === updatedSection.id )         return false;
            if ( section.room       !== updatedSection.room )       return false;
            if ( section.day        !== updatedSection.day )        return false;
            if ( section.moduleId   !== updatedSection.moduleId )   return false;

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


    const handleSaveSection = useCallback(( section: Section ): boolean => {
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
            const overlapping = sections.some(( existingSection : Section ) => {
                if ( existingSection.room       !== section.room )       return false;
                if ( existingSection.day        !== section.day )        return false;
                if ( existingSection.moduleId   !== section.moduleId )   return false;
                return true;
            });

            if ( overlapping ) {
                toast( 'No se puede crear la sección porque ya existe una en ese módulo y sala.', errorToast );
                return false;
            }

            setSections(prevSections => [ ...prevSections, section ]);

            if ( filteredRoomIds.has( section.room )) {
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
        const section = sections.find(( s : Section ) => s.id === sectionId );

        if ( !section ) return;

        setSelectedSection( section );
        setIsModalOpen( true );
    }, [sections]);


    const getDayModuleId = useCallback(( section: Section ): number =>
        modules.find( dayM =>
            dayM.id === section.moduleId &&
            dayM.dayId === section.day
        )?.dayModuleId!,
    [modules]);


    const onUpdateSection = useCallback( async ( updatedSection: Section ) => {
        const saveSection: UpdateSection = {
            roomId      : updatedSection.room,
            dayModuleId : getDayModuleId( updatedSection )
        }

        const url = `${ENV.REQUEST_BACK_URL}sections/${updatedSection.id}`;

        try {
            const data = await fetchApi<Section | null>( url, "PATCH", saveSection );

            if ( !data ) {
                toast( 'No se pudo actualizar la sección', errorToast );
                return;
            }

            toast( 'Sección actualizada correctamente', successToast );
        } catch ( error ) {
            toast( 'No se pudo actualizar la sección', errorToast );
        }
    }, [modules, getDayModuleId]);


    const handleSectionMove = useCallback((
        sectionId   : string,
        newRoomId   : string,
        newDay      : number,
        newModuleId : string
    ) : boolean => {
        const targetOccupied = sections
            .some(( section : Section ) =>
                section.id          !== sectionId   &&
                section.room        === newRoomId   &&
                section.day         === newDay      &&
                section.moduleId    === newModuleId
            );

        if ( targetOccupied ) {
            toast( 'No se puede mover la sección porque ya existe una en ese módulo y sala.', errorToast );
            return false;
        }

        const sectionToMove = sections.find( section => section.id === sectionId );

        if ( !sectionToMove ) return false;

        const updatedSection: Section = {
            ...sectionToMove,
            room        : newRoomId,
            day         : newDay,
            moduleId    : newModuleId,
        };

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

        onUpdateSection( updatedSection );

        return true;
    }, [sections, onUpdateSection]);


    const handleModalClose = useCallback(() => {
        setIsModalOpen( false );
        setSelectedSection( null );
    }, []);


    const handleLoadExcelSuccess = useCallback(() => {
        setShowLoadExcel( false );
        toast( 'Archivo Excel cargado exitosamente. Recargando datos...', successToast );
        window.location.reload();
    }, []);

    const handleLoadExcelCancel = useCallback(() => {
        setShowLoadExcel( false );
    }, []);


    const getSectionsForCell = useCallback((roomId: string, day: number, moduleId: string) => {
        const key = `${roomId}-${day}-${moduleId}`;
        return sectionsByCellRef.current.get(key) || [];
    }, []);


    if (modulesLoading || sectionsLoading || spacesLoading || sizesLoading || !isInitialized) {
        return <TableSkeleton />;
    }

    if ( sectionsError ) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive mb-2">Error al cargar secciones</p>

                    <p className="text-muted-foreground text-sm">{sectionsErrorMessage?.message}</p>

                    <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Debes cargar un archivo Excel con las secciones</p>

                        <LoadExcel
                            onSuccess   = { handleLoadExcelSuccess }
                            onCancel    = { handleLoadExcelCancel }
                        />
                    </div>
                </div>
            </div>
        );
    }

    if ( showLoadExcel ) {
        return (
            <LoadExcel
                onSuccess   = { handleLoadExcelSuccess }
                onCancel    = { handleLoadExcelCancel }
            />
        );
    }

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
            />

            {isModalOpen && selectedSection && (
                <SectionModal
                    section     = { selectedSection }
                    rooms       = { rooms }
                    onClose     = { handleModalClose }
                    onSave      = { handleUpdateSection }
                    onDelete    = { handleDeleteSection }
                />
            )}
        </>
    );
}
