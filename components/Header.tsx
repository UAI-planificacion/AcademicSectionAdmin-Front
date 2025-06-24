'use client'

import { useEffect, useState }  from "react";
import { useTheme }             from "next-themes";
import { useRouter }            from "next/navigation";

import {
    Book,
    Calendar,
    CalendarClock,
    Clock,
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

    // Estado local para almacenar la información de la sesión
    const [sessionData, setSessionData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    // Cargar la sesión al montar el componente
    useEffect(() => {
        let isMounted = true;

        const fetchSession = async () => {
            try {
                const session = await getSession();
                console.log('🚀 ~ file: Header.tsx:22 ~ session:', session);

                // Solo actualizar el estado si el componente sigue montado
                if (isMounted) {
                    setSessionData(session);
                }
            } catch (err) {
                console.error('Error al obtener la sesión:', err);

                // Solo actualizar el estado si el componente sigue montado
                if (isMounted) {
                    setError(err);
                }
            } finally {
                // Solo actualizar el estado si el componente sigue montado
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchSession();

        // Limpieza al desmontar el componente
        return () => {
            isMounted = false;
        };
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

    return (
        <header className="bg-black py-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
            <div className="flex justify-between items-center container mx-auto">
                <h1 className="text-2xl font-bold">Secciones Académicas</h1>

                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/sections')}
                            id="sections"
                        >
                            <GraduationCap className="mr-2 h-6 w-6" />
                            Secciones
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/modules')}
                            id="modules"
                        >
                            <Clock className="mr-2 h-5 w-5" />
                            Módulos
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/days')}
                            id="days"
                        >
                            <Calendar className="mr-2 h-5 w-5" />
                            Días
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/periods')}
                            id="periods"
                        >
                            <CalendarClock className="mr-2 h-5 w-5" />
                            Periodos
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/spaces')}
                            id="spaces"
                        >
                            <Cuboid className="mr-2 h-5 w-5" />
                            Espacios
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/sizes')}
                            id="sizes"
                        >
                            <Ruler className="mr-2 h-5 w-5" />
                            Tamaños
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/subjects')}
                            id="subjects"
                        >
                            <Book className="mr-2 h-5 w-5" />
                            Asignaturas
                        </MenubarTrigger>
                    </MenubarMenu>

                    <MenubarMenu>
                        <MenubarTrigger
                            onClick={() => router.push('/professors')}
                            id="professors"
                        >
                            <User className="mr-2 h-5 w-5" />
                            Profesores
                        </MenubarTrigger>
                    </MenubarMenu>
                </Menubar>

                <div className="flex items-center gap-2">
                    {loading ? (
                        <Button variant="outline" disabled>Cargando...</Button>
                    ) : sessionData?.data?.user ? (
                        <Button 
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
                            <Button variant="outline" size="icon">
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Light
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Dark
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => setTheme("system")}>
                                System
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
