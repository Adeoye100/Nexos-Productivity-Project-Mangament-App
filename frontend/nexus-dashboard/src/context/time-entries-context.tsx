import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from "react"
import { useYMap } from "@/lib/sync/useYMap"
import { toDateString } from "@/lib/habit-streak"

export interface TimeEntry {
  id: string
  taskId?: string
  goalId?: string
  description?: string
  startTime: string
  endTime?: string
  durationMinutes?: number
  date: string
}

interface TimeEntriesContextValue {
  entries: TimeEntry[]
  /** Currently running live timer, if any */
  activeEntry: TimeEntry | null
  startTimer: (opts?: {
    taskId?: string
    goalId?: string
    description?: string
  }) => TimeEntry
  stopTimer: () => TimeEntry | null
  addManualEntry: (data: {
    durationMinutes: number
    date?: string
    taskId?: string
    goalId?: string
    description?: string
  }) => TimeEntry
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteEntry: (id: string) => void
}

const TimeEntriesContext = createContext<TimeEntriesContextValue | null>(null)

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function TimeEntriesProvider({ children }: { children: ReactNode }) {
  const {
    state: entriesMap,
    set: setEntryInMap,
    remove: removeEntryFromMap,
  } = useYMap<TimeEntry>("time-entries")

  const entries = useMemo(() => {
    return Object.values(entriesMap).sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    )
  }, [entriesMap])

  const activeEntry = useMemo(
    () => entries.find((e) => !e.endTime) ?? null,
    [entries],
  )

  const startTimer = useCallback(
    (opts?: {
      taskId?: string
      goalId?: string
      description?: string
    }): TimeEntry => {
      // Stop any existing open timer first (single active session)
      const open = Object.values(entriesMap).find((e) => !e.endTime)
      if (open) {
        const end = new Date()
        const durationMinutes = Math.max(
          1,
          Math.round(
            (end.getTime() - new Date(open.startTime).getTime()) / 60000,
          ),
        )
        setEntryInMap(open.id, {
          ...open,
          endTime: end.toISOString(),
          durationMinutes,
        })
      }

      const now = new Date()
      const entry: TimeEntry = {
        id: newId(),
        taskId: opts?.taskId || undefined,
        goalId: opts?.goalId || undefined,
        description: opts?.description?.trim() || undefined,
        startTime: now.toISOString(),
        date: toDateString(now),
      }
      setEntryInMap(entry.id, entry)
      return entry
    },
    [entriesMap, setEntryInMap],
  )

  const stopTimer = useCallback((): TimeEntry | null => {
    const open = Object.values(entriesMap).find((e) => !e.endTime)
    if (!open) return null
    const end = new Date()
    const durationMinutes = Math.max(
      1,
      Math.round((end.getTime() - new Date(open.startTime).getTime()) / 60000),
    )
    const updated: TimeEntry = {
      ...open,
      endTime: end.toISOString(),
      durationMinutes,
    }
    setEntryInMap(open.id, updated)
    return updated
  }, [entriesMap, setEntryInMap])

  const addManualEntry = useCallback(
    (data: {
      durationMinutes: number
      date?: string
      taskId?: string
      goalId?: string
      description?: string
    }): TimeEntry => {
      const minutes = Math.max(1, Math.round(data.durationMinutes))
      const date = data.date || toDateString(new Date())
      const end = new Date(`${date}T12:00:00`)
      const start = new Date(end.getTime() - minutes * 60000)
      const entry: TimeEntry = {
        id: newId(),
        taskId: data.taskId || undefined,
        goalId: data.goalId || undefined,
        description: data.description?.trim() || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        durationMinutes: minutes,
        date,
      }
      setEntryInMap(entry.id, entry)
      return entry
    },
    [setEntryInMap],
  )

  const updateEntry = useCallback(
    (id: string, updates: Partial<TimeEntry>) => {
      const existing = entriesMap[id]
      if (!existing) return
      setEntryInMap(id, { ...existing, ...updates })
    },
    [entriesMap, setEntryInMap],
  )

  const deleteEntry = useCallback(
    (id: string) => {
      removeEntryFromMap(id)
    },
    [removeEntryFromMap],
  )

  return (
    <TimeEntriesContext.Provider
      value={{
        entries,
        activeEntry,
        startTimer,
        stopTimer,
        addManualEntry,
        updateEntry,
        deleteEntry,
      }}
    >
      {children}
    </TimeEntriesContext.Provider>
  )
}

export function useTimeEntries() {
  const ctx = useContext(TimeEntriesContext)
  if (!ctx) {
    throw new Error("useTimeEntries must be used within TimeEntriesProvider")
  }
  return ctx
}
