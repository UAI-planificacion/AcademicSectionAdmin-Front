import { betterAuth } from "better-auth"
import { ENV } from "../envs/env"


export const auth = betterAuth({
    socialProviders: {
        microsoft: { 
            clientId                : ENV.MSAL.CLIENT_ID, 
            clientSecret            : ENV.MSAL.CLIENT_SECRET, 
            tenantId                : ENV.MSAL.TENANT_ID, 
            redirectURI				: ENV.URL + '/api/auth/callback/microsoft',
			requireSelectAccount    : true,
            scope                   : [ "openid", "profile", "email", "offline_access", "https://graph.microsoft.com/User.Read" ],
        }, 
    },
});