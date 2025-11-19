import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiClient } from '@/lib/api';

interface GiveawayAccount {
  id: number;
  email: string;
  // NOTE: Password should not be stored or sent to the client.
  // The backend will handle it, but we need it for creation.
  password?: string;
  is_claimed: boolean;
  created_at: string;
}

interface GiveawayContextType {
  accounts: GiveawayAccount[];
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (email: string, password: string) => Promise<boolean>;
  deleteAccount: (id: number) => Promise<boolean>;
}

const GiveawayContext = createContext<GiveawayContextType | undefined>(undefined);

export const GiveawayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<GiveawayAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!token) {
      setError("Authentication required.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getGiveaways();
      setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = async (email: string, password: string): Promise<boolean> => {
    if (!token) {
      setError("Authentication required.");
      return false;
    }

    try {
      const newAccount = await apiClient.addGiveaway(email, password);
      setAccounts(prev => [newAccount, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      return false;
    }
  };

  const deleteAccount = async (id: number): Promise<boolean> => {
    if (!token) {
      setError("Authentication required.");
      return false;
    }

    try {
      await apiClient.deleteGiveaway(id);
      setAccounts(prev => prev.filter(account => account.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      return false;
    }
  };

  return (
    <GiveawayContext.Provider value={{ accounts, isLoading, error, fetchAccounts, addAccount, deleteAccount }}>
      {children}
    </GiveawayContext.Provider>
  );
};

export const useGiveaway = (): GiveawayContextType => {
  const context = useContext(GiveawayContext);
  if (context === undefined) {
    throw new Error('useGiveaway must be used within a GiveawayProvider');
  }
  return context;
};
