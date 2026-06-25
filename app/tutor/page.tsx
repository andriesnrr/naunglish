import { redirect } from "next/navigation"
import { auth } from "@/auth"
import TutorChat from "@/components/TutorChat"

export default async function TutorPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-5">
        <span className="text-label-caps" style={{ color: "#051f1f" }}>
          AI TUTOR
        </span>
        <h1
          className="text-headline-md mt-1"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          Ask the Tutor
        </h1>
        <p
          className="text-body-md mt-1"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          Grammar, vocabulary, writing, speaking — ask anything.
        </p>
      </div>

      <TutorChat />
    </div>
  )
}
