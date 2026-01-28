'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

interface PeriodContextType {
    selectedPeriodId    : string;
    setSelectedPeriodId : (periodId: string) => void;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
    const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');

    return (
        <PeriodContext.Provider value={{ selectedPeriodId, setSelectedPeriodId }}>
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
