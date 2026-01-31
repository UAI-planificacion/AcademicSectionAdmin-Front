'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

interface PeriodContextType {
    selectedPeriodIds   : string[];
    setSelectedPeriodIds: (periodIds: string[]) => void;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
    const [selectedPeriodIds, setSelectedPeriodIds] = useState<string[]>([]);

    return (
        <PeriodContext.Provider value={{ selectedPeriodIds, setSelectedPeriodIds }}>
            {children}
        </PeriodContext.Provider>
    );
}

export function usePeriodContext() {
    const context = useContext(PeriodContext);

    if (context === undefined) {
        throw new Error('usePeriodContext must be used within a PeriodProvider');
    }

    return context;
}
