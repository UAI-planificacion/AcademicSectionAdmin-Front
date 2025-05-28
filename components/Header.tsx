'use client'

import { Moon, Sun }    from "lucide-react";
import { useTheme }     from "next-themes";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
}                   from "@/components/ui/dropdown-menu";
import { Button }   from "@/components/ui/button";
import SignIn   from "@/components/auth/SignIn";
import { useSession, signOut, getSession } from "@/config/better-auth/auth-client";
import { useEffect, useState } from "react";

export default  function Header() {
    const { setTheme } = useTheme();

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
        <header className=" py-4 border-b border-gray-200">
            <div className="flex justify-between items-center container mx-auto ">
                <h1 className="text-2xl font-bold">Administrador de Secciones Académicas</h1>

                <div className="flex items-center gap-2">
                {/* <SignMsal /> */}
                {loading ? (
                    <Button variant="outline" disabled>Cargando...</Button>
                ) : sessionData?.data?.user ? (
                    <Button 
                        variant="outline" 
                        onClick={async () => {
                            await signOut();
                            refreshSession(); // Refrescar la sesión después de cerrar sesión
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
