import { createAuthClient } from "better-auth/client";

import { ENV } from "@/config/envs/env";


// Crear el cliente de autenticación
const authClient = createAuthClient({
    baseURL: ENV.URL
});

// Exportar las funciones y hooks necesarios
export const signIn = async () => await authClient.signIn.social({ provider: "microsoft", callbackURL: "/" });
export const signOut = async () => await authClient.signOut();

// Exportar el hook de sesión
// En Better Auth, useSession devuelve un átomo de Jotai
export const useSession = authClient.useSession;

// También exportamos una función para obtener la sesión actual
export const getSession = async () => {
  return await authClient.getSession();
};