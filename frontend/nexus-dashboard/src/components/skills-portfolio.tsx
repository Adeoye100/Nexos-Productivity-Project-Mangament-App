import { useMemo, useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Plus,
  Sprout,
  Trash2,
  Link2,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSkills, type Skill } from "@/context/skills-context"
import { xpProgress } from "@/lib/xp"
import { cn } from "@/lib/utils"
import DeleteButton from "@/components/ui/delete-button"

export function SkillsPortfolio() {
  const {
    skills,
    generalXp,
    generalLevel,
    addSkill,
    deleteSkill,
    addProofLink,
    deleteProofLink,
    getProofsForSkill,
  } = useSkills()

  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [proofSkillId, setProofSkillId] = useState<string | null>(null)
  const [proofTitle, setProofTitle] = useState("")
  const [proofUrl, setProofUrl] = useState("")
  const [proofError, setProofError] = useState("")

  const general = useMemo(() => xpProgress(generalXp), [generalXp])

  const resetAdd = () => {
    setName("")
    setCategory("")
    setAddOpen(false)
  }

  const handleAddSkill = () => {
    if (!name.trim()) return
    const skill = addSkill({
      name: name.trim(),
      category: category.trim() || undefined,
    })
    resetAdd()
    setExpandedId(skill.id)
  }

  const openProofDialog = (skillId: string) => {
    setProofSkillId(skillId)
    setProofTitle("")
    setProofUrl("")
    setProofError("")
  }

  const handleAddProof = () => {
    if (!proofSkillId) return
    try {
      addProofLink({
        skillId: proofSkillId,
        title: proofTitle.trim() || "Proof",
        url: proofUrl.trim(),
      })
      setProofSkillId(null)
      setProofError("")
    } catch (err) {
      setProofError(err instanceof Error ? err.message : "Invalid URL")
    }
  }

  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight mb-2">
            Skills Portfolio
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Track growth with cosmetic XP — nothing here gates features.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0 shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
            <Sprout className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Overall growth</p>
            <p className="text-2xl font-medium leading-none">
              Level {generalLevel}
              <span className="text-sm text-muted-foreground font-normal ml-2">
                {generalXp} XP
              </span>
            </p>
          </div>
        </div>
        <Progress value={general.ratio * 100} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {general.remaining} XP to level {general.level + 1}
          <span className="opacity-70"> · level = ⌊√(xp / 50)⌋</span>
        </p>
      </Card>

      {skills.length === 0 ? (
        <Card className="border-none shadow-md bg-background/30 backdrop-blur-sm p-10 text-center">
          <Sprout className="w-10 h-10 mx-auto text-muted-foreground mb-3 opacity-60" />
          <p className="text-muted-foreground mb-4">
            No skills yet. Add something you&apos;re actively growing.
          </p>
          <Button variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add your first skill
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              expanded={expandedId === skill.id}
              onToggle={() =>
                setExpandedId((id) => (id === skill.id ? null : skill.id))
              }
              proofs={getProofsForSkill(skill.id)}
              onAddProof={() => openProofDialog(skill.id)}
              onDeleteProof={deleteProofLink}
              onDeleteSkill={() => deleteSkill(skill.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={(o) => (o ? setAddOpen(true) : resetAdd())}>
        <DialogContent className="sm:max-w-md bg-background border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle className="font-medium">Add Skill</DialogTitle>
            <DialogDescription>
              Name a skill you&apos;re growing. Category is optional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React, Public Speaking"
              className="bg-background/30 border-border/50"
              onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
              autoFocus
            />
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="bg-background/30 border-border/50"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={resetAdd}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill} disabled={!name.trim()}>
              Add Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={proofSkillId !== null}
        onOpenChange={(o) => !o && setProofSkillId(null)}
      >
        <DialogContent className="sm:max-w-md bg-background border-border/50 shadow-lg">
          <DialogHeader>
            <DialogTitle className="font-medium">Add proof link</DialogTitle>
            <DialogDescription>
              External URL only — certificate page, image host, or document link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              value={proofTitle}
              onChange={(e) => setProofTitle(e.target.value)}
              placeholder="Title"
              className="bg-background/30 border-border/50"
            />
            <Input
              value={proofUrl}
              onChange={(e) => {
                setProofUrl(e.target.value)
                setProofError("")
              }}
              placeholder="https://…"
              className={cn(
                "bg-background/30 border-border/50",
                proofError && "border-destructive/60",
              )}
            />
            {proofError && (
              <p className="text-xs text-destructive">{proofError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setProofSkillId(null)}>
              Cancel
            </Button>
            <Button onClick={handleAddProof} disabled={!proofUrl.trim()}>
              Save link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SkillCard({
  skill,
  expanded,
  onToggle,
  proofs,
  onAddProof,
  onDeleteProof,
  onDeleteSkill,
}: {
  skill: Skill
  expanded: boolean
  onToggle: () => void
  proofs: { id: string; title: string; url: string }[]
  onAddProof: () => void
  onDeleteProof: (id: string) => void
  onDeleteSkill: () => void
}) {
  const progress = xpProgress(skill.xp)

  return (
    <Card className="border-none shadow-md bg-background/40 backdrop-blur-sm overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 flex items-start gap-3 hover:bg-foreground/[0.03] transition-colors"
      >
        <div className="mt-1 text-muted-foreground">
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-lg font-medium truncate">{skill.name}</h2>
            {skill.category && (
              <Badge
                variant="secondary"
                className="text-[10px] font-normal h-5 px-1.5"
              >
                {skill.category}
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-medium text-accent leading-none">
              {skill.level}
            </span>
            <span className="text-xs text-muted-foreground">
              level · {skill.xp} XP
            </span>
          </div>
          <Progress value={progress.ratio * 100} className="h-1.5" />
          <p className="text-[11px] text-muted-foreground mt-1.5">
            {progress.remaining} XP to next level
          </p>
        </div>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-border/30 ml-7 sm:ml-8">
          <div className="flex items-center justify-between gap-2 mt-3 mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Proof links
            </p>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[10px] border-border/50"
                onClick={onAddProof}
              >
                <Link2 className="w-3 h-3 mr-1" />
                Add proof
              </Button>
              <DeleteButton onClick={onDeleteSkill} />
            </div>
          </div>

          {proofs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              No proof yet — link a cert, image, or doc when you have one.
            </p>
          ) : (
            <ul className="space-y-2">
              {proofs.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl bg-background/30 px-3 py-2 shadow-sm"
                >
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0 flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                  >
                    <span className="truncate font-medium">{p.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onDeleteProof(p.id)}
                    aria-label="Remove proof"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  )
}
