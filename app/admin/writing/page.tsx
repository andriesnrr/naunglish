import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import Link from "next/link"

export default async function AdminWritingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()
  if (user?.role !== "admin") redirect("/dashboard")

  const { data: prompts } = await supabase
    .from("writing_prompts")
    .select("id, difficulty, prompt, word_min, word_max")
    .order("difficulty")

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin" className="text-xs" style={{ color: "#727878", fontFamily: "JetBrains Mono, monospace" }}>← Admin</Link>
          <h1 className="text-display-sm mt-1" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>Writing Prompts</h1>
        </div>
        <span className="text-xs px-3 py-1 rounded-full" style={{ background: "#e8efef", color: "#414848", fontFamily: "JetBrains Mono, monospace" }}>
          {prompts?.length ?? 0} total
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {(prompts ?? []).map(p => (
          <div
            key={p.id}
            className="rounded-xl p-4"
            style={{ background: "#fff", border: "1px solid #e8efef", boxShadow: "0 2px 0 0 #c1c8c7" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#e8efef", fontFamily: "JetBrains Mono, monospace", color: "#414848" }}>{p.difficulty}</span>
              <span className="ml-auto text-xs" style={{ color: "#727878", fontFamily: "JetBrains Mono, monospace" }}>
                {p.word_min}–{p.word_max} words
              </span>
            </div>
            <p className="text-sm" style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}>{p.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
