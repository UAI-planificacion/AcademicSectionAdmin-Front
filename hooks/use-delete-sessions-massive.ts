import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { SectionSession } from '@/models/section.model';
import { successToast, errorToast } from '@/config/toast/toast.config';
import { KEY_QUERYS } from '@/lib/key-queries';
import { fetchApi, Method } from '@/services_/fetch';


interface DeleteSessionsParams {
    sessionIds      : string[];
    updatedSections : SectionSession[];
}


interface DeleteSessionsContext {
    previousSections: SectionSession[];
}


interface UseDeleteSessionsMassiveReturn {
    mutate     : ( params: DeleteSessionsParams ) => void;
    isPending  : boolean;
    isError    : boolean;
    isSuccess  : boolean;
}


export function useDeleteSessionsMassive(): UseDeleteSessionsMassiveReturn {
    const queryClient = useQueryClient();

    const mutation = useMutation<
        void,
        Error,
        DeleteSessionsParams,
        DeleteSessionsContext
    >({
        mutationFn: async ({ sessionIds }) => {
            const ids = sessionIds.join(',');
            await fetchApi<void>({
                url: `sessions/massive/${ids}`,
                method: Method.DELETE
            });
        },
        // Optimistic update: remove sessions immediately
        onMutate: async ({ updatedSections }) => {
            // Cancel any outgoing refetches to avoid overwriting optimistic update
            await queryClient.cancelQueries({ queryKey: [KEY_QUERYS.SECTIONS] });

            // Snapshot the previous value
            const previousSections = queryClient.getQueryData<SectionSession[]>([KEY_QUERYS.SECTIONS]) || [];

            // Optimistically update to the new value (without deleted sessions)
            queryClient.setQueryData<SectionSession[]>([KEY_QUERYS.SECTIONS], updatedSections);

            // Return context with previous state for rollback
            return { previousSections };
        },
        // On success: invalidate and refetch to ensure sync with server
        onSuccess: ( _, { sessionIds } ) => {
            queryClient.invalidateQueries({ queryKey: [KEY_QUERYS.SECTIONS] });
            const count = sessionIds.length;
            toast( `${count} ${count === 1 ? 'sesión eliminada' : 'sesiones eliminadas'} correctamente`, successToast );
        },
        // On error: rollback to previous state and show error toast
        onError: ( error, _, context ) => {
            if ( context?.previousSections ) {
                queryClient.setQueryData<SectionSession[]>([KEY_QUERYS.SECTIONS], context.previousSections);
            }

            toast( error.message || 'No se pudieron eliminar las sesiones', errorToast );
        },
    });

    return {
        mutate      : mutation.mutate,
        isPending   : mutation.isPending,
        isError     : mutation.isError,
        isSuccess   : mutation.isSuccess,
    };
}
