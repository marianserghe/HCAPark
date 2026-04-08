import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, Household } from './supabase';

type HouseholdsContextType = {
  households: Household[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  togglePaid: (household: Household) => Promise<void>;
  stats: {
    total: number;
    paidCount: number;
    unpaidCount: number;
    percentagePaid: string;
    totalCollected: number;
    expectedTotal: number;
  };
};

const HouseholdsContext = createContext<HouseholdsContextType | null>(null);

export function HouseholdsProvider({ children }: { children: React.ReactNode }) {
  const [households, setHouseholds] = useState<Household[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('households')
        .select('*')
        .order('street')
        .order('house_number');
      
      if (error) throw error;
      setHouseholds(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePaid = useCallback(async (household: Household) => {
    const newStatus = household.status === 'paid' ? 'unpaid' : 'paid';
    const newAmount = newStatus === 'paid' ? 50.00 : 0;
    
    try {
      const { error } = await supabase
        .from('households')
        .update({ 
          status: newStatus, 
          amount_paid: newAmount,
          paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        })
        .eq('id', household.id);
      
      if (error) throw error;
      
      // Update local state immediately
      setHouseholds(prev => 
        prev.map(h => 
          h.id === household.id 
            ? { ...h, status: newStatus, amount_paid: newAmount }
            : h
        )
      );
    } catch (err: any) {
      throw err;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = {
    total: households.length,
    paidCount: households.filter(h => h.status === 'paid').length,
    unpaidCount: households.filter(h => h.status === 'unpaid').length,
    percentagePaid: households.length > 0 
      ? ((households.filter(h => h.status === 'paid').length / households.length) * 100).toFixed(2)
      : '0.00',
    totalCollected: households.reduce((sum, h) => sum + (h.amount_paid || 0), 0),
    expectedTotal: households.length * 50,
  };

  return (
    <HouseholdsContext.Provider value={{ households, loading, error, refresh, togglePaid, stats }}>
      {children}
    </HouseholdsContext.Provider>
  );
}

export function useHouseholds() {
  const context = useContext(HouseholdsContext);
  if (!context) {
    throw new Error('useHouseholds must be used within a HouseholdsProvider');
  }
  return context;
}