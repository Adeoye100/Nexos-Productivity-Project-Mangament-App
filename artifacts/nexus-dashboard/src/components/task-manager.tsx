
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus, Trash2, Edit2, Check, X, Download, Sparkles,
  ArrowUp, ArrowRight, ArrowDown, Calendar, Bell, BellOff, MoreVertical
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useTasks } from "@/context/tasks-context"
import { useNotifications } from "@/context/notifications-context"
import type { Task, Priority } from "@/context/tasks-context"

const categories = ["Personal", "Work", "Health", "Shopping", "Other"]
const priorities: Priority[] = ["High", "Medium", "Low"]

export function TaskManager() {
  const { tasks, addTask, deleteTask, toggleComplete, updateTask } = useTasks()
  const { addNotification } = useNotifications()

  const [newTask, setNewTask] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Personal")
  const [selectedPriority, setSelectedPriority] = useState<Priority>("Medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [newTaskReminder, setNewTaskReminder] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [settingReminderId, setSettingReminderId] = useState<string | null>(null)
  const [reminderInput, setReminderInput] = useState("")

  useEffect(() => {
    generateAiSuggestion()
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true)
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(p => {
          if (p === "granted") setNotificationsEnabled(true)
        })
      }
    }
  }, [])

  // Notification checker: due, overdue, reminder
  useEffect(() => {
    const check = () => {
      const now = new Date()
      tasks.forEach(task => {
        if (task.completed) return

        // Task due
        if (task.dueDate && !task.notified) {
          if (new Date(task.dueDate) <= now) {
            addNotification({
              type: "task_due",
              title: `Due now: ${task.title}`,
              message: `Your task "${task.title}" is due!`,
            })
            updateTask(task.id, { notified: true })
          }
        }

        // Task overdue (1+ hour past due)
        if (task.dueDate && task.notified && !task.overdueNotified) {
          const overdueSince = new Date(new Date(task.dueDate).getTime() + 60 * 60 * 1000)
          if (now >= overdueSince) {
            addNotification({
              type: "task_overdue",
              title: `Overdue: ${task.title}`,
              message: `"${task.title}" was due ${new Date(task.dueDate).toLocaleString()} and hasn't been completed.`,
            })
            updateTask(task.id, { overdueNotified: true })
          }
        }

        // Reminder
        if (task.reminderAt && !task.reminderNotified) {
          if (new Date(task.reminderAt) <= now) {
            addNotification({
              type: "reminder",
              title: `Reminder: ${task.title}`,
              message: `Scheduled reminder for "${task.title}".`,
            })
            updateTask(task.id, { reminderNotified: true })
          }
        }
      })
    }

    const interval = setInterval(check, 60_000)
    check()
    return () => clearInterval(interval)
  }, [tasks, addNotification, updateTask])

  const generateAiSuggestion = () => {
    const suggestions = [
      "Consider grouping similar tasks together for better efficiency.",
      "Break large tasks into smaller, manageable steps.",
      "Schedule your most important tasks during peak productivity hours.",
      "Take short breaks between tasks to maintain focus.",
      "High-priority tasks tackled first = more momentum for the day.",
    ]
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)])
  }

  const handleAddTask = () => {
    if (!newTask.trim()) return
    addTask({
      title: newTask,
      category: selectedCategory,
      priority: selectedPriority,
      completed: false,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
      reminderAt: newTaskReminder ? new Date(newTaskReminder) : undefined,
    })
    setNewTask("")
    setNewTaskDueDate("")
    setNewTaskReminder("")
    generateAiSuggestion()
  }

  const handleToggleComplete = (task: Task) => {
    if (!task.completed) {
      addNotification({
        type: "task_completed",
        title: "Task completed! 🎉",
        message: `"${task.title}" has been marked as done.`,
      })
    }
    toggleComplete(task.id)
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditText(task.title)
  }

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return
    updateTask(editingId, { title: editText })
    setEditingId(null)
    setEditText("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const saveReminder = (taskId: string) => {
    if (!reminderInput) return
    updateTask(taskId, { reminderAt: new Date(reminderInput), reminderNotified: false })
    setSettingReminderId(null)
    setReminderInput("")
  }

  const exportTasks = () => {
    const content = tasks
      .map(t => {
        const due = t.dueDate ? ` [Due: ${new Date(t.dueDate).toLocaleString()}]` : ""
        return `[${t.completed ? "x" : " "}] ${t.title} (${t.category}) - ${t.priority}${due}`
      })
      .join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tasks.txt"
    a.click()
  }

  const requestPermission = () => {
    Notification.requestPermission().then(p => {
      if (p === "granted") setNotificationsEnabled(true)
    })
  }

  const filteredTasks = filterCategory ? tasks.filter(t => t.category === filterCategory) : tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) {
      const order = { High: 0, Medium: 1, Low: 2 }
      return order[a.priority] - order[b.priority]
    }
    return a.completed ? 1 : -1
  })

  const completedCount = tasks.filter(t => t.completed).length

  return (
    <div className="container mx-auto px-4 relative z-10">
      {/* Header */}
      <div className="mb-8 animate-slide-in-up flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-5xl font-bold mb-3 tracking-tight">Task Manager</h1>
          <p className="text-muted-foreground text-xl">
            {completedCount} of {tasks.length} tasks completed
          </p>
        </div>
        {"Notification" in window && !notificationsEnabled && (
          <Button
            variant="outline"
            onClick={requestPermission}
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </Button>
        )}
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="mb-8 animate-slide-in-up delay-100">
          <Card className="glass-card p-6 border-accent/30 border-t-[0px] border-r-[0px] border-b-[0px] border-l-[0px]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2 text-accent text-lg">AI Suggestion</h3>
                <p className="text-foreground leading-relaxed text-base">{aiSuggestion}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Task Form */}
      <div className="animate-slide-in-up delay-200">
        <Card className="glass-card p-6 border-primary/30 mb-8 border-t-[0px] border-r-[0px] border-b-[0px] border-l-[0px]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddTask()}
                className="flex-1 bg-background/30 border-border/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
              />
              <Button
                onClick={handleAddTask}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold md:w-auto w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-xl bg-background/30 border border-border/50 text-foreground backdrop-blur-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value as Priority)}
                className="px-4 py-2 rounded-xl bg-background/30 border border-border/50 text-foreground backdrop-blur-sm"
              >
                {priorities.map(p => (
                  <option key={p} value={p}>{p} Priority</option>
                ))}
              </select>
              <div className="flex items-center gap-2 bg-background/30 border border-border/50 rounded-xl px-3 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  type="datetime-local"
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                  className="border-none bg-transparent focus-visible:ring-0 w-auto h-9 text-sm text-foreground"
                  title="Due date"
                />
              </div>
              <div className="flex items-center gap-2 bg-background/30 border border-border/50 rounded-xl px-3 backdrop-blur-sm">
                <Bell className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Input
                  type="datetime-local"
                  value={newTaskReminder}
                  onChange={e => setNewTaskReminder(e.target.value)}
                  className="border-none bg-transparent focus-visible:ring-0 w-auto h-9 text-sm text-foreground"
                  title="Remind me at"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3 mb-6 animate-slide-in-up delay-300">
        <Button
          variant={filterCategory === null ? "default" : "outline"}
          onClick={() => setFilterCategory(null)}
          className={cn(
            "rounded-xl font-semibold transition-all duration-300",
            filterCategory === null
              ? "bg-primary text-primary-foreground"
              : "glass border-border/50 text-muted-foreground hover:text-foreground hover:border-border",
          )}
        >
          All
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={filterCategory === cat ? "default" : "outline"}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "rounded-xl font-semibold transition-all duration-300",
              filterCategory === cat
                ? "bg-primary text-primary-foreground"
                : "glass border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30",
            )}
          >
            {cat}
          </Button>
        ))}
        <Button
          variant="outline"
          onClick={exportTasks}
          className="ml-auto glass border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 rounded-xl font-semibold bg-transparent"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="animate-fade-in">
            <Card className="glass-card p-16 text-center border-border/50 border-dashed border-t-[0px] border-r-[0px] border-b-[0px] border-l-[0px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Check className="w-8 h-8 text-primary/50" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground mb-1">
                    {filterCategory ? `No ${filterCategory} tasks` : "No tasks yet"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {filterCategory
                      ? `Add your first ${filterCategory.toLowerCase()} task above.`
                      : "Add your first task above — type something and press Enter."}
                  </p>
                </div>
                {!filterCategory && (
                  <Button
                    variant="outline"
                    onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Add a new task..."]')?.focus()}
                    className="border-primary/30 text-primary hover:bg-primary/10 rounded-xl"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add your first task
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ) : (
          sortedTasks.map(task => (
            <div key={task.id} className="animate-slide-in-up">
              <Card
                className={cn(
                  "group glass-card border-border/50 hover:border-primary/40 transition-all duration-300 overflow-hidden",
                  task.completed && "opacity-60",
                )}
              >
                <div className="p-5">
                  {/* Top row: checkbox + title + actions */}
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={cn(
                        "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                        task.completed
                          ? "bg-primary border-primary"
                          : "border-muted-foreground hover:border-primary",
                      )}
                    >
                      {task.completed && <Check className="w-3 h-3 text-primary-foreground" />}
                    </button>

                    {/* Title — visual anchor */}
                    <div className="flex-1 min-w-0">
                      {editingId === task.id ? (
                        <Input
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") saveEdit()
                            if (e.key === "Escape") cancelEdit()
                          }}
                          className="bg-background/50 border-border"
                          autoFocus
                        />
                      ) : (
                        <p className={cn(
                          "text-base font-semibold leading-snug text-foreground break-words",
                          task.completed && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {editingId === task.id ? (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button size="sm" onClick={saveEdit} className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 px-2">
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="border-border bg-transparent h-7 px-2">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Desktop: hover-reveal cluster */}
                        <div className="hidden md:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            size="sm" variant="ghost"
                            onClick={() => {
                              if (settingReminderId === task.id) {
                                setSettingReminderId(null)
                              } else {
                                setSettingReminderId(task.id)
                                setReminderInput(task.reminderAt ? new Date(task.reminderAt).toISOString().slice(0, 16) : "")
                              }
                            }}
                            className={cn("h-7 w-7 p-0 text-muted-foreground hover:text-accent", task.reminderAt && !task.reminderNotified && "text-accent")}
                            title="Set reminder"
                          >
                            {task.reminderAt && !task.reminderNotified ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => startEdit(task)} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground" title="Edit">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteTask(task.id)} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        {/* Mobile: kebab dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="md:hidden h-7 w-7 p-0 text-muted-foreground flex-shrink-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-strong border-primary/20 border-t-[0px] border-r-[0px] border-b-[0px] border-l-[0px]">
                            <DropdownMenuItem onClick={() => {
                              setSettingReminderId(settingReminderId === task.id ? null : task.id)
                              setReminderInput(task.reminderAt ? new Date(task.reminderAt).toISOString().slice(0, 16) : "")
                            }}>
                              <Bell className="w-4 h-4 mr-2" /> Set Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startEdit(task)}>
                              <Edit2 className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>

                  {/* Metadata row */}
                  <div className="flex flex-wrap gap-2 mt-3 ml-8">
                    {task.dueDate && (
                      <Badge variant="outline" className={cn(
                        "text-xs gap-1 font-normal h-6 px-2",
                        new Date(task.dueDate) < new Date() && !task.completed
                          ? "border-destructive/50 text-destructive bg-destructive/10"
                          : "border-border text-muted-foreground"
                      )}>
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Badge>
                    )}

                    <Badge className={cn(
                      "text-xs gap-1 font-medium h-6 px-2 border-0",
                      task.priority === "High"
                        ? "bg-red-500/15 text-red-600 dark:text-red-400"
                        : task.priority === "Medium"
                        ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    )}>
                      {task.priority === "High" && <ArrowUp className="w-3 h-3" />}
                      {task.priority === "Medium" && <ArrowRight className="w-3 h-3" />}
                      {task.priority === "Low" && <ArrowDown className="w-3 h-3" />}
                      {task.priority}
                    </Badge>

                    <Badge variant="secondary" className="text-xs font-normal h-6 px-2">
                      {task.category}
                    </Badge>

                    {task.reminderAt && !task.reminderNotified && (
                      <Badge variant="outline" className="text-xs gap-1 font-normal h-6 px-2 border-accent/40 text-accent bg-accent/5">
                        <Bell className="w-3 h-3" />
                        {new Date(task.reminderAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </Badge>
                    )}
                  </div>

                  {/* Inline reminder setter */}
                  {settingReminderId === task.id && (
                    <div className="flex items-center gap-2 mt-3 ml-8">
                      <Input
                        type="datetime-local"
                        value={reminderInput}
                        onChange={e => setReminderInput(e.target.value)}
                        className="h-8 text-xs bg-background/50 border-accent/30 w-auto"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => saveReminder(task.id)} className="h-8 text-xs bg-accent hover:bg-accent/90">
                        Set
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSettingReminderId(null)} className="h-8 text-xs">
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
