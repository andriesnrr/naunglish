import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { getCEFR } from "@/lib/cefr"
import { awardActivityXP } from "@/lib/xp"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { answers, questions } = await req.json()
  // answers: Record<questionId, selectedIndex>
  // questions: Question[]

  if (!answers || !questions?.length) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 })
  }

  // Score per skill
  const breakdown: Record<string, { correct: number; total: number }> = {}
  let totalCorrect = 0

  for (const q of questions) {
    const skill = q.skill as string
    if (!breakdown[skill]) breakdown[skill] = { correct: 0, total: 0 }
    breakdown[skill].total++
    if (answers[q.id] === q.answer) {
      breakdown[skill].correct++
      totalCorrect++
    }
  }

  const totalScore = Math.round((totalCorrect / questions.length) * 100)
  const cefrBand = getCEFR(totalScore)

  const breakdownPct: Record<string, number> = {}
  for (const [skill, { correct, total }] of Object.entries(breakdown)) {
    breakdownPct[skill] = Math.round((correct / total) * 100)
  }

  const supabase = createServiceClient()

  await supabase.from("mock_results").insert({
    user_id: session.user.id,
    total_score: totalScore,
    cefr_band: cefrBand,
    breakdown: breakdownPct,
  })

  // Award XP
  await awardActivityXP(session.user.id, "mock_test_complete", createServiceClient())

  return NextResponse.json({ totalScore, cefrBand, breakdown: breakdownPct })
}
