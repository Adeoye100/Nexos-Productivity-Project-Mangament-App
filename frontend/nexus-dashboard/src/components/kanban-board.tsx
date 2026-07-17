import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTasks, Task, TaskStatus } from "@/context/tasks-context"
import { TaskCard } from "./task-card"
import { cn } from "@/lib/utils"

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "not_started", title: "Not Started" },
  { id: "in_progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
]

export function KanbanBoard() {
  const { tasks, updateTask } = useTasks()
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const tasksByStatus = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id)
      return acc
    }, {} as Record<TaskStatus, Task[]>)
  }, [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t) => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveTask = active.data.current?.type === "Task"
    const isOverColumn = over.data.current?.type === "Column"

    if (isActiveTask && isOverColumn) {
      const activeTask = tasks.find((t) => t.id === activeId)
      if (activeTask && activeTask.status !== overId) {
        updateTask(activeId as string, { status: overId as TaskStatus })
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeId = active.id
    const overId = over.id

    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // If dropped over a column header or area
    if (COLUMNS.find(c => c.id === overId)) {
        if (activeTask.status !== overId) {
            updateTask(activeId as string, { status: overId as TaskStatus })
        }
        return
    }

    // If dropped over another task
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask && activeTask.status !== overTask.status) {
      updateTask(activeId as string, { status: overTask.status })
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-250px)] min-h-[500px] overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={tasksByStatus[col.id]}
          />
        ))}

        <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
                styles: {
                    active: {
                        opacity: "0.5",
                    },
                },
            }),
        }}>
          {activeTask ? (
            <div className="w-[300px] rotate-3 scale-105 transition-transform">
              <TaskCard task={activeTask} variant="board" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function BoardColumn({
  column,
  tasks,
}: {
  column: { id: TaskStatus; title: string }
  tasks: Task[]
}) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks])

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] bg-black/20 dark:bg-black/40 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {column.title}
          </h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
            {tasks.length}
          </span>
        </div>
        <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            column.id === "not_started" ? "bg-zinc-400" :
            column.id === "in_progress" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
            "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
        )} />
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {/* Drop zone for empty column */}
        <div 
            className="h-20" 
            data-type="Column" 
            data-id={column.id}
        />
      </div>
    </div>
  )
}

function SortableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 rounded-xl border-2 border-dashed border-accent h-[100px] w-full"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard task={task} variant="board" />
    </div>
  )
}
