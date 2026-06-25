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

  const { skill, difficulty } = await req.json()
  if (!skill || !difficulty) return NextResponse.json({ error: "skill and difficulty required" }, { status: 400 })

  const systemPrompt = `You are an expert English language test author creating questions for Indonesian university students targeting CEFR ${difficulty} level.

Generate exactly 20 unique multiple-choice questions for the "${skill}" skill.

Return ONLY a valid JSON array, no markdown, no explanation, no preamble. Format:
[
  {
    "prompt": "question text here, use ___ for blanks",
    "options": ["option A", "option B", "option C", "option D"],
    "answer": 0,
    "explanation": "clear explanation why the answer is correct",
    "tags": ["tag1", "tag2"],
    "passage": null,
    "audio_text": null
  }
]

Rules:
- answer is index 0-3
- all 4 options must be plausible
- explanation must reference the grammar rule or vocabulary concept clearly
- tags should be specific: e.g. "past-perfect", "collocations", "subject-verb-agreement"
- for reading skill: include a passage (2-3 sentences), set audio_text to null
- for listening skill: include audio_text (1-2 sentences to be spoken), set passage to null
- for grammar/vocab: set both passage and audio_text to null
- questions must be varied — no repeating the same structure
- difficulty ${difficulty}: A2=basic, B1=intermediate, B2=upper-intermediate, C1=advanced, C2=mastery`

  const groq = getGroq()
  const allQuestions: Record<string, unknown>[] = []
  const errors: string[] = []

  for (let batch = 0; batch < 3; batch++) {
    try {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 4000,
        temperature: 0.8,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate batch ${batch + 1} of 3. Make sure these 20 questions are different from previous batches.` },
        ],
      })

      const text = response.choices[0].message.content ?? ""
      const clean = text.replace(/```json|```/g, "").trim()
      const parsed = JSON.parse(clean)

      if (Array.isArray(parsed)) {
        allQuestions.push(...parsed)
      }
    } catch (e) {
      errors.push(`Batch ${batch + 1} failed: ${e}`)
    }
  }

  const rows = allQuestions
    .filter(q => q.prompt && Array.isArray(q.options) && q.options.length === 4 && typeof q.answer === "number")
    .map(q => ({
      skill,
      difficulty,
      type: skill === "reading" ? "reading" : skill === "listening" ? "listening" : "mcq",
      prompt: q.prompt,
      passage: q.passage ?? null,
      audio_text: q.audio_text ?? null,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation ?? "",
      tags: q.tags ?? [],
    }))

  const { error: insertError } = await supabase.from("questions").insert(rows)
  if (insertError) errors.push(`Insert failed: ${insertError.message}`)

  return NextResponse.json({ inserted: insertError ? 0 : rows.length, errors })
}
