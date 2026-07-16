import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Priority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  reminderAt?: Date;
  notified?: boolean;
  overdueNotified?: boolean;
  reminderNotified?: boolean;
}

interface TasksContextValue {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'notified' | 'overdueNotified' | 'reminderNotified'>) => Task;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Support migration from old 'tasks' key
    const raw = localStorage.getItem('nexus-tasks') || localStorage.getItem('tasks');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setTasks(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          reminderAt: t.reminderAt ? new Date(t.reminderAt) : undefined,
          priority: (t.priority as Priority) || 'Medium',
        })));
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('nexus-tasks', JSON.stringify(tasks));
    }
  }, [tasks, loaded]);

  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'notified' | 'overdueNotified' | 'reminderNotified'>): Task => {
    const task: Task = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      notified: false,
      overdueNotified: false,
      reminderNotified: false,
    };
    setTasks(prev => [task, ...prev]);
    return task;
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, addTask, deleteTask, toggleComplete, updateTask }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
