import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from "react"
import { useYMap } from "@/lib/sync/useYMap"
import { levelFromXp } from "@/lib/xp"

export interface Skill {
  id: string
  name: string
  category?: string
  xp: number
  level: number
  createdAt: string
}

export interface ProofLink {
  id: string
  skillId: string
  title: string
  url: string
  addedAt: string
}

export interface GrowthProfile {
  id: "profile"
  generalXp: number
  generalLevel: number
}

interface SkillsContextValue {
  skills: Skill[]
  proofLinks: ProofLink[]
  generalXp: number
  generalLevel: number
  addSkill: (data: { name: string; category?: string }) => Skill
  updateSkill: (id: string, updates: Partial<Pick<Skill, "name" | "category">>) => void
  deleteSkill: (id: string) => void
  addProofLink: (data: { skillId: string; title: string; url: string }) => ProofLink
  deleteProofLink: (id: string) => void
  getProofsForSkill: (skillId: string) => ProofLink[]
  /** Award XP to the general pool (and optionally a linked skill). Cosmetic only. */
  awardActivityXp: (amount: number, skillId?: string | null) => void
}

const SkillsContext = createContext<SkillsContextValue | null>(null)

function isWellFormedUrl(url: string): boolean {
  try {
    const u = new URL(url.trim())
    return u.protocol === "http:" || u.protocol === "https:"
  } catch {
    return false
  }
}

export { isWellFormedUrl }

export function SkillsProvider({ children }: { children: ReactNode }) {
  const {
    state: skillsMap,
    set: setSkillInMap,
    remove: removeSkillFromMap,
  } = useYMap<Skill>("skills")

  const {
    state: proofsMap,
    set: setProofInMap,
    remove: removeProofFromMap,
  } = useYMap<ProofLink>("skill-proofs")

  const {
    state: growthMap,
    set: setGrowthInMap,
  } = useYMap<GrowthProfile>("growth-profile")

  const skills = useMemo(() => {
    return Object.values(skillsMap).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }, [skillsMap])

  const proofLinks = useMemo(() => {
    return Object.values(proofsMap).sort(
      (a, b) =>
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
    )
  }, [proofsMap])

  const profile = growthMap["profile"]
  const generalXp = profile?.generalXp ?? 0
  const generalLevel = profile?.generalLevel ?? levelFromXp(generalXp)

  const addSkill = useCallback(
    (data: { name: string; category?: string }): Skill => {
      const skill: Skill = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: data.name.trim(),
        category: data.category?.trim() || undefined,
        xp: 0,
        level: 0,
        createdAt: new Date().toISOString(),
      }
      setSkillInMap(skill.id, skill)
      return skill
    },
    [setSkillInMap],
  )

  const updateSkill = useCallback(
    (id: string, updates: Partial<Pick<Skill, "name" | "category">>) => {
      const existing = skillsMap[id]
      if (!existing) return
      setSkillInMap(id, {
        ...existing,
        ...updates,
        name: updates.name !== undefined ? updates.name.trim() : existing.name,
        category:
          updates.category !== undefined
            ? updates.category.trim() || undefined
            : existing.category,
      })
    },
    [skillsMap, setSkillInMap],
  )

  const deleteSkill = useCallback(
    (id: string) => {
      removeSkillFromMap(id)
      Object.values(proofsMap)
        .filter((p) => p.skillId === id)
        .forEach((p) => removeProofFromMap(p.id))
    },
    [removeSkillFromMap, proofsMap, removeProofFromMap],
  )

  const addProofLink = useCallback(
    (data: { skillId: string; title: string; url: string }): ProofLink => {
      const url = data.url.trim()
      if (!isWellFormedUrl(url)) {
        throw new Error("Please enter a valid http(s) URL")
      }
      if (!skillsMap[data.skillId]) {
        throw new Error("Skill not found")
      }
      const proof: ProofLink = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        skillId: data.skillId,
        title: data.title.trim() || "Proof",
        url,
        addedAt: new Date().toISOString(),
      }
      setProofInMap(proof.id, proof)
      return proof
    },
    [skillsMap, setProofInMap],
  )

  const deleteProofLink = useCallback(
    (id: string) => {
      removeProofFromMap(id)
    },
    [removeProofFromMap],
  )

  const getProofsForSkill = useCallback(
    (skillId: string) => proofLinks.filter((p) => p.skillId === skillId),
    [proofLinks],
  )

  const awardActivityXp = useCallback(
    (amount: number, skillId?: string | null) => {
      if (!amount || amount <= 0) return

      const current = growthMap["profile"] ?? {
        id: "profile" as const,
        generalXp: 0,
        generalLevel: 0,
      }
      const nextGeneralXp = current.generalXp + amount
      setGrowthInMap("profile", {
        id: "profile",
        generalXp: nextGeneralXp,
        generalLevel: levelFromXp(nextGeneralXp),
      })

      if (skillId) {
        const skill = skillsMap[skillId]
        if (skill) {
          const nextXp = skill.xp + amount
          setSkillInMap(skillId, {
            ...skill,
            xp: nextXp,
            level: levelFromXp(nextXp),
          })
        }
      }
    },
    [growthMap, setGrowthInMap, skillsMap, setSkillInMap],
  )

  return (
    <SkillsContext.Provider
      value={{
        skills,
        proofLinks,
        generalXp,
        generalLevel,
        addSkill,
        updateSkill,
        deleteSkill,
        addProofLink,
        deleteProofLink,
        getProofsForSkill,
        awardActivityXp,
      }}
    >
      {children}
    </SkillsContext.Provider>
  )
}

export function useSkills() {
  const ctx = useContext(SkillsContext)
  if (!ctx) {
    throw new Error("useSkills must be used within SkillsProvider")
  }
  return ctx
}
