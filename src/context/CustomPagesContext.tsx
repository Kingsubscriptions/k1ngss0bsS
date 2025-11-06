import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import { CustomPagesService, CustomPage } from "@/lib/supabase";

export type { CustomPage };

interface CustomPagesContextValue {
  pages: CustomPage[];
  publishedPages: CustomPage[];
  addPage: (page: Omit<CustomPage, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updatePage: (page: CustomPage) => Promise<boolean>;
  deletePage: (pageId: string) => Promise<boolean>;
  getPageBySlug: (slug: string) => CustomPage | undefined;
}

const CustomPagesContext = createContext<CustomPagesContextValue | undefined>(undefined);

export const CustomPagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load pages from Supabase on mount
  useEffect(() => {
    loadPages();
  }, []);

  // Subscribe to real-time changes from Supabase
  useEffect(() => {
    const unsubscribe = CustomPagesService.subscribeToChanges((supabasePages) => {
      console.log('🔄 Custom pages synced from Supabase (cross-browser sync)');
      setPages(supabasePages);
    });

    return unsubscribe;
  }, []);

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabasePages = await CustomPagesService.getPages();
      setPages(supabasePages);
      console.log('✅ Custom pages loaded from Supabase');
    } catch (error) {
      console.error('Failed to load custom pages from Supabase:', error);
      setPages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPage = useCallback(async (pageData: Omit<CustomPage, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      const success = await CustomPagesService.addPage(pageData);
      if (success) {
        console.log('✅ Custom page added to Supabase');
        // Reload pages to get the new page with ID
        await loadPages();
      } else {
        throw new Error('Failed to add page to database');
      }
      return success;
    } catch (error) {
      console.error('Failed to add custom page:', error);
      return false;
    }
  }, [loadPages]);

  const updatePage = useCallback(async (page: CustomPage): Promise<boolean> => {
    try {
      const success = await CustomPagesService.updatePage(page);
      if (success) {
        setPages((prev) => prev.map((p) => (p.id === page.id ? page : p)));
        console.log('✅ Custom page updated in Supabase');
      } else {
        throw new Error('Failed to update page in database');
      }
      return success;
    } catch (error) {
      console.error('Failed to update custom page:', error);
      return false;
    }
  }, []);

  const deletePage = useCallback(async (pageId: string): Promise<boolean> => {
    try {
      const success = await CustomPagesService.deletePage(pageId);
      if (success) {
        setPages((prev) => prev.filter((p) => p.id !== pageId));
        console.log('✅ Custom page deleted from Supabase');
      } else {
        throw new Error('Failed to delete page from database');
      }
      return success;
    } catch (error) {
      console.error('Failed to delete custom page:', error);
      return false;
    }
  }, []);

  const getPageBySlug = useCallback((slug: string): CustomPage | undefined => {
    return pages.find((page) => page.slug === slug);
  }, [pages]);

  const publishedPages = useMemo(() => pages.filter((page) => page.published), [pages]);

  const value = useMemo<CustomPagesContextValue>(
    () => ({
      pages,
      publishedPages,
      addPage,
      updatePage,
      deletePage,
      getPageBySlug,
    }),
    [pages, publishedPages, addPage, updatePage, deletePage, getPageBySlug],
  );

  return <CustomPagesContext.Provider value={value}>{children}</CustomPagesContext.Provider>;
};

export const useCustomPages = (): CustomPagesContextValue => {
  const context = useContext(CustomPagesContext);
  if (!context) {
    throw new Error("useCustomPages must be used within a CustomPagesProvider");
  }
  return context;
};
