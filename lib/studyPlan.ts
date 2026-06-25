import type { CEFRBand, Skill } from "@/types"

const CEFR_PCT: Record<CEFRBand, number> = {
  A1: 15, A2: 35, B1: 50, B2: 65, C1: 80, C2: 90,
}

const ALL_SKILLS: Skill[] = ["grammar", "vocab", "reading", "listening", "speaking", "writing"]

type SkillScores = Partial<Record<Skill, number>>

export type StudyPlanTargets = {
  dailyQuestions: number
  dailyFlashcards: number
  skillPriority: { skill: Skill; questionsPerDay: number; priority: "high" | "medium" | "low" }[]
  weeklyWritingSessions: number
  weeklyMockTests: number
  daysUntilExam: number | null
  intensity: "light" | "moderate" | "intensive"
}

export function generateStudyPlan(
  currentCEFR: CEFRBand,
  examDate: string | null,
  skillScores: SkillScores
): StudyPlanTargets {
  const today = new Date()
  const daysUntilExam = examDate
    ? Math.max(1, Math.floor((new Date(examDate).getTime() - today.getTime()) / 86_400_000))
    : null

  const intensity: StudyPlanTargets["intensity"] =
    daysUntilExam === null ? "moderate"
    : daysUntilExam > 60 ? "light"
    : daysUntilExam > 21 ? "moderate"
    : "intensive"

  const baseQPerDay = intensity === "light" ? 15 : intensity === "moderate" ? 25 : 40
  const dailyFlashcards = intensity === "light" ? 8 : intensity === "moderate" ? 12 : 20
  const weeklyWritingSessions = intensity === "light" ? 1 : intensity === "moderate" ? 2 : 3
  const weeklyMockTests = intensity === "light" ? 0 : intensity === "moderate" ? 1 : 2

  const targetPct = 80 // aim for C1

  // Gap per skill: target - current. Skills not yet attempted get full gap.
  const currentBase = CEFR_PCT[currentCEFR]
  const gaps: Record<Skill, number> = {} as Record<Skill, number>

  for (const skill of ALL_SKILLS) {
    const current = skillScores[skill] ?? currentBase
    gaps[skill] = Math.max(0, targetPct - current)
  }

  const totalGap = Object.values(gaps).reduce((s, g) => s + g, 0) || 1

  // Distribute daily questions proportional to gap; minimum 2 per skill
  const skillPriority = ALL_SKILLS.map((skill) => {
    const share = gaps[skill] / totalGap
    const questionsPerDay = Math.max(2, Math.round(baseQPerDay * share))
    const priority: "high" | "medium" | "low" =
      gaps[skill] >= 25 ? "high" : gaps[skill] >= 10 ? "medium" : "low"
    return { skill, questionsPerDay, priority }
  }).sort((a, b) => b.questionsPerDay - a.questionsPerDay)

  const dailyQuestions = skillPriority.reduce((s, sp) => s + sp.questionsPerDay, 0)

  return {
    dailyQuestions,
    dailyFlashcards,
    skillPriority,
    weeklyWritingSessions,
    weeklyMockTests,
    daysUntilExam,
    intensity,
  }
}
