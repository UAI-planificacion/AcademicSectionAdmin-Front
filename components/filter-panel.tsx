"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import type { Filters, Room } from "@/lib/types"
import MultiSelectCombobox from "./inputs/Combobox"
import { usePeriods } from "@/hooks/use-periods"
import { useSizes } from "@/hooks/use-sizes"

interface FilterPanelProps {
    rooms: Room[]
    onFilterChange: (filters: Filters) => void
}

export function FilterPanel({ rooms, onFilterChange }: FilterPanelProps) {
    const [localFilters, setLocalFilters] = useState<Filters>({
        periods: [],
        buildings: [],
        sizes: [],
    })
    
    // Use the periods hook
    const { periods, loading: periodsLoading } = usePeriods();
    const { sizes, loading: sizesLoading } = useSizes();

    // Extract unique buildings for filter options
    const buildings = Array.from(new Set(rooms.map((room) => room.building)))

    // Aplicar filtros cuando cambian
    useEffect(() => {
        const handler = setTimeout(() => {
            console.log("Enviando filtros desde FilterPanel:", localFilters)
            onFilterChange(localFilters)
        }, 100)

        return () => clearTimeout(handler)
    }, [localFilters, onFilterChange])

    const handleBuildingsChange = (values: string[]) => {
        setLocalFilters((prev) => ({ ...prev, buildings: values }))
    }

    const handleCapacityGroupsChange = (values: string[]) => {
        setLocalFilters((prev) => ({ ...prev, sizes: values }))
    }

    const handlePeriodsChange = (values: string[]) => {
        setLocalFilters((prev) => ({ ...prev, periods: values }))
    }

    return (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-2">
            <div className="space-y-2 w-64">
                <Label htmlFor="periods">Periodos</Label>

                <MultiSelectCombobox
                    options={periods.map((period) => ({ value: period.id, label: period.label }))}
                    placeholder="Todos los periodos"
                    onSelectionChange={handlePeriodsChange}
                    defaultValues={localFilters.periods}
                />
            </div>

            <div className="space-y-2 w-64">
                <Label htmlFor="buildings">Edificio</Label>

                <MultiSelectCombobox
                    options={buildings.map((building) => ({ value: building, label: building }))}
                    placeholder="Todos los edificios"
                    onSelectionChange={handleBuildingsChange}
                    defaultValues={localFilters.buildings}
                />
            </div>

            <div className="space-y-2 w-64">
                <Label htmlFor="capacityGroups">Talla</Label>

                <MultiSelectCombobox
                    options={sizes.map((size) => ({ value: size.id, label: size.label }))}
                    placeholder="Todas las tallas"
                    onSelectionChange={handleCapacityGroupsChange}
                    defaultValues={localFilters.sizes}
                />
            </div>
        </div>
    )
}
