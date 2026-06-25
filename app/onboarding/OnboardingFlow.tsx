"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Question } from "@/types"

type Props = {
  questions: Question[]
  defaultName: string
}

type Phase = "profile" | "test" | "result"

const CEFR_DESC: Record<string, string> = {
  C2: "Mastery — near-native proficiency",
  C1: "Advanced — effective independent user",
  B2: "Upper Intermediate — independent user",
  B1: "Intermediate — threshold user",
  A2: "Elementary — basic user",
  A1: "Beginner — breakthrough",
}

export default function OnboardingFlow({ questions, defaultName }: Props) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>("profile")

  // Profile step
  const [name, setName] = useState(defaultName)
  const [examDate, setExamDate] = useState("")

  // Test step
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})

  // Result
  const [cefrResult, setCefrResult] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submitOnboarding = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, examDate: examDate || null, answers, questions }),
      })
      const data = await res.json()
      setCefrResult(data.cefrResult ?? "B1")
      setPhase("result")
    } catch {
      setCefrResult("B1")
      setPhase("result")
    } finally {
      setSubmitting(false)
    }
  }, [submitting, name, examDate, answers, questions])

  if (questions.length === 0) {
    return (
      <p className="text-center text-body-md" style={{ color: "#727878" }}>
        No placement questions available. Please contact the admin.
      </p>
    )
  }

  const q = questions[current]

  // Profile phase
  if (phase === "profile") {
    return (
      <div className="flex flex-col gap-6 max-w-md mx-auto">
        <div>
          <span className="text-label-caps" style={{ color: "#727878" }}>STEP 1 OF 2</span>
          <h2
            className="text-headline-md mt-1"
            style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
          >
            Tell us about yourself
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}
            >
              Your name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-[#c1c8c7] px-4 py-3 focus:outline-none focus:border-[#051f1f] transition-colors"
              style={{ fontFamily: "Source Serif 4, serif", color: "#161d1d", fontSize: "15px" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              className="text-sm font-medium"
              style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}
            >
              Target exam date <span style={{ color: "#727878", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="w-full rounded-xl border border-[#c1c8c7] px-4 py-3 focus:outline-none focus:border-[#051f1f] transition-colors"
              style={{ fontFamily: "JetBrains Mono, monospace", color: "#161d1d", fontSize: "14px" }}
            />
          </div>
        </div>

        <button
          onClick={() => questions.length > 0 ? setPhase("test") : submitOnboarding()}
          disabled={!name.trim()}
          className="px-6 py-3 rounded-xl text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed self-start"
          style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}
        >
          {questions.length > 0 ? "Next: Placement Test →" : "Get Started →"}
        </button>
      </div>
    )
  }

  // Test phase
  if (phase === "test" && q) {
    const answered = Object.keys(answers).length
    return (
      <div className="flex flex-col gap-5 max-w-md mx-auto">
        {/* Header */}
        <div>
          <span className="text-label-caps" style={{ color: "#727878" }}>
            STEP 2 OF 2 · PLACEMENT TEST
          </span>
          <div className="mt-2 flex justify-between text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>
            <span>{current + 1} / {questions.length}</span>
            <span>{answered} answered</span>
          </div>
          <div className="mt-1.5 w-full h-1 rounded-full bg-[#e8efef] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${((current + 1) / questions.length) * 100}%`, backgroundColor: "#051f1f" }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="card p-5">
          <p
            className="text-body-lg"
            style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif", lineHeight: "1.6" }}
          >
            {q.prompt}
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                  className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                  style={{
                    borderColor: selected ? "#051f1f" : "#c1c8c7",
                    backgroundColor: selected ? "#e8efef" : "#fff",
                    fontFamily: "Source Serif 4, serif",
                    color: "#161d1d",
                    fontSize: "15px",
                    boxShadow: selected ? "0 2px 0 0 #c1c8c7" : "none",
                  }}
                >
                  <span
                    className="inline-block w-6 h-6 rounded-full text-center text-xs font-bold mr-3"
                    style={{
                      backgroundColor: selected ? "#051f1f" : "#e8efef",
                      color: selected ? "#fff" : "#727878",
                      lineHeight: "24px",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#c1c8c7] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#e8efef] transition-colors"
            style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
            Prev
          </button>
          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-white"
              style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}
            >
              Next
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={submitOnboarding}
              disabled={submitting}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-white disabled:opacity-60"
              style={{ backgroundColor: "#4a5d4e", fontFamily: "Source Serif 4, serif" }}
            >
              {submitting ? "Scoring…" : "Finish"}
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Result phase
  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto text-center">
      <div className="card p-8 flex flex-col items-center gap-4">
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "56px", color: "#4a5d4e" }}
        >
          school
        </span>
        <div>
          <span className="text-label-caps" style={{ color: "#727878" }}>YOUR STARTING LEVEL</span>
          <p
            className="text-display-lg font-bold mt-1"
            style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
          >
            {cefrResult}
          </p>
          <p
            className="text-body-md mt-1"
            style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
          >
            {CEFR_DESC[cefrResult] ?? ""}
          </p>
        </div>
        <p
          className="text-sm"
          style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
        >
          Your study plan has been tailored to reach C1–C2.
        </p>
      </div>

      <button
        onClick={() => router.push("/dashboard")}
        className="px-6 py-3 rounded-xl text-white font-medium"
        style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}
      >
        Go to Dashboard →
      </button>
    </div>
  )
}
