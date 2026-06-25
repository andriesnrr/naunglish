import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import PlacementTestClient from "./PlacementTestClient"

export default async function PlacementTestPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()

  // 15 questions: mix of skills and difficulties A2–C1
  const { data: allQuestions } = await supabase
    .from("questions")
    .select("id, prompt, options, passage")
    .in("difficulty", ["A2", "B1", "B2", "C1"])

  if (!allQuestions?.length) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 text-center">
        <p style={{ fontFamily: "Source Serif 4, serif", color: "#727878" }}>
          No questions available. Ask an admin to seed questions first.
        </p>
      </div>
    )
  }

  // Sample 15 evenly: shuffle + take 15
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 15)

  return (
    <div>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-2">
        <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", letterSpacing: "2px", color: "#727878" }}>
          PLACEMENT TEST
        </span>
        <h1 style={{ fontFamily: "Source Serif 4, serif", fontSize: "24px", fontWeight: 700, color: "#161d1d", marginTop: "4px" }}>
          Check Your Level
        </h1>
        <p style={{ fontFamily: "Source Serif 4, serif", fontSize: "14px", color: "#727878", marginTop: "4px" }}>
          15 questions · no hints · takes about 10 minutes
        </p>
      </div>
      <PlacementTestClient questions={shuffled} />
    </div>
  )
}
