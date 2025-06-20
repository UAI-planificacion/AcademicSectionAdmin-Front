"use client"

import { useState, useEffect, JSX } from 'react';

import { toast } from 'sonner';

import type {
    Space,
    SortDirection,
    SortField,
    Filters,
    SortConfig
} from '@/lib/types';

import { useSections }  from '@/hooks/use-sections';
import { useSpaces }    from '@/hooks/use-spaces';
import { useModules }   from '@/hooks/use-modules';

import { SectionModal } from '@/components/sections/section-modal';
import { ModuleGrid }   from '@/components/sections/module-grid';

import { Section, UpdateSection } from '@/models/section.model';

import { errorToast, successToast } from '@/config/toast/toast.config';


export function SchedulerDashboard(): JSX.Element {
    const { sections: initialSections, loading: sectionsLoading }   = useSections();
    const { spaces: initialRooms, loading: spacesLoading }          = useSpaces();
    const { modules } = useModules();

    const [sections, setSections]                   = useState<Section[]>([]);
    const [filteredSections, setFilteredSections]   = useState<Section[]>([]);
    const [rooms, setRooms]                         = useState<Space[]>([]);
    const [filteredRooms, setFilteredRooms]         = useState<Space[]>([]);
    const [selectedSection, setSelectedSection]     = useState<Section | null>(null);
    const [isModalOpen, setIsModalOpen]             = useState(false);
    const [isInitialized, setIsInitialized]         = useState(false);
    const [sortConfig, setSortConfig]               = useState<SortConfig>({
        field: "name",
        direction: "asc",
    });
    const [filters, setFilters] = useState<Filters>({
        periods: [],
        buildings: [],
        sizes: [],
        rooms: [],
        types: [],
        capacities: [],
    });

    const sortedRooms = [...filteredRooms].sort((a, b) => {
        const { field, direction } = sortConfig;

        if ( field === "capacity" ) {
            return direction === "asc" ? a.capacity - b.capacity : b.capacity - a.capacity;
        }
        else if ( field === "size" ) {
            return direction === "asc"
                ? a.sizeId.localeCompare(b.sizeId)
                : b.sizeId.localeCompare(a.sizeId);
        }
        else {
            const aValue = a[field as keyof Space];
            const bValue = b[field as keyof Space];

            if ( typeof aValue === "string" && typeof bValue === "string" ) {
                return direction === "asc"
                    ? aValue.localeCompare( bValue )
                    : bValue.localeCompare( aValue );
            }

            return 0;
        }
    });

    useEffect(() => {
        if ( !sectionsLoading && !spacesLoading ) {
            setSections( initialSections );
            setFilteredSections( initialSections );
            setRooms( initialRooms );
            setFilteredRooms( initialRooms );
            setIsInitialized( true );
        }
    }, [ initialSections, initialRooms, sectionsLoading, spacesLoading ] );

    useEffect(() => {
        if ( !isInitialized ) return;

        console.log("Aplicando filtros:", filters);

        // Filtrar secciones
        let filteredSecs = [...sections];

        // Filter by periods (multiple selection)
        if (filters.periods.length > 0) {
            filteredSecs = filteredSecs.filter((section) => filters.periods.includes(section.period))
        }

        // Filtrar salas
        let filteredRms = [...rooms]

        // Filter by buildings (multiple selection)
        if (filters.buildings && filters.buildings.length > 0) {
            filteredRms = filteredRms.filter((room) => filters.buildings.includes(room.building))
        }

        // Filter by capacity groups (multiple selection)
        if (filters.sizes && filters.sizes.length > 0) {
            filteredRms = filteredRms.filter((room) => filters.sizes.includes(room.sizeId))
        }

        // Filter by room IDs (multiple selection)
        if (filters.rooms && filters.rooms.length > 0) {
            filteredRms = filteredRms.filter((room) => filters.rooms!.includes(room.id))
        }

        // Filter by room types (multiple selection)
        if (filters.types && filters.types.length > 0) {
            filteredRms = filteredRms.filter((room) => filters.types!.includes(room.type))
        }

        // Filter by capacities (multiple selection)
        if (filters.capacities && filters.capacities.length > 0) {
            filteredRms = filteredRms.filter((room) => filters.capacities!.includes(room.capacity.toString()))
        }

        // Ahora filtramos las secciones para que solo incluyan las que están en las salas filtradas
        const filteredRoomIds = new Set(filteredRms.map((room) => room.id))
        filteredSecs = filteredSecs.filter((section) => filteredRoomIds.has(section.room))

        console.log("Secciones filtradas:", filteredSecs.length)
        console.log("Salas filtradas:", filteredRms.length)

        // Update filtered sections and rooms
        setFilteredSections( filteredSecs )
        setFilteredRooms( filteredRms )
    }, [ filters, sections, rooms, isInitialized ])


    const handleSortChange = ( field: SortField, direction: SortDirection ) => {
        setSortConfig({ field, direction });
    }

    const handleSaveSection = ( section: Section ): boolean => {
        // Verificar si es una sección existente (tiene ID) o nueva
        const existingSection = sections.find(s => s.id === section.id);
        
        if (existingSection) {
            // Es una actualización
            const result = handleUpdateSection(section);
            if (result) {
                // Actualizar filteredSections inmediatamente
                setFilteredSections(prevFiltered => 
                    prevFiltered.map(s => s.id === section.id ? section : s)
                );
            }
            return result;
        } else {
            // Es una nueva sección
            const overlapping = sections.some(( existingSection : Section ) => {
                if ( existingSection.room       !== section.room )       return false;
                if ( existingSection.day        !== section.day )        return false;
                if ( existingSection.moduleId   !== section.moduleId )   return false;
                return true;
            });

            if ( overlapping ) {
                alert("No se puede crear la sección porque ya existe una en ese módulo y sala.")
                return false;
            }

            // Agregar la nueva sección
            setSections(prevSections => [...prevSections, section]);

            // Verificar si la nueva sección debe aparecer en filteredSections
            const filteredRoomIds = new Set(filteredRooms.map(room => room.id));
            if (filteredRoomIds.has(section.room)) {
                setFilteredSections(prevFiltered => [...prevFiltered, section]);
            }
            
            return true;
        }
    }

    const handleUpdateSection = ( updatedSection: Section ) => {
        const overlapping = sections.some(( section : Section ) => {
            if ( section.id         === updatedSection.id )         return false;
            if ( section.room       !== updatedSection.room )       return false;
            if ( section.day        !== updatedSection.day )        return false;
            if ( section.moduleId   !== updatedSection.moduleId )   return false;

            return true;
        })

        if ( overlapping ) {
            alert("No se puede actualizar la sección porque ya existe una en ese módulo y sala.")
            return false
        }

        const updatedSections = sections.map(( section ) => 
            ( section.id === updatedSection.id ? updatedSection : section )
        )

        setSections( updatedSections );

        setFilteredSections(prevFiltered => 
            prevFiltered.map(s => s.id === updatedSection.id ? updatedSection : s)
        );

        return true
    }

    const handleDeleteSection = ( sectionId: string ) => {
        const updatedSections = sections.filter(( section ) => section.id !== sectionId );
        setSections( updatedSections );
    }

    const handleSectionClick = ( sectionId: string ) => {
        const section = sections.find(( s : Section ) => s.id === sectionId );

        if ( !section ) return;

        setSelectedSection( section );
        setIsModalOpen( true );
    }

    function handleSectionMove(
        sectionId   : string,
        newRoomId   : string,
        newDay      : number,
        newModuleId : string
    ) : boolean {
        const targetOccupied = sections
            .some(( section : Section ) =>
                section.id          !== sectionId   &&
                section.room        === newRoomId   &&
                section.day         === newDay      &&
                section.moduleId    === newModuleId
            );

        if ( targetOccupied ) return false;

        // Encontrar la sección a actualizar
        const sectionToMove = sections.find(section => section.id === sectionId);
        if (!sectionToMove) return false;

        // Crear la sección actualizada con los nuevos datos
        const updatedSection: Section = {
            ...sectionToMove,
            room        : newRoomId,
            day         : newDay,
            moduleId    : newModuleId,
        };

        // Actualizar solo la sección específica en el estado
        setSections(prevSections => 
            prevSections.map(section => 
                section.id === sectionId ? updatedSection : section
            )
        );

        // Actualizar también en filteredSections
        setFilteredSections(prevFiltered => 
            prevFiltered.map(section => 
                section.id === sectionId ? updatedSection : section
            )
        );

        onUpdateSection( updatedSection );

        return true;
    }

    async function onUpdateSection( updatedSection: Section ) {
        const saveSection: UpdateSection = {
            roomId      : updatedSection.room,
            dayModuleId : getDayModuleId( updatedSection )
        }

        console.log('🚀 ~ file: scheduler-dashboard.tsx:272 ~ saveSection:', saveSection)

        try {
            const data = await fetch( `http://localhost:3030/api/v1/sections/${updatedSection.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify( saveSection )
            });

            await data.json();

            toast( 'Sección actualizada correctamente', successToast );
        } catch (error) {
            toast( 'No se pudo actualizar la sección', errorToast );
        }
    }


    function getDayModuleId( section: Section ): number {
        return modules.find( dayM =>
            dayM.id === section.moduleId &&
            dayM.dayId === section.day
        )?.dayModuleId!;
    }


    return (
        <>
            <ModuleGrid
                sections        = { filteredSections }
                rooms           = { sortedRooms }
                onSectionClick  = { handleSectionClick }
                onSectionMove   = { handleSectionMove }
                onSectionSave   = { handleSaveSection }
                onSortChange    = { handleSortChange }
                sortConfig      = { sortConfig }
            />

            {isModalOpen && selectedSection && (
                <SectionModal
                    section     = { selectedSection }
                    rooms       = { rooms }
                    onClose     = { () => setIsModalOpen( false )}
                    onSave      = { handleUpdateSection }
                    onDelete    = { handleDeleteSection }
                />
            )}
        </>
    );
}
