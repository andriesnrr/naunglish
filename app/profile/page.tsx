import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import ProfileClient from "./ProfileClient"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const userId = session.user.id

  const [{ data: user }, { data: settings }] = await Promise.all([
    supabase.from("users").select("name, exam_date, current_cefr").eq("id", userId).maybeSingle(),
    supabase.from("user_settings").select("daily_goal, notif_email, privacy_public").eq("user_id", userId).maybeSingle(),
  ])

  return (
    <ProfileClient
      name={user?.name ?? session.user.name ?? ""}
      email={session.user.email ?? ""}
      image={session.user.image ?? null}
      examDate={user?.exam_date ?? null}
      dailyGoal={settings?.daily_goal ?? 20}
      notifEmail={settings?.notif_email ?? true}
      privacyPublic={settings?.privacy_public ?? false}
      currentCefr={user?.current_cefr ?? null}
    />
  )
}
