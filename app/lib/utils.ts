import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateForInput(date: Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function getCapacityGroup(capacity: number): "XS" | "S" | "MS" | "M" | "L" {
  if (capacity < 30) return "XS"
  if (capacity >= 30 && capacity < 40) return "S"
  if (capacity >= 40 && capacity < 50) return "MS"
  if (capacity >= 50 && capacity < 60) return "M"
  return "L"
}
