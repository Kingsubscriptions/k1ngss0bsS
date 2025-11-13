import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to system preference
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  // Default to dark if no saved theme
  const initialTheme = savedTheme || 'dark';
  setTheme(initialTheme);
  applyTheme(initialTheme);
  }, []);

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled className="border-2">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleTheme}
      className="border-2 transition-all duration-300 hover:scale-105 hover:shadow-md bg-background/80 backdrop-blur-sm"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 transition-all duration-300 text-slate-600 hover:text-primary" />
      ) : (
        <Sun className="h-4 w-4 transition-all duration-300 text-amber-500 hover:text-primary rotate-0 hover:rotate-90" />
      )}
    </Button>
  );
};

export default ThemeToggle;