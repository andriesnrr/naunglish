"use client"

import { useState, useCallback } from "react"
import type { Flashcard as FlashcardType } from "@/types"
import Flashcard from "@/components/Flashcard"

type Props = {
  cards: FlashcardType[]
}

export default function FlashcardDeck({ cards: initialCards }: Props) {
  const [cards, setCards] = useState(initialCards)
  const [index, setIndex] = useState(0)

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  const next = useCallback(() => {
    setIndex((i) => Math.min(cards.length - 1, i + 1))
  }, [cards.length])

  const shuffle = useCallback(() => {
    setCards((c) => [...c].sort(() => Math.random() - 0.5))
    setIndex(0)
  }, [])

  if (!cards.length) return null

  return (
    <div className="flex flex-col gap-6">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <span
          className="text-label-caps"
          style={{ color: "#727878" }}
        >
          {index + 1} / {cards.length}
        </span>
        <button
          onClick={shuffle}
          className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-[#c1c8c7] hover:bg-[#e8efef] transition-colors"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            shuffle
          </span>
          Shuffle
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-[#e8efef] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${((index + 1) / cards.length) * 100}%`,
            backgroundColor: "#051f1f",
          }}
        />
      </div>

      {/* Card */}
      <Flashcard card={cards[index]} />

      {/* Navigation */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={prev}
          disabled={index === 0}
          className="flex items-center gap-1 px-5 py-2.5 rounded-xl border border-[#c1c8c7] hover:bg-[#e8efef] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_back
          </span>
          Prev
        </button>
        <button
          onClick={next}
          disabled={index === cards.length - 1}
          className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}
        >
          Next
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            arrow_forward
          </span>
        </button>
      </div>

      {/* Done state */}
      {index === cards.length - 1 && (
        <p
          className="text-center text-sm italic"
          style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
        >
          You&apos;ve reached the end. Shuffle for another round!
        </p>
      )}
    </div>
  )
}
