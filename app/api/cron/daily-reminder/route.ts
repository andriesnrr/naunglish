import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase"
import { sendDailyReminder } from "@/lib/email"

// Vercel Cron: daily at 08:00 UTC (15:00 WIB)
export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = new Date().toISOString().split("T")[0]

  // Users who haven't been active today
  // Join users with streaks; include those with no streak row
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      name,
      exam_date,
      streaks(current_streak, last_active)
    `)
    .not("email", "is", null)
    .not("starting_cefr", "is", null) // only onboarded users

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const toNotify = (users ?? []).filter((u) => {
    const streak = (u.streaks as { current_streak: number; last_active: string | null }[] | null)?.[0]
    return !streak || streak.last_active !== today
  })

  const results = await Promise.allSettled(
    toNotify.map((u) => {
      const streak = (u.streaks as { current_streak: number; last_active: string | null }[] | null)?.[0]
      const daysUntilExam = u.exam_date
        ? Math.max(0, Math.floor((new Date(u.exam_date).getTime() - Date.now()) / 86_400_000))
        : null

      return sendDailyReminder({
        to: u.email!,
        name: u.name ?? "Student",
        streak: streak?.current_streak ?? 0,
        daysUntilExam,
      })
    })
  )

  const sent = results.filter((r) => r.status === "fulfilled").length
  const failed = results.filter((r) => r.status === "rejected").length

  return NextResponse.json({ ok: true, sent, failed, total: toNotify.length })
}
