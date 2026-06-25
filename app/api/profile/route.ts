import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name, examDate, dailyGoal, notifEmail, privacyPublic } = await req.json()
  const supabase = createServiceClient()
  const userId = session.user.id

  const [userRes, settingsRes] = await Promise.all([
    supabase.from("users").update({
      name: name ?? null,
      exam_date: examDate || null,
    }).eq("id", userId),

    supabase.from("user_settings").upsert({
      user_id: userId,
      daily_goal: dailyGoal ?? 20,
      notif_email: notifEmail ?? true,
      privacy_public: privacyPublic ?? false,
    }, { onConflict: "user_id" }),
  ])

  if (userRes.error) return NextResponse.json({ error: userRes.error.message }, { status: 500 })
  if (settingsRes.error) return NextResponse.json({ error: settingsRes.error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
