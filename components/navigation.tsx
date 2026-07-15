"use client"

import { Cloud, CheckSquare, MessageSquare, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Weather", icon: Cloud },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/assistant", label: "AI Assistant", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
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
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                    isActive
                      ? "glass-card neon-glow text-primary"
                      : "text-muted-foreground hover:text-foreground hover:glass",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-semibold tracking-wide hidden md:inline">{link.label}</span>
                </Link>
              )
            })}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
