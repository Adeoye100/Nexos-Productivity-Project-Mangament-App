import { useEffect, useMemo, useRef } from "react"
import { useTasks } from "@/context/tasks-context"
import { useNotifications } from "@/context/notifications-context"
import { checkAndUnblockTask } from "@/lib/blocked-dependency"

/** 5 minutes — keep GitHub PAT rate limits happy */
export const BLOCKED_DEPENDENCY_POLL_MS = 5 * 60 * 1000

/**
 * While the app is open and at least one task has blockedByRef,
 * poll GitHub and auto-unblock when the linked PR/issue is merged/closed.
 * No interval is scheduled when nothing is blocked.
 */
export function useBlockedDependencyPolling() {
  const { tasks, updateTask } = useTasks()
  const { addNotification } = useNotifications()
  const inFlight = useRef(false)

  const tasksRef = useRef(tasks)
  const updateTaskRef = useRef(updateTask)
  const addNotificationRef = useRef(addNotification)
  tasksRef.current = tasks
  updateTaskRef.current = updateTask
  addNotificationRef.current = addNotification

  const blockedKey = useMemo(
    () =>
      tasks
        .filter((t) => Boolean(t.blockedByRef?.trim()))
        .map((t) => `${t.id}:${t.blockedByRef}`)
        .sort()
        .join("|"),
    [tasks],
  )

  useEffect(() => {
    if (!blockedKey) return

    const run = async () => {
      if (inFlight.current) return
      inFlight.current = true
      try {
        const blocked = tasksRef.current.filter((t) =>
          Boolean(t.blockedByRef?.trim()),
        )
        for (const task of blocked) {
          try {
            await checkAndUnblockTask(task, {
              updateTask: updateTaskRef.current,
              addNotification: addNotificationRef.current,
            })
          } catch (err) {
            console.error("[blocked-dependency] poll check failed:", err)
          }
        }
      } finally {
        inFlight.current = false
      }
    }

    // Initial check shortly after a block appears, then on the interval
    const initial = window.setTimeout(() => {
      void run()
    }, 2_000)

    const interval = window.setInterval(() => {
      void run()
    }, BLOCKED_DEPENDENCY_POLL_MS)

    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [blockedKey])
}
