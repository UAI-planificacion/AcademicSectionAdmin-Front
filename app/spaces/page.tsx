"use client"

import { useState } from "react"

import { Building, Plus, Pencil, Trash2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table/data-table"

// import { type Space, spaces as initialSpaces } from "@/lib/data"
import { formatDate } from "@/lib/utils"

import { SpaceModal } from "./space-modal"
import { Space } from "@/lib/types"
import { useSpaces } from "@/hooks/use-spaces"
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog"

export default function SpacesPage() {
    const { spaces } = useSpaces()
    // const [spaces, setSpaces]           = useState<Space[]>(initialSpaces)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentSpace, setCurrentSpace] = useState<Space | null>(null)

    const handleAddSpace = (space: Space) => {
        // setSpaces([...spaces, space])
    }

    const handleUpdateSpace = (updatedSpace: Space) => {
        // setSpaces( spaces.map(( space ) => ( space.id === updatedSpace.id ? updatedSpace : space )))
    }

    const handleDeleteSpace = ( id: string ) => {
        // setSpaces( spaces.filter(( space ) => space.id !== id ))
    }

    const openAddModal = () => {
        setCurrentSpace( null );
        setIsModalOpen( true );
    }

    const openEditModal = ( space: Space ): void => {
        setCurrentSpace( space );
        setIsModalOpen( true );
    }

    const openDeleteDialog = ( space: Space ) => {
        setCurrentSpace( space );
        setIsDeleteDialogOpen( true );
    }

    const columns: ColumnDef<Space>[] = [
        {
            accessorKey: "id",
            header: "Nombre",
        },
        {
            accessorKey: "type",
            header: "Tipo",
        },
        {
            accessorKey: "capacity",
            header: "Capacidad",
        },
        {
            accessorKey: "sizeId",
            header: "Tamaño",
        },
        {
            accessorKey: "building",
            header: "Edificio",
            cell: ({ row }) => (
                <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    {row.original.building}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Fecha de Creación",
            cell: ({ row }) => formatDate(new Date (row.original.createdAt)),
        },
        {
            accessorKey: "updatedAt",
            header: "Última Actualización",
            cell: ({ row }) => formatDate(new Date (row.original.updatedAt)),
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
                <h1 className="text-3xl font-bold">Espacios</h1>

                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />

                    Añadir Espacio
                </Button>
            </div>

            <DataTable
                columns             = { columns }
                data                = { spaces }
                searchKey           = "id"
                searchPlaceholder   = "Buscar por ID..."
            />

            <SpaceModal
                isOpen      ={ isModalOpen }
                onClose     ={ () => setIsModalOpen( false )}
                space       ={ currentSpace }
                onAdd       ={ handleAddSpace }
                onUpdate    ={ handleUpdateSpace }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen(false) }
                onConfirm   = { () => { handleDeleteSpace(currentSpace?.id || '') } }
                name        = { currentSpace?.id || '' }
                type        = "el Espacio"
            />
        </div>
    )
}
