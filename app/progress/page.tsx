import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { getCEFR } from "@/lib/cefr"
import ScoreRing from "@/components/ScoreRing"
import ExportPDFButton from "@/components/ExportPDFButton"
import { SKILL_COLORS } from "@/types"
import type { Skill, CEFRBand } from "@/types"

const CEFR_COLOR: Record<CEFRBand, string> = {
  C2: "#3f51b5",
  C1: "#266a4b",
  B2: "#4a5d4e",
  B1: "#8e5d44",
  A2: "#d4af37",
  A1: "#727878",
}

export default async function ProgressPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const userId = session.user.id

  // Parallel fetch all data
  const [
    { data: streakRow },
    { data: xpRow },
    { data: skillScores },
    { data: mockResults },
    { data: recentProgress },
    { data: userRow },
  ] = await Promise.all([
    supabase.from("streaks").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("leaderboard_scores").select("xp, weekly_xp").eq("user_id", userId).maybeSingle(),
    supabase
      .from("user_scores")
      .select("skill, score_pct, cefr_band, taken_at")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false }),
    supabase
      .from("mock_results")
      .select("*")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false })
      .limit(5),
    supabase
      .from("user_progress")
      .select("correct, answered_at")
      .eq("user_id", userId)
      .gte("answered_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("users").select("current_cefr, starting_cefr, exam_date").eq("id", userId).maybeSingle(),
  ])

  const streak = streakRow ?? { current_streak: 0, longest_streak: 0 }
  const xp = xpRow?.xp ?? 0
  const weeklyXp = xpRow?.weekly_xp ?? 0

  // Latest score per skill
  const latestBySkill: Record<string, { score_pct: number; cefr_band: string }> = {}
  for (const row of skillScores ?? []) {
    if (!latestBySkill[row.skill]) {
      latestBySkill[row.skill] = { score_pct: row.score_pct, cefr_band: row.cefr_band }
    }
  }

  // Activity: questions per day for last 7 days
  const today = new Date()
  const last7: { label: string; count: number }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const label = d.toLocaleDateString("en-GB", { weekday: "short" })
    const dateStr = d.toISOString().slice(0, 10)
    const count = (recentProgress ?? []).filter(
      (p) => p.answered_at?.slice(0, 10) === dateStr
    ).length
    return { label, count }
  })

  const maxDay = Math.max(...last7.map((d) => d.count), 1)
  const totalAnswered = (recentProgress ?? []).length
  const totalCorrect = (recentProgress ?? []).filter((p) => p.correct).length
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0
  const overallPct = Object.values(latestBySkill).length > 0
    ? Math.round(Object.values(latestBySkill).reduce((s, v) => s + v.score_pct, 0) / Object.values(latestBySkill).length)
    : 0

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-label-caps" style={{ color: "#051f1f" }}>PROGRESS</span>
          <h1 className="text-headline-md mt-1" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>
            Your Progress
          </h1>
        </div>
        <ExportPDFButton />
      </div>
      {userRow?.exam_date && (
        <p className="text-body-md" style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}>
          Exam: {new Date(userRow.exam_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "STREAK", value: `${streak.current_streak}d`, sub: `best ${streak.longest_streak}d` },
          { label: "XP TOTAL", value: xp.toLocaleString(), sub: `+${weeklyXp} this week` },
          { label: "ACCURACY", value: `${accuracy}%`, sub: `${totalAnswered} q (30d)` },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-4 flex flex-col gap-1 text-center">
            <span className="text-label-caps" style={{ color: "#727878" }}>{label}</span>
            <span className="text-headline-sm font-bold" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>
              {value}
            </span>
            <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>
              {sub}
            </span>
          </div>
        ))}
      </div>

      {/* Overall CEFR */}
      {overallPct > 0 && (
        <div className="card p-6 flex items-center gap-6">
          <ScoreRing pct={overallPct} size={100} />
          <div>
            <span className="text-label-caps" style={{ color: "#727878" }}>CURRENT LEVEL</span>
            <p
              className="text-display-lg font-bold mt-1"
              style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
            >
              {getCEFR(overallPct)}
            </p>
            {userRow?.starting_cefr && userRow.starting_cefr !== getCEFR(overallPct) && (
              <p className="text-sm mt-1" style={{ color: "#4a5d4e", fontFamily: "Source Serif 4, serif" }}>
                Started at {userRow.starting_cefr}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Skill breakdown */}
      {Object.keys(latestBySkill).length > 0 && (
        <div className="card p-5 flex flex-col gap-4">
          <span className="text-label-caps" style={{ color: "#727878" }}>SKILLS</span>
          {(Object.keys(SKILL_COLORS) as Skill[]).map((skill) => {
            const data = latestBySkill[skill]
            if (!data) return null
            const meta = SKILL_COLORS[skill]
            const band = data.cefr_band as CEFRBand
            return (
              <div key={skill} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}>
                    {meta.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-bold"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        backgroundColor: `${CEFR_COLOR[band]}20`,
                        color: CEFR_COLOR[band],
                      }}
                    >
                      {band}
                    </span>
                    <span className="text-xs font-bold" style={{ fontFamily: "JetBrains Mono, monospace", color: meta.accent }}>
                      {data.score_pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#e8efef] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${data.score_pct}%`, backgroundColor: meta.accent }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 7-day activity chart */}
      <div className="card p-5 flex flex-col gap-4">
        <span className="text-label-caps" style={{ color: "#727878" }}>ACTIVITY (7 DAYS)</span>
        <div className="flex items-end gap-2 h-24">
          {last7.map(({ label, count }) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${Math.max(4, (count / maxDay) * 80)}px`,
                  backgroundColor: count > 0 ? "#051f1f" : "#e8efef",
                }}
              />
              <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mock test history */}
      {(mockResults?.length ?? 0) > 0 && (
        <div className="card p-5 flex flex-col gap-3">
          <span className="text-label-caps" style={{ color: "#727878" }}>MOCK TEST HISTORY</span>
          {mockResults!.map((r) => {
            const band = r.cefr_band as CEFRBand
            return (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-[#e8efef] last:border-0">
                <div>
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: "Source Serif 4, serif", color: "#161d1d" }}
                  >
                    {r.total_score}%
                  </span>
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      backgroundColor: `${CEFR_COLOR[band] ?? "#727878"}20`,
                      color: CEFR_COLOR[band] ?? "#727878",
                    }}
                  >
                    {band}
                  </span>
                </div>
                <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>
                  {new Date(r.taken_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
