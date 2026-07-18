import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Trash2, Edit2, Check, X,
  ArrowUp, ArrowRight, ArrowDown, Calendar, Bell, MoreVertical, Github, ExternalLink
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Task } from "@/context/tasks-context"
import { useTasks } from "@/context/tasks-context"

interface TaskCardProps {
  task: Task
  isSelected?: boolean
  onClick?: () => void
  variant?: "list" | "board"
}

export function TaskCard({ task, isSelected, onClick, variant = "list" }: TaskCardProps) {
  const { deleteTask, toggleComplete, updateTask } = useTasks()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [settingReminderId, setSettingReminderId] = useState<string | null>(null)
  const [reminderInput, setReminderInput] = useState("")

  const startEdit = () => {
    setEditingId(task.id)
    setEditText(task.title)
  }

  const saveEdit = () => {
    if (!editText.trim()) return
    updateTask(task.id, { title: editText })
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveReminder = () => {
    if (!reminderInput) return
    updateTask(task.id, { reminderAt: new Date(reminderInput), reminderNotified: false })
    setSettingReminderId(null)
  }

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleComplete(task.id)
  }

  const isBoard = variant === "board"

  return (
    <Card
      className={cn(
        "group transition-all duration-300 overflow-hidden",
        isBoard 
          ? "bg-[#0a0a0a] border-[#1a1a1a] hover:border-accent/40 shadow-lg" 
          : "glass-card border-border/50 hover:border-primary/40",
        task.completed && "opacity-60",
        isSelected && (isBoard ? "border-accent ring-1 ring-accent/20 bg-accent/5" : "border-l-4 border-l-primary ring-1 ring-primary/20 bg-primary/5")
      )}
      onClick={onClick}
    >
      <div className={cn(isBoard ? "p-3" : "p-5")}>
        <div className="flex items-start gap-3">
          {!isBoard && (
            <button
              onClick={handleToggleComplete}
              className={cn(
                "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                task.completed
                  ? "bg-primary border-primary"
                  : "border-muted-foreground hover:border-primary",
              )}
            >
              {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
            </button>
          )}

          <div className="flex-1 min-w-0">
            {editingId === task.id ? (
              <Input
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") saveEdit()
                  if (e.key === "Escape") cancelEdit()
                }}
                className={cn(
                  "border-border",
                  isBoard ? "bg-black/50" : "bg-background/50"
                )}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex flex-col gap-0.5">
                <p className={cn(
                  "font-semibold leading-snug break-words",
                  isBoard ? "text-sm text-zinc-100" : "text-base text-foreground",
                  task.completed && "line-through text-muted-foreground"
                )}>
                  {task.title}
                </p>
                {task.githubIssueId && (
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    Synced from GitHub — mark complete here does not close the issue
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {editingId === task.id ? (
              <>
                <Button size="sm" onClick={(e) => { e.stopPropagation(); saveEdit(); }} className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2">
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); cancelEdit(); }} className="border-border bg-transparent h-7 px-2">
                  <X className="w-3.5 h-3.5" />
                </Button>
              </>
            ) : (
              <>
                <div className={cn("items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0", isBoard ? "flex" : "hidden md:flex")}>
                  <Button
                    size="sm" variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (settingReminderId === task.id) {
                        setSettingReminderId(null)
                      } else {
                        setSettingReminderId(task.id)
                        setReminderInput(task.reminderAt ? new Date(task.reminderAt).toISOString().slice(0, 16) : "")
                      }
                    }}
                    className={cn(
                      "h-7 w-7 p-0 text-muted-foreground hover:text-accent", 
                      task.reminderAt && !task.reminderNotified && "text-accent",
                      isBoard && "hover:bg-zinc-800"
                    )}
                    title="Set reminder"
                  >
                    {task.reminderAt && !task.reminderNotified ? <Bell className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5 opacity-50" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); startEdit(); }} className={cn("h-7 w-7 p-0 text-muted-foreground hover:text-foreground", isBoard && "hover:bg-zinc-800")} title="Edit">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className={cn("h-7 w-7 p-0 text-muted-foreground hover:text-destructive", isBoard && "hover:bg-zinc-800")} title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {!isBoard && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="md:hidden h-7 w-7 p-0 text-muted-foreground flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-strong border-primary/20">
                      <DropdownMenuItem onClick={() => {
                        setSettingReminderId(settingReminderId === task.id ? null : task.id)
                        setReminderInput(task.reminderAt ? new Date(task.reminderAt).toISOString().slice(0, 16) : "")
                      }}>
                        <Bell className="w-4 h-4 mr-2" /> Set Reminder
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={startEdit}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>

        <div className={cn("flex flex-wrap gap-2 mt-3", !isBoard && "ml-8")}>
          {task.dueDate && (
            <Badge variant="outline" className={cn(
              "text-[10px] gap-1 font-normal h-5 px-1.5",
              new Date(task.dueDate) < new Date() && !task.completed
                ? "border-destructive/50 text-destructive bg-destructive/10"
                : isBoard ? "border-zinc-800 text-zinc-400" : "border-border text-muted-foreground"
            )}>
              <Calendar className="w-2.5 h-2.5" />
              {new Date(task.dueDate).toLocaleString(undefined, { month: "short", day: "numeric" })}
            </Badge>
          )}

          <Badge className={cn(
            "text-[10px] gap-1 font-medium h-5 px-1.5 border-0",
            task.priority === "High"
              ? "bg-red-500/15 text-red-600 dark:text-red-400"
              : task.priority === "Medium"
              ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
          )}>
            {task.priority === "High" && <ArrowUp className="w-2.5 h-2.5" />}
            {task.priority === "Medium" && <ArrowRight className="w-2.5 h-2.5" />}
            {task.priority === "Low" && <ArrowDown className="w-2.5 h-2.5" />}
            {task.priority}
          </Badge>

          <Badge variant="secondary" className={cn("text-[10px] font-normal h-5 px-1.5", isBoard && "bg-zinc-800 text-zinc-300")}>
            {task.category}
          </Badge>

          {task.githubIssueId && (
            <Badge variant="outline" className="text-[10px] font-normal h-5 px-1.5 border-slate-700 bg-slate-900/50 text-slate-300 gap-1">
              <Github className="w-2.5 h-2.5" />
              GitHub
              {task.githubUrl && (
                <a 
                  href={task.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-primary"
                >
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              )}
            </Badge>
          )}

          {isBoard && (
            <span className="ml-auto text-[10px] font-mono text-zinc-500">
              #{task.id.slice(-4)}
            </span>
          )}
        </div>

        {settingReminderId === task.id && (
          <div className={cn("flex items-center gap-2 mt-3", !isBoard && "ml-8")}>
            <Input
              type="datetime-local"
              value={reminderInput}
              onChange={e => setReminderInput(e.target.value)}
              className={cn("h-8 text-[10px] border-accent/30 w-auto", isBoard ? "bg-black/50" : "bg-background/50")}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <Button size="sm" onClick={(e) => { e.stopPropagation(); saveReminder(); }} className="h-8 text-[10px] bg-accent hover:bg-accent/90">
              Set
            </Button>
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSettingReminderId(null); }} className="h-8 text-[10px]">
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
