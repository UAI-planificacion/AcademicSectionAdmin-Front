'use client'

import { JSX } from "react";

import { Button }           from "@/components/ui/button";
import { signIn }           from "@/config/better-auth/auth-client";
import { MicrosoftIcon }    from "@/icons/microsoft";


export default function SignIn(): JSX.Element {
    return (
        <Button
            type        = "button"
            variant     = {'outline'}
            className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white"
            onClick     = { async () => await signIn()}
        >
            <MicrosoftIcon/>
            <span className="hidden xl:block">Iniciar sesión</span>
        </Button>
    );
}
