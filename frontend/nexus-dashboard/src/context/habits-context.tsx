import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type TargetFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  category?: string;
  targetFrequency: TargetFrequency;
  createdAt: string; // YYYY-MM-DD
  color?: string; // Hex or CSS color
  reminderAt?: string; // HH:mm
  notifiedToday?: string; // YYYY-MM-DD
}

export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

interface HabitsContextValue {
  habits: Habit[];
  entries: HabitEntry[];
  addHabit: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  deleteHabit: (id: string) => void;
  toggleEntry: (habitId: string, date: string) => void;
  getEntryForDate: (habitId: string, date: string) => HabitEntry | undefined;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

// ── Sample data (seeded, deterministic) ──────────────────────────────────────
const SAMPLE_HABITS: Habit[] = [
  { id: 'sh1', name: 'Morning Run',   category: 'Fitness',  targetFrequency: 'daily', createdAt: '2024-09-01' },
  { id: 'sh2', name: 'Read 30 mins',  category: 'Learning', targetFrequency: 'daily', createdAt: '2024-09-01' },
  { id: 'sh3', name: 'Meditate',      category: 'Wellness', targetFrequency: 'daily', createdAt: '2024-10-01' },
];

// FNV-1a hash for deterministic "random" — consistent across reloads
function seededRand(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h % 10000) / 10000;
}

function generateSampleEntries(): HabitEntry[] {
  const entries: HabitEntry[] = [];
  const today = new Date();
  // Probability of completion per habit (higher = more consistent)
  const thresholds: Record<string, number> = { sh1: 0.78, sh2: 0.65, sh3: 0.52 };

  for (let d = 0; d < 210; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const ds = date.toISOString().split('T')[0];

    SAMPLE_HABITS.forEach(h => {
      const rand = seededRand(`${h.id}-${ds}`);
      if (rand < (thresholds[h.id] ?? 0.5)) {
        entries.push({ id: `${h.id}-${ds}`, habitId: h.id, date: ds, completed: true });
      }
    });
  }
  return entries;
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits]   = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loaded, setLoaded]   = useState(false);

  // Load from localStorage; seed sample data on first visit
  useEffect(() => {
    const rawHabits  = localStorage.getItem('nexus-habits');
    const rawEntries = localStorage.getItem('nexus-habit-entries');

    if (rawHabits) {
      try { setHabits(JSON.parse(rawHabits)); } catch { /* ignore */ }
    } else {
      setHabits(SAMPLE_HABITS);
    }

    if (rawEntries) {
      try { setEntries(JSON.parse(rawEntries)); } catch { /* ignore */ }
    } else {
      setEntries(generateSampleEntries());
    }

    setLoaded(true);
  }, []);

  // Persist
  useEffect(() => {
    if (loaded) localStorage.setItem('nexus-habits', JSON.stringify(habits));
  }, [habits, loaded]);

  useEffect(() => {
    if (loaded) localStorage.setItem('nexus-habit-entries', JSON.stringify(entries));
  }, [entries, loaded]);

  const addHabit = useCallback((data: Omit<Habit, 'id' | 'createdAt'>) => {
    const habit: Habit = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setHabits(prev => [...prev, habit]);
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setEntries(prev => prev.filter(e => e.habitId !== id));
  }, []);

  const toggleEntry = useCallback((habitId: string, date: string) => {
    setEntries(prev => {
      const exists = prev.some(e => e.habitId === habitId && e.date === date);
      if (exists) {
        return prev.filter(e => !(e.habitId === habitId && e.date === date));
      }
      return [...prev, { id: `${habitId}-${date}`, habitId, date, completed: true }];
    });
  }, []);

  const getEntryForDate = useCallback((habitId: string, date: string) => {
    return entries.find(e => e.habitId === habitId && e.date === date);
  }, [entries]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  return (
    <HabitsContext.Provider value={{ habits, entries, addHabit, deleteHabit, toggleEntry, getEntryForDate, updateHabit }}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) {
    console.error('useHabits must be used within HabitsProvider');
    throw new Error('useHabits must be used within HabitsProvider');
  }
  return ctx;
}
