import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type Priority = "High" | "Medium" | "Low";
export type TaskStatus = "not_started" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  completed: boolean;
  status: TaskStatus;
  createdAt: Date;
  dueDate?: Date;
  reminderAt?: Date;
  notified?: boolean;
  overdueNotified?: boolean;
  reminderNotified?: boolean;
}

interface TasksContextValue {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'notified' | 'overdueNotified' | 'reminderNotified' | 'status'> & { status?: TaskStatus }) => Task;
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
        setTasks(parsed.map((t: any) => {
          const status = t.status || (t.completed ? 'completed' : 'not_started');
          return {
            ...t,
            status,
            completed: status === 'completed',
            createdAt: new Date(t.createdAt),
            dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
            reminderAt: t.reminderAt ? new Date(t.reminderAt) : undefined,
            priority: (t.priority as Priority) || 'Medium',
          };
        }));
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

  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt' | 'notified' | 'overdueNotified' | 'reminderNotified' | 'status'> & { status?: TaskStatus }): Task => {
    const status = data.status || (data.completed ? 'completed' : 'not_started');
    const task: Task = {
      ...data,
      status,
      completed: status === 'completed',
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
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newCompleted = !t.completed;
        return {
          ...t,
          completed: newCompleted,
          status: newCompleted ? 'completed' : 'not_started'
        };
      }
      return t;
    }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus = updates.status !== undefined ? updates.status : t.status;
        const newCompleted = updates.completed !== undefined ? updates.completed : (updates.status !== undefined ? updates.status === 'completed' : t.completed);

        // If status changed to completed, but completed wasn't explicitly set, sync them
        // If completed changed, but status wasn't explicitly set, sync them
        let finalStatus = newStatus;
        let finalCompleted = newCompleted;

        if (updates.status !== undefined && updates.completed === undefined) {
          finalCompleted = updates.status === 'completed';
        } else if (updates.completed !== undefined && updates.status === undefined) {
          finalStatus = updates.completed ? 'completed' : (t.status === 'completed' ? 'not_started' : t.status);
        }

        return { ...t, ...updates, status: finalStatus, completed: finalCompleted };
      }
      return t;
    }));
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
