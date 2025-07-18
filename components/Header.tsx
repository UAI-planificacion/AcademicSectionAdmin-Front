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
}                       from "@/components/ui/menubar"
import SignIn           from "@/components/auth/SignIn";
import { Button }       from "@/components/ui/button";
import { AlertMessage } from "@/components/dialogs/Alert";

import { signOut, getSession } from "@/config/better-auth/auth-client";


export default function Header() {
    const router = useRouter();
    const { setTheme } = useTheme();

    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showAuthMessage, setShowAuthMessage] = useState(false);


    useEffect(() => {
        const loadSession = async () => {
            try {
                setIsLoading(true);
                const sessionData = await getSession();
                setSession(sessionData?.data || null);
            } catch (error) {
                console.error('Error al cargar sesión:', error);
                setSession(null);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadSession();
    }, []);


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('requireAuth') === 'true') {
            setShowAuthMessage(true);
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('requireAuth');
            window.history.replaceState({}, '', newUrl.toString());
        }
    }, []);

    return (
        <>
            <header className="bg-black py-4 border-b border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center container mx-auto gap-2">
                    <h1 className="text-xl xl:text-2xl font-bold text-white">Secciones Académicas</h1>

                    {
                        session?.user && (
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
                        )
                    }

                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <Button className="bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white" variant="outline" disabled>Cargando...</Button>
                        ) :(
                            session?.user ? (
                                <Button 
                                    className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white"
                                    variant     = "outline" 
                                    onClick     = { async () => await signOut() }
                                >
                                    Cerrar sesión
                                </Button>
                            ) : (
                                <SignIn />
                            )
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

            {showAuthMessage && (
                <AlertMessage
                    title="Debes iniciar sesión para acceder a esta página."
                    onClose={() => setShowAuthMessage(false)}
                />
            )}
        </>
    );
}
