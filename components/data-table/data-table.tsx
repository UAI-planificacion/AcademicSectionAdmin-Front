"use client"

import { JSX, useState } from "react";

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    type SortingState,
    getSortedRowModel,
    type ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
}                               from "@/components/ui/table";
import { Input }                from "@/components/ui/input";
import { DataTablePagination }  from "@/components/data-table/data-table-pagination";



interface DataTableProps<TData, TValue> {
    columns             : ColumnDef<TData, TValue>[];
    data                : TData[];
    searchKey?          : string;
    searchPlaceholder?  : string;
}


export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Buscar...",
}: DataTableProps<TData, TValue> ): JSX.Element {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel         : getCoreRowModel(),
        getPaginationRowModel   : getPaginationRowModel(),
        onSortingChange         : setSorting,
        getSortedRowModel       : getSortedRowModel(),
        onColumnFiltersChange   : setColumnFilters,
        getFilteredRowModel     : getFilteredRowModel(),
        state                   : {
            sorting,
            columnFilters,
        }
    })


    return (
        <>
            {searchKey && (
                <div className="flex items-center py-4">
                    <Input
                        placeholder = { searchPlaceholder }
                        value       = {( table.getColumn( searchKey )?.getFilterValue() as string ) ?? "" }
                        onChange    = {( event ) => table.getColumn( searchKey )?.setFilterValue( event.target.value )}
                        className   = "max-w-sm"
                    />
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length
                        ?
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        :
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No hay resultados.
                                </TableCell>
                            </TableRow>
                        }
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination table={table} />
        </>
    );
}
