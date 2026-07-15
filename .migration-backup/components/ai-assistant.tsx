"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Sparkles, Trash2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-accent animate-bounce" />
    <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
    <div className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
  </div>
)

export function AIAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I can help you with weather insights, task organization, and daily planning. How can I assist you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }


  const customHandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        createdAt: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Chat cleared. How can I help you now?",
      },
    ])
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const quickPrompts = [
    "What's the weather like today?",
    "Help me organize my tasks",
    "Give me productivity tips",
    "Suggest a daily schedule",
    "Give a simple, precise, and insightful answer to any question"
  ]

  return (
    <div className="container mx-auto px-4 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center neon-glow-accent">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold neon-text">AI Assistant</h1>
          </div>
          <p className="text-muted-foreground text-lg">Your intelligent companion powered by Gemini AI</p>
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
          {messages.map((message) => (
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
                    ? "bg-primary/90 text-primary-foreground rounded-br-sm neon-glow"
                    : "bg-card/80 border border-border text-foreground rounded-bl-sm",
                )}
              >
                <p className="leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>
                {message.createdAt && <p className="text-[10px] mt-2 opacity-70 text-right">{message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
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
          <form onSubmit={customHandleSubmit} className="relative">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
        {quickPrompts.map((prompt) => (
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

      {/* Info Card */}
      <Card className="glass p-4 border-accent/20 mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          <span className="text-accent font-semibold">Powered by:</span> Google Gemini AI for intelligent responses.
        </p>
      </Card>
    </div>
  )
}

