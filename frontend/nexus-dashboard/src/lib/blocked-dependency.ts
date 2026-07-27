import {
  checkPRStatus,
  formatGitHubRefShort,
  type GitHubRefStatus,
} from "@/lib/github"
import type { Task } from "@/context/tasks-context"
import type { NotificationType } from "@/context/notifications-context"

export interface UnblockDeps {
  updateTask: (id: string, updates: Partial<Task>) => void
  addNotification: (n: {
    type: NotificationType
    title: string
    message: string
  }) => void
}

export interface CheckAndUnblockResult {
  status: GitHubRefStatus
  unblocked: boolean
}

/**
 * Core unblock logic — independent of how the check was triggered
 * (manual button, 5-minute poll, or a future webhook handler).
 * Only clears blockedByRef when the linked PR/issue is merged or closed.
 */
export async function checkAndUnblockTask(
  task: Pick<Task, "id" | "title" | "blockedByRef">,
  deps: UnblockDeps,
): Promise<CheckAndUnblockResult> {
  const ref = task.blockedByRef?.trim()
  if (!ref) {
    return { status: "open", unblocked: false }
  }

  const status = await checkPRStatus(ref)

  if (status === "open") {
    return { status, unblocked: false }
  }

  deps.updateTask(task.id, { blockedByRef: undefined })

  const short = formatGitHubRefShort(ref)
  const verb = status === "merged" ? "merged" : "closed"
  deps.addNotification({
    type: "task_unblocked",
    title: `Task unblocked: ${short} was ${verb}`,
    message: `"${task.title}" is no longer blocked by ${short}.`,
  })

  return { status, unblocked: true }
}
