import { useTheme } from "next-themes";
import { Sun, Moon, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const themes = [
  { id: "light", icon: Sun, label: "Light" },
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "warm", icon: Flame, label: "Warm" },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-1">
        <div className="relative flex items-center bg-foreground/5 backdrop-blur-md border border-border/40 rounded-full p-1 shadow-inner w-full max-w-[240px] h-10 animate-pulse" />
      </div>
    );
  }

  const activeIndex = themes.findIndex((t) => t.id === theme);
  // Default to 0 if theme is 'system' or something else not in our list
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className="flex items-center justify-center p-1">
      <div className="relative flex items-center bg-foreground/5 backdrop-blur-md border border-border/40 rounded-full p-1 shadow-inner w-full max-w-[240px]">
        {/* Sliding Indicator */}
        <div
          className="absolute h-8 rounded-full bg-primary shadow-sm transition-all duration-300 ease-in-out"
          style={{
            width: `calc((100% - 8px) / 3)`,
            transform: `translateX(calc(${safeIndex} * (100% + 4px)))`,
          }}
        />

        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center gap-2 py-1.5 px-3 rounded-full transition-colors duration-200",
                isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={`${t.label} Theme`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
