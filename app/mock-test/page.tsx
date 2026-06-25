import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import MockTest from "@/components/MockTest"
import type { Question } from "@/types"

export default async function MockTestPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()

  // Fetch 20 questions: 4 per skill (grammar, vocab, reading, listening, speaking excluded — MCQ only)
  const skills = ["grammar", "vocab", "reading", "listening"]
  const allQuestions: Question[] = []

  for (const skill of skills) {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("skill", skill)
      .order("created_at", { ascending: false })
      .limit(5)
    if (data) allQuestions.push(...(data as Question[]))
  }

  // Shuffle
  const shuffled = allQuestions.sort(() => Math.random() - 0.5)

  return (
    <div className="px-4 py-6">
      <div className="max-w-xl mx-auto mb-6">
        <span className="text-label-caps" style={{ color: "#727878" }}>
          ASSESSMENT
        </span>
        <h1
          className="text-headline-md mt-1"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          Mock Test
        </h1>
      </div>

      {shuffled.length > 0 ? (
        <MockTest questions={shuffled} durationSeconds={1800} />
      ) : (
        <div className="card p-8 text-center max-w-xl mx-auto">
          <span
            className="material-symbols-outlined block mb-3"
            style={{ fontSize: "48px", color: "#c1c8c7" }}
          >
            quiz
          </span>
          <p
            className="text-body-md italic"
            style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
          >
            No questions available yet. Add some via the admin panel.
          </p>
        </div>
      )}
    </div>
  )
}
