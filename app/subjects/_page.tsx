"use client"

import { useEffect, useState } from "react";

import { Plus, Pencil, Trash2 } from "lucide-react";
import type { ColumnDef }       from "@tanstack/react-table";

import { Button }               from "@/components/ui/button";
import { DataTable }            from "@/components/data-table/data-table";
import { DeleteConfirmDialog }  from "@/components/dialogs/DeleteConfirmDialog";

import { formatDate } from "@/lib/utils";
import { Subject }    from "@/lib/types";

import { SubjectModal } from "@/app/subjects/subject-modal";
import { useSubjects } from "@/hooks/use-subjects";
import { ENV } from "@/config/envs/env";
import { fetchApi } from "@/services/fetch";
import { toast } from "sonner";
import { errorToast, successToast } from "@/config/toast/toast.config";


export default function SubjectsPage() {
    const { subjects, isLoading, isError, error }       = useSubjects();
    const [subjectsData, setSubjectsData]               = useState<Subject[]>( subjects );
    const [isModalOpen, setIsModalOpen]                 = useState( false );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen]   = useState( false );
    const [currentSubject, setCurrentSubject]           = useState<Subject | null>( null );


    useEffect(() => {
        if ( subjects && subjects.length > 0 )
            setSubjectsData( subjects );
    }, [ subjects ]);


    const handleAddSubject = (subject: Subject) => {
        setSubjectsData([...subjectsData, subject])
    }

    const handleUpdateSubject = (updatedSubject: Subject) => {
        setSubjectsData(subjectsData.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)))
    }


    async function handleDeleteSubject( id: string ): Promise<void> {
        try {
            const url = `${ENV.REQUEST_BACK_URL}subjects/${id}`;
            const subjectDelete = await fetchApi<Subject | null>( url, "DELETE" );

            if ( !subjectDelete ) {
                toast( 'No se pudo eliminar la asignatura', errorToast );
                return;
            }

            setSubjectsData(subjectsData.filter((subject) => subject.id !== id))
            toast( 'Asignatura eliminada correctamente', successToast );
        } catch (error) {
            toast( 'No se pudo eliminar la asignatura', errorToast );
        }
    }


    function openAddModal(): void {
        setCurrentSubject(null);
        setIsModalOpen(true);
    }

    function openEditModal( subject: Subject ): void {
        setCurrentSubject(subject);
        setIsModalOpen(true);
    }

    function openDeleteDialog( subject: Subject ): void {
        setCurrentSubject(subject);
        setIsDeleteDialogOpen(true);
    }

    const columns: ColumnDef<Subject>[] = [
        {
            accessorKey : "id",
            header      : "ID",
        },
        {
            accessorKey : "name",
            header      : "Nombre",
        },
        {
            accessorKey : "startDate",
            header      : "Fecha de Inicio",
            cell        : ({ row }) => formatDate( row.original.startDate ),
        },
        {
            accessorKey : "endDate",
            header      : "Fecha de Fin",
            cell        : ({ row }) => formatDate( row.original.endDate ),
        },
        {
            id      : "actions",
            cell    : ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant = "ghost"
                        size    = "icon"
                        onClick = {() => openEditModal( row.original )}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                        variant = "ghost"
                        size    = "icon"
                        onClick = {() => openDeleteDialog( row.original )}
                    >
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
                        <p className="text-muted-foreground">Cargando asignaturas...</p>
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
                        <p className="text-destructive mb-2">Error al cargar asignaturas</p>
                        <p className="text-muted-foreground text-sm">{error?.message}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Asignaturas</h1>

                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />

                    Añadir Asignatura
                </Button>
            </div>

            <DataTable
                columns             = { columns }
                data                = { subjectsData }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            <SubjectModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen( false )}
                subject     = { currentSubject }
                onAdd       = { handleAddSubject }
                onUpdate    = { handleUpdateSubject }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen( false )}
                onConfirm   = { () => { handleDeleteSubject( currentSubject?.id || '' )}}
                name        = { currentSubject?.id || '' }
                type        = "la Asignatura"
            />
        </div>
    )
}
