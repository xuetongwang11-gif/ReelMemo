import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { MediaItem } from './types';
import { Language } from './i18n';

interface AppState {
  items: MediaItem[];
  language: Language;
  theme: 'light' | 'dark';
  addItem: (item: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<MediaItem>) => void;
  deleteItem: (id: string) => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const STORAGE_KEY = 'reelmemo_data';
const SETTINGS_KEY = 'reelmemo_settings';

export function AppProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored items', e);
      }
    }
    return [];
  });

  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.language) return parsed.language;
      } catch (e) {}
    }
    return navigator.language.startsWith('zh') ? 'zh' : 'en';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.theme) return parsed.theme;
      } catch (e) {}
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ language, theme }));
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [language, theme]);

  const addItem = (itemData: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: MediaItem = {
      ...itemData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const updateItem = (id: string, updates: Partial<MediaItem>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <AppContext.Provider value={{ items, language, theme, addItem, updateItem, deleteItem, setLanguage, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
