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

  const { transcript, prompt, mode, taskId } = await req.json()

  if (!transcript || !prompt) {
    return NextResponse.json({ error: "Missing transcript or prompt" }, { status: 400 })
  }

  const systemPrompt = mode === "read_aloud"
    ? `You are an English pronunciation coach for Indonesian university students targeting CEFR C1-C2.
       The student was asked to read aloud a given text. Evaluate their spoken transcript vs the original.
       Return JSON: {"feedback": "...", "score_accuracy": 0-100, "score_fluency": 0-100}
       feedback: 2-3 sentences, specific, encouraging but honest. In English.`
    : `You are an English speaking coach for Indonesian university students targeting CEFR C1-C2.
       The student responded to a prompt with free speech. Evaluate their spoken response.
       Return JSON: {"feedback": "...", "score_accuracy": 0-100, "score_fluency": 0-100}
       score_accuracy: content relevance + grammar. score_fluency: vocabulary range + coherence.
       feedback: 2-3 sentences, specific, encouraging but honest. In English.`

  const userMessage = mode === "read_aloud"
    ? `Original text: "${prompt}"\n\nStudent transcript: "${transcript}"`
    : `Prompt: "${prompt}"\n\nStudent response: "${transcript}"`

  try {
    const response = await getClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    })

    const text = response.choices[0].message.content ?? ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in response")

    const parsed = JSON.parse(jsonMatch[0])
    await awardActivityXP(session.user.id, "speaking_completed", createServiceClient())
    return NextResponse.json({
      feedback: parsed.feedback ?? "No feedback available.",
      score_accuracy: parsed.score_accuracy ?? 70,
      score_fluency: parsed.score_fluency ?? 70,
    })
  } catch {
    return NextResponse.json(
      { feedback: "Could not evaluate. Please try again.", score_accuracy: 0, score_fluency: 0 },
      { status: 500 }
    )
  }
}
