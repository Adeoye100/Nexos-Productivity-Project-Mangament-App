import { useState } from "react"
import { Cloud, CheckSquare, MessageSquare, Settings, Bell, SunMoon } from "lucide-react"
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
      {/* Desktop: top bar with centered pill */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 h-16 items-center justify-between px-6 z-50 glass-strong border-b border-border/30 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2.5 min-w-[120px]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          <span className="text-lg font-bold tracking-wide text-foreground">NEXUS</span>
        </div>

        {/* Pill containing nav links */}
        <div className="flex items-center gap-0.5 px-1.5 py-1.5 rounded-full bg-foreground/5 border border-border/40">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-full transition-all duration-200 min-w-[64px]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-none">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1 min-w-[120px] justify-end">
          <button
            onClick={handleBellClick}
            className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile: bottom pill nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
        <div className="flex items-center justify-around px-2 py-2 rounded-full glass-strong border border-border/30">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 min-w-[52px]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium leading-none">{link.label}</span>
              </Link>
            )
          })}

          <button
            onClick={handleBellClick}
            className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-all duration-200"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[9px] font-medium leading-none">Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0.5 min-w-[14px] h-[14px] flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div className="flex flex-col items-center gap-0.5 px-2 py-1.5">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <NotificationLog open={logOpen} onClose={() => setLogOpen(false)} />
    </>
  )
}
