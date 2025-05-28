'use client'

import { JSX } from "react";

import { Button }           from "@/components/ui/button";
import { signIn }           from "@/config/better-auth/auth-client";
import { MicrosoftIcon }    from "@/icons/microsoft";


export default function SignIn(): JSX.Element {
    return (
        <Button
            type    = "button"
            variant = {'outline'}
            onClick = { async () => await signIn()}
        >
            <MicrosoftIcon/>
            Iniciar sesión
        </Button>
    );
}
