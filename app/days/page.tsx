"use client"

import { useState } from "react"

import { Plus, Pencil, Trash2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"

import { DayModal } from "./day-modal"

import { Day } from "@/lib/types"
import { useDays } from "@/hooks/use-days"
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog"


export default function DaysPage() {
//   const [days, setDays] = useState<Day[]>(initialDays)
    const { days } = useDays();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentDay, setCurrentDay] = useState<Day | null>(null)

    const handleAddDay = (day: Day) => {
        // setDays([...days, day])
    }

    const handleUpdateDay = (updatedDay: Day) => {
        // setDays(days.map((day) => (day.id === updatedDay.id ? updatedDay : day)))
    }

    const handleDeleteDay = (id: number) => {
        // setDays(days.filter((day) => day.id !== id))
    }

    const openAddModal = () => {
        setCurrentDay(null)
        setIsModalOpen(true)
    }

    const openEditModal = (day: Day) => {
        setCurrentDay(day)
        setIsModalOpen(true)
    }

    const openDeleteDialog = (day: Day) => {
        setCurrentDay(day)
        setIsDeleteDialogOpen(true)
    }

    const columns: ColumnDef<Day>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "name",
            header: "Nombre Completo",
        },
        {
            accessorKey: "mediumName",
            header: "Nombre Medio",
        },
        {
            accessorKey: "shortName",
            header: "Nombre Corto",
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => openEditModal(row.original)}>
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(row.original)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Días</h1>

                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Día
                </Button>
            </div>

            <DataTable
                columns             = { columns }
                data                = { days }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            <DayModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen( false )}
                day         = { currentDay }
                onAdd       = { handleAddDay }
                onUpdate    = { handleUpdateDay }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => handleDeleteDay( currentDay?.id || 0 )}
                type        = "día"
                name        = { 'Día' }
            />
        </div>
    );
}
