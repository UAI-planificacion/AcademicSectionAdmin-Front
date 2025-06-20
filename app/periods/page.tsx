"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"
import { Plus, Pencil, Trash2 } from "lucide-react"
// import { type Period, periods as initialPeriods, type Status } from "@/lib/data"
import { formatDate } from "@/lib/utils"
import { PeriodModal } from "./period-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Period, Status } from "@/lib/types"
import { usePeriods } from "@/hooks/use-periods"
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog"

export default function PeriodsPage() {
    const { periods } = usePeriods();
    // const [periods, setPeriods] = useState<Period[]>(initialPeriods)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null)

    const handleAddPeriod = (period: Period) => {
        // setPeriods([...periods, period])
    }

    const handleUpdatePeriod = (updatedPeriod: Period) => {
        // setPeriods(periods.map((period) => (period.id === updatedPeriod.id ? updatedPeriod : period)))
    }

    const handleDeletePeriod = (id: string) => {
        // setPeriods(periods.filter((period) => period.id !== id))
    }

    const openAddModal = () => {
        setCurrentPeriod(null)
        setIsModalOpen(true)
    }

    const openEditModal = (period: Period) => {
        setCurrentPeriod(period)
        setIsModalOpen(true)
    }

    const openDeleteDialog = (period: Period) => {
        setCurrentPeriod(period)
        setIsDeleteDialogOpen(true)
    }

    const getStatusBadge = (status: Status) => {
        switch (status) {
        case "Open":
            return <Badge className="bg-green-500">Abierto</Badge>
        case "InProgress":
            return <Badge className="bg-blue-500">En Progreso</Badge>
        case "Closed":
            return <Badge className="bg-red-500">Cerrado</Badge>
        default:
            return <Badge>{status}</Badge>
        }
    }

    const columns: ColumnDef<Period>[] = [
        {
        accessorKey: "id",
        header: "ID",
        },
        {
        accessorKey: "name",
        header: "Nombre",
        },
        {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
        accessorKey: "startDate",
        header: "Fecha de Inicio",
        // cell: ({ row }) => formatDate(row.original.startDate),
        cell: ({ row }) => row.original.startDate,
        },
        {
        accessorKey: "endDate",
        header: "Fecha de Fin",
        // cell: ({ row }) => formatDate(row.original.endDate),
        cell: ({ row }) => row.original.endDate,
        },
        {
        accessorKey: "openingDate",
        header: "Fecha de Apertura",
        // cell: ({ row }) => formatDate(row.original.openingDate),
        cell: ({ row }) => row.original.openingDate,
        },
        {
        accessorKey: "closingDate",
        header: "Fecha de Cierre",
        // cell: ({ row }) => formatDate(row.original.closingDate),
        cell: ({ row }) => row.original.closingDate,
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
            <h1 className="text-3xl font-bold">Periodos</h1>
            <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Añadir Periodo
            </Button>
        </div>

        <DataTable columns={columns} data={periods} searchKey="name" searchPlaceholder="Buscar por nombre..." />

        <PeriodModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            period={currentPeriod}
            onAdd={handleAddPeriod}
            onUpdate={handleUpdatePeriod}
        />

        <DeleteConfirmDialog
            isOpen      = { isDeleteDialogOpen }
            onClose     = { () => setIsDeleteDialogOpen(false) }
            onConfirm   = { () => { handleDeletePeriod(currentPeriod?.id || '') } }
            name        = { currentPeriod?.name || '' }
            type        = "el Periodo"
        />
        </div>
    )
}
