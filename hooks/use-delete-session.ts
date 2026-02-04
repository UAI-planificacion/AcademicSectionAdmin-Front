import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { SectionSession } from '@/models/section.model';
import { successToast, errorToast } from '@/config/toast/toast.config';
import { KEY_QUERYS } from '@/lib/key-queries';
import { fetchApi, Method } from '@/services_/fetch';


interface DeleteSessionParams {
    sessionId       : string;
    updatedSections : SectionSession[];
}


interface DeleteSessionContext {
    previousSections: SectionSession[];
}


interface UseDeleteSessionReturn {
    mutate     : ( params: DeleteSessionParams ) => void;
    isPending  : boolean;
    isError    : boolean;
    isSuccess  : boolean;
}


export function useDeleteSession(): UseDeleteSessionReturn {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        void,
        Error,
        DeleteSessionParams,
        DeleteSessionContext
    >({
        mutationFn: async ({ sessionId }) => {
            await fetchApi<void>({
                url: `sessions/${sessionId}`,
                method: Method.DELETE
            });
        },
        // Optimistic update: remove session immediately
        onMutate: async ({ updatedSections }) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: [KEY_QUERYS.SECTIONS] });

            // Snapshot the previous value
            const previousSections = queryClient.getQueryData<SectionSession[]>([KEY_QUERYS.SECTIONS]) || [];

            // Optimistically update to the new value (without deleted session)
            queryClient.setQueryData<SectionSession[]>([KEY_QUERYS.SECTIONS], updatedSections);

            // Return context with previous state for rollback
            return { previousSections };
        },
        // On success: invalidate and refetch to ensure sync with server
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });
            toast( 'Sesión eliminada correctamente', successToast );
        },
        // On error: rollback to previous state and show error toast
        onError: ( error, _, context ) => {
            if ( context?.previousSections ) {
                queryClient.setQueryData<SectionSession[]>([KEY_QUERYS.SECTIONS], context.previousSections);
            }

            toast( error.message || 'No se pudo eliminar la sesión', errorToast );
        },
    });

    return {
        mutate      : mutation.mutate,
        isPending   : mutation.isPending,
        isError     : mutation.isError,
        isSuccess   : mutation.isSuccess,
    };
}
