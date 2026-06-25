import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { getCEFR } from "@/lib/cefr"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, examDate, answers, questions } = await req.json()
  // answers: Record<questionId, selectedIndex>
  // questions: Question[]

  const supabase = createServiceClient()
  const userId = session.user.id

  let cefrResult = "B1" // default if no questions
  if (questions?.length > 0 && answers) {
    const correct = questions.filter((q: { id: string; answer: number }) => answers[q.id] === q.answer).length
    const pct = Math.round((correct / questions.length) * 100)
    cefrResult = getCEFR(pct)
  }

  // Save placement result
  await supabase.from("placement_results").insert({
    user_id: userId,
    cefr_result: cefrResult,
    answers: answers ?? {},
  })

  // Update user profile
  await supabase.from("users").upsert({
    id: userId,
    name: name ?? session.user.name ?? null,
    email: session.user.email ?? "",
    starting_cefr: cefrResult,
    current_cefr: cefrResult,
    exam_date: examDate ?? null,
  })

  // Initialise streak row
  await supabase.from("streaks").upsert({ user_id: userId }, { onConflict: "user_id" })

  // Initialise XP row
  await supabase.from("leaderboard_scores").upsert({ user_id: userId }, { onConflict: "user_id" })

  return NextResponse.json({ cefrResult })
}
