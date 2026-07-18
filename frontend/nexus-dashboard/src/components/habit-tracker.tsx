import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { useVimNavigation } from "@/hooks/use-vim-navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Flame, Trophy, Plus, Trash2, Lock, Unlock, Bell, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHabits } from "@/context/habits-context"
import { useNotifications } from "@/context/notifications-context"

// ── Date helpers ──────────────────────────────────────────────────────────────
const toDs = (d: Date) => d.toISOString().split("T")[0]

function todayDate() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function fmtFull(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ── Grid builder ──────────────────────────────────────────────────────────────
interface GridCell {
  date: Date | null
  ds: string | null
}

const CELL   = 11   // px
const GAP    = 3    // px
const STRIDE = CELL + GAP

function buildGrid() {
  const today = todayDate()

  // Sunday of the week 52 weeks ago
  const start = new Date(today)
  start.setDate(start.getDate() - 52 * 7)
  start.setDate(start.getDate() - start.getDay()) // walk to Sunday

  const cells: GridCell[] = []
  const d = new Date(start)
  while (d <= today) {
    cells.push({ date: new Date(d), ds: toDs(new Date(d)) })
    d.setDate(d.getDate() + 1)
  }
  // Pad to full week
  while (cells.length % 7 !== 0) cells.push({ date: null, ds: null })

  // Month labels: first cell of each calendar month
  const months: { label: string; col: number }[] = []
  let lastMonth = -1
  cells.forEach((c, i) => {
    if (!c.date) return
    const col = Math.floor(i / 7)
    const m = c.date.getMonth()
    if (m !== lastMonth) {
      months.push({ label: c.date.toLocaleDateString("en-US", { month: "short" }), col })
      lastMonth = m
    }
  })

  return { cells, weeks: cells.length / 7, months }
}

// ── Intensity level (0-4) ─────────────────────────────────────────────────────
function intensityLevel(completed: number, total: number): 0 | 1 | 2 | 3 | 4 {
  if (total === 0 || completed === 0) return 0
  const r = completed / total
  if (r <= 0.25) return 1
  if (r <= 0.5)  return 2
  if (r <= 0.75) return 3
  return 4
}

// ── Streak calculation ────────────────────────────────────────────────────────
function calcStreaks(dates: Set<string>) {
  if (dates.size === 0) return { current: 0, longest: 0 }

  const today = todayDate()
  const todS  = toDs(today)
  const checkFrom = dates.has(todS)
    ? today
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)

  // Current streak: walk backward
  let cur = 0
  const cd = new Date(checkFrom)
  while (dates.has(toDs(cd))) {
    cur++
    cd.setDate(cd.getDate() - 1)
  }

  // Longest streak: scan sorted
  const sorted = [...dates].sort()
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000
    )
    if (diff === 1) { run++; if (run > longest) longest = run }
    else run = 1
  }

  return { current: cur, longest: Math.max(longest, cur) }
}

// ── Tooltip state ─────────────────────────────────────────────────────────────
interface TipState {
  vx: number   // viewport x
  vy: number   // viewport y
  dateLabel: string
  detail: string
}

// ── Component ─────────────────────────────────────────────────────────────────
export function HabitTracker() {
  const { habits, entries, addHabit, deleteHabit, toggleEntry, getEntryForDate, updateHabit } = useHabits()
  const { addNotification } = useNotifications()

  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [editMode,    setEditMode]    = useState(false)
  const [tooltip,     setTooltip]     = useState<TipState | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName,     setNewName]     = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newFreq,     setNewFreq]     = useState<"daily" | "weekly" | "custom">("daily")
  const [newColor,    setNewColor]    = useState("")
  const [newReminder, setNewReminder] = useState("")

  // ── Grid (static) ───────────────────────────────────────────────────────────
  const grid = useMemo(() => buildGrid(), [])

  // ── Per-habit date sets ─────────────────────────────────────────────────────
  const perHabitDateSets = useMemo(() => {
    const map = new Map<string, Set<string>>()
    habits.forEach(h => map.set(h.id, new Set()))
    entries.forEach(e => {
      if (!map.has(e.habitId)) map.set(e.habitId, new Set())
      map.get(e.habitId)!.add(e.date)
    })
    return map
  }, [habits, entries])

  // ── All-habits completion map (date → {count, names}) ──────────────────────
  const completionMap = useMemo(() => {
    const map = new Map<string, { count: number; names: string[] }>()
    habits.forEach(h => {
      const dates = perHabitDateSets.get(h.id) ?? new Set<string>()
      dates.forEach(date => {
        if (!map.has(date)) map.set(date, { count: 0, names: [] })
        const d = map.get(date)!
        d.count++
        d.names.push(h.name)
      })
    })
    return map
  }, [habits, perHabitDateSets])

  // ── Streaks ─────────────────────────────────────────────────────────────────
  const overallStreak = useMemo(() => {
    const allDates = new Set<string>()
    entries.forEach(e => allDates.add(e.date))
    return calcStreaks(allDates)
  }, [entries])

  const perHabitStreaks = useMemo(() => {
    const map = new Map<string, { current: number; longest: number }>()
    habits.forEach(h => map.set(h.id, calcStreaks(perHabitDateSets.get(h.id) ?? new Set())))
    return map
  }, [habits, perHabitDateSets])

  const displayStreak = selectedHabitId
    ? (perHabitStreaks.get(selectedHabitId) ?? { current: 0, longest: 0 })
    : overallStreak

  // ── Cell intensity getter ───────────────────────────────────────────────────
  const getLevel = useCallback((ds: string): 0 | 1 | 2 | 3 | 4 => {
    if (selectedHabitId) {
      return perHabitDateSets.get(selectedHabitId)?.has(ds) ? 4 : 0
    }
    const data = completionMap.get(ds)
    if (!data) return 0
    // If we have habits, calculate ratio, otherwise 0
    const totalHabits = habits.length || 1
    return intensityLevel(data.count, totalHabits)
  }, [selectedHabitId, perHabitDateSets, completionMap, habits.length])

  // ── Cell interaction ─────────────────────────────────────────────────────────
  const handleCellClick = useCallback((cell: GridCell) => {
    if (!cell.date || !cell.ds || !editMode || !selectedHabitId) return
    if (cell.date >= todayDate()) return // only past cells in edit mode
    toggleEntry(selectedHabitId, cell.ds)
  }, [editMode, selectedHabitId, toggleEntry])

  const handleCellHover = useCallback((e: React.MouseEvent<HTMLDivElement>, cell: GridCell) => {
    if (!cell.date || !cell.ds) return
    const rect = e.currentTarget.getBoundingClientRect()

    let detail: string
    if (selectedHabitId) {
      const done = perHabitDateSets.get(selectedHabitId)?.has(cell.ds)
      detail = done ? "✓ Completed" : "Not completed"
    } else {
      const data = completionMap.get(cell.ds)
      if (data && data.count > 0) {
        detail = `${data.count}/${habits.length} completed: ${data.names.join(", ")}`
      } else {
        detail = habits.length === 0 ? "No habits yet" : "None completed"
      }
    }

    setTooltip({ vx: rect.left + rect.width / 2, vy: rect.top, dateLabel: fmtFull(cell.date), detail })
  }, [selectedHabitId, perHabitDateSets, completionMap, habits])

  // ── Add habit ────────────────────────────────────────────────────────────────
  const handleAddHabit = () => {
    if (!newName.trim()) return
    addHabit({
      name: newName.trim(),
      category: newCategory.trim() || undefined,
      targetFrequency: newFreq,
      color: newColor.trim() || undefined,
      reminderAt: newReminder || undefined
    })
    setNewName(""); setNewCategory(""); setNewFreq("daily"); setNewColor(""); setNewReminder(""); setShowAddForm(false)
  }

  // Habit Notification Checker
  useEffect(() => {
    const check = () => {
      const now = new Date()
      const todayDs = toDs(now)
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0')

      habits.forEach(habit => {
        if (habit.reminderAt && habit.notifiedToday !== todayDs) {
          // Check if habit is already completed today
          const isCompletedToday = entries.some(e => e.habitId === habit.id && e.date === todayDs && e.completed)
          if (isCompletedToday) return

          if (currentTime >= habit.reminderAt) {
            addNotification({
              type: "task_due", 
              title: `Habit reminder: ${habit.name}`,
              message: `Time to complete your habit: ${habit.name}`,
            })
            updateHabit(habit.id, { notifiedToday: todayDs })
          }
        }
      })
    }

    const interval = setInterval(check, 60000) // Check every minute
    check() // Initial check
    return () => clearInterval(interval)
  }, [habits, entries, addNotification, updateHabit])

  const today      = toDs(todayDate())
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })

  const addHabitInputRef = useRef<HTMLInputElement>(null)

  const { selectedIndex, setSelectedIndex } = useVimNavigation({
    items: habits,
    onEnter: (habit) => {
      setSelectedHabitId(habit.id)
      setEditMode(false)
    },
    onSpace: (habit) => toggleEntry(habit.id, today),
    onSlash: () => {
      setShowAddForm(true)
      setTimeout(() => addHabitInputRef.current?.focus(), 0)
    },
    onEscape: () => {
      setShowAddForm(false)
      setSelectedHabitId(null)
    },
    enabled: !showAddForm
  })

  return (
    <div className="relative min-h-screen pt-24 pb-28 md:pb-12">

      {/* ── Fixed viewport tooltip ─────────────────────────────────────────── */}
      {tooltip && (
        <div
          className="fixed z-[200] pointer-events-none px-3 py-2 rounded-xl text-xs shadow-xl border border-border/50 bg-popover text-popover-foreground max-w-xs"
          style={{ left: tooltip.vx, top: tooltip.vy - 10, transform: "translate(-50%, -100%)" }}
        >
          <div className="font-semibold mb-0.5">{tooltip.dateLabel}</div>
          <div className="text-muted-foreground">{tooltip.detail}</div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-5xl">

        {/* ── Header + streak cards ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 animate-slide-in-up">
          <div>
            <h1 className="text-5xl font-bold mb-3 tracking-tight">Habit Tracker</h1>
            <p className="text-muted-foreground text-xl">Build lasting streaks, one day at a time</p>
          </div>
          <div className="flex gap-3">
            <Card className="glass-card px-5 py-3 flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold leading-none">{displayStreak.current}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">day streak</p>
              </div>
            </Card>
            <Card className="glass-card px-5 py-3 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold leading-none">{displayStreak.longest}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">best streak</p>
              </div>
            </Card>
          </div>
        </div>

        {/* ── Heatmap card ─────────────────────────────────────────────────── */}
        <Card className="glass-card p-6 mb-6 animate-slide-in-up delay-100">
          {/* View selector + edit toggle */}
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setSelectedHabitId(null); setEditMode(false) }}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  selectedHabitId === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/10 text-muted-foreground hover:text-foreground"
                )}
              >
                All Habits
              </button>
              {habits.map(h => (
                <button
                  key={h.id}
                  onClick={() => { setSelectedHabitId(h.id); setEditMode(false) }}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    selectedHabitId === h.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-foreground/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {h.name}
                </button>
              ))}
            </div>

            {/* Edit-past toggle — only relevant in per-habit view */}
            {selectedHabitId && (
              <button
                onClick={() => setEditMode(v => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  editMode
                    ? "bg-primary/15 text-primary"
                    : "bg-foreground/10 text-muted-foreground hover:text-foreground"
                )}
              >
                {editMode
                  ? <><Unlock className="w-3 h-3" /> Editing history</>
                  : <><Lock   className="w-3 h-3" /> Edit history</>
                }
              </button>
            )}
          </div>

          {/* Scrollable heatmap */}
          <div className="overflow-x-auto pb-1 -mx-1 px-1">
            <div className="inline-block">
              {/* Month labels */}
              <div className="relative h-5" style={{ marginLeft: 28 }}>
                {grid.months.map(({ label, col }) => (
                  <span
                    key={`${label}-${col}`}
                    className="absolute text-[10px] text-muted-foreground select-none"
                    style={{ left: col * STRIDE }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Day labels + cell grid */}
              <div className="flex" style={{ gap: 8 }}>
                {/* Day-of-week labels: show Mon / Wed / Fri */}
                <div
                  className="flex flex-col text-[10px] text-muted-foreground select-none"
                  style={{ width: 20, gap: GAP }}
                >
                  {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
                    <div key={i} style={{ height: CELL, lineHeight: `${CELL}px` }}>{label}</div>
                  ))}
                </div>

                {/* Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: `repeat(7, ${CELL}px)`,
                    gridAutoFlow: "column",
                    gridAutoColumns: `${CELL}px`,
                    gap: `${GAP}px`,
                  }}
                >
                  {grid.cells.map((cell, i) => {
                    const level      = cell.ds ? getLevel(cell.ds) : 0
                    const isTod      = cell.ds === today
                    const isPast     = cell.date !== null && cell.date < todayDate()
                    const canEdit    = editMode && !!selectedHabitId && isPast

                    return (
                      <div
                        key={cell.ds ?? `pad-${i}`}
                        className={cn(
                          "rounded-sm transition-transform",
                          cell.date && "hover:scale-[1.4] hover:z-10",
                          isTod      && "ring-1 ring-primary",
                          canEdit    && "cursor-pointer"
                        )}
                        style={{
                          width:           CELL,
                          height:          CELL,
                          backgroundColor: cell.date 
                            ? (selectedHabitId && habits.find(h => h.id === selectedHabitId)?.color && level > 0
                                ? habits.find(h => h.id === selectedHabitId)!.color 
                                : `var(--hm-${level})`)
                            : "transparent",
                          opacity: (selectedHabitId && level > 0) ? 0.8 : 1
                        }}
                        onMouseEnter={cell.date ? e => handleCellHover(e, cell) : undefined}
                        onMouseLeave={cell.date ? () => setTooltip(null) : undefined}
                        onClick={cell.date ? () => handleCellClick(cell) : undefined}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div
                className="flex items-center gap-2 mt-4 text-[10px] text-muted-foreground select-none"
                style={{ marginLeft: 28 }}
              >
                <span>Less</span>
                {([0, 1, 2, 3, 4] as const).map(l => (
                  <div
                    key={l}
                    className="rounded-sm"
                    style={{ width: CELL, height: CELL, backgroundColor: `var(--hm-${l})` }}
                  />
                ))}
                <span>More</span>
              </div>
            </div>
          </div>

          {/* Per-habit edit mode hint */}
          {editMode && selectedHabitId && (
            <p className="text-[11px] text-muted-foreground mt-3">
              Click any past square to toggle this habit's completion for that day.
            </p>
          )}
        </Card>

        {/* ── Today + Habit list ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Today's check-off */}
          <Card className="glass-card p-6 animate-slide-in-up delay-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Today</h2>
              <span className="text-xs text-muted-foreground">{todayLabel}</span>
            </div>

            {habits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No habits yet — add one to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {habits.map((h, index) => {
                  const done = !!getEntryForDate(h.id, today)
                  return (
                    <div
                      key={h.id}
                      className={cn(
                        "flex items-center gap-3 p-1 rounded-lg transition-colors",
                        selectedIndex === index && "bg-primary/5 ring-1 ring-primary/20 border-l-4 border-l-primary"
                      )}
                      onClick={() => setSelectedIndex(index)}
                    >
                      <Checkbox
                        id={`chk-${h.id}`}
                        checked={done}
                        onCheckedChange={() => toggleEntry(h.id, today)}
                        style={{
                          backgroundColor: done && h.color ? h.color : undefined,
                          borderColor: h.color ? h.color : undefined
                        }}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={`chk-${h.id}`}
                        className={cn(
                          "flex-1 text-sm font-medium cursor-pointer select-none transition-colors",
                          done ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {h.name}
                      </label>
                      {h.category && (
                        <span className="text-[10px] text-muted-foreground bg-foreground/10 px-2 py-0.5 rounded-full shrink-0">
                          {h.category}
                        </span>
                      )}
                    </div>
                  )
                })}

                <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  {habits.filter(h => !!getEntryForDate(h.id, today)).length} of {habits.length} completed today
                </div>
              </div>
            )}
          </Card>

          {/* Active habits + add form */}
          <Card className="glass-card p-6 animate-slide-in-up delay-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Active Habits</h2>
              <button
                onClick={() => setShowAddForm(v => !v)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  showAddForm
                    ? "bg-foreground/10 text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddForm ? "Cancel" : "Add Habit"}
              </button>
            </div>

            {showAddForm && (
              <div className="mb-5 p-4 rounded-xl bg-foreground/5 border border-border/50 space-y-3">
                <Input
                  ref={addHabitInputRef}
                  placeholder="Habit name (e.g. Morning Run)"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAddHabit()}
                  className="bg-background/50 border-border"
                  autoFocus
                />
                <Input
                  placeholder="Category (optional)"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="bg-background/50 border-border"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Color hex (e.g. #06b6d4)"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="bg-background/50 border-border flex-1"
                  />
                  <div
                    className="w-10 h-10 rounded-lg border border-border shrink-0"
                    style={{ backgroundColor: newColor || 'transparent' }}
                  />
                </div>
                <div className="flex gap-2">
                  {(["daily", "weekly", "custom"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setNewFreq(f)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                        newFreq === f
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-background/50 border border-border rounded-lg px-3 flex-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={newReminder}
                      onChange={e => setNewReminder(e.target.value)}
                      className="border-none bg-transparent focus-visible:ring-0 h-9 text-xs"
                      title="Reminder time"
                    />
                  </div>
                </div>
                <Button
                  className="w-full rounded-lg"
                  disabled={!newName.trim()}
                  onClick={handleAddHabit}
                >
                  Add Habit
                </Button>
              </div>
            )}

            {habits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No habits yet.</p>
            ) : (
              <div className="space-y-1">
                {habits.map(h => {
                  const streak = perHabitStreaks.get(h.id) ?? { current: 0, longest: 0 }
                  return (
                    <div
                      key={h.id}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-foreground/5 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {h.color && (
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: h.color }} />
                          )}
                          <p className="text-sm font-medium truncate">{h.name}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {h.category && (
                            <span className="text-[10px] text-muted-foreground">{h.category}</span>
                          )}
                          <span className="flex items-center gap-0.5 text-[10px] text-orange-400">
                            <Flame className="w-3 h-3" />{streak.current}d
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-yellow-400">
                            <Trophy className="w-3 h-3" />{streak.longest}d best
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHabit(h.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label={`Delete ${h.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
