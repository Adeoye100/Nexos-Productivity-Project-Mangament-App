import { createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { useYMap } from '@/lib/sync/useYMap';

export interface Prompt {
  id: string;
  title: string;
  body: string;
  category?: string;
  createdAt: string;
}

interface PromptsContextValue {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => Prompt;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
}

const PromptsContext = createContext<PromptsContextValue | null>(null);

export function PromptsProvider({ children }: { children: ReactNode }) {
  const { state: promptsMap, set: setPromptInMap, remove: removePromptFromMap } = useYMap<Prompt>("prompts");

  const prompts = useMemo(() => {
    return Object.values(promptsMap).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [promptsMap]);

  const addPrompt = useCallback((data: Omit<Prompt, 'id' | 'createdAt'>): Prompt => {
    const prompt: Prompt = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setPromptInMap(prompt.id, prompt);
    return prompt;
  }, [setPromptInMap]);

  const updatePrompt = useCallback((id: string, updates: Partial<Prompt>) => {
    const existing = promptsMap[id];
    if (existing) {
      setPromptInMap(id, { ...existing, ...updates });
    }
  }, [promptsMap, setPromptInMap]);

  const deletePrompt = useCallback((id: string) => {
    removePromptFromMap(id);
  }, [removePromptFromMap]);

  return (
    <PromptsContext.Provider value={{ prompts, addPrompt, updatePrompt, deletePrompt }}>
      {children}
    </PromptsContext.Provider>
  );
}

export function usePrompts() {
  const ctx = useContext(PromptsContext);
  if (!ctx) {
    throw new Error('usePrompts must be used within PromptsProvider');
  }
  return ctx;
}
