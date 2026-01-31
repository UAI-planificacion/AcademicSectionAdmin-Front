'use client'

import {
    useEffect,
    useState,
    useMemo,
    useCallback
}               from "react";
import Image    from "next/image";

import { SendHorizontal } from "lucide-react";

import { Button }           from "@/components/ui/button";
import { Badge }            from "@/components/ui/badge";
import { AlertMessage }     from "@/components/dialogs/Alert";
import { usePeriodContext } from "@/contexts/period-context";
import MultiSelectCombobox  from "@/components/inputs/Combobox";
import { Theme }            from "@/components/theme/Theme";
import { Login }            from "./Login";
import { usePeriods }       from "@/hooks/use-periods";
import { useSession }       from "@/hooks/use-session";


export default function Header() {
	const { staff }                                         = useSession();
    const { periods }                                       = usePeriods();
    const { selectedPeriodIds, setSelectedPeriodIds }       = usePeriodContext();
    const [showAuthMessage, setShowAuthMessage]             = useState( false );
    const [tempSelectedPeriodIds, setTempSelectedPeriodIds] = useState<string[]>([]);


    useEffect(() => {
		const urlParams = new URLSearchParams( window.location.search );

		if ( urlParams.get( 'requireAuth' ) === 'true' ) {
			const newUrl = new URL( window.location.href );

			newUrl.searchParams.delete( 'requireAuth' );

			window.history.replaceState( {}, '', newUrl.toString() );
		}
	}, []);

    // Sync temp state with context when context changes externally
    useEffect(() => {
        setTempSelectedPeriodIds( selectedPeriodIds );
    }, [selectedPeriodIds]);

    /**
     * Calculate which periods should be disabled based on overlap logic
     * Two periods overlap if they share at least one day in common
     * Overlap condition: startA <= endB AND endA > startB (ensures at least 1 day overlap)
     */
    const getDisabledPeriods = useCallback(( selectedIds: string[] ): string[] => {
        // If no periods selected, all are enabled
        if ( selectedIds.length === 0 ) return [];

        // Find the first selected period
        const firstSelected = periods.find( p => p.id === selectedIds[ 0 ]);

        if ( !firstSelected ) return [];

        const firstStart    = new Date( firstSelected.startDate );
        const firstEnd      = new Date( firstSelected.endDate );

        // Disable periods that DON'T overlap with the first selected period
        // Two periods overlap if: startA <= endB AND endA > startB
        return periods
            .filter( p => {
                const periodStart   = new Date( p.startDate );
                const periodEnd     = new Date( p.endDate );

                // Check if periods overlap (have at least 1 day in common)
                const overlaps = firstStart <= periodEnd && firstEnd > periodStart;

                // Disable if they DON'T overlap
                return !overlaps;
            })
            .map( p => p.id );
    }, [periods]);

    // Memoize disabled periods based on TEMP selection
    const disabledPeriods = useMemo(
        () => getDisabledPeriods( tempSelectedPeriodIds ),
        [tempSelectedPeriodIds, getDisabledPeriods]
    );

    // Handle period selection change (updates local state only)
    const handlePeriodSelectionChange = useCallback(( value: string[] | string ) => {
        const newSelectedIds = Array.isArray( value ) ? value : [value];

        // If deselecting the first period, recalculate based on new first period
        if ( tempSelectedPeriodIds.length > 0 && newSelectedIds.length > 0 ) {
            const firstPeriodRemoved = !newSelectedIds.includes( tempSelectedPeriodIds[ 0 ]);

            if ( firstPeriodRemoved ) {
                // Keep only periods that overlap with the new first period
                const newDisabled       = getDisabledPeriods([ newSelectedIds[ 0 ]]);
                const validSelections   = newSelectedIds.filter( id => !newDisabled.includes( id ));

                setTempSelectedPeriodIds( validSelections );
                return;
            }
        }

        setTempSelectedPeriodIds( newSelectedIds );
    }, [tempSelectedPeriodIds, getDisabledPeriods]);

    // Apply the selection and trigger the query
    const handleApplySelection = useCallback(() => {
        setSelectedPeriodIds( tempSelectedPeriodIds );
    }, [tempSelectedPeriodIds, setSelectedPeriodIds]);

    // Check if there are pending changes
    const hasPendingChanges = useMemo(() => {
        if (tempSelectedPeriodIds.length !== selectedPeriodIds.length) return true;
        return !tempSelectedPeriodIds.every(id => selectedPeriodIds.includes(id));
    }, [tempSelectedPeriodIds, selectedPeriodIds]);


    return (
        <>
            <header className="bg-black py-4 sm:py-1.5 border-b border-gray-200 dark:border-gray-800 transition-colors">
                <div className="flex justify-between items-center container mx-auto gap-2">
                    <div className="hidden sm:flex items-center gap-2">
                        <a href="/">
							<span className="sr-only">Universidad Adolfo Ibáñez</span>

							<Image
								title   = "UAI"
								src     = "https://mailing20s.s3.amazonaws.com/templtates/logosinescudo.png"
								alt     = "logo uai"
								width   = { 137 }
								height  = { 50 }
							/>
						</a>

						<h1 className="hidden lg:flex text-xl lg:text-2xl xl:text-3xl font-bold text-white">
                            Secciones Académicas
                        </h1>
                    </div>

                    <div className="flex items-center mx-auto gap-2">
                        <Theme />

						<Login />

                        {/* Period Selector */}
                        { staff &&
                            <div className="flex items-center gap-2">
                                <div className="w-[200px] xl:w-[400px]">
                                    <MultiSelectCombobox
                                        options             = { periods.map((period) => ({ value: period.id, label: period.label || '' }))}
                                        placeholder         = "Seleccionar períodos"
                                        onSelectionChange   = {handlePeriodSelectionChange}
                                        defaultValues       = { tempSelectedPeriodIds }
                                        multiple            = { true }
                                        disabledValues      = { disabledPeriods }
                                        className           = "bg-black text-white border-zinc-700 hover:bg-zinc-900"
                                    />
                                </div>

                                {/* Search Button with Badge */}
                                <Button
                                    variant     = "outline"
                                    size        = "icon"
                                    className   = "bg-black text-white border-zinc-700 hover:bg-zinc-900 hover:text-white relative"
                                    onClick     = { handleApplySelection }
                                    disabled    = { tempSelectedPeriodIds.length === 0 }
                                    title       = "Buscar sesiones"
                                >
                                    <SendHorizontal className="h-[1.2rem] w-[1.2rem]" />

                                    { hasPendingChanges && tempSelectedPeriodIds.length > 0 && (
                                        <Badge 
                                            variant     = "destructive" 
                                            className   = "absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                        >
                                            { tempSelectedPeriodIds.length }
                                        </Badge>
                                    )}
                                </Button>
                            </div>
                        }
                    </div>
                </div>
            </header>

            {showAuthMessage && (
                <AlertMessage
                    title="Debes iniciar sesión para acceder a esta página."
                    onClose={() => setShowAuthMessage(false)}
                />
            )}
        </>
    );
}
