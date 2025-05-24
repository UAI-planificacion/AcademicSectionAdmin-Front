"use client"

import { useState, useEffect } from "react"
import { SectionModal } from "@/components/section-modal"
import { FilterPanel } from "@/components/filter-panel"
import { ModuleGrid } from "@/components/module-grid"
import type { Section, Room, SortDirection, SortField, Filters, SortConfig } from "@/lib/types"
import { initialSections, initialRooms } from "@/lib/data"
import { initializeLocalStorageIfNeeded } from "@/lib/initLocalStorage"
import { extractDataFromSections } from "@/lib/localStorage"

export function SchedulerDashboard() {
  // Inicializar estados con valores por defecto
    const [sections, setSections] = useState<Section[]>([])
    const [filteredSections, setFilteredSections] = useState<Section[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
    const [selectedSection, setSelectedSection] = useState<Section | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    // const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "name",
        direction: "asc",
    })
    const [filters, setFilters] = useState<Filters>({
        periods: [],
        buildings: [],
        capacityGroups: [],
    })
    const [isInitialized, setIsInitialized] = useState(false)

    // Sort rooms based on current sort config
    const sortedRooms = [...filteredRooms].sort((a, b) => {
        const { field, direction } = sortConfig

        if (field === "capacity") {
            return direction === "asc" ? a.capacity - b.capacity : b.capacity - a.capacity
        } else if (field === "capacityGroup") {
            return direction === "asc"
                ? a.capacityGroup.localeCompare(b.capacityGroup)
                : b.capacityGroup.localeCompare(a.capacityGroup)
        } else {
            const aValue = a[field];
            const bValue = b[field];

            if (typeof aValue === "string" && typeof bValue === "string") {
                return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
            }

            return 0;
        }
    })

    // Cargar datos iniciales después del montaje para evitar problemas de hidratación
    useEffect(() => {
        setSections(initialSections)
        setFilteredSections(initialSections)
        setRooms(initialRooms)
        setFilteredRooms(initialRooms)
        setIsInitialized(true)
        
        // Inicializar datos en localStorage si no existen
        initializeLocalStorageIfNeeded()
    }, [])

    // Apply filters to sections and rooms
    useEffect(() => {
        if (!isInitialized) return

        console.log("Aplicando filtros:", filters)

        // Filtrar secciones
        let filteredSecs = [...sections]

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
        if (filters.capacityGroups && filters.capacityGroups.length > 0) {
            filteredRms = filteredRms.filter((room) => filters.capacityGroups.includes(room.capacityGroup))
        }

        // Ahora filtramos las secciones para que solo incluyan las que están en las salas filtradas
        const filteredRoomIds = new Set(filteredRms.map((room) => room.id))
        filteredSecs = filteredSecs.filter((section) => filteredRoomIds.has(section.roomId))

        console.log("Secciones filtradas:", filteredSecs.length)
        console.log("Salas filtradas:", filteredRms.length)

        // Update filtered sections and rooms
        setFilteredSections(filteredSecs)
        setFilteredRooms(filteredRms)
    }, [filters, sections, rooms, isInitialized])

    const handleFilterChange = (newFilters: Filters) => {
        console.log("Nuevos filtros:", newFilters)
        setFilters(newFilters)
    }

    const handleSortChange = (field: SortField, direction: SortDirection) => {
        setSortConfig({ field, direction })
    }


    const handleUpdateSection = (updatedSection: Section) => {
        // Check for overlapping sections
        const overlapping = sections.some(( section : Section ) => {
            if ( section.id         === updatedSection.id )         return false;
            if ( section.roomId     !== updatedSection.roomId )     return false;
            if ( section.day        !== updatedSection.day )        return false;
            if ( section.moduleId   !== updatedSection.moduleId )   return false;

            return true;
        })

        if ( overlapping ) {
            alert("No se puede actualizar la sección porque ya existe una en ese módulo y sala.")
            return false
        }

        const updatedSections = sections.map((section) => 
            (section.id === updatedSection.id ? updatedSection : section)
        )
        
        setSections(updatedSections)
        
        // Actualizar localStorage con los datos actualizados
        extractDataFromSections(updatedSections)
        
        return true
    }

    const handleDeleteSection = (sectionId: string) => {
        const updatedSections = sections.filter((section) => section.id !== sectionId)
        setSections(updatedSections)
        
        // Actualizar localStorage con los datos actualizados
        extractDataFromSections(updatedSections)
    }

    const handleSectionClick = (sectionId: string) => {
        const section = sections.find(( s : Section ) => s.id === sectionId );

        if ( !section ) return;

        setSelectedSection( section );
        setIsModalOpen( true );
    }

    const handleSectionMove = (
        sectionId   : string,
        newRoomId   : string,
        newDay      : number,
        newModuleId : string
    ) : boolean => {
        // Verificar si ya existe una sección en esa posición
        const targetOccupied = sections
            .some(( section : Section ) =>
                section.id          !== sectionId   &&
                section.roomId      === newRoomId   &&
                section.day         === newDay      &&
                section.moduleId    === newModuleId
            );

        if ( targetOccupied ) return false;

        // Actualizar la sección
        const updatedSections = sections.map((section) => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    roomId: newRoomId,
                    day: newDay,
                    moduleId: newModuleId,
                }
            }
            return section;
        })
        
        setSections(updatedSections)
        
        // Actualizar localStorage con los datos actualizados
        extractDataFromSections(updatedSections)
        
        return true;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col">
                <div className="container mx-auto my-0.5">
                    <FilterPanel rooms={rooms} onFilterChange={handleFilterChange} />
                </div>

                <ModuleGrid
                    sections        = { filteredSections }
                    rooms           = { sortedRooms }
                    onSectionClick  = { handleSectionClick }
                    onSectionMove   = { handleSectionMove }
                    onSortChange    = { handleSortChange }
                    sortConfig      = { sortConfig }
                />
            </div>

            {isModalOpen && selectedSection && (
                <SectionModal
                    section     = { selectedSection }
                    rooms       = { rooms }
                    onClose     = { () => setIsModalOpen( false )}
                    onSave      = { handleUpdateSection }
                    onDelete    = { handleDeleteSection }
                />
            )}
        </div>
    )
}
