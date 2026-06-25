"use client"

import { useState } from "react"
import type { Flashcard as FlashcardType } from "@/types"

type Props = {
  card: FlashcardType
}

export default function Flashcard({ card }: Props) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div
      className="w-full cursor-pointer select-none"
      style={{ perspective: "1000px", height: "260px" }}
      onClick={() => setFlipped((f) => !f)}
      role="button"
      aria-label={flipped ? "Show front" : "Reveal definition"}
    >
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.45s ease",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl flex flex-col items-center justify-center gap-3 px-6"
          style={{
            backfaceVisibility: "hidden",
            backgroundColor: "#051f1f",
          }}
        >
          <span
            className="text-display-lg text-white text-center"
            style={{ fontFamily: "Source Serif 4, serif" }}
          >
            {card.word}
          </span>
          <span
            className="italic"
            style={{
              fontFamily: "Source Serif 4, serif",
              color: "#d4af37",
              fontSize: "18px",
            }}
          >
            {card.pos}
          </span>
          <span
            className="text-xs mt-2"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#6f8988" }}
          >
            TAP TO REVEAL
          </span>
        </div>

        {/* Back */}
        <div
          className="card absolute inset-0 flex flex-col justify-center gap-4 px-6"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p
            className="text-body-lg font-semibold"
            style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
          >
            {card.definition}
          </p>
          <p
            className="text-body-md italic"
            style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
          >
            &ldquo;{card.example}&rdquo;
          </p>
          <span
            className="self-start px-2 py-0.5 rounded text-xs font-bold"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              backgroundColor: "#e4e3db",
              color: "#5f5f59",
            }}
          >
            {card.difficulty}
          </span>
        </div>
      </div>
    </div>
  )
}
