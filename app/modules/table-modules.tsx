"use client"

import { useState } from "react"

import { Plus, Pencil, Trash2, Clock, CheckCircle, XCircle } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button }       from "@/components/ui/button"
import { DataTable }    from "@/components/data-table/data-table"
import { Badge }        from "@/components/ui/badge"

import { Module } from "@/lib/types"

import { useModules }   from "@/hooks/use-modules"
import { useDays }      from "@/hooks/use-days"

import { ModuleModal } from "./module-modal"
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog"


export default function TableModules() {
    //   const [modules, setModules] = useState<Module[]>(initialModules)
    const { modules } = useModules();
    const { days } = useDays();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentModule, setCurrentModule] = useState<Module | null>(null)

    const handleAddModule = (module: Module) => {
        // setModules([...modules, module])
    }

    const handleUpdateModule = (updatedModule: Module) => {
        // setModules(modules.map((module) => (module.id === updatedModule.id ? updatedModule : module)))
    }

    const handleDeleteModule = (id: string) => {
        // setModules(modules.filter((module) => module.id !== id))
    }

    const openAddModal = () => {
        setCurrentModule(null)
        setIsModalOpen(true)
    }

    const openEditModal = (module: Module) => {
        setCurrentModule(module)
        setIsModalOpen(true)
    }

    const openDeleteDialog = (module: Module) => {
        setCurrentModule(module)
        setIsDeleteDialogOpen(true)
    }

    const getDayName = (dayId: number) => {
        const day = days.find((d) => d.id === dayId)
        return day ? day.name : `Día ${dayId}`
    }

    const columns: ColumnDef<Module>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "code",
            header: "Código",
        },
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "isActive",
            header: "Estado",
            cell: ({ row }) => (
                <div className="flex items-center">
                {row.original.isActive ? (
                    <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    <Badge className="bg-green-500">Activo</Badge>
                    </>
                ) : (
                    <>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    <Badge className="bg-red-500">Inactivo</Badge>
                    </>
                )}
                </div>
            ),
        },
        {
            accessorKey: "startHour",
            header: "Hora Inicio",
            cell: ({ row }) => (
                <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {row.original.startHour}
                </div>
            ),
        },
        {
            accessorKey: "endHour",
            header: "Hora Fin",
            cell: ({ row }) => (
                <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                {row.original.endHour}
                </div>
            ),
        },
        {
            accessorKey: "dayId",
            header: "Día",
            cell: ({ row }) => getDayName(row.original.dayId),
        },
        {
            accessorKey: "order",
            header: "Orden",
        },
        {
            accessorKey: "difference",
            header: "Diferencia",
            cell: ({ row }) => row.original.difference || "N/A",
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
        <div className="container mx-auto">
            {/* <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Módulos</h1>
                <Button onClick={openAddModal}>
                <Plus className="mr-2 h-4 w-4" />
                Añadir Módulo
                </Button>
            </div> */}

            <DataTable
                columns             = { columns }
                data                = { modules }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            <ModuleModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen( false )}
                module      = { currentModule }
                onAdd       = { handleAddModule }
                onUpdate    = { handleUpdateModule }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => handleDeleteModule( currentModule?.id || '' )}
                type        = "módulo"
                name        = { 'Módulo' }
            />
        </div>
    )
}
