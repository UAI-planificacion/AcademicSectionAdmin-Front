"use client"

import {
    Pencil,
    Trash2,
    Clock,
    CheckCircle,
    XCircle
}                           from "lucide-react";
import type { ColumnDef }   from "@tanstack/react-table";

import { Button }               from "@/components/ui/button";
import { DataTable }            from "@/components/data-table/data-table";
import { Badge }                from "@/components/ui/badge";
// Removed unused DeleteConfirmDialog import

import { ModuleOriginal } from "@/models/module.model";
import { useModulesOriginal } from "@/hooks/use-modules-original";


export default function TableModules(
    {
        modules,
        onOpenEditModal,
        onOpenDeleteDialog,
        editingModule,
        setEditingModule
    }: {
        modules: ModuleOriginal[];
        onOpenEditModal: (module: ModuleOriginal) => void;
        onOpenDeleteDialog: (module: ModuleOriginal) => void;
        editingModule: ModuleOriginal | null;
        setEditingModule: React.Dispatch<React.SetStateAction<ModuleOriginal | null>>;
    }
) {
    const handleDeleteModule = (id: string) => {
        // The actual delete logic should be handled by the parent component
    }

    // const getDayName = (dayId: number) => {
    //     const day = days.find((d) => d.id === dayId)
    //     return day ? day.name : `Día ${dayId}`
    // }

    const columns: ColumnDef<ModuleOriginal>[] = [
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
            accessorKey: "difference",
            header: "Diferencia",
            cell: ({ row }) => row.original.difference || "-",
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onOpenEditModal(row.original)}>
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => onOpenDeleteDialog(row.original)}>
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
                    Añadir Módulo
                </Button>
            </div> */}

            <DataTable
                columns             = { columns }
                data                = { modules }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            {/* <ModuleModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen( false )}
                module      = { currentModule }
                onAdd       = { handleAddModule }
                onUpdate    = { handleUpdateModule }
            /> */}
        </div>
    );
}
