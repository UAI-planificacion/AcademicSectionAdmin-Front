'use client'

export default function Home() {
    return (
        <div className="flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-900">
            <div className="w-full max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">Administrador de Secciones Académicas</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Sistema de gestión para la planificación de secciones académicas de la Universidad Adolfo Ibáñez
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-4">Bienvenido al Sistema</h2>
                            <p className="mb-4">
                                Esta plataforma permite gestionar y planificar las secciones académicas de manera eficiente.
                            </p>
                            <ul className="list-disc list-inside space-y-2 mb-4">
                                <li>Visualización de secciones por sala y horario</li>
                                <li>Arrastrar y soltar para reasignar secciones</li>
                                <li>Filtrado por edificio, capacidad y otros criterios</li>
                                <li>Exportación de datos para reportes</li>
                            </ul>
                            <p>
                                Inicie sesión para acceder a todas las funcionalidades del sistema.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
