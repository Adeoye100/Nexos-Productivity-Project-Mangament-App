import { useState } from "react"
import { usePrompts, Prompt } from "@/context/prompts-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Edit2, Save, X, Search, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromptLibraryProps {
  onSelectPrompt?: (body: string) => void;
}

export function PromptLibrary({ onSelectPrompt }: PromptLibraryProps) {
  const { prompts, addPrompt, updatePrompt, deletePrompt } = usePrompts()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    category: ""
  })

  const resetForm = () => {
    setFormData({ title: "", body: "", category: "" })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSave = () => {
    if (!formData.title || !formData.body) return

    if (editingId) {
      updatePrompt(editingId, formData)
    } else {
      addPrompt(formData)
    }
    resetForm()
  }

  const handleEdit = (prompt: Prompt) => {
    setFormData({
      title: prompt.title,
      body: prompt.body,
      category: prompt.category || ""
    })
    setEditingId(prompt.id)
    setIsAdding(true)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  const filteredPrompts = prompts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const groupedPrompts = filteredPrompts.reduce((acc, p) => {
    const cat = p.category || "Uncategorized"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {} as Record<string, Prompt[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search prompts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsAdding(true)} size="icon" variant="outline">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4 space-y-3 glass-strong border-primary/20 animate-in fade-in slide-in-from-top-2">
          <Input 
            placeholder="Prompt Title" 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <Textarea 
            placeholder="Prompt Body" 
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="min-h-[100px]"
          />
          <Input 
            placeholder="Category (optional)" 
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!formData.title || !formData.body}>
              <Save className="w-4 h-4 mr-2" /> {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {Object.entries(groupedPrompts).map(([category, items]) => (
          <div key={category} className="space-y-1">
            <button 
              onClick={() => toggleCategory(category)}
              className="flex items-center w-full text-xs font-semibold text-muted-foreground uppercase tracking-wider p-1 hover:text-foreground transition-colors"
            >
              {expandedCategories[category] !== false ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
              {category}
            </button>
            
            {(expandedCategories[category] !== false) && (
              <div className="space-y-1 pl-1">
                {items.map(prompt => (
                  <div 
                    key={prompt.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors border border-transparent hover:border-border cursor-pointer"
                    onClick={() => onSelectPrompt?.(prompt.body)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{prompt.title}</h4>
                      <p className="text-xs text-muted-foreground truncate">{prompt.body}</p>
                    </div>
                    <div className="hidden group-flex flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(prompt)
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-destructive hover:text-destructive" 
                        onClick={(e) => {
                          e.stopPropagation()
                          deletePrompt(prompt.id)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredPrompts.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No prompts found</p>
          </div>
        )}
      </div>
    </div>
  )
}
