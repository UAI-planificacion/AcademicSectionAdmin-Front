"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { periods, capacityGroups } from "@/lib/data"
import type { Filters, Room } from "@/lib/types"
import { Filter, X } from "lucide-react"

interface FilterPanelProps {
  rooms: Room[]
  onFilterChange: (filters: Filters) => void
}

export function FilterPanel({ rooms, onFilterChange }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<Filters>({
    periods: [],
    building: "",
    capacityGroup: "",
  })

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

  const handleBuildingChange = (value: string) => {
    setLocalFilters((prev) => ({ ...prev, building: value === "all" ? "" : value }))
  }

  const handleCapacityGroupChange = (value: string) => {
    setLocalFilters((prev) => ({ ...prev, capacityGroup: value === "all" ? "" : value }))
  }

  const handlePeriodToggle = (period: string) => {
    setLocalFilters((prev) => {
      const newPeriods = prev.periods.includes(period)
        ? prev.periods.filter((p) => p !== period)
        : [...prev.periods, period]
      return { ...prev, periods: newPeriods }
    })
  }

  const clearFilters = () => {
    setLocalFilters({
      periods: [],
      building: "",
      capacityGroup: "",
    })
  }

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-medium">Filtros</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Ocultar" : "Mostrar"}
          </Button>
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Periodos</Label>
            <div className="grid grid-cols-2 gap-2">
              {periods.map((period) => (
                <div key={period} className="flex items-center space-x-2">
                  <Checkbox
                    id={`period-${period}`}
                    checked={localFilters.periods.includes(period)}
                    onCheckedChange={() => handlePeriodToggle(period)}
                  />
                  <label
                    htmlFor={`period-${period}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {period}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="building">Edificio</Label>
            <Select value={localFilters.building || "all"} onValueChange={handleBuildingChange}>
              <SelectTrigger id="building">
                <SelectValue placeholder="Todos los edificios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los edificios</SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building} value={building}>
                    {building}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacityGroup">Talla</Label>
            <Select value={localFilters.capacityGroup || "all"} onValueChange={handleCapacityGroupChange}>
              <SelectTrigger id="capacityGroup">
                <SelectValue placeholder="Todas las tallas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tallas</SelectItem>
                {capacityGroups.map((group) => (
                  <SelectItem key={group.value} value={group.value}>
                    {group.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
