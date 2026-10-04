import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppMode = 'user' | 'developer';

interface AppModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

const STORAGE_KEY = 'nexus-app-mode';

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'developer' || stored === 'user') ? stored : 'user';
  });

  const setMode = (newMode: AppMode) => {
    localStorage.setItem(STORAGE_KEY, newMode);
    setModeState(newMode);
  };

  const toggleMode = () => {
    setMode(mode === 'user' ? 'developer' : 'user');
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
