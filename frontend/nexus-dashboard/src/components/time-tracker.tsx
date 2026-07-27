import { useEffect, useState } from "react"
import { Pause, Play, Plus } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTimeEntries } from "@/context/time-entries-context"
import { useTasks } from "@/context/tasks-context"
import { useGoals } from "@/context/goals-context"
import { formatDuration } from "@/lib/goal-progress"

const selectClass =
  "px-3 py-2 rounded-xl bg-background/30 border border-border/50 text-foreground text-sm min-h-[40px] w-full"

export function TimeTrackerWidget() {
  const { activeEntry, startTimer, stopTimer, addManualEntry } = useTimeEntries()
  const { tasks } = useTasks()
  const { activeGoals } = useGoals()

  const [description, setDescription] = useState("")
  const [taskId, setTaskId] = useState("")
  const [goalId, setGoalId] = useState("")
  const [manualMinutes, setManualMinutes] = useState("")
  const [elapsedLabel, setElapsedLabel] = useState("0m")

  useEffect(() => {
    if (!activeEntry) {
      setElapsedLabel("0m")
      return
    }
    const tick = () => {
      const mins = Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(activeEntry.startTime).getTime()) / 60000,
        ),
      )
      setElapsedLabel(formatDuration(mins))
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [activeEntry])

  const handleStart = () => {
    startTimer({
      description: description.trim() || undefined,
      taskId: taskId || undefined,
      goalId: goalId || undefined,
    })
  }

  const handleStop = () => {
    stopTimer()
  }

  const handleManual = () => {
    const mins = Number(manualMinutes)
    if (!Number.isFinite(mins) || mins <= 0) return
    addManualEntry({
      durationMinutes: mins,
      description: description.trim() || undefined,
      taskId: taskId || undefined,
      goalId: goalId || undefined,
    })
    setManualMinutes("")
  }

  const openTasks = tasks.filter((t) => !t.completed)

  return (
    <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-medium">Time Tracker</h3>
          <p className="text-xs text-muted-foreground">
            Live timer or manual entry — link Task/Goal optionally
          </p>
        </div>
        {activeEntry && (
          <div className="text-right">
            <p className="text-2xl font-medium tabular-nums text-accent leading-none">
              {elapsedLabel}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">running</p>
          </div>
        )}
      </div>

      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What are you working on?"
        className="bg-background/30 border-border/50"
        disabled={Boolean(activeEntry)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className={selectClass}
          disabled={Boolean(activeEntry)}
        >
          <option value="">No task</option>
          {openTasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <select
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          className={selectClass}
          disabled={Boolean(activeEntry)}
        >
          <option value="">No goal</option>
          {activeGoals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        {activeEntry ? (
          <Button onClick={handleStop} className="shadow-sm">
            <Pause className="w-4 h-4 mr-2" />
            Stop
          </Button>
        ) : (
          <Button onClick={handleStart} className="shadow-sm">
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        )}
      </div>

      {!activeEntry && (
        <div className="pt-2 border-t border-border/30 space-y-2">
          <p className="text-xs text-muted-foreground">Manual entry</p>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              placeholder="Minutes"
              className="bg-background/30 border-border/50 w-28"
            />
            <Button
              variant="outline"
              onClick={handleManual}
              disabled={!manualMinutes || Number(manualMinutes) <= 0}
              className="border-border/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log time
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
