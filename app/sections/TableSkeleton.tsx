'use client'

export default function TableSkeleton() {
    return (
        <div className="flex max-h-screen border rounded-lg">
            <div className="flex-shrink-0 border-r border-zinc-300 dark:border-zinc-700">
                <div className="overflow-hidden">
                    <table className="border-collapse">
                        <thead className="sticky top-0 z-50 bg-black">
                            <tr className="bg-black text-white h-12">
                                <th className="border-x border-zinc-700 p-2 w-[100px]">Sala</th>
                                <th className="border-x border-zinc-700 p-2 w-[80px]">Tipo</th>
                                <th className="border-x border-zinc-700 p-2 w-[80px]">Edificio</th>
                                <th className="border-x border-zinc-700 p-2 w-[80px]">Talla</th>
                                <th className="border-x border-zinc-700 p-2 w-[80px]">Capacidad</th>
                            </tr>
                        </thead>

                        <tbody>
                            {Array.from({ length: 20 }).map((_, index) => (
                                <tr key={`skeleton-row-${index}`} className="border-b h-16">
                                    <td className="border-x p-2 bg-white dark:bg-zinc-900">
                                        <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </td>
                                    <td className="border-x p-2 bg-white dark:bg-zinc-900">
                                        <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </td>
                                    <td className="border-x p-2 bg-white dark:bg-zinc-900">
                                        <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </td>
                                    <td className="border-x p-2 bg-white dark:bg-zinc-900">
                                        <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </td>
                                    <td className="border-x p-2 bg-white dark:bg-zinc-900">
                                        <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-73px)]">
                <table className="border-collapse">
                    <thead className="sticky top-0 z-50 bg-black">
                        <tr className="bg-black text-white h-12">
                            {Array.from({ length: 30 }).map((_, index) => (
                                <th key={`skeleton-header-${index}`} className="border-x border-zinc-700 p-2 min-w-[80px]">
                                    <div className="animate-pulse h-4 bg-gray-600 rounded"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({ length: 20 }).map((_, rowIndex) => (
                            <tr key={`skeleton-content-row-${rowIndex}`} className="border-b h-16">
                                {Array.from({ length: 30 }).map((_, colIndex) => (
                                    <td key={`skeleton-cell-${rowIndex}-${colIndex}`} className="border-x p-2">
                                        <div className="animate-pulse">
                                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
