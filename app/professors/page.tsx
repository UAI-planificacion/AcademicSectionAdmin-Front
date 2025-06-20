"use client"

import { useState } from "react";

import { Plus, Pencil, Trash2, Mail }   from "lucide-react";
import type { ColumnDef }               from "@tanstack/react-table";

import { Button }       from "@/components/ui/button";
import { DataTable }    from "@/components/data-table/data-table";

import { formatDate }   from "@/lib/utils";
import { Professor }    from "@/lib/types";

import { ProfessorModal } from "./professor-modal";

import { useProfessors } from "@/hooks/use-professors";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog";


export default function ProfessorsPage() {
    // const [professors, setProfessors] = useState<Professor[]>(initialProfessors)
    const { professors } = useProfessors();
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentProfessor, setCurrentProfessor] = useState<Professor | null>(null)

    const handleAddProfessor = (professor: Professor) => {
        // setProfessors([...professors, professor])
    }

    const handleUpdateProfessor = (updatedProfessor: Professor) => {
        // setProfessors(professors.map((professor) => (professor.id === updatedProfessor.id ? updatedProfessor : professor)))
    }

    const handleDeleteProfessor = (id: string) => {
        // setProfessors(professors.filter((professor) => professor.id !== id))
    }

    const openAddModal = () => {
        setCurrentProfessor(null)
        setIsModalOpen(true)
    }

    const openEditModal = (professor: Professor) => {
        setCurrentProfessor(professor)
        setIsModalOpen(true)
    }

    const openDeleteDialog = (professor: Professor) => {
        setCurrentProfessor(professor)
        setIsDeleteDialogOpen(true)
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
                    "N/A"
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
                data                = { professors }
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
