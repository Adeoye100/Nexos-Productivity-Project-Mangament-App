import { useState } from "react"
import { Cloud, CheckSquare, MessageSquare, Settings, Bell } from "lucide-react"
import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useNotifications } from "@/context/notifications-context"
import { NotificationLog } from "@/components/notification-log"

export function Navigation() {
  const [location] = useLocation()
  const [logOpen, setLogOpen] = useState(false)
  const { unreadCount, markAllRead } = useNotifications()

  const links = [
    { href: "/", label: "Weather", icon: Cloud },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/assistant", label: "AI Assistant", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  const handleBellClick = () => {
    setLogOpen(true)
    markAllRead()
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-primary/20 animate-fade-in">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center neon-glow">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <span className="text-2xl font-bold neon-text tracking-wide">NEXUS</span>
            </div>

            <div className="flex items-center gap-2">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex gap-2 px-4 py-2 rounded-xl transition-all duration-300 glass-card neon-glow text-primary rounded-tl-[2px] rounded-tr-[2px] rounded-br-[2px] rounded-bl-[2px] justify-start items-center"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-semibold tracking-wide hidden md:inline">{link.label}</span>
                  </Link>
                );
              })}

              {/* Notification bell */}
              <button
                onClick={handleBellClick}
                className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:glass transition-all duration-300"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1 neon-glow">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="ml-1">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <NotificationLog open={logOpen} onClose={() => setLogOpen(false)} />
    </>
  );
}
