"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Question = {
  id: string
  prompt: string
  options: string[]
  passage: string | null
}

type ResultData = {
  newCefr: string
  previousCefr: string | null
  score: number
  correct: number
  total: number
}

const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"]

function cefrDelta(prev: string | null, next: string): "improved" | "dropped" | "same" | "first" {
  if (!prev) return "first"
  const pi = CEFR_ORDER.indexOf(prev)
  const ni = CEFR_ORDER.indexOf(next)
  if (ni > pi) return "improved"
  if (ni < pi) return "dropped"
  return "same"
}

export default function PlacementTestClient({ questions }: { questions: Question[] }) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; selected: number }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<ResultData | null>(null)

  const q = questions[current]
  const total = questions.length

  async function handleNext() {
    if (selected === null) return
    const newAnswers = [...answers, { questionId: q.id, selected }]
    setAnswers(newAnswers)
    setSelected(null)

    if (current + 1 < total) {
      setCurrent(current + 1)
    } else {
      setSubmitting(true)
      const res = await fetch("/api/placement-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: newAnswers }),
      })
      const data = await res.json()
      setResult(data)
      setSubmitting(false)
    }
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: "36px", color: "#051f1f" }}>refresh</span>
        <p style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}>Calculating your level…</p>
      </div>
    )
  }

  if (result) {
    const delta = cefrDelta(result.previousCefr, result.newCefr)
    const deltaIcon = delta === "improved" ? "↑" : delta === "dropped" ? "↓" : delta === "same" ? "=" : "★"
    const deltaColor = delta === "improved" ? "#266a4b" : delta === "dropped" ? "#b94040" : "#414848"

    return (
      <div className="max-w-md mx-auto px-4 py-10 flex flex-col gap-6 items-center text-center">
        <div
          className="rounded-2xl p-8 w-full"
          style={{ background: "#fff", border: "1px solid #e8efef", boxShadow: "0 2px 0 0 #c1c8c7" }}
        >
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", letterSpacing: "2px", color: "#727878", marginBottom: "8px" }}>
            YOUR LEVEL
          </p>
          <p style={{ fontFamily: "Source Serif 4, serif", fontSize: "64px", fontWeight: 700, color: "#051f1f", lineHeight: 1 }}>
            {result.newCefr}
          </p>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: "#727878", marginTop: "8px" }}>
            {result.correct}/{result.total} correct · {result.score}%
          </p>

          {result.previousCefr && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: "#727878" }}>
                {result.previousCefr}
              </span>
              <span style={{ fontSize: "18px", color: deltaColor, fontWeight: 700 }}>{deltaIcon}</span>
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: "#161d1d", fontWeight: 700 }}>
                {result.newCefr}
              </span>
              <span style={{ fontFamily: "Source Serif 4, serif", fontSize: "13px", color: deltaColor }}>
                {delta === "improved" ? "improved!" : delta === "dropped" ? "dropped" : "no change"}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif", fontSize: "16px" }}
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => router.push("/progress")}
          className="text-sm"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878", textDecoration: "underline" }}
        >
          View progress history
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#727878", letterSpacing: "1px" }}>
            PLACEMENT TEST
          </span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#414848" }}>
            {current + 1} / {total}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[#e8efef] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((current + 1) / total) * 100}%`, backgroundColor: "#051f1f" }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        className="rounded-xl p-6 flex flex-col gap-5"
        style={{ background: "#fff", border: "1px solid #e8efef", boxShadow: "0 2px 0 0 #c1c8c7" }}
      >
        {q.passage && (
          <div
            className="rounded-lg p-4"
            style={{ background: "#f4f7f6", borderLeft: "3px solid #051f1f" }}
          >
            <p style={{ fontFamily: "Source Serif 4, serif", fontSize: "14px", color: "#414848", lineHeight: 1.7 }}>
              {q.passage}
            </p>
          </div>
        )}
        <p style={{ fontFamily: "Source Serif 4, serif", fontSize: "18px", color: "#161d1d", lineHeight: 1.5 }}>
          {q.prompt}
        </p>

        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="w-full text-left px-4 py-3 rounded-xl transition-all"
              style={{
                fontFamily: "Source Serif 4, serif",
                fontSize: "15px",
                background: selected === i ? "#051f1f" : "#f4f7f6",
                color: selected === i ? "#fff" : "#414848",
                border: `1px solid ${selected === i ? "#051f1f" : "#e8efef"}`,
                boxShadow: selected === i ? "0 2px 0 0 #000" : "none",
              }}
            >
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", marginRight: "10px", opacity: 0.6 }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        disabled={selected === null}
        className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-30 transition-opacity"
        style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif", fontSize: "16px" }}
      >
        {current + 1 === total ? "Submit" : "Next →"}
      </button>
    </div>
  )
}
