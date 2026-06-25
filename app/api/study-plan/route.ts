import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { generateStudyPlan } from "@/lib/studyPlan"
import type { CEFRBand, Skill } from "@/types"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServiceClient()
  const { data } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle()

  return NextResponse.json(data ?? null)
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServiceClient()
  const userId = session.user.id

  const [{ data: user }, { data: scores }] = await Promise.all([
    supabase.from("users").select("current_cefr, exam_date").eq("id", userId).maybeSingle(),
    supabase
      .from("user_scores")
      .select("skill, score_pct")
      .eq("user_id", userId)
      .order("taken_at", { ascending: false }),
  ])

  const currentCEFR = (user?.current_cefr ?? "B1") as CEFRBand
  const examDate = user?.exam_date ?? null

  // Latest score per skill
  const skillScores: Partial<Record<Skill, number>> = {}
  for (const row of scores ?? []) {
    if (!skillScores[row.skill as Skill]) {
      skillScores[row.skill as Skill] = row.score_pct
    }
  }

  const plan = generateStudyPlan(currentCEFR, examDate, skillScores)

  const { data: saved } = await supabase
    .from("study_plans")
    .upsert(
      { user_id: userId, exam_date: examDate, daily_targets: plan },
      { onConflict: "user_id" }
    )
    .select()
    .single()

  return NextResponse.json(saved)
}
