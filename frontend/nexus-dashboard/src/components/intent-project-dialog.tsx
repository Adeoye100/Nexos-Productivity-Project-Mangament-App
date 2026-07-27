import { useState } from "react"
import { useLocation } from "wouter"
import { Loader2, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTasks } from "@/context/tasks-context"
import { useToast } from "@/hooks/use-toast"
import {
  IntentPreview,
  type IntentPreviewTask,
} from "@/components/intent-preview"
import type { Priority } from "@/context/tasks-context"

interface IntentProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Phase = "input" | "loading" | "preview"

const VALID_PRIORITIES = new Set(["Low", "Medium", "High"])

function toPreviewTasks(
  tasks: { title: string; priority: string }[],
): IntentPreviewTask[] | null {
  if (!Array.isArray(tasks) || tasks.length === 0) return null

  const mapped: IntentPreviewTask[] = []
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i]
    if (!t || typeof t.title !== "string" || !t.title.trim()) return null
    if (!VALID_PRIORITIES.has(t.priority)) return null
    mapped.push({
      id: `gen-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      title: t.title.trim(),
      priority: t.priority as Priority,
    })
  }
  return mapped
}

export function IntentProjectDialog({
  open,
  onOpenChange,
}: IntentProjectDialogProps) {
  const { addTask } = useTasks()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const [phase, setPhase] = useState<Phase>("input")
  const [intent, setIntent] = useState("")
  const [projectName, setProjectName] = useState("")
  const [previewTasks, setPreviewTasks] = useState<IntentPreviewTask[]>([])

  const reset = () => {
    setPhase("input")
    setIntent("")
    setProjectName("")
    setPreviewTasks([])
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleGenerate = async () => {
    const trimmed = intent.trim()
    if (!trimmed) return

    setPhase("loading")

    try {
      const response = await fetch("/api/tasks/generate-from-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: trimmed }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message =
          typeof data?.error === "string"
            ? data.error
            : "Failed to generate tasks from intent"
        toast({
          title: "Could not generate tasks",
          description: message,
          variant: "destructive",
        })
        setPhase("input")
        return
      }

      if (
        typeof data?.projectName !== "string" ||
        !data.projectName.trim()
      ) {
        toast({
          title: "Could not generate tasks",
          description: "AI returned invalid format",
          variant: "destructive",
        })
        setPhase("input")
        return
      }

      const mapped = toPreviewTasks(data.tasks)
      if (!mapped) {
        toast({
          title: "Could not generate tasks",
          description: "AI returned invalid format",
          variant: "destructive",
        })
        setPhase("input")
        return
      }

      setProjectName(data.projectName.trim())
      setPreviewTasks(mapped)
      setPhase("preview")
    } catch {
      toast({
        title: "Could not generate tasks",
        description: "AI backend unreachable. Please try again.",
        variant: "destructive",
      })
      setPhase("input")
    }
  }

  const handleConfirm = () => {
    const category = projectName.trim()
    if (!category) return

    for (const task of previewTasks) {
      const title = task.title.trim()
      if (!title) continue
      addTask({
        title,
        category,
        priority: task.priority,
        completed: false,
      })
    }

    toast({
      title: "Project added",
      description: `${previewTasks.length} task${previewTasks.length === 1 ? "" : "s"} added under “${category}”.`,
    })

    handleOpenChange(false)
    setLocation("/tasks")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background border-border/50 text-foreground shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-medium">
            <Sparkles className="w-5 h-5 text-accent" />
            New Project from Intent
          </DialogTitle>
          <DialogDescription>
            {phase === "preview"
              ? "Review and edit the proposed tasks, then approve to add them to your board."
              : "Describe what you want to build or do. Nothing is added until you approve."}
          </DialogDescription>
        </DialogHeader>

        {phase === "input" && (
          <div className="space-y-4 pt-2">
            <Input
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void handleGenerate()
                }
              }}
              placeholder="Describe what you want to build or do"
              className="bg-background/30 border-border/50 backdrop-blur-sm"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={!intent.trim()}
              >
                Generate tasks
              </Button>
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm">Breaking your intent into tasks…</p>
          </div>
        )}

        {phase === "preview" && (
          <IntentPreview
            projectName={projectName}
            onProjectNameChange={setProjectName}
            tasks={previewTasks}
            onChangeTasks={setPreviewTasks}
            onConfirm={handleConfirm}
            onCancel={() => handleOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
