import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import { SKILL_COLORS } from "@/types"
import QuizEngine from "@/components/QuizEngine"
import type { Skill, Question } from "@/types"

const VALID_SKILLS = ["grammar", "vocab", "reading", "listening", "speaking", "writing"]

type Props = {
  params: Promise<{ skill: string }>
}

export default async function PracticePage({ params }: Props) {
  const { skill } = await params

  if (!VALID_SKILLS.includes(skill)) notFound()

  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const typedSkill = skill as Skill
  const { accent, label } = SKILL_COLORS[typedSkill]

  const supabase = createServiceClient()

  // Fetch up to 10 questions for this skill, mixed difficulties
  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .eq("skill", skill)
    .limit(10)

  if (error || !questions?.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <span
          className="text-body-lg"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          No questions available for {skill} yet.
        </span>
      </div>
    )
  }

  // Shuffle
  const shuffled = [...questions].sort(() => Math.random() - 0.5) as Question[]

  return (
    <div>
      {/* Skill header bar */}
      <div
        className="sticky top-14 z-40 px-4 py-2 flex items-center gap-2"
        style={{ backgroundColor: `${accent}18`, borderBottom: `1px solid ${accent}44` }}
      >
        <span
          className="text-label-caps"
          style={{ color: accent }}
        >
          {label} · Practice
        </span>
      </div>

      <QuizEngine
        skill={typedSkill}
        mode="practice"
        questions={shuffled}
        userId={session.user.id}
      />
    </div>
  )
}
