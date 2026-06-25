import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle()
  return data?.role === "admin" ? session : null
}

export async function POST(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { resource, data } = await req.json()
  const supabase = createServiceClient()

  const TABLE_MAP: Record<string, string> = {
    questions: "questions",
    flashcards: "flashcards",
    speaking: "speaking_tasks",
    writing: "writing_prompts",
  }

  const table = TABLE_MAP[resource]
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 400 })

  const { data: row, error } = await supabase.from(table).insert(data).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(row)
}

export async function DELETE(req: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { resource, id } = await req.json()
  const supabase = createServiceClient()

  const TABLE_MAP: Record<string, string> = {
    questions: "questions",
    flashcards: "flashcards",
    speaking: "speaking_tasks",
    writing: "writing_prompts",
  }

  const table = TABLE_MAP[resource]
  if (!table) return NextResponse.json({ error: "Unknown resource" }, { status: 400 })

  const { error } = await supabase.from(table).delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
