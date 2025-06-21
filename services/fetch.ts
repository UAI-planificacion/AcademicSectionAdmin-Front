export async function fetchApi<T>(
    url     : string,
    method  : string,
    body?   : object
): Promise<T | null> {
    try {
        const response = await fetch( url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( body || {} ),
        } );

        if ( !response.ok ) {
            throw new Error( "Error al hacer la petición" );
        }

        const data = await response.json() as T;

        return data;
    } catch ( error ) {
        return null;
    }
}
