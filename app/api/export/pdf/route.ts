import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { ProgressDocument } from "@/lib/progressPdf"
import type { DocumentProps } from "@react-pdf/renderer"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const supabase = createServiceClient()
  const userId = session.user.id

  const [
    { data: user },
    { data: scores },
    { data: mockResults },
    { data: streakRow },
    { data: xpRow },
  ] = await Promise.all([
    supabase.from("users").select("name, current_cefr, exam_date").eq("id", userId).maybeSingle(),
    supabase.from("user_scores").select("skill, score_pct").eq("user_id", userId).order("taken_at", { ascending: false }),
    supabase.from("mock_results").select("total_score, cefr_band, taken_at").eq("user_id", userId).order("taken_at", { ascending: false }).limit(5),
    supabase.from("streaks").select("current_streak, longest_streak").eq("user_id", userId).maybeSingle(),
    supabase.from("leaderboard_scores").select("xp").eq("user_id", userId).maybeSingle(),
  ])

  const latestBySkill: Record<string, number> = {}
  for (const row of scores ?? []) {
    if (!latestBySkill[row.skill]) latestBySkill[row.skill] = row.score_pct
  }

  const overallPct = Object.values(latestBySkill).length > 0
    ? Math.round(Object.values(latestBySkill).reduce((s, v) => s + v, 0) / Object.values(latestBySkill).length)
    : null

  const generatedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  const doc = React.createElement(ProgressDocument, {
    name: user?.name ?? "Student",
    currentCefr: user?.current_cefr ?? null,
    examDate: user?.exam_date ?? null,
    overallPct,
    latestBySkill,
    streak: streakRow,
    xp: xpRow?.xp ?? 0,
    mockResults: mockResults ?? [],
    generatedDate,
  }) as React.ReactElement<DocumentProps>

  const buffer = await renderToBuffer(doc)
  const uint8 = new Uint8Array(buffer)

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="naunglish-progress-${new Date().toISOString().slice(0, 10)}.pdf"`,
    },
  })
}
