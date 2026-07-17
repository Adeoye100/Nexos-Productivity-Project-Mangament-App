import * as React from "react"
import {
  Cloud,
  CheckSquare,
  MessageSquare,
  Settings,
  LayoutGrid,
  Plus,
  Moon,
  Sun,
  Laptop,
} from "lucide-react"
import { useLocation } from "wouter"
import { useTheme } from "next-themes"
import { useTasks } from "@/context/tasks-context"
import { useHabits } from "@/context/habits-context"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [, setLocation] = useLocation()
  const { setTheme } = useTheme()
  const { addTask } = useTasks()
  const { addHabit } = useHabits()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => setLocation("/"))}>
            <Cloud className="mr-2 h-4 w-4" />
            <span>Weather</span>
            <CommandShortcut>GP</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/tasks"))}>
            <CheckSquare className="mr-2 h-4 w-4" />
            <span>Tasks</span>
            <CommandShortcut>GT</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/assistant"))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>AI Assistant</span>
            <CommandShortcut>GA</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/habits"))}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            <span>Habits</span>
            <CommandShortcut>GH</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setLocation("/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>GS</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                addTask({
                  title: "New Task",
                  category: "Personal",
                  priority: "Medium",
                })
                setLocation("/tasks")
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Task</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                addHabit({
                  name: "New Habit",
                  icon: "✨",
                  color: "blue",
                })
                setLocation("/habits")
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Add New Habit</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
