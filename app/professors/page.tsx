"use client"

import { useEffect, useState } from "react";

import { Plus, Pencil, Trash2, Mail }   from "lucide-react";
import type { ColumnDef }               from "@tanstack/react-table";

import { ProfessorModal } from "@/app/professors/professor-modal";

import { Button }               from "@/components/ui/button";
import { DataTable }            from "@/components/data-table/data-table";
import { DeleteConfirmDialog }  from "@/components/dialogs/DeleteConfirmDialog";

import { formatDate }   from "@/lib/utils";
import { Professor }    from "@/lib/types";

import { useProfessors } from "@/hooks/use-professors";


export default function ProfessorsPage() {
    const { professors }                                = useProfessors();
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


    function handleDeleteProfessor( id: string ): void {
        setProfessorsData( professorsData.filter(( professor ) => professor.id !== id ));
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
