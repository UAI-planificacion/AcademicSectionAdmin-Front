"use client"

import { useEffect, useState } from "react"

import {
    Plus,
    Pencil,
    Trash2,
    Ruler
}                           from "lucide-react";
import type { ColumnDef }   from "@tanstack/react-table";
import { toast }            from "sonner";

import { Button }               from "@/components/ui/button";
import { DataTable }            from "@/components/data-table/data-table";
import { DeleteConfirmDialog }  from "@/components/dialogs/DeleteConfirmDialog";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import { SizeModal }            from "@/app/sizes/size-modal";
import { Size, Sizes }          from "@/models/size.model";
import { deleteSizeStorage }    from "@/stores/local-storage-sizes";
import { fetchApi }             from "@/services/fetch";
import { useSizes }             from "@/hooks/use-sizes";


export default function SizesPage() {
    const { sizes }                                     = useSizes();
    const [sizesData, setSizesData]                     = useState<Size[]>( [] );
    const [isModalOpen, setIsModalOpen]                 = useState( false );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [currentSize, setCurrentSize]                 = useState<Size | null>( null );


    useEffect(() => {
        setSizesData( sizes );
    }, [sizes]);


    const handleAddSize = (size: Size) => {
        setSizesData([...sizesData, size]);
    }


    const handleUpdateSize = (updatedSize: Size) => {
        setSizesData(
            sizesData.map(( size ) =>
                size.id === updatedSize.id
                    ? updatedSize
                    : size
            )
        );
    }


    async function handleDeleteSize(id: string): Promise<void> {
        try {
            const url = `${ENV.REQUEST_BACK_URL}sizes/${id}`;
            const sizeData = await fetchApi<Sizes>( url, 'DELETE' );

            if ( !sizeData ) {
                toast( 'Error al eliminar la talla', errorToast );
                return;
            }

            deleteSizeStorage( sizeData.id );
            setSizesData( sizesData.filter(( size ) => size.id !== id ));
            toast( 'Talla eliminada correctamente', successToast );
        } catch ( error ) {
            toast( 'Error al eliminar la talla', errorToast );
        } finally {
            setIsDeleteDialogOpen( false );
        }
    }


    function openAddModal(): void {
        setCurrentSize( null );
        setIsModalOpen( true );
    }


    function openEditModal( size: Size ): void {
        setCurrentSize( size );
        setIsModalOpen( true );
    }


    async function openDeleteDialog(size: Size): Promise<void> {
        setCurrentSize( size );
        setIsDeleteDialogOpen( true );
    }

    const columns: ColumnDef<Size>[] = [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => (
                <div className="flex items-center">
                <Ruler className="mr-2 h-4 w-4" />
                {row.original.id}
                </div>
            ),
        },
        {
            accessorKey: "detail",
            header: "Detalle",
        },
        {
            accessorKey: "min",
            header: "Mínimo",
            cell: ({ row }) => row.original.min ?? "-",
        },
        {
            accessorKey: "max",
            header: "Máximo",
            cell: ({ row }) => row.original.max ?? "-",
        },
        {
            accessorKey: "greaterThan",
            header: "Mayor que",
            cell: ({ row }) => row.original.greaterThan ?? "-",
        },
        {
            accessorKey: "lessThan",
            header: "Menor que",
            cell: ({ row }) => row.original.lessThan ?? "-",
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
                <h1 className="text-3xl font-bold">Tamaños</h1>

                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Tamaño
                </Button>
            </div>

            <DataTable
                columns             = { columns }
                data                = { sizesData }
                searchKey           = "id"
                searchPlaceholder   = "Buscar por ID..."
            />

            <SizeModal
                isOpen          = { isModalOpen }
                onClose         = { () => setIsModalOpen( false )}
                size            = { currentSize }
                onAdd           = { handleAddSize }
                onUpdate        = { handleUpdateSize }
                existingSizes   = { sizesData }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => { handleDeleteSize( currentSize?.id || '' )}}
                name        = { currentSize?.id || '' }
                type        = "el Tamaño"
            />
        </div>
    );
}
