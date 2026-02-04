"use client"

import React from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SectionSession } from '@/models/section.model';
import { AlertTriangle } from 'lucide-react';


interface Props {
    open            : boolean;
    sessions        : SectionSession[];
    onConfirm       : () => void;
    onCancel        : () => void;
    isLoading       : boolean;
}


export function DeleteConfirmationDialog({
    open,
    sessions,
    onConfirm,
    onCancel,
    isLoading
}: Props): React.ReactElement {
    const sessionCount = sessions.length;

    // Don't render dialog if no sessions
    if ( sessionCount === 0 ) {
        return <></>;
    }

    // Deduplicate sessions by session.id to prevent showing duplicates
    const uniqueSessions = sessions.filter((session, index, self) =>
        index === self.findIndex((s) => s.session.id === session.session.id)
    );

    const uniqueCount = uniqueSessions.length;

    return (
        <Dialog open={open} onOpenChange={( isOpen ) => !isOpen && !isLoading && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Confirmar Eliminación
                    </DialogTitle>

                    <DialogDescription>
                        ¿Está seguro de que desea eliminar {uniqueCount} {uniqueCount === 1 ? 'sesión' : 'sesiones'}?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Sesiones a eliminar:
                    </p>

                    <div className="max-h-[200px] overflow-y-auto border rounded-md p-3 bg-muted/50">
                        <ul className="space-y-1">
                            {uniqueSessions.map(( session ) => (
                                <li 
                                    key={session.session.id}
                                    className="text-sm font-mono"
                                >
                                    {session.subject.id}-{session.code} ({session.session.name})
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-sm text-destructive font-medium">
                        ⚠️ Esta acción no se puede deshacer.
                    </p>
                </div>

                <DialogFooter className="flex items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
