import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface GiveawayContent {
  id?: number;
  header_title?: string;
  header_subtitle?: string;
  about_section_title?: string;
  about_section_content?: string;
  how_it_works_title?: string;
  how_it_works_steps?: any[]; // Adjust type based on your JSON structure
  payment_info_title?: string;
  payment_info_content?: string;
  faq_title?: string;
  faqs?: any[]; // Adjust type based on your JSON structure
  cta_title?: string;
  cta_button_text?: string;
  cta_button_link?: string;
}

interface GiveawayContentContextType {
  content: GiveawayContent;
  setContent: React.Dispatch<React.SetStateAction<GiveawayContent>>;
  isLoading: boolean;
  error: string | null;
  saveContent: () => Promise<void>;
}

const GiveawayContentContext = createContext<GiveawayContentContextType | undefined>(undefined);

export const GiveawayContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<GiveawayContent>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/giveaways/content');
        if (!response.ok) {
          throw new Error('Failed to fetch giveaway content');
        }
        const data = await response.json();
        setContent(data || {});
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  const saveContent = async () => {
    setError(null);
    try {
      const response = await fetch('/api/admin/giveaways/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }
      // Optionally re-fetch or update state from response
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw to be caught by the calling component
    }
  };

  return (
    <GiveawayContentContext.Provider value={{ content, setContent, isLoading, error, saveContent }}>
      {children}
    </GiveawayContentContext.Provider>
  );
};

export const useGiveawayContent = () => {
  const context = useContext(GiveawayContentContext);
  if (context === undefined) {
    throw new Error('useGiveawayContent must be used within a GiveawayContentProvider');
  }
  return context;
};
