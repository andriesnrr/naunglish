"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Question } from "@/types"
import { SKILL_COLORS } from "@/types"
import ScoreRing from "@/components/ScoreRing"

type Props = {
  questions: Question[]
  durationSeconds?: number
}

type Result = {
  totalScore: number
  cefrBand: string
  breakdown: Record<string, number>
}

const CEFR_DESC: Record<string, string> = {
  C2: "Mastery — near-native proficiency",
  C1: "Advanced — effective independent user",
  B2: "Upper Intermediate — independent user",
  B1: "Intermediate — threshold user",
  A2: "Elementary — basic user",
  A1: "Beginner — breakthrough",
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}

export default function MockTest({ questions, durationSeconds = 1800 }: Props) {
  const [phase, setPhase] = useState<"intro" | "test" | "result">("intro")
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(durationSeconds)
  const [result, setResult] = useState<Result | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer
  useEffect(() => {
    if (phase !== "test") return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          submitAnswers()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const submitAnswers = useCallback(async () => {
    if (submitting) return
    clearInterval(timerRef.current!)
    setSubmitting(true)
    try {
      const res = await fetch("/api/mock-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, questions }),
      })
      const data = await res.json()
      setResult(data)
      setPhase("result")
    } catch {
      setResult({ totalScore: 0, cefrBand: "A1", breakdown: {} })
      setPhase("result")
    } finally {
      setSubmitting(false)
    }
  }, [answers, questions, submitting])

  const q = questions[current]
  const answeredCount = Object.keys(answers).length
  const pct = Math.round((answeredCount / questions.length) * 100)
  const timerWarning = timeLeft < 300

  if (phase === "intro") {
    return (
      <div className="card p-8 flex flex-col gap-6 max-w-xl mx-auto">
        <div>
          <span className="text-label-caps" style={{ color: "#727878" }}>MOCK TEST</span>
          <h2
            className="text-headline-md mt-1"
            style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
          >
            Full Practice Exam
          </h2>
        </div>
        <ul className="flex flex-col gap-2" style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: "#4a5d4e" }}>quiz</span>
            {questions.length} questions across all skills
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: "#4a5d4e" }}>timer</span>
            {Math.round(durationSeconds / 60)} minutes
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: "#4a5d4e" }}>emoji_events</span>
            100 XP on completion
          </li>
          <li className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" style={{ color: "#4a5d4e" }}>school</span>
            CEFR band result with skill breakdown
          </li>
        </ul>
        <button
          onClick={() => setPhase("test")}
          className="px-6 py-3 rounded-xl text-white font-medium self-start"
          style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}
        >
          Start Test →
        </button>
      </div>
    )
  }

  if (phase === "result" && result) {
    return (
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        {/* Score */}
        <div className="card p-8 flex flex-col items-center gap-4 text-center">
          <ScoreRing pct={result.totalScore} size={140} />
          <div>
            <span
              className="text-display-lg font-bold"
              style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
            >
              {result.cefrBand}
            </span>
            <p
              className="text-body-md mt-1"
              style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
            >
              {CEFR_DESC[result.cefrBand] ?? ""}
            </p>
          </div>
          <div
            className="px-3 py-1 rounded text-xs font-bold"
            style={{
              fontFamily: "JetBrains Mono, monospace",
              backgroundColor: "#e4e3db",
              color: "#5f5f59",
            }}
          >
            +100 XP EARNED
          </div>
        </div>

        {/* Skill breakdown */}
        <div className="card p-6 flex flex-col gap-4">
          <span className="text-label-caps" style={{ color: "#727878" }}>SKILL BREAKDOWN</span>
          {Object.entries(result.breakdown).map(([skill, score]) => {
            const meta = SKILL_COLORS[skill as keyof typeof SKILL_COLORS]
            return (
              <div key={skill} className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-sm" style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}>
                    {meta?.label ?? skill}
                  </span>
                  <span className="text-xs font-bold" style={{ fontFamily: "JetBrains Mono, monospace", color: meta?.accent ?? "#051f1f" }}>
                    {score}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#e8efef] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${score}%`, backgroundColor: meta?.accent ?? "#051f1f" }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <a
          href="/dashboard"
          className="px-6 py-3 rounded-xl border border-[#c1c8c7] text-center hover:bg-[#e8efef] transition-colors"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          Back to Dashboard
        </a>
      </div>
    )
  }

  // Test phase
  return (
    <div className="flex flex-col gap-5 max-w-xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        {/* Progress */}
        <div className="flex flex-col gap-1 flex-1 mr-4">
          <div className="flex justify-between">
            <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>
              {current + 1} / {questions.length}
            </span>
            <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>
              {answeredCount} answered
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-[#e8efef] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: "#051f1f" }}
            />
          </div>
        </div>
        {/* Timer */}
        <span
          className="text-sm font-bold shrink-0"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            color: timerWarning ? "#e11d48" : "#414848",
          }}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Skill tag */}
      <div className="flex items-center gap-2">
        <span
          className="px-2 py-0.5 rounded text-xs font-bold uppercase"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            backgroundColor: "#e8efef",
            color: SKILL_COLORS[q.skill]?.accent ?? "#414848",
          }}
        >
          {SKILL_COLORS[q.skill]?.label ?? q.skill}
        </span>
        <span
          className="px-2 py-0.5 rounded text-xs"
          style={{
            fontFamily: "JetBrains Mono, monospace",
            backgroundColor: "#e4e3db",
            color: "#5f5f59",
          }}
        >
          {q.difficulty}
        </span>
      </div>

      {/* Passage */}
      {q.passage && (
        <div
          className="p-4 rounded-xl border border-[#c1c8c7] text-body-md"
          style={{
            fontFamily: "Source Serif 4, serif",
            color: "#414848",
            lineHeight: "1.75",
            backgroundColor: "#fff",
          }}
        >
          {q.passage}
        </div>
      )}

      {/* Question */}
      <div
        className="card p-5"
      >
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
          className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#c1c8c7] hover:bg-[#e8efef] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
          Prev
        </button>

        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-white transition-colors"
            style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}
          >
            Next
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={submitAnswers}
            disabled={submitting}
            className="flex items-center gap-1 px-5 py-2.5 rounded-xl text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#4a5d4e", fontFamily: "Source Serif 4, serif" }}
          >
            {submitting ? "Scoring…" : "Submit Test"}
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>check</span>
          </button>
        )}
      </div>

      {/* Early submit */}
      {current < questions.length - 1 && answeredCount === questions.length && (
        <button
          onClick={submitAnswers}
          disabled={submitting}
          className="self-center text-sm underline"
          style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
        >
          All answered — submit early
        </button>
      )}
    </div>
  )
}
