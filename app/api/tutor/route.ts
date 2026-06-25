import { auth } from "@/auth"
import Groq from "groq-sdk"

function getClient() { return new Groq({ apiKey: process.env.GROQ_API_KEY }) }

const SYSTEM = `You are Naunglish Tutor — a warm, expert English coach for Indonesian university students targeting CEFR C1-C2.

Your role:
- Answer questions about English grammar, vocabulary, pronunciation, writing, and speaking
- Explain concepts clearly with examples tailored to Indonesian learners
- Gently correct errors in the student's messages
- Encourage and motivate without being condescending
- Keep responses concise (3-6 sentences unless the student asks for more detail)
- Use examples from academic and everyday contexts

You may occasionally use simple Bahasa Indonesia to clarify a difficult concept, but default to English to maximise exposure.
Never do the student's homework for them — guide, don't give answers.`

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  const { messages } = await req.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "No messages" }), { status: 400 })
  }

  const stream = await getClient().chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [{ role: "system", content: SYSTEM }, ...messages],
    stream: true,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? ""
        if (text) controller.enqueue(encoder.encode(text))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
