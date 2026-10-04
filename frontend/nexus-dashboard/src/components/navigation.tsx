import { useState, useMemo } from "react"
import {
  Cloud,
  CheckSquare,
  MessageSquare,
  Settings,
  Bell,
  LayoutGrid,
  Terminal,
  Palette,
  Sprout,
  Compass,
  Menu,
} from "lucide-react"
import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import { ThemeSelector } from "@/components/theme-selector"
import { useNotifications } from "@/context/notifications-context"
import { NotificationLog } from "@/components/notification-log"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useAppMode } from "@/context/app-mode-context"
import { ModeToggle } from "@/components/mode-toggle"

type NavLink = {
  href: string
  label: string
  mobileLabel: string
  icon: typeof Cloud
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-sm">
        <span className="text-primary-foreground font-bold text-sm">N</span>
      </div>
      <span className="text-lg font-bold tracking-wide text-foreground truncate">
        NEXUS
      </span>
    </div>
  )
}

export function Navigation() {
  const [location] = useLocation()
  const [logOpen, setLogOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const { unreadCount, markAllRead } = useNotifications()
  const { mode } = useAppMode()

  const allLinks: NavLink[] = useMemo(() => {
    if (mode === 'developer') {
      return [
        { href: "/dev/kanban",   label: "Kanban",      mobileLabel: "Kanban",   icon: CheckSquare },
        { href: "/dev/standup",  label: "Generator",   mobileLabel: "Generator", icon: Terminal },
        { href: "/dev/deadlines",label: "Deadlines",   mobileLabel: "Deadlines", icon: Compass },
        { href: "/sync-test",    label: "Sync",        mobileLabel: "Sync",     icon: Cloud },
        { href: "/assistant",    label: "AI Assistant",mobileLabel: "AI",       icon: MessageSquare },
        { href: "/settings",     label: "Settings",    mobileLabel: "Settings", icon: Settings },
      ]
    }
    // Default User Mode
    return [
      { href: "/",          label: "Life",          mobileLabel: "Life",     icon: Compass },
      { href: "/tasks",     label: "Tasks",         mobileLabel: "Tasks",    icon: CheckSquare },
      { href: "/assistant", label: "AI Assistant",  mobileLabel: "AI",       icon: MessageSquare },
      { href: "/habits",    label: "Habits",        mobileLabel: "Habits",   icon: LayoutGrid },
      { href: "/skills",    label: "Skills",        mobileLabel: "Skills",   icon: Sprout },
      { href: "/commands",  label: "Notes",         mobileLabel: "Notes",    icon: Terminal }, // To be replaced by Notes
      { href: "/settings",  label: "Settings",      mobileLabel: "Settings", icon: Settings },
    ]
  }, [mode]);

  const mobilePrimaryHrefs = mode === 'developer' 
    ? ["/dev/kanban", "/dev/standup", "/assistant"] 
    : ["/tasks", "/", "/assistant"];

  const mobilePrimaryLinks = mobilePrimaryHrefs
    .map((href) => allLinks.find((l) => l.href === href)!)
    .filter(Boolean)

  const mobileMoreLinks = allLinks.filter(
    (l) => !mobilePrimaryHrefs.includes(l.href),
  )

  const handleBellClick = () => {
    setLogOpen(true)
    markAllRead()
  }

  const isMoreRouteActive = mobileMoreLinks.some((l) => l.href === location)

  return (
    <>
      {/* Top bar — always present; fills empty mobile header space */}
      <nav className="fixed top-0 left-0 right-0 h-14 md:h-16 flex items-center justify-between px-4 md:px-6 z-50 glass-strong border-b border-border/30 animate-fade-in">
        <BrandMark />

        {/* Desktop/tablet: full tab pill */}
        <div className="hidden md:flex items-center gap-0.5 px-1.5 py-1.5 rounded-full bg-foreground/5 border border-border/40">
          {allLinks.map((link) => {
            const Icon = link.icon
            const isActive = location === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 min-w-[56px]",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-medium leading-none">
                  {link.label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Single ThemeSelector instance + notifications + ModeToggle */}
        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
          <div className="hidden md:block mr-2">
            <ModeToggle />
          </div>
          <button
            onClick={handleBellClick}
            className="relative p-2.5 md:p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 touch-manipulation"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center bg-primary text-primary-foreground text-[9px] font-bold rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="p-2.5 md:p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 touch-manipulation"
                aria-label="Theme settings"
              >
                <Palette className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="bottom"
              align="end"
              className="w-64 p-2 glass-strong border-border/40"
            >
              <div className="mb-2 px-2 py-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                  Theme
                </span>
              </div>
              <ThemeSelector />
              <div className="md:hidden mt-2 pt-2 border-t border-border/40">
                <div className="mb-2 px-2 py-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">
                    Mode
                  </span>
                </div>
                <div className="px-2">
                  <ModeToggle />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      {/* Notifications Drawer */}
      <NotificationLog open={logOpen} onClose={() => setLogOpen(false)} />

      {/* Mobile-only bottom nav capsule */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="glass-strong border border-border/30 rounded-[2rem] p-1.5 flex items-center justify-between shadow-lg shadow-black/5 animate-slide-up">
          {mobilePrimaryLinks.map((link) => {
            const Icon = link.icon
            const isActive = location === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full py-2 rounded-3xl transition-all duration-300",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm scale-100"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 scale-95",
                )}
                onClick={() => setMoreOpen(false)}
              >
                <Icon className={cn("w-5 h-5 mb-1", isActive && "animate-spring")} />
                <span className="text-[10px] font-medium tracking-wide">
                  {link.mobileLabel}
                </span>
              </Link>
            )
          })}
          
          <button
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center w-full py-2 rounded-3xl transition-all duration-300",
              moreOpen || isMoreRouteActive
                ? "bg-primary/10 text-primary scale-100"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 scale-95",
            )}
            aria-label="More options"
          >
            <Menu className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium tracking-wide">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Drawer */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="h-[60vh] sm:h-[50vh] rounded-t-[2rem] px-2">
          <SheetHeader className="px-4 pb-4">
            <SheetTitle className="text-left font-serif text-2xl">Menu</SheetTitle>
            <SheetDescription className="text-left sr-only">
              Additional navigation options
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-4 gap-2 px-2">
            {mobileMoreLinks.map((link) => {
              const Icon = link.icon
              const isActive = location === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground",
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-[11px] font-medium">{link.label}</span>
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
