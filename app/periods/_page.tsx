"use client"

import { JSX, useEffect, useState } from "react";

import { Plus, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef }       from "@tanstack/react-table";

import { PeriodModal }          from "@/app/periods/period-modal";

import { Button }               from "@/components/ui/button";
import { DataTable }            from "@/components/data-table/data-table";
import { Badge }                from "@/components/ui/badge";
import { DeleteConfirmDialog }  from "@/components/dialogs/DeleteConfirmDialog";

import { Period, Status } from "@/lib/types";

import { usePeriods } from "@/hooks/use-periods";
import { ENV } from "@/config/envs/env";
import { fetchApi } from "@/services/fetch";
import { toast } from "sonner";
import { errorToast, successToast } from "@/config/toast/toast.config";
import { deletePeriodStorage } from "@/stores/local-storage-periods";


export default function PeriodsPage(): JSX.Element {
    const { periods }                                   = usePeriods();
    const [periodsData, setPeriodsData]                 = useState<Period[]>( periods );
    const [isModalOpen, setIsModalOpen]                 = useState<boolean>( false );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState<boolean>( false );
    const [currentPeriod, setCurrentPeriod]             = useState<Period | null>( null );


    useEffect(() => {
        setPeriodsData( periods );
    }, [periods]);


    const handleAddPeriod = ( period: Period ) => setPeriodsData([ ...periodsData, period ]);


    function handleUpdatePeriod( updatedPeriod: Period ): void {
        setPeriodsData(
            periodsData.map(( period ) => ( period.id === updatedPeriod.id
                ? updatedPeriod
                : period
            ))
        );
    }


    async function handleDeletePeriod( id: string ): Promise<void> {
        const url       = `${ENV.REQUEST_BACK_URL}periods/${id}`;
        const periodSave = await fetchApi<Period | null>( url, "DELETE" );

        if ( !periodSave ) {
            toast( 'No se pudo eliminar el periodo', errorToast );
            return;
        }

        setPeriodsData( periodsData.filter(( period ) => period.id !== id ));
        deletePeriodStorage( periodSave.id );
        toast( 'Periodo eliminado correctamente', successToast );
    }


    function openAddModal(): void {
        setCurrentPeriod( null );
        setIsModalOpen( true );
    }


    function openEditModal( period: Period ): void {
        setCurrentPeriod( period );
        setIsModalOpen( true );
    }


    function openDeleteDialog( period: Period ): void {
        setCurrentPeriod( period );
        setIsDeleteDialogOpen( true );
    }


    const getStatusBadge = ( status: Status ): JSX.Element => ({
        Open        : <Badge className="bg-green-500">Abierto</Badge>,
        InProgress  : <Badge className="bg-blue-500">En Progreso</Badge>,
        Closed      : <Badge className="bg-red-500">Cerrado</Badge>,
        default     : <Badge>{status}</Badge>
    }[status] || <Badge>{status}</Badge> );


    const columns: ColumnDef<Period>[] = [
        {
            accessorKey : "id",
            header      : "ID",
        },
        {
            accessorKey : "name",
            header      : "Nombre",
        },
        {
            accessorKey : "status",
            header      : "Estado",
            cell        : ({ row }) => getStatusBadge( row.original.status ),
        },
        {
            accessorKey : "startDate",
            header      : "Fecha de Inicio",
            // cell: ({ row }) => formatDate(row.original.startDate),
            cell        : ({ row }) => row.original.startDate,
        },
        {
            accessorKey : "endDate",
            header      : "Fecha de Fin",
            cell        : ({ row }) => row.original.endDate,
            // cell: ({ row }) => formatDate(row.original.endDate),
        },
        {
            accessorKey : "openingDate",
            header      : "Fecha de Apertura",
            cell        : ({ row }) => row.original.openingDate,
            // cell: ({ row }) => formatDate(row.original.openingDate),
        },
        {
            accessorKey : "closingDate",
            header      : "Fecha de Cierre",
            cell        : ({ row }) => row.original.closingDate,
            // cell: ({ row }) => formatDate(row.original.closingDate),
        },
        {
            id      : "actions",
            cell    : ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal( row.original )}>
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog( row.original )}>
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

            <DataTable
                columns             = { columns }
                data                = { periodsData }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            <PeriodModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen( false )}
                period      = { currentPeriod }
                onAdd       = { handleAddPeriod }
                onUpdate    = { handleUpdatePeriod }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => { handleDeletePeriod( currentPeriod?.id || '' )}}
                name        = { currentPeriod?.name || '' }
                type        = "el Periodo"
            />
        </div>
    );
}
