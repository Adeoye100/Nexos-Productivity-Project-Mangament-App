import { useState } from "react"
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

type NavLink = {
  href: string
  label: string
  mobileLabel: string
  icon: typeof Cloud
}

const allLinks: NavLink[] = [
  { href: "/",          label: "Weather",      mobileLabel: "Weather",  icon: Cloud },
  { href: "/life",      label: "Life",          mobileLabel: "Life",     icon: Compass },
  { href: "/tasks",     label: "Tasks",         mobileLabel: "Tasks",    icon: CheckSquare },
  { href: "/assistant", label: "AI Assistant",  mobileLabel: "AI",       icon: MessageSquare },
  { href: "/habits",    label: "Habits",        mobileLabel: "Habits",   icon: LayoutGrid },
  { href: "/skills",    label: "Skills",        mobileLabel: "Skills",   icon: Sprout },
  { href: "/commands",  label: "Commands",      mobileLabel: "Prompts",  icon: Terminal },
  { href: "/settings",  label: "Settings",      mobileLabel: "Settings", icon: Settings },
]

/** Primary mobile bottom-nav slots (order matches product spec) */
const mobilePrimaryHrefs = ["/tasks", "/life", "/assistant"] as const

const mobilePrimaryLinks = mobilePrimaryHrefs
  .map((href) => allLinks.find((l) => l.href === href)!)
  .filter(Boolean)

const mobileMoreLinks = allLinks.filter(
  (l) => !(mobilePrimaryHrefs as readonly string[]).includes(l.href),
)

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

        {/* Single ThemeSelector instance + notifications */}
        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
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
              <ThemeSelector />
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      {/* Mobile: 4-slot bottom nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
        <div className="flex items-center justify-around px-1 py-2 rounded-full glass-strong border border-border/30 shadow-md">
          {mobilePrimaryLinks.map((link) => {
            const Icon = link.icon
            const isActive = location === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all duration-200 min-w-[56px] active:scale-95 touch-manipulation",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground active:bg-foreground/10",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium leading-none">
                  {link.mobileLabel}
                </span>
              </Link>
            )
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all duration-200 min-w-[56px] active:scale-95 touch-manipulation",
              isMoreRouteActive
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground active:bg-foreground/10",
            )}
            aria-label="More destinations"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[9px] font-medium leading-none">More</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-border/40 bg-background/95 backdrop-blur-md pb-8 max-h-[70vh]"
        >
          <SheetHeader className="text-left pb-2">
            <SheetTitle className="font-medium">More</SheetTitle>
            <SheetDescription>
              Everything else in Nexos
            </SheetDescription>
          </SheetHeader>
          <ul className="px-2 space-y-1 overflow-y-auto">
            {mobileMoreLinks.map((link) => {
              const Icon = link.icon
              const isActive = location === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-colors touch-manipulation",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-foreground/5 active:bg-foreground/10",
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </SheetContent>
      </Sheet>

      <NotificationLog open={logOpen} onClose={() => setLogOpen(false)} />
    </>
  )
}
