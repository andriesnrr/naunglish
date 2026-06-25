import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { awardActivityXP } from "@/lib/xp"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { question_id, correct } = await req.json()

  if (!question_id || typeof correct !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { error } = await supabase.from("user_progress").insert({
    user_id: session.user.id,
    question_id,
    correct,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { xpAwarded, streakBonusAwarded } = await awardActivityXP(
    session.user.id,
    correct ? "question_correct" : "question_wrong",
    supabase
  )

  return NextResponse.json({ ok: true, xpAwarded, streakBonusAwarded })
}
