'use client'

import dynamic from "next/dynamic"

const SchedulerDashboard = dynamic(
    () => import( '@/components/sections/scheduler-dashboard' ).then(( mod ) => mod.SchedulerDashboard ),
    {
        ssr: false,
        loading: () => (
            <div className="container mx-auto py-6 px-4">
                <h1 className="text-3xl font-bold mb-6">Administrador de Secciones Académicas</h1>

                <div className="h-[600px] w-full border rounded-lg flex items-center justify-center">
                    Cargando planificador...
                </div>
            </div>
        ),
    }
);

export default function SectionPage() {
    return (
        <main className="max-h-[calc(100vh-73px)] overflow-y-hidden">
            <SchedulerDashboard />
        </main>
    )
}