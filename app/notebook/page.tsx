import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import NotebookClient from "@/components/NotebookClient"
import type { NotebookEntry } from "@/types"

export default async function NotebookPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const { data } = await supabase
    .from("notebook_entries")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  const entries = (data ?? []) as NotebookEntry[]

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="mb-6">
        <span className="text-label-caps" style={{ color: "#051f1f" }}>
          NOTEBOOK
        </span>
        <h1
          className="text-headline-md mt-1"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          My Notebook
        </h1>
        <p
          className="text-body-md mt-1"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          Save words and grammar rules as you learn. {entries.length > 0 && `${entries.length} entries saved.`}
        </p>
      </div>

      <NotebookClient initialEntries={entries} />
    </div>
  )
}
