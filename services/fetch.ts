export type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function fetchApi<T>(
    url     : string,
    method  : Method,
    body?   : object
): Promise<T | null> {
    const bodyRequest = method !== 'GET' ? body : undefined;

    try {
        const response = await fetch( url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( bodyRequest ),
        } );

        if ( !response.ok ) {
            throw new Error( "Error al hacer la petición" );
        }

        return await response.json() as T;
    } catch ( error ) {
        return null;
    }
}
