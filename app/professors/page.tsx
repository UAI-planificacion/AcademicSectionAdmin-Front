"use client"

import { useEffect, useState } from "react";

import { Plus, Pencil, Trash2, Mail }   from "lucide-react";
import type { ColumnDef }               from "@tanstack/react-table";
import { toast }                        from "sonner";

import { ProfessorModal } from "@/app/professors/professor-modal";

import { Button }               from "@/components/ui/button";
import { DataTable }            from "@/components/data-table/data-table";
import { DeleteConfirmDialog }  from "@/components/dialogs/DeleteConfirmDialog";

import { formatDate }   from "@/lib/utils";
import { Professor }    from "@/lib/types";

import {
    errorToast,
    successToast
}               from "@/config/toast/toast.config";
import { ENV }  from "@/config/envs/env";

import { useProfessors }    from "@/hooks/use-professors";
import { fetchApi }         from "@/services/fetch";


export default function ProfessorsPage() {
    const { professors, isLoading, isError, error }     = useProfessors();
    const [professorsData, setProfessorsData]           = useState<Professor[]>( professors );
    const [isModalOpen, setIsModalOpen]                 = useState( false );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [currentProfessor, setCurrentProfessor]       = useState<Professor | null>( null );


    useEffect(() => {
        if ( professors && professors.length > 0 )
            setProfessorsData( professors );
    }, [ professors ]);


    function handleAddProfessor(professor: Professor): void {
        setProfessorsData([ ...professorsData, professor ]);
    }


    function handleUpdateProfessor( updatedProfessor: Professor ): void {
        setProfessorsData(
            professorsData.map(( professor ) => (
                professor.id === updatedProfessor.id
                    ? updatedProfessor
                    : professor
            ))
        );
    }


    async function handleDeleteProfessor( id: string ): Promise<void> {
        try {
            const url = `${ENV.REQUEST_BACK_URL}professors/${id}`;
            const professorDelete = await fetchApi<Professor | null>( url, "DELETE" );

            if ( !professorDelete ) {
                toast( 'No se pudo eliminar el profesor', errorToast );
                return;
            }

            setProfessorsData( professorsData.filter(( professor ) => professor.id !== id ));
            toast( 'Profesor eliminado correctamente', successToast );
        } catch (error) {
            toast( 'No se pudo eliminar el profesor', errorToast );
        }
    }


    function openAddModal(): void {
        setCurrentProfessor( null );
        setIsModalOpen( true );
    }


    function openEditModal( professor: Professor ): void {
        setCurrentProfessor( professor );
        setIsModalOpen( true );
    }


    function openDeleteDialog( professor: Professor ): void {
        setCurrentProfessor( professor );
        setIsDeleteDialogOpen( true );
    }


    const columns: ColumnDef<Professor>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "name",
            header: "Nombre",
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => {
                const email = row.original.email
                return email ? (
                    <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {email}
                    </div>
                ) : (
                    "-"
                )
            },
        },
        {
            accessorKey: "createdAt",
            header: "Fecha de Creación",
            cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
            accessorKey: "updatedAt",
            header: "Última Actualización",
            cell: ({ row }) => formatDate(row.original.updatedAt),
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

    // Manejo de estados de carga y error
    if (isLoading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Cargando profesores...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <p className="text-destructive mb-2">Error al cargar profesores</p>
                        <p className="text-muted-foreground text-sm">{error?.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Profesores</h1>

                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Profesor
                </Button>
            </div>

            <DataTable
                columns             = { columns }
                data                = { professorsData }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            <ProfessorModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen( false )}
                professor   = { currentProfessor }
                onAdd       = { handleAddProfessor }
                onUpdate    = { handleUpdateProfessor }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen(false) }
                onConfirm   = { () => { handleDeleteProfessor(currentProfessor?.id || '') } }
                name        = { currentProfessor?.name || '' }
                type        = "el Profesor"
            />
        </div>
    );
}
