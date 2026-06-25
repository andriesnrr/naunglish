import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { generateStudyPlan } from "@/lib/studyPlan"
import { SKILL_COLORS } from "@/types"
import type { CEFRBand, Skill } from "@/types"
import type { StudyPlanTargets } from "@/lib/studyPlan"
import StudyPlanRefresh from "./StudyPlanRefresh"

const INTENSITY_COLOR = {
  light:     { bg: "#e8efef", color: "#4a5d4e" },
  moderate:  { bg: "#fdf3ec", color: "#8e5d44" },
  intensive: { bg: "#fde8ec", color: "#be123c" },
}

const PRIORITY_COLOR = {
  high:   "#be123c",
  medium: "#8e5d44",
  low:    "#4a5d4e",
}

export default async function StudyPlanPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const userId = session.user.id

  const [{ data: user }, { data: scores }, { data: savedPlan }] = await Promise.all([
    supabase.from("users").select("current_cefr, exam_date").eq("id", userId).maybeSingle(),
    supabase
      .from("user_scores")
      .select("skill, score_pct")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false }),
    supabase.from("study_plans").select("*").eq("user_id", userId).maybeSingle(),
  ])

  const currentCEFR = (user?.current_cefr ?? "B1") as CEFRBand
  const examDate = user?.exam_date ?? null

  const skillScores: Partial<Record<Skill, number>> = {}
  for (const row of scores ?? []) {
    if (!skillScores[row.skill as Skill]) skillScores[row.skill as Skill] = row.score_pct
  }

  // Use saved plan or generate fresh
  const plan: StudyPlanTargets = savedPlan?.daily_targets ?? generateStudyPlan(currentCEFR, examDate, skillScores)
  const i = plan.intensity
  const ic = INTENSITY_COLOR[i]

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-label-caps" style={{ color: "#051f1f" }}>STUDY PLAN</span>
          <h1 className="text-headline-md mt-1" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>
            Your Daily Plan
          </h1>
        </div>
        <StudyPlanRefresh />
      </div>

      {/* Intensity badge + exam countdown */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="px-3 py-1 rounded-full text-sm font-bold uppercase"
          style={{ fontFamily: "JetBrains Mono, monospace", backgroundColor: ic.bg, color: ic.color }}
        >
          {i}
        </span>
        {plan.daysUntilExam !== null && (
          <span className="text-sm" style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}>
            {plan.daysUntilExam} days until exam
          </span>
        )}
        <span
          className="px-2 py-0.5 rounded text-xs"
          style={{ fontFamily: "JetBrains Mono, monospace", backgroundColor: "#e8efef", color: "#727878" }}
        >
          STARTING {currentCEFR} → TARGET C1
        </span>
      </div>

      {/* Daily summary cards */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "QUESTIONS / DAY", value: plan.dailyQuestions, icon: "quiz" },
          { label: "FLASHCARDS / DAY", value: plan.dailyFlashcards, icon: "style" },
          { label: "WRITING / WEEK", value: plan.weeklyWritingSessions, icon: "edit" },
          { label: "MOCK TESTS / WEEK", value: plan.weeklyMockTests, icon: "assignment" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-4 flex flex-col gap-2">
            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "#c1c8c7" }}>{icon}</span>
            <span className="text-headline-sm font-bold" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>
              {value}
            </span>
            <span className="text-label-caps" style={{ color: "#727878" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Skill priorities */}
      <div className="card p-5 flex flex-col gap-4">
        <span className="text-label-caps" style={{ color: "#727878" }}>SKILL FOCUS</span>
        {plan.skillPriority.map(({ skill, questionsPerDay, priority }) => {
          const meta = SKILL_COLORS[skill]
          return (
            <div key={skill} className="flex items-center gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}>
                    {meta.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold uppercase"
                      style={{ fontFamily: "JetBrains Mono, monospace", color: PRIORITY_COLOR[priority] }}
                    >
                      {priority}
                    </span>
                    <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: meta.accent }}>
                      {questionsPerDay}q/day
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#e8efef] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(100, (questionsPerDay / plan.dailyQuestions) * 100 * 2)}%`, backgroundColor: meta.accent }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommended daily schedule */}
      <div className="card p-5 flex flex-col gap-3">
        <span className="text-label-caps" style={{ color: "#727878" }}>SUGGESTED DAILY SCHEDULE</span>
        {[
          { time: "Morning", task: `${plan.skillPriority[0]?.questionsPerDay ?? 0} ${plan.skillPriority[0]?.skill} questions`, icon: "wb_sunny" },
          { time: "Afternoon", task: `${plan.dailyFlashcards} flashcard review`, icon: "style" },
          { time: "Evening", task: `${plan.skillPriority[1]?.questionsPerDay ?? 0} ${plan.skillPriority[1]?.skill} questions`, icon: "nights_stay" },
        ].map(({ time, task, icon }) => (
          <div key={time} className="flex items-center gap-3 py-1">
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#c1c8c7" }}>{icon}</span>
            <div>
              <span className="text-xs font-bold" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>{time}</span>
              <p className="text-sm" style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}>{task}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
