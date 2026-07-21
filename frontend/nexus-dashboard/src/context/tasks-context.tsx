import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { getGitHubConfig, fetchGitHubIssues, GITHUB_LABEL_MAPPING } from '@/lib/github';
import { useToast } from '@/hooks/use-toast';
import { useYMap } from '@/lib/sync/useYMap';

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
  githubIssueId?: number;
  githubUrl?: string;
  estimatedHours?: number;
}

interface TasksContextValue {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'notified' | 'overdueNotified' | 'reminderNotified' | 'status'> & { status?: TaskStatus }) => Task;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  refreshGitHubTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { state: tasksMap, set: setTaskInMap, remove: removeTaskFromMap } = useYMap<Task>("tasks");

  const tasks = useMemo(() => {
    return Object.values(tasksMap)
      .map(t => ({
        ...t,
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        reminderAt: t.reminderAt ? new Date(t.reminderAt) : undefined,
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [tasksMap]);

  useEffect(() => {
    const isMigrated = localStorage.getItem('tasks-migrated-to-yjs');
    if (isMigrated) return;

    // Use multiple potential keys for old storage
    const oldKeys = ['nexus-tasks', 'tasks', 'nexus_tasks', 'tasks-data', 'nexus-tasks-v1'];
    let raw = null;
    let usedKey = '';
    for (const key of oldKeys) {
      raw = localStorage.getItem(key);
      if (raw) {
        usedKey = key;
        break;
      }
    }

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((t: any) => {
            if (!t.id) return;
            const status = t.status || (t.completed ? 'completed' : 'not_started');
            const task: Task = {
              ...t,
              status,
              completed: status === 'completed',
              createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
              dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
              reminderAt: t.reminderAt ? new Date(t.reminderAt) : undefined,
              priority: (t.priority as Priority) || 'Medium',
            };
            setTaskInMap(task.id, task);
          });
          console.log(`Migrated tasks from ${usedKey} to Yjs`);
        }
        localStorage.setItem('tasks-migrated-to-yjs', 'true');
      } catch (e) {
        console.error('Failed to migrate tasks', e);
      }
    } else {
      localStorage.setItem('tasks-migrated-to-yjs', 'true');
    }
  }, [setTaskInMap]);

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
    setTaskInMap(task.id, task);
    return task;
  }, [setTaskInMap]);

  const deleteTask = useCallback((id: string) => {
    removeTaskFromMap(id);
  }, [removeTaskFromMap]);

  const toggleComplete = useCallback((id: string) => {
    const t = tasksMap[id];
    if (t) {
      const newCompleted = !t.completed;
      setTaskInMap(id, {
        ...t,
        completed: newCompleted,
        status: newCompleted ? 'completed' : 'not_started'
      });
    }
  }, [tasksMap, setTaskInMap]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const t = tasksMap[id];
    if (t) {
      // Ensure we don't accidentally pass Date objects directly if they need to be strings in Yjs
      // though Yjs can handle some objects, it's safer to keep them consistent.
      // Actually Yjs Map will store whatever we give it.
      
      const newStatus = updates.status !== undefined ? updates.status : t.status;
      const newCompleted = updates.completed !== undefined ? updates.completed : (updates.status !== undefined ? updates.status === 'completed' : t.completed);

      let finalStatus = newStatus;
      let finalCompleted = newCompleted;

      if (updates.status !== undefined && updates.completed === undefined) {
        finalCompleted = updates.status === 'completed';
      } else if (updates.completed !== undefined && updates.status === undefined) {
        finalStatus = updates.completed ? 'completed' : (t.status === 'completed' ? 'not_started' : t.status);
      }

      setTaskInMap(id, { ...t, ...updates, status: finalStatus, completed: finalCompleted });
    }
  }, [tasksMap, setTaskInMap]);

  const refreshGitHubTasks = useCallback(async () => {
    const config = getGitHubConfig();
    if (!config) return;

    try {
      const issues = await fetchGitHubIssues(config.token, config.repo);
      
      const existingGitHubIds = new Set(
        Object.values(tasksMap)
          .filter(t => t.githubIssueId)
          .map(t => t.githubIssueId)
      );

      issues.forEach(issue => {
        if (!existingGitHubIds.has(issue.id)) {
          let category = "Work";
          issue.labels.forEach(label => {
            if (GITHUB_LABEL_MAPPING[label.name.toLowerCase()]) {
              category = GITHUB_LABEL_MAPPING[label.name.toLowerCase()].category;
            }
          });

          const taskId = `github-${issue.id}`;
          const newTask: Task = {
            id: taskId,
            title: issue.title,
            category,
            priority: "Medium",
            completed: issue.state === "closed",
            status: issue.state === "closed" ? "completed" : "not_started",
            createdAt: new Date(issue.updated_at),
            githubIssueId: issue.id,
            githubUrl: issue.html_url,
            notified: false,
            overdueNotified: false,
            reminderNotified: false,
          };
          setTaskInMap(taskId, newTask);
        }
      });

      toast({
        title: "GitHub Sync Complete",
        description: `Synced tasks from ${config.repo}`,
      });
    } catch (error) {
      console.error("GitHub sync failed", error);
      toast({
        title: "GitHub Sync Failed",
        description: "Could not fetch issues from GitHub.",
        variant: "destructive",
      });
    }
  }, [tasksMap, setTaskInMap, toast]);

  return (
    <TasksContext.Provider value={{ tasks, addTask, deleteTask, toggleComplete, updateTask, refreshGitHubTasks }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    console.error('useTasks must be used within TasksProvider');
    throw new Error('useTasks must be used within TasksProvider');
  }
  return ctx;
}
