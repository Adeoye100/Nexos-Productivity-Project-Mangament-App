import { useState, useMemo } from "react";
import { useTasks } from "@/context/tasks-context";
import { useHabits } from "@/context/habits-context";
import { generateStandup, generateTaskBriefContext } from "@/lib/standup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, FileText, CheckSquare, Copy, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function StandupGenerator() {
  const { tasks } = useTasks();
  const { entries, habits } = useHabits();
  const [activeTab, setActiveTab] = useState<"standup" | "brief">("standup");
  const [briefOutput, setBriefOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const standupText = useMemo(() => {
    // Pass empty github issues for now as it's not wired to context
    return generateStandup(tasks, entries, habits, []);
  }, [tasks, entries, habits]);

  const activeTasks = useMemo(() => {
    return tasks.filter(t => t.status === "not_started" || t.status === "in_progress");
  }, [tasks]);

  const toggleTaskSelection = (id: string) => {
    const next = new Set(selectedTaskIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedTaskIds(next);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateBrief = async () => {
    if (selectedTaskIds.size === 0) {
      toast({ variant: "destructive", title: "No tasks selected", description: "Please select at least one task." });
      return;
    }

    setIsGenerating(true);
    setBriefOutput("");
    try {
      const selectedTasks = tasks.filter(t => selectedTaskIds.has(t.id));
      const prompt = generateTaskBriefContext(selectedTasks);
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) throw new Error("Failed to generate brief");

      const data = await response.json();
      setBriefOutput(data.message || "No response generated.");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Generation failed", description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  const [repoStandupOutput, setRepoStandupOutput] = useState("");
  const [isGeneratingRepo, setIsGeneratingRepo] = useState(false);

  const handleGenerateRepoStandup = async () => {
    setIsGeneratingRepo(true);
    setRepoStandupOutput("");
    try {
      // Import on demand to avoid breaking SSR or early evaluation if github.ts has issues
      const { getGitHubConfig, fetchGitHubCommits } = await import('@/lib/github');
      const config = getGitHubConfig();
      if (!config) {
        throw new Error("GitHub is not connected. Add a token in Settings.");
      }

      const commits = await fetchGitHubCommits(config.token, config.repo);
      const recentCommits = commits.slice(0, 10).map(c => `- ${c.commit.message} (${c.commit.author.name})`).join('\n');
      
      const prompt = `Here are the most recent commits from the connected repository:\n\n${recentCommits}\n\nPlease generate a concise, professional daily standup summary (what was done, what might be next) based solely on these commits.`;
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) throw new Error("Failed to generate repo standup");

      const data = await response.json();
      setRepoStandupOutput(data.message || "No response generated.");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Generation failed", description: e.message });
    } finally {
      setIsGeneratingRepo(false);
    }
  };

  return (
    <div className="container mx-auto px-4 relative z-10 max-w-4xl">
      <div className="mb-8 animate-slide-in-up">
        <h1 className="text-5xl font-bold mb-3 tracking-tight flex items-center gap-3">
          <TerminalIcon className="w-10 h-10 text-primary" />
          Developer Tools
        </h1>
        <p className="text-muted-foreground text-xl">
          Daily standup reports and AI-powered task instructions
        </p>
      </div>

      <div className="flex gap-2 mb-6 animate-slide-in-up delay-100">
        <Button 
          variant={activeTab === "standup" ? "default" : "outline"} 
          onClick={() => setActiveTab("standup")}
          className={cn("rounded-xl font-semibold", activeTab === "standup" ? "bg-primary text-primary-foreground" : "")}
        >
          <FileText className="w-4 h-4 mr-2" /> Daily Standup
        </Button>
        <Button 
          variant={activeTab === "brief" ? "default" : "outline"} 
          onClick={() => setActiveTab("brief")}
          className={cn("rounded-xl font-semibold", activeTab === "brief" ? "bg-primary text-primary-foreground" : "")}
        >
          <Bot className="w-4 h-4 mr-2" /> AI Task Brief
        </Button>
        <Button 
          variant={activeTab === "repo" ? "default" : "outline"} 
          onClick={() => setActiveTab("repo" as any)}
          className={cn("rounded-xl font-semibold", activeTab === "repo" ? "bg-primary text-primary-foreground" : "")}
        >
          <Bot className="w-4 h-4 mr-2" /> Repo Standup
        </Button>
      </div>

      <Card className="glass-card p-6 border-primary/30 animate-slide-in-up delay-200">
        {activeTab === "standup" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Today's Standup</h2>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(standupText)}>
                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy
              </Button>
            </div>
            <Textarea 
              readOnly 
              value={standupText} 
              className="font-mono min-h-[300px] bg-background/50 border-border/50"
            />
          </div>
        )}

        {activeTab === "brief" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 border-r border-border/50 pr-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                Select Tasks
              </h2>
              <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {activeTasks.length === 0 ? (
                  <p className="text-muted-foreground italic text-sm">No active tasks available.</p>
                ) : (
                  activeTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 border border-border/50 transition-colors">
                      <Checkbox 
                        id={`task-${task.id}`} 
                        checked={selectedTaskIds.has(task.id)} 
                        onCheckedChange={() => toggleTaskSelection(task.id)}
                        className="mt-1"
                      />
                      <label htmlFor={`task-${task.id}`} className="flex-1 cursor-pointer">
                        <div className="font-medium text-sm leading-tight mb-1">{task.title}</div>
                        <div className="flex gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground uppercase">{task.status.replace("_", " ")}</span>
                          {task.priority && (
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-semibold",
                              task.priority === "high" ? "bg-destructive/20 text-destructive" :
                              task.priority === "medium" ? "bg-primary/20 text-primary" :
                              "bg-accent/20 text-accent"
                            )}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>
              <Button onClick={handleGenerateBrief} disabled={isGenerating || selectedTaskIds.size === 0} className="w-full mt-4 font-semibold">
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                Generate Brief
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Generated Brief</h2>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(briefOutput)} disabled={!briefOutput}>
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy
                </Button>
              </div>
              <div className="min-h-[400px] h-full p-4 rounded-lg bg-background/50 border border-border/50 font-mono text-sm whitespace-pre-wrap overflow-y-auto">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p>AI is analyzing tasks and generating brief...</p>
                  </div>
                ) : briefOutput ? (
                  briefOutput
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground/50 italic text-center">
                    Select tasks and click generate to create a human-readable instruction brief.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === "repo" as any && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">AI Repo Standup</h2>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(repoStandupOutput)} disabled={!repoStandupOutput}>
                {copied ? <Check className="w-4 h-4 mr-2 text-green-500" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy
              </Button>
            </div>
            
            <div className="flex justify-center mb-4">
              <Button onClick={handleGenerateRepoStandup} disabled={isGeneratingRepo} className="w-full font-semibold">
                {isGeneratingRepo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Bot className="w-4 h-4 mr-2" />}
                Generate Standup from GitHub Commits
              </Button>
            </div>

            <div className="min-h-[300px] h-full p-4 rounded-lg bg-background/50 border border-border/50 font-mono text-sm whitespace-pre-wrap overflow-y-auto">
              {isGeneratingRepo ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p>AI is fetching commits and generating standup...</p>
                </div>
              ) : repoStandupOutput ? (
                repoStandupOutput
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground/50 italic text-center">
                  Click generate to connect to GitHub and summarize recent commits.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function TerminalIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  )
}
