import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Copy, Check, Plus, Trash2, Terminal, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCommands, CommandSnippet } from "@/context/commands-context"
import { toast } from "@/hooks/use-toast"

const toolFilters = ["All", "Git", "SSH", "Aria2c", "Linux", "Other"]

export function CommandManager() {
  const { commands, addCommand, deleteCommand } = useCommands()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTool, setSelectedTool] = useState("All")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // New Command Form State
  const [newTool, setNewTool] = useState("")
  const [newCommand, setNewCommand] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newTags, setNewTags] = useState("")

  const filteredCommands = useMemo(() => {
    return commands.filter(cmd => {
      const matchesSearch = 
        cmd.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTool = selectedTool === "All" || cmd.tool === selectedTool;
      
      return matchesSearch && matchesTool;
    });
  }, [commands, searchQuery, selectedTool]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Copied to clipboard",
        description: "The command has been copied.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedId(id);
        toast({
          title: "Copied to clipboard",
          description: "The command has been copied.",
        });
        setTimeout(() => setCopiedId(null), 2000);
      } catch (e) {
        toast({
          variant: "destructive",
          title: "Copy failed",
          description: "Please copy the command manually.",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  const handleAddCommand = () => {
    if (!newTool || !newCommand || !newDescription) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in tool, command, and description.",
      });
      return;
    }

    addCommand({
      tool: newTool,
      command: newCommand,
      description: newDescription,
      tags: newTags ? newTags.split(",").map(t => t.trim()) : [],
    });

    setNewTool("");
    setNewCommand("");
    setNewDescription("");
    setNewTags("");
    setShowAddForm(false);
    toast({
      title: "Command added",
      description: "Your custom command has been saved.",
    });
  };

  return (
    <div className="container mx-auto px-4 relative z-10">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-in-up">
        <div>
          <h1 className="text-5xl font-bold mb-3 tracking-tight flex items-center gap-3">
            <Terminal className="w-10 h-10 text-primary" />
            CLI Reference
          </h1>
          <p className="text-muted-foreground text-xl">
            Searchable bank for common dev tools and linux commands
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold px-6"
        >
          {showAddForm ? "Cancel" : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Add Command
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <Card className="glass-card p-6 border-primary/30 mb-8 animate-slide-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tool Name</label>
              <Input 
                placeholder="e.g. Git, Docker, K8s" 
                value={newTool}
                onChange={e => setNewTool(e.target.value)}
                className="bg-background/30 border-border/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input 
                placeholder="e.g. basic, advanced, networking" 
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                className="bg-background/30 border-border/50 backdrop-blur-sm"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Command String</label>
              <Input 
                placeholder="The actual CLI command" 
                value={newCommand}
                onChange={e => setNewCommand(e.target.value)}
                className="bg-background/30 border-border/50 backdrop-blur-sm font-mono text-sm"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input 
                placeholder="What does this command do?" 
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                className="bg-background/30 border-border/50 backdrop-blur-sm"
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <Button onClick={handleAddCommand} className="w-full md:w-auto px-8">
                Save Command
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-in-up delay-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search tools, commands, tags..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/30 border-border/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 animate-slide-in-up delay-200">
        {toolFilters.map(tool => (
          <Button
            key={tool}
            variant={selectedTool === tool ? "default" : "outline"}
            onClick={() => setSelectedTool(tool)}
            className={cn(
              "rounded-xl font-semibold transition-all duration-300",
              selectedTool === tool
                ? "bg-primary text-primary-foreground"
                : "glass border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30",
            )}
          >
            {tool}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommands.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground italic">No commands found matching your criteria.</p>
          </div>
        ) : (
          filteredCommands.map((cmd, idx) => (
            <Card 
              key={cmd.id} 
              className={cn(
                "glass-card border-border/50 hover:border-primary/40 transition-all duration-300 flex flex-col overflow-hidden animate-slide-in-up",
                `delay-${(idx % 5) * 100}`
              )}
            >
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
                      {cmd.tool}
                    </Badge>
                    {cmd.isCustom && (
                      <Badge variant="outline" className="border-accent/30 text-accent text-xs font-semibold px-2 rounded-md">
                        Custom
                      </Badge>
                    )}
                  </div>
                  {cmd.isCustom && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteCommand(cmd.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="group relative">
                  <div className="bg-background/50 rounded-lg p-3 font-mono text-sm border border-border/50 break-all pr-10 min-h-[44px]">
                    {cmd.command}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopy(cmd.id, cmd.command)}
                    className="absolute right-1.5 top-1.5 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-background shadow-sm border border-border/30"
                  >
                    {copiedId === cmd.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="space-y-2 flex-1">
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {cmd.description}
                  </p>
                  {cmd.tags && cmd.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {cmd.tags.map(tag => (
                        <div key={tag} className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
