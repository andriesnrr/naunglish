import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const supabase = createServiceClient()
  const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()
  if (user?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { difficulty } = await req.json()
  if (!difficulty) return NextResponse.json({ error: "difficulty required" }, { status: 400 })

  const prompt = `Generate exactly 30 English vocabulary flashcards for CEFR ${difficulty} level.
Return ONLY valid JSON array:
[{ "word": "", "pos": "noun|verb|adjective|adverb", "definition": "", "example": "", "difficulty": "${difficulty}" }]
No markdown, no preamble.`

  try {
    const response = await getGroq().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4000,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.choices[0].message.content ?? ""
    const clean = text.replace(/```json|```/g, "").trim()
    const parsed = JSON.parse(clean)

    if (!Array.isArray(parsed)) throw new Error("Response not an array")

    const rows = parsed
      .filter((f: Record<string, unknown>) => f.word && f.pos && f.definition && f.example)
      .map((f: Record<string, unknown>) => ({
        word: f.word,
        pos: f.pos,
        definition: f.definition,
        example: f.example,
        difficulty: f.difficulty ?? difficulty,
      }))

    const { error: insertError } = await supabase.from("flashcards").insert(rows)
    if (insertError) throw new Error(insertError.message)

    return NextResponse.json({ inserted: rows.length, errors: [] })
  } catch (e) {
    return NextResponse.json({ inserted: 0, errors: [`Generation failed: ${e}`] })
  }
}
