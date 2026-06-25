import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { skill, score_pct, cefr_band } = body

  if (!skill || typeof score_pct !== "number" || !cefr_band) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from("user_scores").insert({
    user_id: session.user.id,
    skill,
    score_pct,
    cefr_band,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update current_cefr on users table
  await supabase
    .from("users")
    .update({ current_cefr: cefr_band })
    .eq("id", session.user.id)

  return NextResponse.json({ ok: true })
}
