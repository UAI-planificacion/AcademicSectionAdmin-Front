'use client'

import { useEffect, useState }  from "react";
import { useTheme }             from "next-themes";
import { useRouter }            from "next/navigation";

import {
    Book,
    Calendar,
    CalendarClock,
    Clock,
    Computer,
    Cuboid,
    GraduationCap,
    Moon,
    Ruler,
    Sun,
    User
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
}                   from "@/components/ui/dropdown-menu";
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
}                   from "@/components/ui/menubar"
import SignIn       from "@/components/auth/SignIn";
import { Button }   from "@/components/ui/button";

import { signOut, getSession } from "@/config/better-auth/auth-client";


export default  function Header() {
    const { setTheme } = useTheme();
    const router = useRouter();

    const [sessionData, setSessionData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const session = await getSession();
                console.log('🚀 ~ file: Header.tsx:22 ~ session:', session);
                setSessionData(session);
            } catch (err) {
                console.error('Error al obtener la sesión:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, []);
    
    // Refrescar la sesión cuando cambie el estado de autenticación
    const refreshSession = async () => {
        try {
            setLoading(true);
            const session = await getSession();
            setSessionData(session);
        } catch (err) {
            console.error('Error al refrescar la sesión:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if ( error ) {
        return (
            <header className="bg-black py-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center container mx-auto gap-2">
                    <h1 className="text-xl xl:text-2xl font-bold text-white">Secciones Académicas</h1>
                    <p className="text-red-500">Error al obtener la sesión</p>
                </div>
            </header>
        );
    }

    return (
        <header className="bg-black py-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex justify-between items-center container mx-auto gap-2">
                <h1 className="text-xl xl:text-2xl font-bold text-white">Secciones Académicas</h1>

                <Menubar className="hidden md:flex bg-black text-white border-zinc-700">
                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/sections')}
                            id="sections"
                        >
                            <GraduationCap className="mr-2 h-6 w-6" />
                            <span className="hidden xl:block">Secciones</span>
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/modules')}
                            id="modules"
                        >
                            <Clock className="mr-2 h-5 w-5" />
                            <span className="hidden xl:block">Módulos</span>
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/days')}
                            id="days"
                        >
                            <Calendar className="mr-2 h-5 w-5" />
                            <span className="hidden xl:block">Días</span>
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/periods')}
                            id="periods"
                        >
                            <CalendarClock className="mr-2 h-5 w-5" />
                            <span className="hidden xl:block">Periodos</span>
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/spaces')}
                            id="spaces"
                        >
                            <Cuboid className="mr-2 h-5 w-5" />
                            <span className="hidden xl:block">Espacios</span>
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/sizes')}
                            id="sizes"
                        >
                            <Ruler className="mr-2 h-5 w-5" />
                            <span className="hidden xl:block">Tamaños</span>
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/subjects')}
                            id="subjects"
                        >
                            <Book className="mr-2 h-5 w-5" />
                            <span className="hidden xl:block">Asignaturas</span>
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/professors')}
                            id="professors"
                        >
                            <User className="mr-2 h-5 w-5" />
                            <span className="hidden xl:block">Profesores</span>
                        </MenubarTrigger>
                    </MenubarMenu>
                </Menubar>

                <div className="flex items-center gap-2">
                    {loading ? (
                        <Button className="bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white" variant="outline" disabled>Cargando...</Button>
                    ) : sessionData?.data?.user ? (
                        <Button 
                            className="bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white"
                            variant="outline" 
                            onClick={async () => {
                                await signOut();
                                refreshSession();
                            }}
                        >
                            Cerrar sesión
                        </Button>
                    ) : (
                        <SignIn />
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                                <Computer className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                                <span className="sr-only">Cambiar tema</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="bg-black text-white border-zinc-700">
                            <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center justify-between">
                                Claro
                                <Sun className="h-[1.2rem] w-[1.2rem]" />
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center justify-between">
                                Oscuro
                                <Moon className="h-[1.2rem] w-[1.2rem]" />
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center justify-between">
                                Sistema
                                <Computer className="h-[1.2rem] w-[1.2rem]" />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
