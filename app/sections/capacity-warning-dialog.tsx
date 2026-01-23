"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface AffectedSession {
    ssec: string;
    registered: number | null;
    quota: number;
    chairsAvailable: number;
}

interface CapacityWarningDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    spaceName: string;
    spaceCapacity: number;
    affectedSessions: AffectedSession[];
    onConfirm: () => void;
    onCancel: () => void;
}

export function CapacityWarningDialog({
    open,
    onOpenChange,
    spaceName,
    spaceCapacity,
    affectedSessions,
    onConfirm,
    onCancel,
}: CapacityWarningDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    const handleCancel = () => {
        onCancel();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                        <DialogTitle>Advertencia de Capacidad</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        Las siguientes sesiones quedarán con capacidad negativa si se mueven al espacio{" "}
                        <span className="font-semibold">{spaceName}</span> (Capacidad: {spaceCapacity}).
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="space-y-3">
                        {affectedSessions.map((session, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-sm">
                                            SSEC: {session.ssec}
                                        </span>
                                        <span className="text-destructive font-semibold text-sm">
                                            Resultado: {session.chairsAvailable}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Registrados / Cuota:{" "}
                                        <span className="font-medium">
                                            {session.registered !== null ? session.registered : "null"} / {session.quota}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1 sm:flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        className="flex-1 sm:flex-1"
                    >
                        Continuar de todas formas
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
