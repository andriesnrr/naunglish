import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { getCEFR } from "@/lib/cefr"
import SkillCard from "@/components/SkillCard"
import type { Skill } from "@/types"

const SKILLS: Skill[] = ["grammar", "vocab", "reading", "listening", "speaking", "writing"]

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const userId = session.user.id

  // Redirect to onboarding if not yet completed
  const { data: userProfile } = await supabase
    .from("users")
    .select("starting_cefr")
    .eq("id", userId)
    .maybeSingle()
  if (!userProfile?.starting_cefr) redirect("/onboarding")

  // Fetch best score per skill
  const { data: scores } = await supabase
    .from("user_scores")
    .select("skill, score_pct, cefr_band")
    .eq("user_id", userId)
    .order("score_pct", { ascending: false })

  // Build skill → best score map
  const skillMap = new Map<string, { score: number; cefr: string }>()
  for (const row of scores ?? []) {
    if (!skillMap.has(row.skill)) {
      skillMap.set(row.skill, { score: row.score_pct, cefr: row.cefr_band })
    }
  }

  // Overall avg
  const allScores = Array.from(skillMap.values()).map((v) => v.score)
  const avgScore =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : null
  const overallCEFR = avgScore !== null ? getCEFR(avgScore) : null

  // Streak
  const { data: streakRow } = await supabase
    .from("streaks")
    .select("current_streak, last_active")
    .eq("user_id", userId)
    .single()

  const streak = streakRow?.current_streak ?? 0

  // Daily goal
  const { data: settingsRow } = await supabase
    .from("user_settings")
    .select("daily_goal")
    .eq("user_id", userId)
    .single()

  const dailyGoal = settingsRow?.daily_goal ?? 20

  // Questions answered today
  const today = new Date().toISOString().split("T")[0]
  const { count: todayCount } = await supabase
    .from("user_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("answered_at", `${today}T00:00:00`)

  const goalProgress = Math.min(((todayCount ?? 0) / dailyGoal) * 100, 100)

  // Study plan
  const { data: planRow } = await supabase
    .from("study_plans")
    .select("daily_targets")
    .eq("user_id", userId)
    .single()

  const dailyTargets: string[] = planRow?.daily_targets ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Stat card */}
      <div
        className="rounded-xl p-5 flex flex-col gap-2"
        style={{ backgroundColor: "#051f1f" }}
      >
        <span
          className="text-label-caps"
          style={{ color: "#6f8988" }}
        >
          OVERALL PROGRESS
        </span>
        <div className="flex items-end gap-3">
          <span
            className="text-display-lg text-white"
          >
            {avgScore !== null ? `${avgScore}%` : "—"}
          </span>
          {overallCEFR && (
            <span
              className="text-2xl font-bold mb-1"
              style={{ color: "#d4af37", fontFamily: "JetBrains Mono, monospace" }}
            >
              {overallCEFR}
            </span>
          )}
        </div>
        <p className="text-sm" style={{ color: "#6f8988", fontFamily: "Source Serif 4, serif" }}>
          {avgScore !== null
            ? "Keep pushing — C1 is within reach."
            : "Complete your first practice to see your score."}
        </p>
      </div>

      {/* Streak bar */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#d4af37]" style={{ fontSize: "20px" }}>
              local_fire_department
            </span>
            <span className="text-body-md font-semibold" style={{ color: "#161d1d" }}>
              {streak} day streak
            </span>
          </div>
          <span
            className="text-xs"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}
          >
            {todayCount ?? 0}/{dailyGoal} today
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-[#e8efef] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${goalProgress}%`, backgroundColor: "#d4af37" }}
          />
        </div>
      </div>

      {/* Skill grid */}
      <div>
        <h2 className="text-headline-md mb-3" style={{ color: "#161d1d" }}>
          Skills
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SKILLS.map((skill) => {
            const data = skillMap.get(skill)
            return (
              <SkillCard
                key={skill}
                skill={skill}
                bestScore={data?.score ?? null}
                cefrBand={data?.cefr ?? null}
              />
            )
          })}
        </div>
      </div>

      {/* Today's Study Plan */}
      {dailyTargets.length > 0 && (
        <div className="card p-4 flex flex-col gap-3">
          <h2 className="text-headline-md" style={{ color: "#161d1d" }}>
            Today&apos;s Plan
          </h2>
          <ul className="flex flex-col gap-2">
            {dailyTargets.map((target, i) => (
              <li key={i} className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[#727878]"
                  style={{ fontSize: "18px" }}
                >
                  radio_button_unchecked
                </span>
                <span className="text-body-md" style={{ color: "#414848" }}>
                  {target}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Flashcards ghost button */}
      <Link
        href="/flashcards"
        className="self-center px-6 py-3 rounded-xl border border-[#c1c8c7] text-body-md text-[#161d1d] hover:bg-[#e8efef] transition-colors no-underline flex items-center gap-2"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
          style
        </span>
        Study Flashcards
      </Link>
    </div>
  )
}
