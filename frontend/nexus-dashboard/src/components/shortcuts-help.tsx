import { useEffect, useState } from "react"
import { HelpCircle, X } from "lucide-react"
import { useLocation } from "wouter"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [location] = useLocation()

  useEffect(() => {
    // Check if the user has dismissed the hint
    const hintDismissed = localStorage.getItem("shortcutsHintDismissed")
    if (!hintDismissed) {
      setShowHint(true)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger modal on '?'
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest('[cmdk-root]')
        ) {
          return
        }

        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const dismissHint = () => {
    setShowHint(false)
    localStorage.setItem("shortcutsHintDismissed", "true")
  }

  // Define page-specific shortcuts
  const pageShortcuts = []
  if (location === "/tasks") {
    pageShortcuts.push({
      group: "Task Manager",
      shortcuts: [
        { keys: ["j", "k"], description: "Move focus down/up" },
        { keys: ["Enter"], description: "Edit focused task" },
        { keys: ["Space", "x"], description: "Toggle complete on focused task" },
        { keys: ["/"], description: "Focus add new task input" },
        { keys: ["Esc"], description: "Clear focus / Cancel edit" },
      ]
    })
  } else if (location === "/habits") {
    pageShortcuts.push({
      group: "Habit Tracker",
      shortcuts: [
        { keys: ["j", "k"], description: "Move focus down/up" },
        { keys: ["Enter"], description: "Select habit for heatmap view" },
        { keys: ["Space", "x"], description: "Check off habit for today" },
        { keys: ["/"], description: "Focus add new habit form" },
        { keys: ["Esc"], description: "Clear focus / Clear selected habit" },
      ]
    })
  }

  return (
    <>
      {/* Discovery Hint */}
      {showHint && (
        <div className="fixed top-4 right-4 z-50 bg-background border border-border shadow-lg rounded-full px-4 py-2 flex items-center gap-3 animate-fade-in text-sm text-muted-foreground hidden md:flex">
          <span>Press <Kbd>Cmd</Kbd> + <Kbd>K</Kbd> for commands or <Kbd>?</Kbd> for help</span>
          <button
            onClick={dismissHint}
            className="text-muted-foreground hover:text-foreground p-1 rounded-full transition-colors"
            aria-label="Dismiss hint"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border/50 text-foreground glass-strong">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Global</h4>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div className="text-sm">Command Palette</div>
                <div className="flex gap-1">
                  <Kbd>Cmd</Kbd> <span className="text-xs text-muted-foreground px-1">or</span> <Kbd>Ctrl</Kbd> <span className="text-xs text-muted-foreground px-1">+</span> <Kbd>K</Kbd>
                </div>

                <div className="text-sm">Keyboard Shortcuts Help</div>
                <div className="flex justify-end"><Kbd>?</Kbd></div>
              </div>
            </div>

            {pageShortcuts.map((group, i) => (
              <div key={i} className="space-y-3 pt-3 border-t border-border/50">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{group.group}</h4>
                <div className="space-y-2">
                  {group.shortcuts.map((sc, j) => (
                    <div key={j} className="grid grid-cols-[1fr_auto] gap-2">
                      <div className="text-sm text-foreground/80">{sc.description}</div>
                      <div className="flex gap-1 justify-end">
                        {sc.keys.map((k, kIdx) => (
                          <span key={kIdx} className="flex items-center gap-1">
                            {kIdx > 0 && <span className="text-xs text-muted-foreground">or</span>}
                            <Kbd>{k}</Kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
