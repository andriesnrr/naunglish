import { NextResponse } from "next/server"
import { auth } from "@/auth"
import Groq from "groq-sdk"
import { createServiceClient } from "@/lib/supabase"
import { awardActivityXP } from "@/lib/xp"

function getClient() { return new Groq({ apiKey: process.env.GROQ_API_KEY }) }

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { text, prompt, taskId } = await req.json()

  if (!text || !prompt) {
    return NextResponse.json({ error: "Missing text or prompt" }, { status: 400 })
  }

  const systemPrompt = `You are an academic English writing coach for Indonesian university students targeting CEFR C1-C2.
Evaluate the student's written response to a given prompt.
Return ONLY valid JSON (no markdown):
{
  "feedback": "3-4 sentences: specific strengths, one key improvement area, one vocabulary/grammar note",
  "score_content": 0-100,
  "score_language": 0-100,
  "score_structure": 0-100
}
score_content: relevance, depth of ideas.
score_language: grammar accuracy, vocabulary range and precision.
score_structure: coherence, cohesion, paragraph organisation.
Be honest but encouraging. Write in English.`

  const userMessage = `Writing prompt: "${prompt}"\n\nStudent response:\n${text}`

  try {
    const response = await getClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 768,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    })

    const raw = response.choices[0].message.content ?? ""
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON")

    const parsed = JSON.parse(jsonMatch[0])
    await awardActivityXP(session.user.id, "writing_submitted", createServiceClient())
    return NextResponse.json({
      feedback: parsed.feedback ?? "No feedback available.",
      score_content: parsed.score_content ?? 70,
      score_language: parsed.score_language ?? 70,
      score_structure: parsed.score_structure ?? 70,
    })
  } catch {
    return NextResponse.json(
      {
        feedback: "Could not evaluate. Please try again.",
        score_content: 0,
        score_language: 0,
        score_structure: 0,
      },
      { status: 500 }
    )
  }
}
