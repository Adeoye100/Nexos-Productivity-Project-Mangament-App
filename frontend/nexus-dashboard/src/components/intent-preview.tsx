import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Priority } from "@/context/tasks-context"

export interface IntentPreviewTask {
  id: string
  title: string
  priority: Priority
}

interface IntentPreviewProps {
  projectName: string
  onProjectNameChange: (value: string) => void
  tasks: IntentPreviewTask[]
  onChangeTasks: (tasks: IntentPreviewTask[]) => void
  onConfirm: () => void
  onCancel: () => void
}

const priorities: Priority[] = ["High", "Medium", "Low"]

const selectClassName =
  "px-3 py-2 rounded-xl bg-background/30 border border-border/50 text-foreground backdrop-blur-sm min-h-[40px] text-sm"

export function IntentPreview({
  projectName,
  onProjectNameChange,
  tasks,
  onChangeTasks,
  onConfirm,
  onCancel,
}: IntentPreviewProps) {
  const updateTask = (id: string, updates: Partial<IntentPreviewTask>) => {
    onChangeTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const removeTask = (id: string) => {
    onChangeTasks(tasks.filter((t) => t.id !== id))
  }

  const addManualTask = () => {
    onChangeTasks([
      ...tasks,
      {
        id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: "",
        priority: "Medium",
      },
    ])
  }

  const canConfirm =
    projectName.trim().length > 0 &&
    tasks.length > 0 &&
    tasks.every((t) => t.title.trim().length > 0)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Project / category tag
        </label>
        <Input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="bg-background/30 border-border/50 backdrop-blur-sm"
          placeholder="Project name"
        />
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center rounded-xl bg-background/20 shadow-sm p-2"
          >
            <Input
              value={task.title}
              onChange={(e) => updateTask(task.id, { title: e.target.value })}
              placeholder="Task title"
              className="flex-1 bg-background/30 border-border/50 backdrop-blur-sm"
            />
            <select
              value={task.priority}
              onChange={(e) =>
                updateTask(task.id, { priority: e.target.value as Priority })
              }
              className={selectClassName}
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTask(task.id)}
              aria-label="Remove task"
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addManualTask}
        className="w-full border-border/50"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add a task
      </Button>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={onConfirm} disabled={!canConfirm}>
          Add All to Board
        </Button>
      </div>
    </div>
  )
}
