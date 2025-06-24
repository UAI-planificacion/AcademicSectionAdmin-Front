"use client"

import { useEffect, useState } from "react";

import {
    Building,
    Plus,
    Pencil,
    Trash2
}                           from "lucide-react";
import type { ColumnDef }   from "@tanstack/react-table";
import { toast }            from "sonner";

import { SpaceModal } from "@/app/spaces/space-modal";

import { Button }               from "@/components/ui/button";
import { DataTable }            from "@/components/data-table/data-table";
import { DeleteConfirmDialog }  from "@/components/dialogs/DeleteConfirmDialog";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import { useSpaces }            from "@/hooks/use-spaces";
import { Space }                from "@/lib/types";
import { fetchApi }             from "@/services/fetch";
import { deleteSpaceStorage }   from "@/stores/local-storage-spaces";


export default function SpacesPage() {
    const { spaces }                                    = useSpaces();
    const [spacesData, setSpacesData]                   = useState<Space[]>( spaces );
    const [isModalOpen, setIsModalOpen]                 = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState(false);
    const [currentSpace, setCurrentSpace]               = useState<Space | null>(null);


    useEffect(() => {
        if ( spaces && spaces.length > 0 )
            setSpacesData( spaces );
    }, [ spaces ]);


    function handleAddSpace( space: Space ): void {
        setSpacesData([...spacesData, space])
    }


    function handleUpdateSpace( updatedSpace: Space ): void {
        setSpacesData(
            spacesData.map(( space ) => ( space.id === updatedSpace.id
                ? updatedSpace
                : space
            ))
        );
    }


    async function handleDeleteSpace( id: string ): Promise<Space | null> {
        const url       = `${ENV.REQUEST_BACK_URL}spaces/${id}`;
        const spaceSave = await fetchApi<Space | null>( url, "DELETE" );

        if ( !spaceSave ) {
            toast( 'No se pudo eliminar el espacio', errorToast );
            return null;
        }

        setSpacesData( spacesData.filter(( space ) => space.id !== id ))
        deleteSpaceStorage( spaceSave.id );
        toast( 'Espacio eliminado correctamente', successToast );

        return spaceSave;
    }


    function openAddModal(): void {
        setCurrentSpace( null );
        setIsModalOpen( true );
    }


    function openEditModal( space: Space ): void {
        setCurrentSpace( space );
        setIsModalOpen( true );
    }


    function openDeleteDialog( space: Space ): void {
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
            cell: ({ row }) => new Date (row.original.createdAt || '').toLocaleDateString(),
        },
        {
            accessorKey: "updatedAt",
            header: "Última Actualización",
            cell: ({ row }) => new Date (row.original.updatedAt || '').toLocaleDateString(),
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
                data                = { spacesData }
                searchKey           = "id"
                searchPlaceholder   = "Buscar por Nombre..."
            />

            <SpaceModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen( false )}
                space       = { currentSpace }
                onAdd       = { handleAddSpace }
                onUpdate    = { handleUpdateSpace }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => { handleDeleteSpace( currentSpace?.id || '' )}}
                name        = { currentSpace?.id || '' }
                type        = "el Espacio"
            />
        </div>
    )
}
