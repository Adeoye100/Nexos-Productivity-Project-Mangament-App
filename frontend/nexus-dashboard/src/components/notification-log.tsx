import { useNotifications } from '@/context/notifications-context';
import { Button } from '@/components/ui/button';
import { X, Bell, CheckCheck, Trash2, BellRing, Check, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/context/notifications-context';

const typeConfig: Record<NotificationType, { icon: typeof Bell; label: string; color: string }> = {
  task_due:       { icon: Clock,         label: 'Due',      color: 'text-yellow-400' },
  task_overdue:   { icon: BellRing,      label: 'Overdue',  color: 'text-red-400'    },
  task_completed: { icon: Check,         label: 'Done',     color: 'text-green-400'  },
  ai_reply:       { icon: MessageSquare, label: 'AI',       color: 'text-primary'    },
  reminder:       { icon: Bell,          label: 'Reminder', color: 'text-accent'     },
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationLog({ open, onClose }: Props) {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-sm glass-strong border-l border-primary/20 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full neon-glow">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={markAllRead}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <Bell className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No notifications yet</p>
              <p className="text-muted-foreground/60 text-xs">
                Task reminders, AI replies, and completion alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map(n => {
                const cfg = typeConfig[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex gap-3 px-5 py-4 transition-colors',
                      !n.read && 'bg-primary/5'
                    )}
                  >
                    <div className={cn('mt-0.5 flex-shrink-0', cfg.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
