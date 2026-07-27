import type { Task } from "@/context/tasks-context"

export type GoalProgress =
  | { kind: "empty"; label: string }
  | {
      kind: "ratio"
      completed: number
      total: number
      percent: number
      label: string
    }

/**
 * Derived goal progress from linked tasks — never stored on the Goal itself.
 */
export function deriveGoalProgress(
  goalId: string,
  tasks: Pick<Task, "goalId" | "completed">[],
): GoalProgress {
  const linked = tasks.filter((t) => t.goalId === goalId)
  if (linked.length === 0) {
    return { kind: "empty", label: "No linked tasks yet" }
  }
  const completed = linked.filter((t) => t.completed).length
  const total = linked.length
  const percent = Math.round((completed / total) * 100)
  return {
    kind: "ratio",
    completed,
    total,
    percent,
    label: `${completed}/${total} tasks · ${percent}%`,
  }
}

export function startOfWeek(d = new Date()): Date {
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  const dow = day.getDay() // 0 Sun
  day.setDate(day.getDate() - dow)
  return day
}

export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes))
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem ? `${h}h ${rem}m` : `${h}h`
}
