import { createAuthClient } from "better-auth/client";

import { ENV } from "@/config/envs/env";


const authClient = createAuthClient({
    baseURL: ENV.URL,
    fetchOptions: {
        onError(context) {
            if (context.response.status === 401) {
                window.location.href = '/?requireAuth=true';
            }
        },
    },
});

export const signIn = async () => await authClient.signIn.social({ provider: "microsoft", callbackURL: "/" });

export const signOut = async () => {
    try {
        await authClient.signOut();
        window.location.href = '/';
    } catch (error) {
        window.location.href = '/';
    }
};

export const useSession = authClient.useSession;

export const getSession = async () => {
    try {
        const session = await authClient.getSession();
        return session;
    } catch (error) {
        return null;
    }
};
