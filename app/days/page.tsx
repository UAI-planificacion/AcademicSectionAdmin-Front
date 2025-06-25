"use client"

import { useEffect, useState } from "react"

import { Plus, Pencil }     from "lucide-react";
import type { ColumnDef }   from "@tanstack/react-table";

import { Button }       from "@/components/ui/button";
import { DataTable }    from "@/components/data-table/data-table";

import { DayModal } from "@/app/days/day-modal";
import { Day }      from "@/lib/types";
import { useDays }  from "@/hooks/use-days";


export default function DaysPage() {
    const { days }                      = useDays();
    const [daysData, setDaysData]       = useState<Day[]>( days );
    const [isModalOpen, setIsModalOpen] = useState( false );
    const [currentDay, setCurrentDay]   = useState<Day | null>( null );


    useEffect(() => {
        setDaysData( days );
    }, [days]);


    const handleAddDay = (day: Day) => {
        setDaysData([...daysData, day])
    }

    const handleUpdateDay = (updatedDay: Day) => {
        setDaysData(
            daysData.map(( day ) => (
                day.id === updatedDay.id
                    ? updatedDay
                    : day
            ))
        );
    }


    function openAddModal(): void {
        setCurrentDay(null)
        setIsModalOpen(true)
    }


    function openEditModal(day: Day): void {
        setCurrentDay(day)
        setIsModalOpen(true)
    }


    const columns: ColumnDef<Day>[] = [
        {
            accessorKey: "id",
            header: "ID",
        },
        {
            accessorKey: "name",
            header: "Nombre Completo",
        },
        {
            accessorKey: "mediumName",
            header: "Nombre Medio",
        },
        {
            accessorKey: "shortName",
            header: "Nombre Corto",
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" onClick={() => openEditModal(row.original)}>
                    <Pencil className="h-4 w-4" />
                </Button>
            ),
        },
    ]

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Días</h1>

                <Button
                    onClick={openAddModal}
                    disabled={daysData.length >= 7}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir Día
                </Button>
            </div>

            <DataTable
                columns             = { columns }
                data                = { daysData }
                searchKey           = "name"
                searchPlaceholder   = "Buscar por nombre..."
            />

            <DayModal
                isOpen      = { isModalOpen }
                onClose     = { () => setIsModalOpen( false )}
                day         = { currentDay }
                onAdd       = { handleAddDay }
                onUpdate    = { handleUpdateDay }
            />
        </div>
    );
}
