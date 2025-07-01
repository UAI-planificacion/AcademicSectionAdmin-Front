import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate( date?: Date | string  | null | undefined ): string {
    if (!date) return "-"
    return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(date))
}

export function generateId(prefix: string): string {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `${prefix}${timestamp}${randomStr}`.toUpperCase().substring(0, 8)
}
