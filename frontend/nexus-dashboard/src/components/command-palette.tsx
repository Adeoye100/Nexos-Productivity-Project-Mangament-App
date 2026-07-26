import * as React from "react"
import {
  Cloud,
  CheckSquare,
  MessageSquare,
  Settings,
  LayoutGrid,
  Plus,
  Flame,
  Moon,
  Sun,
  Laptop,
} from "lucide-react"
import { useLocation } from "wouter"
import { useTheme } from "next-themes"
import { useTasks } from "@/context/tasks-context"
import { useHabits } from "@/context/habits-context"
import { usePrompts } from "@/context/prompts-context"
import { useCommands } from "@/context/commands-context"

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
  const { prompts } = usePrompts()
  const { aliases } = useCommands()
  const [inputValue, setInputValue] = React.useState("")

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

  React.useEffect(() => {
    if (!open) {
      setInputValue("")
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue) {
      for (const alias of aliases) {
        const match = inputValue.match(alias.pattern)
        if (match) {
          e.preventDefault()
          alias.handler(match.slice(1))
          setOpen(false)
          return
        }
      }
    }
  }

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={inputValue}
        onValueChange={setInputValue}
        onKeyDown={handleKeyDown}
      />
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
                  completed: false,
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
                  color: "blue",
                  targetFrequency: "daily",
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
        {prompts.length > 0 && (
          <>
            <CommandGroup heading="Insert Prompt">
              {prompts.map((prompt) => (
                <CommandItem
                  key={prompt.id}
                  onSelect={() =>
                    runCommand(() => {
                      // We need a way to communicate back to the assistant component or just navigate
                      // For now, let's navigate to assistant and we might need a global state for the input
                      // But the requirement says "Clicking a saved prompt inserts its body into the AI Assistant's input"
                      // Since we don't have a global input state, we can use a simple hack like localStorage or just navigate.
                      // Actually, many apps use a query param or state for this.
                      localStorage.setItem('pending-prompt', prompt.body);
                      setLocation("/assistant");
                    })
                  }
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>{prompt.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}
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
          <CommandItem onSelect={() => runCommand(() => setTheme("warm"))}>
            <Flame className="mr-2 h-4 w-4" />
            <span>Warm</span>
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
