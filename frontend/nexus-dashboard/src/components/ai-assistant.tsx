
import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTasks } from "@/context/tasks-context"
import { useNotifications } from "@/context/notifications-context"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: Date
}

const CHAT_STORAGE_KEY = "nexus-chat-history"
const ACTION_RE = /<action>([\s\S]*?)<\/action>/

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "assistant",
  content:
    "Hello! I'm your Nexus AI assistant. I can check your tasks, help you add new ones, mark tasks complete, give weather insights, and assist with daily planning. How can I help?",
}

const TypingIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
    <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
    <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
  </div>
)

export function AIAssistant() {
  const { tasks, addTask, toggleComplete } = useTasks()
  const { addNotification } = useNotifications()

  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Message[]
        return parsed.map(m => ({ ...m, createdAt: m.createdAt ? new Date(m.createdAt) : undefined }))
      }
    } catch { /* ignore */ }
    return [INITIAL_MESSAGE]
  })
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Persist chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages))
    } catch { /* ignore quota errors */ }
  }, [messages])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      createdAt: new Date(),
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setIsLoading(true)
    setInput("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          tasks: tasks.map(t => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            category: t.category,
            completed: t.completed,
            dueDate: (t.dueDate && !isNaN(t.dueDate.getTime())) ? t.dueDate.toISOString() : undefined,
          })),
        }),
      })

      if (!response.ok) throw new Error("Request failed")
      const data = await response.json() as { message: string }

      // Parse optional <action> block
      const rawText = data.message
      const actionMatch = rawText.match(ACTION_RE)
      let displayText = rawText.replace(ACTION_RE, "").trim()

      if (actionMatch) {
        try {
          const action = JSON.parse(actionMatch[1]) as {
            type: "create_task" | "complete_task"
            title?: string
            priority?: string
            category?: string
            id?: string
          }

          if (action.type === "create_task" && action.title) {
            addTask({
              title: action.title,
              category: (action.category as any) || "Personal",
              priority: (action.priority as any) || "Medium",
              completed: false,
            })
            displayText += `\n\n✅ Task added: "${action.title}"`
          } else if (action.type === "complete_task" && action.id) {
            const target = tasks.find(t => t.id === action.id)
            if (target && !target.completed) {
              toggleComplete(action.id)
              addNotification({
                type: "task_completed",
                title: "Task completed via AI! 🎉",
                message: `"${target.title}" was marked done by the assistant.`,
              })
              displayText += `\n\n✅ Task completed: "${target.title}"`
            }
          }
        } catch { /* ignore malformed action */ }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: displayText,
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])

      // Fire ai_reply notification
      addNotification({
        type: "ai_reply",
        title: "AI Assistant replied",
        message: displayText.slice(0, 80) + (displayText.length > 80 ? "…" : ""),
      })
    } catch (err) {
      console.error("[AI Assistant] fetch failed:", err)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't reach the AI right now. Please try again.",
        createdAt: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    const fresh: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Chat cleared. How can I help you?",
      createdAt: new Date(),
    }
    setMessages([fresh])
    localStorage.removeItem(CHAT_STORAGE_KEY)
  }

  const quickPrompts = [
    "What tasks are due soon?",
    "Add a High priority task: review budget",
    "What's the weather like today?",
    "Help me organize my tasks",
    "Give me productivity tips for today",
  ]

  return (
    <div className="container mx-auto px-4 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold">AI Assistant</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Your intelligent companion — reads your tasks, takes action
          </p>
        </div>
        <Button
          variant="outline"
          onClick={clearChat}
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive-foreground transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      {/* Chat Container */}
      <Card className="glass-strong border-primary/20 mb-4 shadow-lg rounded-2xl overflow-hidden flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 animate-in fade-in-50 slide-in-from-bottom-2",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 border border-accent/30 shadow-sm mt-1">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] rounded-2xl p-4 text-sm shadow-md backdrop-blur-sm",
                  message.role === "user"
                    ? "bg-primary/90 text-primary-foreground rounded-br-sm"
                    : "bg-card/80 border border-border text-foreground rounded-bl-sm",
                )}
              >
                <p className="leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>
                {message.createdAt && (
                  <p className="text-[10px] mt-2 opacity-70 text-right">
                    {message.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 shadow-sm mt-1">
                  <User className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 justify-start animate-in fade-in-50">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 border border-accent/30">
                <Bot className="w-4 h-4 text-accent" />
              </div>
              <div className="bg-card/80 border border-border rounded-2xl rounded-bl-sm p-4 shadow-md flex items-center">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background/30 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              placeholder="Ask me anything, or say 'add task: …'"
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full pl-4 pr-12 py-6 bg-background/50 border-primary/20 focus:border-primary/50 rounded-xl shadow-inner transition-all"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors w-8 h-8 rounded-lg"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </Card>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2 justify-center">
        {quickPrompts.map(prompt => (
          <Button
            key={prompt}
            variant="outline"
            size="sm"
            onClick={() => setInput(prompt)}
            className="border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 bg-background/20 backdrop-blur-sm transition-all rounded-full px-4"
          >
            {prompt}
          </Button>
        ))}
      </div>

      {/* Info */}
      <Card className="glass p-4 border-accent/20 mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          <span className="text-accent font-semibold">Powered by:</span> Google Gemini AI — chat history saved locally in your browser.
        </p>
      </Card>
    </div>
  )
}
