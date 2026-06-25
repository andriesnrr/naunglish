import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import OnboardingFlow from "./OnboardingFlow"
import type { Question } from "@/types"

export default async function OnboardingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()

  // If already onboarded, skip
  const { data: user } = await supabase
    .from("users")
    .select("starting_cefr")
    .eq("id", session.user.id)
    .maybeSingle()

  if (user?.starting_cefr) redirect("/dashboard")

  // Fetch 10 placement questions — 2-3 per skill, varied difficulty
  const skills = ["grammar", "vocab", "reading", "listening"]
  const allQ: Question[] = []

  for (const skill of skills) {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .eq("skill", skill)
      .limit(3)
    if (data) allQ.push(...(data as Question[]))
  }

  // Shuffle + cap at 10
  const questions = allQ.sort(() => Math.random() - 0.5).slice(0, 10)

  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: "#f4f7f6" }}>
      {/* Logo / brand */}
      <div className="max-w-md mx-auto mb-10 text-center">
        <span
          className="text-display-lg font-bold"
          style={{ color: "#051f1f", fontFamily: "Source Serif 4, serif" }}
        >
          Naunglish
        </span>
        <p
          className="text-body-md mt-2"
          style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
        >
          Let&apos;s set up your learning profile.
        </p>
      </div>

      <OnboardingFlow
        questions={questions}
        defaultName={session.user.name ?? ""}
      />
    </div>
  )
}
