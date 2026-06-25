import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"

// Called by Vercel Cron every Monday 00:00 UTC
// Set CRON_SECRET in env and configure vercel.json
export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from("leaderboard_scores")
    .update({ weekly_xp: 0, updated_at: new Date().toISOString() })
    .neq("user_id", "00000000-0000-0000-0000-000000000000") // update all rows

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, reset_at: new Date().toISOString() })
}
