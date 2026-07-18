
import { useState, useMemo, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Github, RefreshCw, GitCommit } from "lucide-react"
import { cn } from "@/lib/utils"
import { getGitHubConfig, fetchGitHubCommits, GitHubCommit } from "@/lib/github"

// ── Date helpers ──────────────────────────────────────────────────────────────
const toDs = (d: Date) => d.toISOString().split("T")[0]

function todayDate() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

// ── Grid builder ──────────────────────────────────────────────────────────────
interface GridCell {
  date: Date | null
  ds: string | null
}

const CELL = 11   // px
const GAP = 3    // px
const STRIDE = CELL + GAP

function buildGrid() {
  const today = todayDate()
  const start = new Date(today)
  start.setDate(start.getDate() - 52 * 7)
  start.setDate(start.getDate() - start.getDay()) // walk to Sunday

  const cells: GridCell[] = []
  const d = new Date(start)
  while (d <= today) {
    cells.push({ date: new Date(d), ds: toDs(new Date(d)) })
    d.setDate(d.getDate() + 1)
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, ds: null })

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

export function GitHubActivity() {
  const [commits, setCommits] = useState<GitHubCommit[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const config = getGitHubConfig()

  const fetchCommits = useCallback(async () => {
    if (!config) return
    setIsLoading(true)
    try {
      const data = await fetchGitHubCommits(config.token, config.repo)
      setCommits(data)
      localStorage.setItem("github_commits_cache", JSON.stringify(data))
    } catch (e) {
      console.error("Failed to fetch GitHub commits", e)
    } finally {
      setIsLoading(false)
    }
  }, [config?.token, config?.repo])

  useEffect(() => {
    const cached = localStorage.getItem("github_commits_cache")
    if (cached) {
      try {
        setCommits(JSON.parse(cached))
      } catch (e) {
        console.error("Failed to parse cached commits", e)
      }
    }
    setLoaded(true)
  }, [])

  const commitMap = useMemo(() => {
    const map = new Map<string, number>()
    commits.forEach(c => {
      const ds = toDs(new Date(c.commit.author.date))
      map.set(ds, (map.get(ds) || 0) + 1)
    })
    return map
  }, [commits])

  const { cells, weeks, months } = useMemo(() => buildGrid(), [])

  if (!config) return null

  return (
    <Card className="glass-card p-6 animate-slide-in-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <Github className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">GitHub Activity</h2>
            <p className="text-sm text-muted-foreground">{config.repo}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCommits}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      <div className="relative overflow-x-auto pb-2 scrollbar-hide">
        <div 
          className="flex flex-col relative"
          style={{ width: weeks * STRIDE, height: 7 * STRIDE + 20 }}
        >
          {/* Month labels */}
          <div className="h-5 relative mb-1">
            {months.map((m, i) => (
              <span
                key={i}
                className="absolute text-[9px] text-muted-foreground font-medium"
                style={{ left: m.col * STRIDE }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap flex-col h-[98px] content-start gap-[3px]">
            {cells.map((c, i) => {
              const count = c.ds ? commitMap.get(c.ds) || 0 : 0
              const intensity = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4
              
              return (
                <div
                  key={i}
                  className={cn(
                    "w-[11px] h-[11px] rounded-[2px] transition-all duration-300",
                    !c.ds ? "bg-transparent" :
                    intensity === 0 ? "bg-foreground/5 hover:bg-foreground/10" :
                    intensity === 1 ? "bg-emerald-500/30 hover:bg-emerald-500/50" :
                    intensity === 2 ? "bg-emerald-500/50 hover:bg-emerald-500/70" :
                    intensity === 3 ? "bg-emerald-500/70 hover:bg-emerald-500/90" :
                    "bg-emerald-500 hover:bg-emerald-400"
                  )}
                  title={c.ds ? `${c.ds}: ${count} commits` : ""}
                />
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-muted-foreground" />
          Recent Activity
        </h3>
        <div className="space-y-2">
          {commits.slice(0, 5).map(c => (
            <div key={c.sha} className="text-xs p-2 rounded-lg bg-foreground/5 border border-border/50">
              <p className="font-medium line-clamp-1">{c.commit.message}</p>
              <p className="text-muted-foreground mt-1">
                {new Date(c.commit.author.date).toLocaleDateString()} by {c.commit.author.name}
              </p>
            </div>
          ))}
          {commits.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No recent activity found. Click refresh to sync.</p>
          )}
        </div>
      </div>
    </Card>
  )
}
