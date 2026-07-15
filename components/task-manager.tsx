"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Edit2, Check, X, Download, Sparkles, ArrowUp, ArrowRight, ArrowDown, Calendar, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

type Priority = "High" | "Medium" | "Low"

interface Task {
  id: string
  title: string
  category: string
  priority: Priority
  completed: boolean
  createdAt: Date
  dueDate?: Date
  notified?: boolean
}

const categories = ["Personal", "Work", "Health", "Shopping", "Other"]
const priorities: Priority[] = ["High", "Medium", "Low"]

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Personal")
  const [selectedPriority, setSelectedPriority] = useState<Priority>("Medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load tasks from localStorage
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks)
        setTasks(parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
          priority: t.priority || "Medium"
        })))
      } catch (e) {
        console.error("Failed to parse tasks", e)
      }
    }

    // Generate AI suggestion based on tasks
    generateAiSuggestion()

    // Request notification permission
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true)
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            setNotificationsEnabled(true)
          }
        })
      }
    }
  }, [])

  useEffect(() => {
    // Save tasks to localStorage
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks])

  // Check for due tasks every minute
  useEffect(() => {
    if (!notificationsEnabled) return

    const checkDueTasks = () => {
      const now = new Date()
      const updatedTasks = tasks.map(task => {
        if (!task.completed && task.dueDate && !task.notified) {
          const dueDate = new Date(task.dueDate)
          if (dueDate <= now) {
            // Trigger notification
            new Notification(`Task Due: ${task.title}`, {
              body: `Your task "${task.title}" is due now!`,
              icon: "/icon.png" // We assume this exists based on previous logs 
            })
            return { ...task, notified: true }
          }
        }
        return task
      })

      // Only update state if changes occurred to avoid loops
      if (JSON.stringify(updatedTasks) !== JSON.stringify(tasks)) {
        setTasks(updatedTasks)
      }
    }

    const interval = setInterval(checkDueTasks, 60000) // Check every minute
    checkDueTasks() // Check immediately

    return () => clearInterval(interval)
  }, [tasks, notificationsEnabled])

  const generateAiSuggestion = () => {
    const suggestions = [
      "Consider grouping similar tasks together for better efficiency.",
      "You have outdoor tasks scheduled. Check the weather forecast first!",
      "Break down large tasks into smaller, manageable steps.",
      "Schedule your most important tasks during your peak productivity hours.",
      "Don't forget to take breaks between tasks to maintain focus.",
    ]
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)])
  }

  const addTask = () => {
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      category: selectedCategory,
      priority: selectedPriority,
      completed: false,
      createdAt: new Date(),
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined,
      notified: false
    }

    setTasks([task, ...tasks])
    setNewTask("")
    setNewTaskDueDate("")
    generateAiSuggestion()
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const toggleComplete = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditText(task.title)
  }

  const saveEdit = () => {
    if (!editText.trim()) return
    setTasks(tasks.map((t) => (t.id === editingId ? { ...t, title: editText } : t)))
    setEditingId(null)
    setEditText("")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const exportTasks = () => {
    const content = tasks.map((t) => {
      const dateStr = t.dueDate ? ` [Due: ${t.dueDate.toLocaleString()}]` : ""
      return `[${t.completed ? "x" : " "}] ${t.title} (${t.category}) - ${t.priority}${dateStr}`
    }).join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "tasks.txt"
    a.click()
  }

  const filteredTasks = filterCategory ? tasks.filter((t) => t.category === filterCategory) : tasks

  // Sort tasks: Incomplete first, then by priority (High > Medium > Low)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return a.completed ? 1 : -1
  })

  // Group by priority if no filter for better view or just list them? 
  // Let's stick to list but sorted.

  const completedCount = tasks.filter((t) => t.completed).length
  const totalCount = tasks.length

  const requestPermission = () => {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        setNotificationsEnabled(true)
      }
    })
  }

  if (!isClient) {
    return null
  }

  return (
    <div className="container mx-auto px-4 relative z-10">
      {/* Header */}
      <div
        className="mb-8 animate-slide-in-up flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-5xl font-bold mb-3 neon-text tracking-tight">Task Manager</h1>
          <p className="text-muted-foreground text-xl">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>
        {!notificationsEnabled && "Notification" in window && (
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
        <div
          className="mb-8 animate-slide-in-up delay-100"
        >
          <Card className="glass-card p-6 border-accent/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0 neon-glow-accent">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2 text-accent text-lg neon-text-accent">AI Suggestion</h3>
                <p className="text-foreground leading-relaxed text-base">{aiSuggestion}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Add Task Form */}
      <div
        className="animate-slide-in-up delay-200"
      >
        <Card className="glass-card p-6 border-primary/30 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                className="flex-1 bg-background/30 border-border/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground"
              />
              <Button
                onClick={addTask}
                className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow rounded-xl font-semibold md:w-auto w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Task
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-xl bg-background/30 border border-border/50 text-foreground backdrop-blur-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as Priority)}
                className="px-4 py-2 rounded-xl bg-background/30 border border-border/50 text-foreground backdrop-blur-sm"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 bg-background/30 border border-border/50 rounded-xl px-2 backdrop-blur-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="datetime-local"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="border-none bg-transparent focus-visible:ring-0 w-auto h-9 text-sm text-foreground"
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
              ? "bg-primary text-primary-foreground neon-glow"
              : "glass border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30",
          )}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filterCategory === cat ? "default" : "outline"}
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "rounded-xl font-semibold transition-all duration-300",
              filterCategory === cat
                ? "bg-primary text-primary-foreground neon-glow"
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
          <div
            key="empty"
            className="animate-fade-in"
          >
            <Card className="glass-card p-12 text-center border-border/50">
              <p className="text-muted-foreground text-lg">No tasks found.</p>
            </Card>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="animate-slide-in-up"
            >
              <Card
                className={cn(
                  "glass-card p-5 border-border/50 hover:border-primary/40 transition-colors duration-300",
                  task.completed && "opacity-60 bg-background/20",
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(task.id)}
                    className={cn(
                      "w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                      task.completed ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary",
                    )}
                  >
                    {task.completed && <Check className="w-4 h-4 text-primary-foreground" />}
                  </button>

                  {/* Task Content */}
                  {editingId === task.id ? (
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit()
                        if (e.key === "Escape") cancelEdit()
                      }}
                      className="flex-1 bg-background/50 border-border"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                        <p className={cn("text-foreground font-medium", task.completed && "line-through text-muted-foreground")}>
                          {task.title}
                        </p>

                        <div className="flex items-center gap-3">
                          {task.dueDate && (
                            <span className={cn(
                              "text-xs flex items-center gap-1",
                              task.dueDate < new Date() && !task.completed ? "text-destructive font-bold" : "text-muted-foreground"
                            )}>
                              <Calendar className="w-3 h-3" />
                              {task.dueDate.toLocaleString()}
                            </span>
                          )}
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full border flex items-center gap-1",
                            task.priority === "High" ? "border-red-500/50 text-red-400 bg-red-950/20" :
                              task.priority === "Medium" ? "border-yellow-500/50 text-yellow-400 bg-yellow-950/20" :
                                "border-blue-500/50 text-blue-400 bg-blue-950/20"
                          )}>
                            {task.priority === "High" && <ArrowUp className="w-3 h-3" />}
                            {task.priority === "Medium" && <ArrowRight className="w-3 h-3" />}
                            {task.priority === "Low" && <ArrowDown className="w-3 h-3" />}
                            {task.priority}
                          </span>
                          <span className="text-xs text-muted-foreground bg-secondary/20 px-2 py-1 rounded-full border border-secondary/20">
                            {task.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {editingId === task.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="border-border bg-transparent">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(task)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
