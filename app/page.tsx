'use client'

import dynamic from "next/dynamic"

// Importar el componente principal de forma dinámica para evitar problemas de hidratación
const SchedulerDashboard = dynamic(
    () => import("@/components/scheduler-dashboard").then((mod) => mod.SchedulerDashboard),
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
    },
)

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col">
            <header className=" py-4 border-b border-gray-200">
                <div className="flex justify-between items-center container mx-auto ">
                    <h1 className="text-2xl font-bold">Administrador de Secciones Académicas</h1>
                    <button>Logout</button>
                </div>
            </header>

            <main className="h-[calc(100vh-6rem)] overflow-y-auto">
                <SchedulerDashboard />
            </main>
        </main>
    )
}
