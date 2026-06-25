"use client"

import { useRouter } from "next/navigation"
import GenerateFlashcardsCard from "./GenerateFlashcardsCard"

type Card = {
  id: string
  word: string
  pos: string
  difficulty: string
  definition: string
}

export default function FlashcardsClient({ cards }: { cards: Card[] }) {
  const router = useRouter()

  return (
    <>
      <GenerateFlashcardsCard onDone={() => router.refresh()} />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e8efef", boxShadow: "0 2px 0 0 #c1c8c7" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#051f1f" }}>
              {["Word", "POS", "Level", "Definition"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6f8988", fontFamily: "JetBrains Mono, monospace", letterSpacing: "1px" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cards.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#f4f7f6", borderBottom: "1px solid #e8efef" }}>
                <td className="px-4 py-3 font-bold" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>{c.word}</td>
                <td className="px-4 py-3 text-xs italic" style={{ color: "#727878" }}>{c.pos}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#e8efef", color: "#414848", fontFamily: "JetBrains Mono, monospace" }}>
                    {c.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-body-md" style={{ color: "#414848" }}>{c.definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
