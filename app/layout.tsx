import type { Metadata } from 'next'

import './globals.css'

import { ThemeProvider }    from '@/components/theme-provider'
import Header               from '@/components/Header'
import { Toaster }          from "@/components/ui/sonner"


export const metadata: Metadata = {
    title       : 'Administrador de Secciones Académicas',
    description : 'Administrador de Secciones Académicas',
    generator   : 'AcademicSectionAdmin',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="es" suppressHydrationWarning={true} >
            <body>
                <ThemeProvider
                    attribute       = "class"
                    defaultTheme    = "system"
                    enableSystem 
                >
                    <Header />

                    <Toaster />

                    <main className="flex-grow">
                        {children}
                    </main>
                </ThemeProvider>
            </body>
        </html>
    )
}
