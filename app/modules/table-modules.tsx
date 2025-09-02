"use client";

import { JSX, useState } from "react";

import {
    Pencil,
    Trash2,
    Clock,
    CheckCircle,
    XCircle
}                           from "lucide-react";
import type { ColumnDef }   from "@tanstack/react-table";
import { toast }            from "sonner";

import { Button }               from "@/components/ui/button";
import { DataTable }            from "@/components/data-table/data-table";
import { Badge }                from "@/components/ui/badge";
import { DeleteConfirmDialog }  from "@/components/dialogs/DeleteConfirmDialog";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import { ModuleModal }      from "@/app/modules/ModuleModal";
import { ModuleOriginal }   from "@/models/module.model";
import { fetchApi }         from "@/services/fetch";


interface Props {
    modules : ModuleOriginal[];
    onSave  : ( modules: ModuleOriginal[] ) => void;
    days    : number[];
}


export default function TableModules({
    modules,
    onSave,
    days
}: Props ): JSX.Element {
    const [isModalOpen, setIsModalOpen]             = useState( false );
    const [isModalDeleteOpen, setIsModalDeleteOpen] = useState( false );
    const [currentModule, setCurrentModule]         = useState<ModuleOriginal>( modules[0] );


    function onOpenModal( module: ModuleOriginal ): void {
        setCurrentModule( module );
        setIsModalOpen( true );
    }


    function onOpenDeleteDialog( module: ModuleOriginal ): void {
        setCurrentModule( module );
        setIsModalDeleteOpen( true );
    }


    async function handleDeleteModule( id: string ): Promise<void> {
        const url       = `${ENV.REQUEST_BACK_URL}modules/${id}`;
        const moduleDeleted = await fetchApi<ModuleOriginal[] | null>( url, "DELETE" );

        if ( !moduleDeleted || moduleDeleted.length === 0 ) {
            toast( 'No se pudo eliminar el módulo', errorToast );
            return;
        }

        onSave( moduleDeleted );
        toast( 'Módulo eliminado correctamente', successToast );
    }


    const columns: ColumnDef<ModuleOriginal>[] = [
        {
            accessorKey : "id",
            header      : "ID",
        },
        {
            accessorKey : "code",
            header      : "Código",
        },
        {
            accessorKey : "name",
            header      : "Nombre",
        },
        {
            accessorKey : "isActive",
            header      : "Estado",
            cell        : ({ row }) => (
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
            accessorKey : "startHour",
            header      : "Hora Inicio",
            cell        : ({ row }) => (
                <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {row.original.startHour}
                </div>
            ),
        },
        {
            accessorKey : "endHour",
            header      : "Hora Fin",
            cell        : ({ row }) => (
                <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {row.original.endHour}
                </div>
            ),
        },
        {
            accessorKey : "difference",
            header      : "Diferencia",
            cell        : ({ row }) => row.original.difference || "-",
        },
        {
            id      : "actions",
            cell    : ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onOpenModal(row.original)}>
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => onOpenDeleteDialog(row.original)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            )
        }
    ]


    return (
        <div className="container mx-auto">
            <DataTable
                columns             = { columns }
                data                = { modules }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            <ModuleModal
                isOpen  = { isModalOpen }
                onClose = { () => setIsModalOpen( false )}
                module  = { currentModule }
                onSave  = { onSave }
                days    = { days }
            />

            <DeleteConfirmDialog
                isOpen      = { isModalDeleteOpen }
                onClose     = { () => setIsModalDeleteOpen( false )}
                onConfirm   = { () => { handleDeleteModule( currentModule?.id || '' )}}
                name        = { currentModule?.name || '' }
                type        = "el Módulo"
            />
        </div>
    );
}
