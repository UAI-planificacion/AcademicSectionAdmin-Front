'use client'

import { SchedulerDashboard } from "@/app/sections/scheduler-dashboard";

export default function SectionPage() {
    return (
        <main className="max-h-[calc(100vh-73px)] overflow-y-hidden">
            <SchedulerDashboard />
        </main>
    )
}