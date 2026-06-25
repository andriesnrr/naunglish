import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { getCEFR } from "@/lib/cefr"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const { answers } = await req.json() as { answers: { questionId: string; selected: number }[] }

  const supabase = createServiceClient()

  // Get questions to check answers
  const ids = answers.map(a => a.questionId)
  const { data: questions } = await supabase
    .from("questions")
    .select("id, answer")
    .in("id", ids)

  const answerMap = new Map((questions ?? []).map(q => [q.id, q.answer]))
  const correct = answers.filter(a => answerMap.get(a.questionId) === a.selected).length
  const pct = Math.round((correct / answers.length) * 100)
  const newCefr = getCEFR(pct)

  // Get previous CEFR
  const { data: userRow } = await supabase
    .from("users")
    .select("current_cefr")
    .eq("id", userId)
    .single()
  const previousCefr = userRow?.current_cefr ?? null

  // Update current_cefr (NOT starting_cefr)
  await supabase.from("users").update({ current_cefr: newCefr }).eq("id", userId)

  // Insert placement result
  await supabase.from("placement_results").insert({
    user_id: userId,
    cefr_result: newCefr,
    answers: answers,
  })

  return NextResponse.json({ newCefr, previousCefr, score: pct, correct, total: answers.length })
}
