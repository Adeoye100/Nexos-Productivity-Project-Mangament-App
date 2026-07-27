import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from "react"
import { useYMap } from "@/lib/sync/useYMap"

export type GoalStatus = "active" | "completed" | "abandoned"

export interface Goal {
  id: string
  title: string
  description?: string
  targetDate?: string
  category?: string
  status: GoalStatus
  createdAt: string
}

interface GoalsContextValue {
  goals: Goal[]
  activeGoals: Goal[]
  addGoal: (
    data: Omit<Goal, "id" | "createdAt" | "status"> & { status?: GoalStatus },
  ) => Goal
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
}

const GoalsContext = createContext<GoalsContextValue | null>(null)

export function GoalsProvider({ children }: { children: ReactNode }) {
  const {
    state: goalsMap,
    set: setGoalInMap,
    remove: removeGoalFromMap,
  } = useYMap<Goal>("goals")

  const goals = useMemo(() => {
    return Object.values(goalsMap).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [goalsMap])

  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "active"),
    [goals],
  )

  const addGoal = useCallback(
    (
      data: Omit<Goal, "id" | "createdAt" | "status"> & { status?: GoalStatus },
    ): Goal => {
      const goal: Goal = {
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        targetDate: data.targetDate || undefined,
        category: data.category?.trim() || undefined,
        status: data.status ?? "active",
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
      }
      setGoalInMap(goal.id, goal)
      return goal
    },
    [setGoalInMap],
  )

  const updateGoal = useCallback(
    (id: string, updates: Partial<Goal>) => {
      const existing = goalsMap[id]
      if (!existing) return
      setGoalInMap(id, { ...existing, ...updates })
    },
    [goalsMap, setGoalInMap],
  )

  const deleteGoal = useCallback(
    (id: string) => {
      removeGoalFromMap(id)
    },
    [removeGoalFromMap],
  )

  return (
    <GoalsContext.Provider
      value={{ goals, activeGoals, addGoal, updateGoal, deleteGoal }}
    >
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals() {
  const ctx = useContext(GoalsContext)
  if (!ctx) {
    throw new Error("useGoals must be used within GoalsProvider")
  }
  return ctx
}
