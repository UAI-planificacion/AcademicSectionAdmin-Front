import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { SectionSession } from '@/models/section.model';
import { ENV } from '@/config/envs/env';
import { successToast, errorToast } from '@/config/toast/toast.config';


interface UpdateSessionPayload {
    sessionId   : string;
    dayModuleId : number;
}


interface UpdateSessionsParams {
    spaceId         : string;
    updates         : UpdateSessionPayload[];
    updatedSections : SectionSession[];
    isNegativeChairs?: boolean;
}


interface UpdateSessionsContext {
    previousSections: SectionSession[];
}


async function updateSessionsMultiple(
    spaceId : string,
    updates : UpdateSessionPayload[],
    isNegativeChairs : boolean = false
): Promise<SectionSession[]> {
    const url = `${ENV.REQUEST_BACK_URL}sessions/update-times/${spaceId}${isNegativeChairs ? '?isNegativeChairs=true' : ''}`;

    const response = await fetch( url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify( updates ),
    });

    if ( !response.ok ) {
        // Extract the error message from the server response
        const errorData = await response.json().catch(() => ({ message: 'Error al actualizar las sesiones' }));
        throw new Error( errorData.message || 'Error al actualizar las sesiones' );
    }

    return await response.json();
}


interface UseUpdateSessionsMultipleReturn {
    mutate     : ( params: UpdateSessionsParams ) => void;
    isPending  : boolean;
    isError    : boolean;
    isSuccess  : boolean;
}


export function useUpdateSessionsMultiple(
    sections    : SectionSession[],
    setSections : React.Dispatch<React.SetStateAction<SectionSession[]>>
): UseUpdateSessionsMultipleReturn {
    const mutation = useMutation<
        SectionSession[],
        Error,
        UpdateSessionsParams,
        UpdateSessionsContext
    >({
        mutationFn: async ({ spaceId, updates, isNegativeChairs }) => {
            return await updateSessionsMultiple( spaceId, updates, isNegativeChairs );
        },
        // Optimistic update: apply changes immediately
        onMutate: async ({ updatedSections }) => {
            let previousSections: SectionSession[] = [];

            // Use functional setState to capture the CURRENT state synchronously
            setSections( currentSections => {
                previousSections = currentSections;
                return updatedSections;
            });

            // Return context with previous state
            return { previousSections };
        },
        // On success: show success toast
        onSuccess: () => {
            toast( 'Secciones actualizadas correctamente', successToast );
        },
        // On error: rollback to previous state and show error toast
        onError: ( error, _, context ) => {
            if ( context?.previousSections ) {
                setSections( context.previousSections );
            }

            toast( error.message || 'No se pudieron actualizar las secciones', errorToast );
        },
    });

    return {
        mutate      : mutation.mutate,
        isPending   : mutation.isPending,
        isError     : mutation.isError,
        isSuccess   : mutation.isSuccess,
    };
}
