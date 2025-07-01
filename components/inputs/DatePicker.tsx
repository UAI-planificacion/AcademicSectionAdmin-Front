"use client"

import * as React from "react"

import { format }                   from "date-fns";
import { es }                       from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";


import {
    Popover,
    PopoverContent,
    PopoverTrigger,
}                   from "@/components/ui/popover";
import { Button }   from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import { cn } from "@/lib/utils";


interface DatePickerProps {
    value?          : Date | null;
    onChange?       : ( date: Date | undefined ) => void;
    placeholder?    : string;
    disabled?       : boolean;
    className?      : string;
    error?          : string;
}


export function DatePicker({
    value,
    onChange,
    placeholder = "Seleccionar fecha",
    disabled = false,
    className,
    error
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = ( date: Date | undefined ) => {
        onChange?.( date );
        setOpen( false );
    }

    return (
        <div className="space-y-1">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant     = "outline"
                        disabled    = { disabled }
                        className   = { cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                            error && "border-destructive",
                            className
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                            {value ? (
                                format(value, "PPP", { locale: es })
                            ) : (
                                <span>{placeholder}</span>
                            )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode        = "single"
                        selected    = { value || undefined }
                        onSelect    = { handleSelect }
                        disabled    = { disabled }
                        locale      = { es }
                    />
                </PopoverContent>
            </Popover>
            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
