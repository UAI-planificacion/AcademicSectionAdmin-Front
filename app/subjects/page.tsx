"use client"

import { useState } from "react"

import { Plus, Pencil, Trash2 } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"

import { Button }       from "@/components/ui/button"
import { DataTable }    from "@/components/data-table/data-table"

import { formatDate } from "@/lib/utils";
import { Subject }    from "@/lib/types";

import { SubjectModal } from "./subject-modal";

import { useSubjects } from "@/hooks/use-subjects";
import { DeleteConfirmDialog } from "@/components/dialogs/DeleteConfirmDialog"


export default function SubjectsPage() {
    // const [subjects, setSubjects] = useState<Subject[]>(initialSubjects)

    const { subjects } = useSubjects()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null)

    const handleAddSubject = (subject: Subject) => {
        // setSubjects([...subjects, subject])
    }

    const handleUpdateSubject = (updatedSubject: Subject) => {
        // setSubjects(subjects.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)))
    }

    const handleDeleteSubject = (id: string) => {
        // setSubjects(subjects.filter((subject) => subject.id !== id))
    }

    const openAddModal = () => {
        setCurrentSubject(null)
        setIsModalOpen(true)
    }

    const openEditModal = (subject: Subject) => {
        setCurrentSubject(subject)
        setIsModalOpen(true)
    }

    const openDeleteDialog = (subject: Subject) => {
        setCurrentSubject(subject)
        setIsDeleteDialogOpen(true)
    }

    const columns: ColumnDef<Subject>[] = [
        {
        accessorKey: "id",
        header: "ID",
        },
        {
        accessorKey: "name",
        header: "Nombre",
        },
        {
        accessorKey: "startDate",
        header: "Fecha de Inicio",
        // cell: ({ row }) => formatDate(row.original.startDate),
        cell: ({ row }) => row.original.startDate,
        },
        {
        accessorKey: "endDate",
        header: "Fecha de Fin",
        // cell: ({ row }) => formatDate(row.original.endDate),
        cell: ({ row }) => row.original.endDate,
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
                <h1 className="text-3xl font-bold">Asignaturas</h1>

                <Button onClick={openAddModal}>
                    <Plus className="mr-2 h-4 w-4" />

                    Añadir Asignatura
                </Button>
            </div>

            <DataTable
                columns             = { columns }
                data                = { subjects }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            <SubjectModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen(false) }
                subject     = { currentSubject }
                onAdd       = { handleAddSubject }
                onUpdate    = { handleUpdateSubject }
            />

            <DeleteConfirmDialog
                isOpen      = { isDeleteDialogOpen }
                onClose     = { () => setIsDeleteDialogOpen(false) }
                onConfirm   = { () => { handleDeleteSubject(currentSubject?.id || '') } }
                name        = { currentSubject?.id || '' }
                type        = "la Asignatura"
            />
        </div>
    )
}
