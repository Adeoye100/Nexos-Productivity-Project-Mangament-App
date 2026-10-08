import { createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { useYMap } from '@/lib/sync/useYMap';

export interface Note {
  id: string;
  title: string;
  body: string;
  topic?: string;
  type: "text" | "prompt" | "contact";
  createdAt: string;
}

interface NotesContextValue {
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: ReactNode }) {
  const { state: notesMap, set: setNoteInMap, remove: removeNoteFromMap } = useYMap<Note>("notes");

  const notes = useMemo(() => {
    return Object.values(notesMap).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notesMap]);

  const addNote = useCallback((data: Omit<Note, 'id' | 'createdAt'>): Note => {
    const note: Note = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setNoteInMap(note.id, note);
    return note;
  }, [setNoteInMap]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const existing = notesMap[id];
    if (existing) {
      setNoteInMap(id, { ...existing, ...updates });
    }
  }, [notesMap, setNoteInMap]);

  const deleteNote = useCallback((id: string) => {
    removeNoteFromMap(id);
  }, [removeNoteFromMap]);

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return ctx;
}
