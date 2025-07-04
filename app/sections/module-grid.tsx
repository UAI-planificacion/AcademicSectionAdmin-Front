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

import type {
    Space,
    SortConfig,
    SortField,
    SortDirection,
    Filters
}                           from "@/lib/types";
import { cn }               from "@/lib/utils";
import { getSpaceTypeName } from "@/lib/space";

import {
    Popover,
    PopoverContent,
    PopoverTrigger
}                           from "@/components/ui/popover";
import { SectionCard }      from "@/app/sections/SectionCard";
import MultiSelectCombobox  from "@/components/inputs/Combobox";
import { Button }           from "@/components/ui/button";

import { useDays }                      from "@/hooks/use-days";
import { useModules, getModulesForDay } from "@/hooks/use-modules";
import { usePeriods }                   from "@/hooks/use-periods";
import { useSizes }                     from "@/hooks/use-sizes";

import { Section } from "@/models/section.model";


interface ModuleGridProps {
    sections        : Section[];
    rooms           : Space[];
    onSectionClick  : ( sectionId: string ) => void;
    onSectionMove   : ( sectionId: string, newRoomId: string, newDay: number, newModuleId: string ) => boolean;
    onSectionSave   : ( section: Section ) => boolean;
    onSortChange    : ( field: SortField, direction: SortDirection ) => void;
    sortConfig      : SortConfig;
    onFilterChange? : ( filters: Filters ) => void;
    getSectionsForCell: ( roomId: string, day: number, moduleId: string ) => Section[];
    isCalculating   : boolean;
}

export function ModuleGrid({
    sections,
    rooms,
    onSectionClick,
    onSectionMove,
    onSectionSave,
    onSortChange,
    sortConfig,
    onFilterChange,
    getSectionsForCell,
    isCalculating,
}: ModuleGridProps ): React.JSX.Element{
    // Filtrar las salas localmente
    const [filteredRooms, setFilteredRooms]     = useState<Space[]>(rooms);
    const [draggedSection, setDraggedSection]   = useState<string | null>( null );
    const [dragOverCell, setDragOverCell]       = useState<string | null>( null );
    const [errorMessage, setErrorMessage]       = useState<string | null>( null );

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
    const uniqueRoomIds     = useMemo(() => Array.from( new Set( rooms.map( room => room.id ))), [rooms]);
    const uniqueTypes       = useMemo(() => Array.from( new Set( rooms.map( room => room.type ))), [rooms]);
    const uniqueBuildings   = useMemo(() => Array.from( new Set( rooms.map( room => room.building ))), [rooms]);

    // Función para aplicar filtros localmente
    const applyFilters = useCallback(( filters: Filters ) => {
        let filtered = [...rooms];

        // Filtrar por sala (ID)
        if (filters.rooms && filters.rooms.length > 0) {
            filtered = filtered.filter(room => filters.rooms!.includes(room.id));
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
            filtered = filtered.filter(room => filters.sizes.includes(room.sizeId));
        }

        // Filtrar por capacidad
        if (filters.capacities && filters.capacities.length > 0) {
            filtered = filtered.filter(room => filters.capacities!.includes(room.capacity.toString()));
        }

        setFilteredRooms(filtered);
    }, [rooms]);
    
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
        setFilteredRooms(rooms);
        applyFilters(localFilters);
    }, [rooms, applyFilters, localFilters]);


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

    const renderCellContent = useCallback((room: Space, day: any, module: any, moduleIndex: number, isLastModule: boolean) => {
        if ( isCalculating ) {
            return (
                <td 
                    key={`skeleton-${room.id}-${day.id}-${module.id}`}
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

        const cellId        = `${room.id}-${day.id}-${module.id}`;
        const cellSections  = getSectionsForCell(room.id, day.id, module.id);
        const isDragOver    = dragOverCell === cellId;
        const hasSection    = cellSections.length > 0;
        const section       = hasSection ? cellSections[0] : null;

        return (
            <SectionCard
                key                     = { `section-${room.id}-${day.id}-${module.id}` }
                section                 = { section }
                dayId                   = { day.id }
                moduleId                = { module.id }
                roomId                  = { room.id }
                isLastModule            = { isLastModule }
                moduleIndex             = { moduleIndex }
                isDragOver              = { isDragOver }
                hasSection              = { hasSection }
                draggedSection          = { draggedSection }
                onSectionClick          = { onSectionClick }
                onDragStart             = { handleDragStart }
                onDragOver              = { handleDragOver }
                onDragLeave             = { handleDragLeave }
                onDrop                  = { handleDrop }
                onSaveSectionFromCard   = { onSectionSave }
            />
        );
    }, [isCalculating, getSectionsForCell, dragOverCell, draggedSection, onSectionClick, onSectionSave]);


    function handleDragStart( e: React.DragEvent, sectionId: string ): void {
        e.dataTransfer.setData( 'text/plain', sectionId );
        setDraggedSection( sectionId );
        e.dataTransfer.effectAllowed = 'move';
    }


    function handleDragOver( e: React.DragEvent, roomId: string, day: number, moduleId: string ): void{
        e.preventDefault();
        const cellId = `${roomId}-${day}-${moduleId}`;
        setDragOverCell( cellId );

        const cellSections = getSectionsForCell( roomId, day, moduleId );

        e.dataTransfer.dropEffect = cellSections.length > 0
            ? 'none'
            : 'move';
    }


    const handleDragLeave = () => setDragOverCell( null );


    function handleDrop( e: React.DragEvent, roomId: string, day: number, moduleId: string ): void {
        e.preventDefault();
        const sectionId = e.dataTransfer.getData( 'text/plain' );
        setDraggedSection( null );
        setDragOverCell( null );

        const cellSections = getSectionsForCell( roomId, day, moduleId );

        if ( cellSections.length > 0 ) {
            setErrorMessage( 'No se puede mover la sección porque el destino ya está ocupado' );
            setTimeout(() => setErrorMessage( null ), 3000 );
            return;
        }

        const success = onSectionMove( sectionId, roomId, day, moduleId );

        if ( !success ) {
            setErrorMessage( 'No se pudo mover la sección' );
            setTimeout(() => setErrorMessage( null ), 3000 );
        }
    }

    const fixedColumnsConfig = {
        name        : { widthClass: "w-[100px] max-w-[100px] truncate" },
        type        : { widthClass: "w-[80px] max-w-[80px] truncate" },
        building    : { widthClass: "w-[80px] max-w-[80px] truncate text-center" },
        size        : { widthClass: "w-[80px] max-w-[80px] truncate text-center" },
        capacity    : { widthClass: "w-[80px] max-w-[80px] truncate text-center" },
    };

    return (
        <div className="flex max-h-screen border rounded-lg">
            {errorMessage && (
                <div className="absolute top-2 right-2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex items-center z-20">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errorMessage}
                </div>
            )}

            {/* Tabla para columnas fijas */}
            <div className="z-10 overflow-y-auto w-[85rem] max-h-[calc(100vh-95px)] rounded-tl-lg relative hide-vertical-scrollbar" ref={fixedTableRef} onScroll={handleScroll}>
                <div className="relative hide-vertical-scrollbar">
                    <table className="border-collapse w-full hide-vertical-scrollbar">
                        <thead className="sticky top-0 z-50 bg-black hide-vertical-scrollbar">
                            <tr className="h-20">
                                <th title="Sala" className={
                                    cn( "cursor-pointer px-2 bg-black border-r border-zinc-700 w-[120px] max-w-[120px]", fixedColumnsConfig.name.widthClass )
                                }>
                                    <div className="flex items-center justify-between">
                                        <Cuboid className="text-white w-5 h-5 mx-2" />

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" className="px-2">
                                                    <Filter className="text-white w-4 h-4 cursor-pointer" />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-[29rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        options={uniqueRoomIds.map((id) => ({ value: id, label: id }))}
                                                        placeholder="Filtrar por sala"
                                                        onSelectionChange={(values) => handleFilterChange('rooms', values as string[])}
                                                        defaultValues={localFilters.rooms || []}
                                                    />
                                                </div>

                                                <div className="p-2 border-t">
                                                    <MultiSelectCombobox
                                                        options={periods.map((period) => ({ value: period.id, label: period.label }))}
                                                        placeholder="Filtrar por periodo"
                                                        onSelectionChange={(values) => handleFilterChange('periods', values as string[])}
                                                        defaultValues={localFilters.periods}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant="ghost"
                                            className="px-2"
                                            onClick={() => onSortChange("name", sortConfig.field === "name" && sortConfig.direction === "asc" ? "desc" : "asc")}
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

                                <th title="Tipo" className={
                                    cn( "cursor-pointer border-l px-2 bg-black border-r border-zinc-700", fixedColumnsConfig.type.widthClass )
                                }>
                                    <div className="flex items-center justify-between">
                                        <Armchair className="text-white w-5 h-5 mx-1" />

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" className="px-2">
                                                    <Filter className="text-white w-4 h-4 cursor-pointer" />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-[21.6rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        options={uniqueTypes.map((type) => ({ 
                                                            value: type, 
                                                            label: getSpaceTypeName(type) 
                                                        }))}
                                                        placeholder="Filtrar por tipo"
                                                        onSelectionChange={(values) => handleFilterChange('types', values as string[])}
                                                        defaultValues={localFilters.types || []}
                                                        isOpen={true}   
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant="ghost"
                                            className="px-2"
                                            onClick={() => onSortChange("type", sortConfig.field === "type" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                        >
                                        {sortConfig.field === "type"
                                            ? sortConfig.direction === "asc"
                                                ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                : <ArrowDownAZ className="h-4 w-4 text-white" />
                                            : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                        }
                                        </Button>
                                    </div>
                                </th>

                                <th title="Edificio" className={
                                    cn( "cursor-pointer border-l px-2 bg-black border-r border-zinc-700", fixedColumnsConfig.building.widthClass )
                                }>
                                    <div className="flex items-center justify-between">
                                        <Building2 className="text-white w-5 h-5 ml-0.5 mr-1.5" />

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" className="px-2">
                                                    <Filter className="text-white w-4 h-4 cursor-pointer" />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-96 p-0" align="center">
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
                                            variant="ghost"
                                            className="px-2"
                                            onClick={() => onSortChange("building", sortConfig.field === "building" && sortConfig.direction === "asc" ? "desc" : "asc")}
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

                                <th title="Talla" className={
                                    cn( "cursor-pointer border-l px-2 bg-black border-r border-zinc-700", fixedColumnsConfig.size.widthClass )
                                }>
                                    <div className="flex items-center justify-between">
                                        <Proportions className="text-white w-5 h-5 ml-0.5 mr-1.5" />

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" className="px-2">
                                                    <Filter className="text-white w-4 h-4 cursor-pointer" />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 h-[21.6rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        options={sizes.map((size) => ({ 
                                                            value: size.id, 
                                                            label: size.label 
                                                        }))}
                                                        placeholder="Filtrar por talla"
                                                        onSelectionChange={(values) => handleFilterChange('sizes', values as string[])}
                                                        defaultValues={localFilters.sizes}
                                                        isOpen={true}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant="ghost"
                                            className="px-2"
                                            onClick={() => onSortChange("size", sortConfig.field === "size" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                        >
                                            {sortConfig.field === "size"
                                                ? sortConfig.direction === "asc"
                                                    ? <ArrowUpAZ className="h-4 w-4 text-white" />
                                                    : <ArrowDownAZ className="h-4 w-4 text-white" />
                                                : <ArrowUpAZ className="h-4 w-4 opacity-50 text-white" />
                                            }
                                        </Button>
                                    </div>
                                </th>

                                <th title="Capacidad" className={cn("cursor-pointer border-r border-r-zinc-700 px-2 bg-black", fixedColumnsConfig.capacity.widthClass)}>
                                    <div className="flex items-center justify-between">
                                        <Ruler className="text-white w-5 h-5 ml-0.5 mr-1.5" />

                                        <Popover>
                                            <PopoverTrigger asChild>
                                            <Button variant="ghost" className="px-2">
                                                    <Filter className="text-white w-4 h-4 cursor-pointer" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-64 h-[25.5rem] p-0" align="center">
                                                <div className="p-2">
                                                    <MultiSelectCombobox
                                                        options={Array.from(new Set(rooms.map(room => room.capacity)))
                                                            .sort((a, b) => a - b)
                                                            .map(capacity => ({
                                                                value: capacity.toString(),
                                                                label: capacity.toString()
                                                            }))}
                                                        placeholder="Filtrar por capacidad"
                                                        onSelectionChange={(values) => handleFilterChange('capacities', values as string[])}
                                                        defaultValues={localFilters.capacities || []}
                                                        isOpen={true}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                        <Button
                                            variant="ghost"
                                            className="px-2"
                                            onClick={() => onSortChange("capacity", sortConfig.field === "capacity" && sortConfig.direction === "asc" ? "desc" : "asc")}
                                        >
                                            {sortConfig.field === "capacity"
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
                            {filteredRooms.map((room) => (
                                <tr key={`fixed-${room.id}`} className="border-b h-16">
                                    {/* Sala */}
                                    <td title={'Sala: ' + room.id} className={cn("border-x p-2 bg-white dark:bg-zinc-900 transition-colors text-sm", fixedColumnsConfig.name.widthClass)}>
                                        {room.id}
                                    </td>

                                    {/* Tipo */}
                                    <td title={'Tipo: ' + getSpaceTypeName(room.type)} className={cn("border-x p-2 bg-white dark:bg-zinc-900 transition-colors text-sm", fixedColumnsConfig.type.widthClass)}>
                                        {getSpaceTypeName(room.type)}
                                    </td>

                                    {/* Edificio */}
                                    <td title={'Edificio: ' + room.building} className={cn("border-x p-2 bg-white dark:bg-zinc-900 transition-colors text-sm", fixedColumnsConfig.building.widthClass)}>
                                        {room.building}
                                    </td>

                                    {/* Talla */}
                                    <td title={'Talla: ' + room.sizeId} className={cn("border-x p-2 bg-white dark:bg-zinc-900 transition-colors text-sm", fixedColumnsConfig.size.widthClass)}>
                                        {room.sizeId}
                                    </td>

                                    {/* Capacidad */}
                                    <td title={'Capacidad: ' + room.capacity.toString()} className={cn("border-x border-r-zinc-400 dark:border-r-zinc-600 p-2 bg-white dark:bg-zinc-900 transition-colors relative text-sm", fixedColumnsConfig.capacity.widthClass)}>
                                        {room.capacity}
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
                                         })
                                    })}
                                </tr>
                            ));
                        })()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
