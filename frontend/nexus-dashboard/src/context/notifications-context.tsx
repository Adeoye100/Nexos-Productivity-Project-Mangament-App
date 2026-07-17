import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

export type NotificationType = 'task_due' | 'task_overdue' | 'task_completed' | 'ai_reply' | 'reminder';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

function fireBrowser(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const addNotification = useCallback((data: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const n: AppNotification = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date(),
      read: false,
    };
    setNotifications(prev => [n, ...prev].slice(0, 50));
    toast(data.title, { description: data.message });
    fireBrowser(data.title, data.message);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
