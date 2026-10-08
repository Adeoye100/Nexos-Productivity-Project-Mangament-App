import { useState, useMemo } from "react";
import { useNotes, Note } from "@/context/notes-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Save, X, Search, Tag, Phone, Terminal, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function NotesManager() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    topic: "",
    type: "text" as "text" | "prompt" | "contact"
  });

  const resetForm = () => {
    setFormData({ title: "", body: "", topic: "", type: "text" });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!formData.title || !formData.body) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in title and body."
      });
      return;
    }

    if (editingId) {
      updateNote(editingId, formData);
      toast({ title: "Note updated" });
    } else {
      addNote(formData);
      toast({ title: "Note added" });
    }
    resetForm();
  };

  const handleEdit = (note: Note) => {
    setFormData({
      title: note.title,
      body: note.body,
      topic: note.topic || "",
      type: note.type
    });
    setEditingId(note.id);
    setShowAddForm(true);
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            n.body.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = selectedTopic ? n.topic === selectedTopic : true;
      return matchesSearch && matchesTopic;
    });
  }, [notes, searchQuery, selectedTopic]);

  const allTopics = useMemo(() => {
    const topics = new Set<string>();
    notes.forEach(n => { if (n.topic) topics.add(n.topic); });
    return Array.from(topics).sort();
  }, [notes]);

  const TypeIcon = ({ type }: { type: Note["type"] }) => {
    switch (type) {
      case "contact": return <Phone className="w-4 h-4" />;
      case "prompt": return <Terminal className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 relative z-10">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-in-up">
        <div>
          <h1 className="text-5xl font-bold mb-3 tracking-tight flex items-center gap-3">
            <FileText className="w-10 h-10 text-primary" />
            Notes & Reference
          </h1>
          <p className="text-muted-foreground text-xl">
            Your personal bank for notes, snippets, and contacts
          </p>
        </div>
        <Button 
          onClick={() => {
            if (showAddForm && !editingId) {
              resetForm();
            } else {
              resetForm();
              setShowAddForm(true);
            }
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold px-6"
        >
          {showAddForm ? "Cancel" : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Add Note
            </>
          )}
        </Button>
      </div>

      {showAddForm && (
        <Card className="glass-card p-6 border-primary/30 mb-8 animate-slide-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                placeholder="Note title" 
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="bg-background/30 border-border/50 backdrop-blur-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic (optional)</label>
              <Input 
                placeholder="e.g. Work, Ideas, Snippets" 
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                className="bg-background/30 border-border/50 backdrop-blur-sm"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="flex gap-2">
                {["text", "prompt", "contact"].map(t => (
                  <Button
                    key={t}
                    type="button"
                    variant={formData.type === t ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, type: t as any })}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium">Body</label>
              <Textarea 
                placeholder={formData.type === "contact" ? "Phone number, email, or address" : "Markdown content"} 
                value={formData.body}
                onChange={e => setFormData({ ...formData, body: e.target.value })}
                className="bg-background/30 border-border/50 backdrop-blur-sm min-h-[100px]"
              />
            </div>
            <div className="md:col-span-2 pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" /> {editingId ? "Update" : "Save Note"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-in-up delay-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/30 border-border/50 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 animate-slide-in-up delay-200">
        <Button
          variant={selectedTopic === null ? "default" : "outline"}
          onClick={() => setSelectedTopic(null)}
          className={cn(
            "rounded-xl font-semibold transition-all duration-300",
            selectedTopic === null
              ? "bg-primary text-primary-foreground"
              : "glass border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30",
          )}
        >
          All
        </Button>
        {allTopics.map(topic => (
          <Button
            key={topic}
            variant={selectedTopic === topic ? "default" : "outline"}
            onClick={() => setSelectedTopic(topic)}
            className={cn(
              "rounded-xl font-semibold transition-all duration-300",
              selectedTopic === topic
                ? "bg-primary text-primary-foreground"
                : "glass border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30",
            )}
          >
            {topic}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground italic">No notes found.</p>
          </div>
        ) : (
          filteredNotes.map((note, idx) => (
            <Card 
              key={note.id} 
              className={cn(
                "glass-card border-border/50 hover:border-primary/40 transition-all duration-300 flex flex-col overflow-hidden animate-slide-in-up",
                `delay-${(idx % 5) * 100}`
              )}
            >
              <div className="p-5 flex-1 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-2.5 py-0.5 rounded-md text-xs font-bold tracking-tight capitalize flex items-center gap-1">
                      <TypeIcon type={note.type} />
                      {note.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(note)}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteNote(note.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold">{note.title}</h3>
                  {note.type === "contact" ? (
                    <a href={`tel:${note.body.replace(/[^\d+]/g, '')}`} className="text-sm text-primary hover:underline break-all">
                      {note.body}
                    </a>
                  ) : (
                    <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                      {note.body}
                    </p>
                  )}
                  {note.topic && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-full">
                        <Tag className="w-3 h-3" />
                        {note.topic}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
