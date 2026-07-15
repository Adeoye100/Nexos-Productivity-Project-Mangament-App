import { TaskManager } from "@/components/task-manager"
import { Navigation } from "@/components/navigation"
import { BackgroundManager } from "@/components/background-manager"

export default function TasksPage() {
  return (
    <main className="min-h-screen">
      <BackgroundManager />
      <Navigation />
      <div className="pt-24 pb-12">
        <TaskManager />
      </div>
    </main>
  )
}
