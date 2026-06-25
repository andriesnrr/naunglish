import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import FlashcardDeck from "./FlashcardDeck"
import type { Flashcard } from "@/types"

export default async function FlashcardsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const { data: cards } = await supabase
    .from("flashcards")
    .select("*")
    .order("created_at", { ascending: true })

  const flashcards = (cards ?? []) as Flashcard[]

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <span className="text-label-caps" style={{ color: "#8e5d44" }}>
          LEXICON
        </span>
        <h1 className="text-headline-md mt-1" style={{ color: "#161d1d" }}>
          Flashcards
        </h1>
        <p
          className="text-body-md mt-1"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          {flashcards.length} words · Tap card to reveal
        </p>
      </div>

      {flashcards.length > 0 ? (
        <FlashcardDeck cards={flashcards} />
      ) : (
        <div className="card p-8 text-center">
          <p
            className="text-body-md italic"
            style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
          >
            No flashcards yet. Add some via the admin panel.
          </p>
        </div>
      )}
    </div>
  )
}
