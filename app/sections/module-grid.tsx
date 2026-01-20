"use client"

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react"

import {
    AlertCircle,
    Armchair,
    ArrowDownAZ,
    ArrowUpAZ,
    Building2,
    Ruler,
    Filter,
    Cuboid,
    Proportions,
    ArrowUp01,
    ArrowDown10
}  from "lucide-react"

import {
    cn,
    getBuildingName,
    getSpaceType
} from "@/lib/utils";
import type {
    SpaceData,
    SortConfig,
    SortField,
    SortDirection,
    Filters
} from "@/lib/types";
import { SectionSession } from "@/models/section.model";

import {
    Popover,
    PopoverContent,
    PopoverTrigger
}                           from "@/components/ui/popover";
import MultiSelectCombobox  from "@/components/inputs/Combobox";
import { Button }           from "@/components/ui/button";
import { SectionCard }      from "@/app/sections/SectionCard";
import { SessionForm }      from "@/app/sections/session-form";

import { useDays }                      from "@/hooks/use-days";
import { useModules, getModulesForDay } from "@/hooks/use-modules";
import { usePeriods }                   from "@/hooks/use-periods";
import { useSizes }                     from "@/hooks/use-sizes";

// import { Section } from "@/models/section.model";
// import { BuildingEnum } from "@/models/section-session.model";


interface ModuleGridProps {
    // sections            : SectionSession[];
    spaces               : SpaceData[];
    onSectionClick      : ( sectionId: string ) => void;
    onSectionMove       : ( sectionId: string, newRoomId: string, newDay: number, newModuleId: string ) => boolean;
    onMultipleSectionMove : ( targetRoomId: string, targetDayModuleId: number ) => boolean;
    onSectionSave       : ( section: SectionSession ) => boolean;
    onSortChange        : ( field: SortField, direction: SortDirection ) => void;
    sortConfig          : SortConfig;
    onFilterChange?     : ( filters: Filters ) => void;
    getSectionsForCell  : ( spaceId: string, dayModuleId: number ) => SectionSession[];
    isCalculating       : boolean;
    selectedSections    : SectionSession[];
    onSectionSelect     : ( section: SectionSession | null ) => void;
    onClearSelection    : () => void;
}


export function ModuleGrid({
    // sections,
    spaces,
    onSectionClick,
    onSectionMove,
    onMultipleSectionMove,
    onSectionSave,
    onSortChange,
    sortConfig,
    onFilterChange,
    getSectionsForCell,
    isCalculating,
    selectedSections,
    onSectionSelect,
    onClearSelection,
}: ModuleGridProps ): React.JSX.Element{
    // Filtrar las salas localmente
    const [filteredRooms, setFilteredRooms]     = useState<SpaceData[]>( spaces );
    const [draggedSection, setDraggedSection]   = useState<string | null>( null );
    const [dragOverCell, setDragOverCell]       = useState<string | null>( null );
    const [dragOverCells, setDragOverCells]     = useState<Map<string, boolean>>( new Map() ); // Map<cellId, isOccupied>
    const [errorMessage, setErrorMessage]       = useState<string | null>( null );
    const [hoveredConsecutiveId, setHoveredConsecutiveId] = useState<string | null>( null );

    // State for SessionForm modal
    const [showSessionForm, setShowSessionForm] = useState<boolean>( false );
    const [sessionFormData, setSessionFormData] = useState<{ dayId: number; moduleId: string; spaceId: string } | null>( null );

    // Estados para los filtros
    const [localFilters, setLocalFilters] = useState<Filters & { rooms?: string[], types?: string[], capacities?: string[] }>({
        periods     : [],
        buildings   : [],
        sizes       : [],
        rooms       : [],
        types       : [],
        capacities  : [],
    });

    // Referencias para sincronizar el scroll
    const fixedTableRef         = useRef<HTMLDivElement>( null );
    const scrollableTableRef    = useRef<HTMLDivElement>( null );

    const { days }      = useDays();
    const { modules }   = useModules();
    const { periods }   = usePeriods();
    const { sizes }     = useSizes();

    // Extraer valores únicos para los filtros
    const uniqueRoomIds     = useMemo(() => Array.from( new Set( spaces.map( room => room.name ))), [spaces]);
    const uniqueTypes       = useMemo(() => Array.from( new Set( spaces.map( room => room.type ))), [spaces]);
    const uniqueBuildings   = useMemo(() => Array.from( new Set( spaces.map( room => room.building ))), [spaces]);

    // Función para aplicar filtros localmente
    const applyFilters = useCallback(( filters: Filters ) => {
        let filtered = [...spaces];

        // Filtrar por sala (ID)
        if (filters.rooms && filters.rooms.length > 0) {
            filtered = filtered.filter(room => filters.rooms!.includes(room.name));
        }

        // Filtrar por tipo
        if (filters.types && filters.types.length > 0) {
            filtered = filtered.filter(room => filters.types!.includes(room.type));
        }

        // Filtrar por edificio
        if (filters.buildings && filters.buildings.length > 0) {
            filtered = filtered.filter(room => filters.buildings.includes(room.building));
        }

        // Filtrar por talla
        if (filters.sizes && filters.sizes.length > 0) {
            filtered = filtered.filter(room => filters.sizes.includes(room.size));
        }

        // Filtrar por capacidad
        if (filters.capacities && filters.capacities.length > 0) {
            filtered = filtered.filter(room => filters.capacities!.includes(room.capacity.toString()));
        }

        setFilteredRooms(filtered);
    }, [spaces]);

    // Manejar cambios en los filtros
    const handleFilterChange = useCallback((filterType: keyof Filters, values: string[]) => {
        setLocalFilters(prev => {
            const newFilters = { ...prev, [filterType]: values };

            applyFilters( newFilters );

            if ( onFilterChange ) {
                onFilterChange( newFilters );
            }

            return newFilters;
        });
    }, [onFilterChange, applyFilters]);


    useEffect(() => {
        setFilteredRooms( spaces );
        applyFilters( localFilters );
    }, [spaces, applyFilters, localFilters]);


    useEffect(() => {
        if ( onFilterChange ) {
            onFilterChange( localFilters );
        }
    }, [onFilterChange, localFilters]);


    const handleScroll = ( e: React.UIEvent<HTMLDivElement> ) => {
        if ( e.currentTarget === scrollableTableRef.current && fixedTableRef.current ) {
            fixedTableRef.current.scrollTop = e.currentTarget.scrollTop;
        } else if ( e.currentTarget === fixedTableRef.current && scrollableTableRef.current ) {
            scrollableTableRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    }


    const renderCellContent = useCallback((
        room            : SpaceData,
        day             : any,
        module          : any,
        moduleIndex     : number,
        isLastModule    : boolean
    ): React.JSX.Element => {
        if ( isCalculating ) {
            return (
                <td 
                    key={`skeleton-${room.name}-${day.id}-${module.id}`}
                    className={cn(
                        "border-x border-l-zinc-300 dark:border-l-zinc-700 p-2 h-16 min-w-[80px] relative",
                        isLastModule ? "border-r-zinc-400 dark:border-r-zinc-600" : "border-r-zinc-300 dark:border-r-zinc-700"
                    )}
                >
                    <div className="animate-pulse">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                </td>
            );
        }

        const cellId        = `${room.name}-${module.dayModuleId}`;
        const cellSections  = getSectionsForCell(room.name, module.dayModuleId);

        // Check if this cell is in the multi-drag state
        const isInMultiDrag         = dragOverCells.has( cellId );
        const isOccupiedInMultiDrag = dragOverCells.get( cellId ) || false;

        // Determine drag over state
        const isDragOver = isInMultiDrag || dragOverCell === cellId;
        const hasSection    = cellSections.length > 0;
        const section       = hasSection ? cellSections[0] : null;

        // For single drag: check if occupied by a DIFFERENT session
        // Use session.id for unique identification (not section.id which can be shared)
        const isOccupiedBySingleDrag = !isInMultiDrag && cellSections.some(s => s.session.id !== draggedSection);
        
        return (
            <SectionCard
                key                     = { `section-${room.id}-${module.dayModuleId}` }
                section                 = { section }
                dayModuleId             = { module.dayModuleId }
                dayId                   = { day.id }
                moduleId                = { module.id }
                roomId                  = { room.name }
                isLastModule            = { isLastModule }
                moduleIndex             = { moduleIndex }
                isDragOver              = { isDragOver }
                isOccupiedDuringDrag    = { isInMultiDrag ? isOccupiedInMultiDrag : isOccupiedBySingleDrag }
                hasSection              = { hasSection }
                draggedSection          = { draggedSection }
                onSectionClick          = { onSectionClick }
                onDragStart             = { handleDragStart }
                onDragOver              = { handleDragOver }
                onDragLeave             = { handleDragLeave }
                onDrop                  = { handleDrop }
                onCreateSession         = { handleCreateSession }
                isSelected              = { section ? selectedSections.some(s => s.session.id === section.session.id) : false }
                onSelect                = { onSectionSelect }
                onClearSelection        = { onClearSelection }
                hoveredConsecutiveId    = { hoveredConsecutiveId }
                onConsecutiveHover      = { setHoveredConsecutiveId }
            />
        );
    }, [isCalculating, getSectionsForCell, dragOverCell, dragOverCells, draggedSection, onSectionClick, onSectionSave, selectedSections, onSectionSelect, onClearSelection, hoveredConsecutiveId]);


    function handleDragStart( e: React.DragEvent, sectionId: string ): void {
        e.dataTransfer.setData( 'text/plain', sectionId );
        setDraggedSection( sectionId );
        e.dataTransfer.effectAllowed = 'move';
    }


    function handleDragOver( e: React.DragEvent, roomId: string, dayModuleId: number ): void{
        e.preventDefault();
        const cellId = `${roomId}-${dayModuleId}`;

        // Optimization: Only recalculate if the target cell has changed
        if ( dragOverCell === cellId ) {
            return;
        }

        setDragOverCell( cellId );

        // Check if we have multiple selections
        if ( selectedSections.length > 1 ) {
            // Verify all selected sections are from the same room
            const firstRoomId = selectedSections[0].session.spaceId;
            const allSameRoom = selectedSections.every( s => s.session.spaceId === firstRoomId );

            if ( !allSameRoom ) {
                // If selections are from different rooms, don't show multi-drag feedback
                setDragOverCells(new Map());
                e.dataTransfer.dropEffect = 'none';

                return;
            }

            // Find the dragged section to use as reference point
            // Use session.id for comparison (draggedSection contains session.id)
            const draggedSectionData = selectedSections.find( s => s.session.id === draggedSection );

            if ( !draggedSectionData ) {
                // If dragged section is not in selection, fall back to single drag
                setDragOverCells(new Map());
                const cellSections = getSectionsForCell( roomId, dayModuleId );
                e.dataTransfer.dropEffect = cellSections.length > 0 ? 'none' : 'move';
                return;
            }

            // Find the module info for the dragged section and target cell
            const draggedModule = modules.find( m => m.dayModuleId === draggedSectionData.session.dayModuleId );
            const targetModule  = modules.find( m => m.dayModuleId === dayModuleId );

            if ( !draggedModule || !targetModule ) {
                // Fallback if modules not found
                setDragOverCells(new Map());
                e.dataTransfer.dropEffect = 'none';

                return;
            }

            // Calculate all target cells based on relative positions using MODULE ORDER
            const newDragOverCells = new Map<string, boolean>();

            // Calculate offset based on module order (grid position), not dayModuleId
            const baseModuleOrder = draggedModule.order;
            const baseDayId = draggedModule.dayId;

            // Calculate target cells for all selected sections
            selectedSections.forEach( section => {
                // Find the module for this section
                const sectionModule = modules.find( m => m.dayModuleId === section.session.dayModuleId );

                if ( !sectionModule ) return;

                // Calculate offset using module order
                const orderOffset = sectionModule.order - baseModuleOrder;
                const dayOffset = sectionModule.dayId - baseDayId;

                // Calculate target position
                const targetDayId = targetModule.dayId + dayOffset;
                const targetModuleOrder = targetModule.order + orderOffset;

                // Find the module with this order on the target day
                // If the order exceeds the day's modules, it might wrap to the next day
                let targetModuleForSection = modules.find(m => 
                    m.dayId === targetDayId && m.order === targetModuleOrder
                );

                // If not found on the target day, try to find by absolute position
                // This handles cases where sessions span across days
                if ( !targetModuleForSection ) {
                    // Get all modules for the target day sorted by order
                    const targetDayModules = modules
                        .filter(m => m.dayId === targetDayId)
                        .sort((a, b) => a.order - b.order);

                    // If targetModuleOrder is beyond this day, look in next day
                    if (targetModuleOrder >= targetDayModules.length) {
                        const nextDayId = targetDayId + 1;
                        const nextDayOrder = targetModuleOrder - targetDayModules.length;

                        targetModuleForSection = modules.find(m => 
                            m.dayId === nextDayId && m.order === nextDayOrder
                        );
                    }
                    // If targetModuleOrder is negative, look in previous day
                    else if (targetModuleOrder < 0) {
                        const prevDayId = targetDayId - 1;
                        const prevDayModules = modules
                            .filter(m => m.dayId === prevDayId)
                            .sort((a, b) => a.order - b.order);
                        const prevDayOrder = prevDayModules.length + targetModuleOrder;

                        targetModuleForSection = modules.find(m => 
                            m.dayId === prevDayId && m.order === prevDayOrder
                        );
                    }
                }

                if (!targetModuleForSection) return;

                const targetDayModuleId = targetModuleForSection.dayModuleId;
                const targetCellId = `${roomId}-${targetDayModuleId}`;

                // Check if this cell is occupied
                const cellSections = getSectionsForCell( roomId, targetDayModuleId );
                // A cell is occupied if it has sections that are NOT in our selection
                // Use session.id for unique identification
                const isOccupied = cellSections.some( s => 
                    !selectedSections.some( selected => selected.session.id === s.session.id )
                );

                newDragOverCells.set( targetCellId, isOccupied );
            });

            setDragOverCells( newDragOverCells );

            // Set dropEffect based on whether ANY cell is occupied
            const anyOccupied = Array.from(newDragOverCells.values()).some(occupied => occupied);
            e.dataTransfer.dropEffect = anyOccupied ? 'none' : 'move';
        } else {
            // Single section drag (original behavior)
            setDragOverCells(new Map()); // Clear multi-cell state
            const cellSections = getSectionsForCell( roomId, dayModuleId );

            // Check if the cell is occupied by a DIFFERENT session (not the one being dragged)
            // Use session.id for unique identification (not section.id which can be shared)
            const isOccupiedByOther = cellSections.some(s => s.session.id !== draggedSection);

            e.dataTransfer.dropEffect = isOccupiedByOther ? 'none' : 'move';
        }
    }


    const handleDragLeave = () => {
        setDragOverCell( null );
        setDragOverCells(new Map()); // Clear multi-cell state
    };


    function handleDrop( e: React.DragEvent, roomId: string, dayModuleId: number ): void {
        e.preventDefault();
        const sectionId = e.dataTransfer.getData( 'text/plain' );
        setDraggedSection( null );
        setDragOverCell( null );
        setDragOverCells( new Map() ); // Clear multi-cell state

        // Check if we have multiple selections
        if ( selectedSections.length > 1 ) {
            // Multi-section move
            const success = onMultipleSectionMove( roomId, dayModuleId );

            if ( !success ) {
                setErrorMessage( 'No se pudieron mover las secciones' );
                setTimeout(() => setErrorMessage( null ), 3000 );
            }
            return;
        }

        // Single section move (original behavior)
        const cellSections = getSectionsForCell( roomId, dayModuleId );

        if ( cellSections.length > 0 ) {
            setErrorMessage( 'No se puede mover la sección porque el destino ya está ocupado' );
            setTimeout(() => setErrorMessage( null ), 3000 );
            return;
        }

        // We need to find the day and moduleId from dayModuleId
        const dayModule = modules.find( m => m.dayModuleId === dayModuleId );

        if ( !dayModule ) {
            setErrorMessage( 'Error: No se pudo encontrar el módulo' );
            setTimeout(() => setErrorMessage( null ), 3000 );
            return;
        }

        const success = onSectionMove( sectionId, roomId, dayModule.dayId, dayModule.id );

        if ( !success ) {
            setErrorMessage( 'No se pudo mover la sección' );
            setTimeout(() => setErrorMessage( null ), 3000 );
        }
    }

    // Handle session creation from SectionCard
    const handleCreateSession = useCallback(( dayId: number, moduleId: string, spaceId: string ) => {
        setSessionFormData({ dayId, moduleId, spaceId });
        setShowSessionForm( true );
    }, []);


    const handleCloseSessionForm = useCallback(() => {
        setShowSessionForm( false );
        setSessionFormData( null );
    }, []);


    const fixedColumnsConfig = {
        name        : { widthClass: "w-[70px] max-w-[70px] truncate" },
        type        : { widthClass: "w-[70px] max-w-[70px] truncate" },
        building    : { widthClass: "w-[70px] max-w-[70px] truncate text-center" },
        size        : { widthClass: "w-[50px] max-w-[50px] truncate text-center" },
        capacity    : { widthClass: "w-[50px] max-w-[50px] truncate text-center" },
    };


    return (
        <div className="flex max-h-screen border rounded-lg">
            { errorMessage && (
                <div className="absolute top-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex items-center z-20">
                    <AlertCircle className="h-4 w-4 mr-2" />

                    { errorMessage }
                </div>
            )}

            {/* Tabla para columnas fijas */}
            <div className="z-10 overflow-y-auto w-[100rem] max-h-[calc(100vh-95px)] rounded-tl-lg relative hide-vertical-scrollbar" ref={fixedTableRef} onScroll={handleScroll}>
                <div className="relative hide-vertical-scrollbar">
                    <table className="border-collapse w-full hide-vertical-scrollbar">
                        <thead className="sticky top-0 z-50 bg-black hide-vertical-scrollbar">
                            <tr className="h-20">
                                <th
                                    title       = "Espacio"
                                    className   = { cn(
                                        "cursor-pointer px-2 content-center bg-black border-r border-zinc-700",
                                        fixedColumnsConfig.name.widthClass
                                    )}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        <Cuboid className="text-white w-4 h-4" />

                                        <span className="text-[13px] text-white">Espacio</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant     = "ghost"
                                                    size        = "icon"
                                                    className   = "px-2"
                                                >
                                                    <Filter className={cn(
                                                        "text-white w-4 h-4 cursor-pointer",
                                                        localFilters.rooms.length > 0 && 'text-blue-500',
                                                        localFilters.periods.length > 0 && 'text-blue-500',
                                                    )} />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-[29rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        options             = { uniqueRoomIds.map(( id ) => ({ value: id, label: id }))}
                                                        placeholder         = "Filtrar por sala"
                                                        onSelectionChange   = {( values ) => handleFilterChange( 'rooms', values as string[] )}
                                                        defaultValues       = { localFilters.rooms || [] }
                                                    />
                                                </div>

                                                <div className="p-2 border-t">
                                                    <MultiSelectCombobox
                                                        options             = { periods.map((period) => ({ value: period.id, label: period.label || '' }))}
                                                        placeholder         = "Filtrar por periodo"
                                                        onSelectionChange   = {( values ) => handleFilterChange( 'periods', values as string[] )}
                                                        defaultValues       = { localFilters.periods }
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant = "ghost"
                                            size    = "icon"
                                            onClick = {() => onSortChange( "name", sortConfig.field === "name" && sortConfig.direction === "asc" ? "desc" : "asc" )}
                                        >
                                            {sortConfig.field === "name"
                                                ? sortConfig.direction === "asc"
                                                    ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                    : <ArrowDownAZ className="h-4 w-4 text-white" />
                                                : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                            }
                                        </Button>
                                    </div>
                                </th>

                                <th
                                    title       = "Tipo"
                                    className   = { cn(
                                        "cursor-pointer border-l px-2 bg-black border-r border-zinc-700",
                                        fixedColumnsConfig.type.widthClass
                                    )}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        <Armchair className="text-white w-4 h-4" />

                                        <span className="text-[13px] text-white">Tipo</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Filter className={cn(
                                                        "text-white w-4 h-4 cursor-pointer",
                                                        localFilters.types.length > 0 && 'text-blue-500'
                                                    )} />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-[25.8rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        placeholder         = "Filtrar por tipo"
                                                        onSelectionChange   = {( values ) => handleFilterChange( 'types', values as string[] )}
                                                        defaultValues       = { localFilters.types || [] }
                                                        isOpen              = { true }
                                                        options             = { uniqueTypes.map(( type ) => ({ 
                                                            value: type,
                                                            label: getSpaceType( type )
                                                        }))}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant = "ghost"
                                            size    = "icon"
                                            onClick = {() => onSortChange("type", sortConfig.field === "type" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                        >
                                            { sortConfig.field === "type"
                                                ? sortConfig.direction === "asc"
                                                    ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                    : <ArrowDownAZ className="h-4 w-4 text-white" />
                                                : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                            }
                                        </Button>
                                    </div>
                                </th>

                                <th
                                    title="Edificio"
                                    className={cn(
                                        "cursor-pointer border-l px-2 bg-black border-r border-zinc-700",
                                        fixedColumnsConfig.building.widthClass
                                    )}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        <Building2 className="text-white w-4 h-4" />

                                        <span className="text-[13px] text-white">Edificio</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant = "ghost"
                                                    size    = "icon"
                                                >
                                                    <Filter className={cn(
                                                        "text-white w-4 h-4 cursor-pointer",
                                                        localFilters.buildings.length > 0 && 'text-blue-500'
                                                    )} />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-[25.8rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        options={uniqueBuildings.map((building) => ({ 
                                                            value: building, 
                                                            label: building 
                                                        }))}
                                                        placeholder="Filtrar por edificio"
                                                        onSelectionChange={(values) => handleFilterChange('buildings', values as string[])}
                                                        defaultValues={localFilters.buildings}
                                                        isOpen={true}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant = "ghost"
                                            size    = "icon"
                                            onClick = {() => onSortChange("building", sortConfig.field === "building" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                        >
                                            {sortConfig.field === "building"
                                                ? sortConfig.direction === "asc"
                                                    ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                    : <ArrowDownAZ className="h-4 w-4 text-white" />
                                                : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                            }
                                        </Button>
                                    </div>
                                </th>

                                <th
                                    title       = "Talla"
                                    className   = { cn(
                                        "cursor-pointer border-l px-2 bg-black border-r border-zinc-700",
                                        fixedColumnsConfig.size.widthClass
                                    )}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        <Proportions className="text-white w-4 h-4" />

                                        <span className="text-[13px] text-white">Talla</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant = "ghost"
                                                    size    = "icon"
                                                >
                                                    <Filter className={cn(
                                                        "text-white w-4 h-4 cursor-pointer",
                                                        localFilters.sizes.length > 0 && 'text-blue-500'
                                                    )} />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-[22.1rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        placeholder         = "Filtrar por talla"
                                                        onSelectionChange   = {( values ) => handleFilterChange('sizes', values as string[])}
                                                        defaultValues       = { localFilters.sizes }
                                                        isOpen              = { true }
                                                        options             = { sizes.map(( size ) => ({ 
                                                            value: size.id || '', 
                                                            label: size.label || '' 
                                                        }))}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant = "ghost"
                                            size    = "icon"
                                            onClick = {() => onSortChange("size", sortConfig.field === "size" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                        >
                                            { sortConfig.field === "size"
                                                ? sortConfig.direction === "asc"
                                                    ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                    : <ArrowDownAZ className="h-4 w-4 text-white" />
                                                : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                            }
                                        </Button>
                                    </div>
                                </th>

                                <th
                                    title       = "Capacidad"
                                    className   = { cn(
                                        "cursor-pointer border-r border-r-zinc-700 px-2 bg-black",
                                        fixedColumnsConfig.capacity.widthClass
                                    )}
                                >
                                    <div className="flex items-center gap-2 justify-center">
                                        <Ruler className="text-white w-4 h-4" />

                                        <span className="text-[13px] text-white">Cap.</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant = "ghost"
                                                    size    = "icon"
                                                >
                                                    <Filter className={cn(
                                                        "text-white w-4 h-4 cursor-pointer",
                                                        localFilters.capacities.length > 0 && 'text-blue-500'
                                                    )} />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-[25.8rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        placeholder         = "Filtrar por capacidad"
                                                        onSelectionChange   = {( values ) => handleFilterChange( 'capacities', values as string[] )}
                                                        defaultValues       = { localFilters.capacities || [] }
                                                        isOpen              = { true }
                                                        options             = { Array.from( new Set( spaces.map( room => room.capacity )))
                                                            .sort(( a, b ) => a - b)
                                                            .map(capacity => ({
                                                                value: capacity.toString(),
                                                                label: capacity.toString()
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant = "ghost"
                                            size    = "icon"
                                            onClick = {() => onSortChange("capacity", sortConfig.field === "capacity" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                        >
                                            { sortConfig.field === "capacity"
                                                ? sortConfig.direction === "asc"
                                                    ? <ArrowUp01 className="h-4 w-4 text-white" />
                                                    : <ArrowDown10 className="h-4 w-4 text-white" />
                                                : <ArrowUp01 className="h-4 w-4 opacity-50 text-white" />
                                            }
                                        </Button>
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            { filteredRooms.map(( room ) => (
                                <tr key={`fixed-${room.id}`} className="border-b h-16">
                                    {/* Espacio */}
                                    <td
                                        title       = { `Espacio: ${ room.name }` }
                                        className   = { cn(
                                            "border-x text-[12px] p-2 bg-white dark:bg-zinc-900 transition-colors",
                                            fixedColumnsConfig.name.widthClass
                                        )}
                                    >
                                        { room.name }
                                    </td>

                                    {/* Tipo */}
                                    <td
                                        title       = { `Tipo: ${ getSpaceType( room.type )}` }
                                        className   = { cn(
                                            "border-x text-[12px] p-2 bg-white dark:bg-zinc-900 transition-colors",
                                            fixedColumnsConfig.type.widthClass
                                        )}
                                    >
                                        { getSpaceType( room.type )}
                                    </td>

                                    {/* Edificio */}
                                    <td
                                        title       = { `Edificio: ${ room.building }` }
                                        className   = { cn(
                                            "border-x text-[12px] p-2 bg-white dark:bg-zinc-900 transition-colors",
                                            fixedColumnsConfig.building.widthClass
                                        )}
                                    >
                                        { getBuildingName( room.building )}
                                    </td>

                                    {/* Talla */}
                                    <td
                                        title       = { `Talla: ${ room.size }` }
                                        className   = { cn(
                                            "border-x text-[12px] p-2 bg-white dark:bg-zinc-900 transition-colors",
                                            fixedColumnsConfig.size.widthClass
                                        )}
                                    >
                                        { room.size }
                                    </td>

                                    {/* Capacidad */}
                                    <td
                                        title       = { `Capacidad: ${ room.capacity }` }
                                        className   = { cn(
                                            "border-x text-[12px] border-r-zinc-400 dark:border-r-zinc-600 p-2 bg-white dark:bg-zinc-900 transition-colors relative",
                                            fixedColumnsConfig.capacity.widthClass
                                        )}
                                    >
                                        { room.capacity }
                                        <div className="absolute top-0 bottom-0 right-0 w-[6px] shadow-[2px_0px_4px_rgba(0,0,0,0.15)] pointer-events-none"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabla para contenido desplazable */}
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-73px)]" ref={scrollableTableRef} onScroll={handleScroll}>
                <table className="border-collapse">
                    <thead className="sticky top-0 z-50 bg-black">
                        <tr className="bg-black text-white h-12">
                            {days.slice( 0, 6 ).map(( day ) => {
                                const dayModules = getModulesForDay( modules, day.id );

                                return (
                                    <th key={`day-header-${day.id}`} colSpan={dayModules.length} className="border-x border-b border-zinc-700 p-2 text-center">
                                        {day.name}
                                    </th>
                                )
                            })}
                        </tr>

                        <tr className="bg-zinc-800 text-white h-8 sticky top-12 z-40">
                            {days.slice(0, 6).map(( day ) => {
                                const dayModules = getModulesForDay( modules, day.id );

                                return dayModules.map(( module, moduleIndex ) => {
                                    return (
                                        <th key={`module-header-${day.id}-${module.id}`} title={`${module.startHour} - ${module.endHour}`} className={cn(
                                                "border-x border-l-zinc-700 text-xs min-w-[80px]",
                                                moduleIndex === dayModules.length - 1 ? "border-r-zinc-400 dark:border-r-zinc-600" : "border-r-zinc-700"
                                            )}
                                        >
                                            {module.name}
                                        </th>
                                    );
                                });
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {(() => {
                            const dayModulesMap = useMemo(() => {
                                const map = new Map<number, any[]>();
                                days.slice(0, 6).forEach(day => {
                                    map.set(day.id, getModulesForDay(modules, day.id));
                                });
                                return map;
                            }, [days, modules]);

                            return filteredRooms.map(( room ) => (
                                <tr key={`room-row-${room.id}`} className="border-b h-16">
                                    {days.slice(0, 6).map(( day ) => {
                                        const dayModules = dayModulesMap.get(day.id) || [];

                                        return dayModules.map((module, moduleIndex) => {
                                            const isLastModule = moduleIndex === dayModules.length - 1;
                                            return renderCellContent(room, day, module, moduleIndex, isLastModule);
                                        });
                                    })}
                                </tr>
                            ));
                        })()}
                    </tbody>
                </table>
            </div>

            {/* Single SessionForm instance for all cells */}
            {showSessionForm && sessionFormData && (
                <SessionForm
                    isOpen      = { showSessionForm }
                    onClose     = { handleCloseSessionForm }
                    sectionSession     = { null }
                    onSave      = { () => {} }
                    dayId       = { sessionFormData.dayId }
                    moduleId    = { sessionFormData.moduleId }
                    spaceId     = { sessionFormData.spaceId }
                />
            )}
        </div>
    );
}
