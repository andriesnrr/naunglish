import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import Link from "next/link"
import QuestionsClient from "./QuestionsClient"

export default async function AdminQuestionsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()
  if (user?.role !== "admin") redirect("/dashboard")

  const { data: questions } = await supabase
    .from("questions")
    .select("id, skill, difficulty, type, prompt")
    .order("skill")
    .order("difficulty")

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-xs" style={{ color: "#727878", fontFamily: "JetBrains Mono, monospace" }}>← Admin</Link>
          <h1 className="text-display-sm mt-1" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>Questions</h1>
        </div>
        <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#e8efef", color: "#414848", fontFamily: "JetBrains Mono, monospace" }}>
          {questions?.length ?? 0} total
        </span>
      </div>

      <QuestionsClient questions={questions ?? []} />
    </div>
  )
}
