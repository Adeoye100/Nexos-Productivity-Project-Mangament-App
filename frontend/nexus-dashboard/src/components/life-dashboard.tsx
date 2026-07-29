import { useMemo, useState, useEffect } from "react"
import { Link } from "wouter"
import {
  Flame,
  Target,
  Sprout,
  Clock,
  Plus,
  ArrowRight,
  Trophy,
  Sparkles,
  RefreshCw,
  Calendar,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useGoals } from "@/context/goals-context"
import { useTasks } from "@/context/tasks-context"
import { useHabits } from "@/context/habits-context"
import { useSkills } from "@/context/skills-context"
import { useTimeEntries } from "@/context/time-entries-context"
import { calcHabitStreaks, toDateString, startOfToday } from "@/lib/habit-streak"
import {
  deriveGoalProgress,
  formatDuration,
  startOfWeek,
} from "@/lib/goal-progress"
import { xpProgress } from "@/lib/xp"
import { TimeTrackerWidget } from "@/components/time-tracker"
import { generateDigest } from "@/lib/insights-digest"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useYMap } from "@/lib/sync/useYMap"
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"

interface AIInsight {
  content: string;
  timestamp: string;
}

export function LifeDashboard() {
  const { goals, activeGoals, addGoal, updateGoal } = useGoals()
  const { tasks } = useTasks()
  const { habits, entries: habitEntries } = useHabits()
  const { skills, generalXp, generalLevel } = useSkills()
  const { entries: timeEntries } = useTimeEntries()

  const { state: insightsMap, set: setInsight } = useYMap<AIInsight>("ai-insights")
  const latestInsight = insightsMap["latest"] || null
  const [isGenerating, setIsGenerating] = useState(false)

  const [goalOpen, setGoalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [category, setCategory] = useState("")

  const handleGenerateInsights = async () => {
    setIsGenerating(true)
    try {
      const digest = generateDigest(tasks, habits, habitEntries, timeEntries, goals)
      const response = await fetch("/api/insights/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ digest }),
      })
      if (!response.ok) throw new Error("Failed to generate insights")
      const data = await response.json()
      setInsight("latest", {
        content: data.message,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const habitSummary = useMemo(() => {
    const allDates = new Set<string>()
    habitEntries.forEach((e) => allDates.add(e.date))
    const overall = calcHabitStreaks(allDates)

    const today = toDateString(startOfToday())
    const doneToday = habits.filter((h) =>
      habitEntries.some((e) => e.habitId === h.id && e.date === today),
    ).length

    return {
      current: overall.current,
      longest: overall.longest,
      doneToday,
      totalHabits: habits.length,
    }
  }, [habits, habitEntries])

  const topSkills = useMemo(() => {
    return [...skills]
      .sort((a, b) => b.level - a.level || b.xp - a.xp)
      .slice(0, 4)
  }, [skills])

  const weekTime = useMemo(() => {
    const weekStartStr = toDateString(startOfWeek())
    const weekEntries = timeEntries.filter((e) => {
      if (!e.durationMinutes || !e.endTime) return false
      return e.date >= weekStartStr
    })

    const total = weekEntries.reduce(
      (sum, e) => sum + (e.durationMinutes ?? 0),
      0,
    )

    const byGoal = new Map<string, number>()
    let unlinked = 0
    for (const e of weekEntries) {
      const mins = e.durationMinutes ?? 0
      if (e.goalId) {
        byGoal.set(e.goalId, (byGoal.get(e.goalId) ?? 0) + mins)
      } else {
        unlinked += mins
      }
    }

    return { total, byGoal, unlinked }
  }, [timeEntries])

  const handleAddGoal = () => {
    if (!title.trim()) return
    addGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate || undefined,
      category: category.trim() || undefined,
    })
    setTitle("")
    setDescription("")
    setTargetDate("")
    setCategory("")
    setGoalOpen(false)
  }

  const general = xpProgress(generalXp)

  return (
    <div className="container mx-auto px-4 max-w-5xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-2">
            Life Dashboard
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Goals, habits, growth, and time — one view over your existing data.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setGoalOpen(true)} className="shrink-0 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* AI Insights Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              AI Insights
            </h2>
          </div>
          {latestInsight && (
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground">
                Last updated: {formatDistanceToNow(new Date(latestInsight.timestamp), { addSuffix: true })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px]"
                onClick={handleGenerateInsights}
                disabled={isGenerating}
              >
                <RefreshCw className={cn("w-3 h-3 mr-1", isGenerating && "animate-spin")} />
                Refresh
              </Button>
            </div>
          )}
        </div>

        {!latestInsight ? (
          <Card className="border-none shadow-md bg-background/30 backdrop-blur-sm p-8 text-center">
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Get an AI-powered summary of your recent productivity patterns based on your tasks, habits, and time logs.
            </p>
            <Button 
              onClick={handleGenerateInsights} 
              disabled={isGenerating}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate Insights
            </Button>
          </Card>
        ) : (
          <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm p-6 overflow-hidden">
            <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed max-w-none text-foreground">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {latestInsight.content}
              </ReactMarkdown>
            </div>
          </Card>
        )}
      </section>

      {/* Active Goals */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Active Goals
          </h2>
        </div>

        {activeGoals.length === 0 ? (
          <Card className="border-none shadow-md bg-background/30 backdrop-blur-sm p-8 text-center">
            <p className="text-muted-foreground mb-3">
              No active goals yet. Create one, then link tasks from the Tasks page.
            </p>
            <Button variant="outline" onClick={() => setGoalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create a goal
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeGoals.map((goal) => {
              const progress = deriveGoalProgress(goal.id, tasks)
              return (
                <Card
                  key={goal.id}
                  className="border-none shadow-md bg-background/40 backdrop-blur-sm p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[10px] shrink-0"
                      onClick={() =>
                        updateGoal(goal.id, { status: "completed" })
                      }
                    >
                      Complete
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {goal.category && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-normal h-5"
                      >
                        {goal.category}
                      </Badge>
                    )}
                    {goal.targetDate && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal h-5 border-border/50"
                      >
                        Target {new Date(goal.targetDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  {progress.kind === "empty" ? (
                    <p className="text-xs text-muted-foreground italic">
                      {progress.label}
                    </p>
                  ) : (
                    <>
                      <Progress value={progress.percent} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        {progress.label}
                      </p>
                    </>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habits summary */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Habits
              </h2>
            </div>
            <Link
              href="/habits"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              Open tracker <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm p-4 sm:p-5">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-orange-400 mb-1">
                  <Flame className="w-4 h-4" />
                </div>
                <p className="text-2xl font-medium leading-none">
                  {habitSummary.current}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  day streak
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-yellow-400 mb-1">
                  <Trophy className="w-4 h-4" />
                </div>
                <p className="text-2xl font-medium leading-none">
                  {habitSummary.longest}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  best streak
                </p>
              </div>
              <div>
                <p className="text-2xl font-medium leading-none">
                  {habitSummary.doneToday}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{habitSummary.totalHabits}
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  done today
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Learning & Growth — from skills-context */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Learning & Growth
              </h2>
            </div>
            <Link
              href="/skills"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              Full portfolio <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm p-4 sm:p-5 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Overall</span>
              <span className="text-xl font-medium">Lv {generalLevel}</span>
              <span className="text-xs text-muted-foreground">
                {generalXp} XP · {general.remaining} to next
              </span>
            </div>
            {topSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No skills yet — add some on the Skills page.
              </p>
            ) : (
              <ul className="space-y-2">
                {topSkills.map((s) => {
                  const p = xpProgress(s.xp)
                  return (
                    <li key={s.id}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {s.name}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          Lv {s.level}
                        </span>
                      </div>
                      <Progress value={p.ratio * 100} className="h-1" />
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </section>
      </div>

      {/* Time */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            This Week&apos;s Time
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TimeTrackerWidget />

          <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm p-4 sm:p-5">
            <p className="text-3xl font-medium tabular-nums mb-1">
              {formatDuration(weekTime.total)}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              tracked this week
            </p>

            {weekTime.total === 0 ? (
              <p className="text-sm text-muted-foreground">
                Start the timer or log minutes to seed your week.
              </p>
            ) : (
              <ul className="space-y-2">
                {[...weekTime.byGoal.entries()].map(([gid, mins]) => {
                  const goal = goals.find((g) => g.id === gid)
                  return (
                    <li
                      key={gid}
                      className="flex justify-between text-sm gap-2"
                    >
                      <span className="truncate text-muted-foreground">
                        {goal?.title ?? "Goal"}
                      </span>
                      <span className="tabular-nums shrink-0">
                        {formatDuration(mins)}
                      </span>
                    </li>
                  )
                })}
                {weekTime.unlinked > 0 && (
                  <li className="flex justify-between text-sm gap-2">
                    <span className="text-muted-foreground">Unlinked</span>
                    <span className="tabular-nums">
                      {formatDuration(weekTime.unlinked)}
                    </span>
                  </li>
                )}
              </ul>
            )}
          </Card>
        </div>
      </section>

      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent className="sm:max-w-md bg-background border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle className="font-medium">New Goal</DialogTitle>
            <DialogDescription>
              Progress is derived from linked tasks — link them from the Tasks page.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title"
              className="bg-background/30 border-border/50"
              autoFocus
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="bg-background/30 border-border/50"
            />
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="bg-background/30 border-border/50"
            />
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-background/30 border-border/50"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal} disabled={!title.trim()}>
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
