import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface NavigationMenu {
  id: string;
  menu_name: string;
  menu_location: string;
  menu_items: Record<string, any>[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NavigationMenusContextType {
  navigationMenus: NavigationMenu[];
  loading: boolean;
  error: string | null;
  fetchNavigationMenus: () => Promise<void>;
  createNavigationMenu: (menu: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNavigationMenu: (id: string, updates: Partial<NavigationMenu>) => Promise<void>;
  deleteNavigationMenu: (id: string) => Promise<void>;
  toggleNavigationMenuStatus: (id: string) => Promise<void>;
  getActiveNavigationMenus: () => NavigationMenu[];
  getNavigationMenuByLocation: (location: string) => NavigationMenu | undefined;
  updateMenuItems: (id: string, menuItems: Record<string, any>[]) => Promise<void>;
}

const NavigationMenusContext = createContext<NavigationMenusContextType | undefined>(undefined);

export const useNavigationMenus = () => {
  const context = useContext(NavigationMenusContext);
  if (!context) {
    throw new Error('useNavigationMenus must be used within a NavigationMenusProvider');
  }
  return context;
};

interface NavigationMenusProviderProps {
  children: ReactNode;
}

export const NavigationMenusProvider: React.FC<NavigationMenusProviderProps> = ({ children }) => {
  const [navigationMenus, setNavigationMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNavigationMenus = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('navigation_menus')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNavigationMenus(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch navigation menus');
    } finally {
      setLoading(false);
    }
  };

  const createNavigationMenu = async (menu: Omit<NavigationMenu, 'id' | 'created_at' | 'updated_at'>) => {
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('navigation_menus')
        .insert([menu])
        .select()
        .single();

      if (insertError) throw insertError;
      setNavigationMenus(prev => [data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create navigation menu');
      throw err;
    }
  };

  const updateNavigationMenu = async (id: string, updates: Partial<NavigationMenu>) => {
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('navigation_menus')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setNavigationMenus(prev => prev.map(menu => menu.id === id ? data : menu));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update navigation menu');
      throw err;
    }
  };

  const deleteNavigationMenu = async (id: string) => {
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('navigation_menus')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setNavigationMenus(prev => prev.filter(menu => menu.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete navigation menu');
      throw err;
    }
  };

  const toggleNavigationMenuStatus = async (id: string) => {
    const menu = navigationMenus.find(m => m.id === id);
    if (!menu) return;

    await updateNavigationMenu(id, { is_active: !menu.is_active });
  };

  const getActiveNavigationMenus = () => {
    return navigationMenus.filter(menu => menu.is_active);
  };

  const getNavigationMenuByLocation = (location: string) => {
    return navigationMenus.find(menu =>
      menu.menu_location === location && menu.is_active
    );
  };

  const updateMenuItems = async (id: string, menuItems: Record<string, any>[]) => {
    await updateNavigationMenu(id, { menu_items: menuItems });
  };

  useEffect(() => {
    fetchNavigationMenus();
  }, []);

  const value: NavigationMenusContextType = {
    navigationMenus,
    loading,
    error,
    fetchNavigationMenus,
    createNavigationMenu,
    updateNavigationMenu,
    deleteNavigationMenu,
    toggleNavigationMenuStatus,
    getActiveNavigationMenus,
    getNavigationMenuByLocation,
    updateMenuItems,
  };

  return (
    <NavigationMenusContext.Provider value={value}>
      {children}
    </NavigationMenusContext.Provider>
  );
};
