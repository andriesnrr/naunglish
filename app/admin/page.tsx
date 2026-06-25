import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import AdminClient from "./AdminClient"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle()

  if (userRow?.role !== "admin") redirect("/dashboard")

  const { data: users } = await supabase
    .from("users")
    .select("id, email, name, current_cefr, role")
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <span className="text-label-caps" style={{ color: "#3f51b5" }}>
          ADMIN
        </span>
        <h1
          className="text-headline-md mt-1"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          Content Manager
        </h1>
        <p
          className="text-body-md mt-1"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          Add questions, flashcards, and practice content.
        </p>
      </div>

      <AdminClient users={users ?? []} />
    </div>
  )
}
