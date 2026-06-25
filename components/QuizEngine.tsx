"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Question, Skill } from "@/types"
import { SKILL_COLORS } from "@/types"
import { getCEFR } from "@/lib/cefr"
import ScoreRing from "./ScoreRing"
import AudioPlayer from "./AudioPlayer"

type Props = {
  skill: Skill
  mode: "practice" | "mock"
  questions: Question[]
  userId: string
}

type AnswerState = {
  selected: number
  correct: boolean
}

export default function QuizEngine({ skill, mode, questions, userId }: Props) {
  const router = useRouter()
  const { accent } = SKILL_COLORS[skill]

  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState<AnswerState | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [results, setResults] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  const question = questions[index]

  const selectOption = useCallback(
    async (optionIndex: number) => {
      if (answer !== null) return
      const correct = optionIndex === question.answer
      setAnswer({ selected: optionIndex, correct })
      setResults((prev) => [...prev, correct])

      // Save progress to API
      try {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question_id: question.id,
            correct,
          }),
        })
      } catch {
        // Non-blocking — progress save failure doesn't break quiz
      }
    },
    [answer, question]
  )

  const next = useCallback(async () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1)
      setAnswer(null)
      setShowHint(false)
    } else {
      // Save session score
      setSaving(true)
      const correctCount = results.filter(Boolean).length + (answer?.correct ? 1 : 0)
      const scorePct = Math.round((correctCount / questions.length) * 100)
      const cefrBand = getCEFR(scorePct)

      try {
        await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill, score_pct: scorePct, cefr_band: cefrBand }),
        })
      } catch {
        // Non-blocking
      }
      setSaving(false)
      setDone(true)
    }
  }, [index, questions.length, results, answer, skill])

  // Result screen
  if (done) {
    const correctCount = results.filter(Boolean).length
    const scorePct = Math.round((correctCount / questions.length) * 100)
    const cefrBand = getCEFR(scorePct)

    return (
      <div className="flex flex-col items-center gap-6 py-10 px-4">
        <ScoreRing pct={scorePct} size={140} color={accent} />

        <div className="text-center flex flex-col gap-1">
          <span
            className="text-display-lg"
            style={{ color: "#161d1d" }}
          >
            {cefrBand}
          </span>
          <span className="text-body-md" style={{ color: "#414848" }}>
            {correctCount} / {questions.length} correct
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setIndex(0)
              setAnswer(null)
              setResults([])
              setDone(false)
            }}
            className="px-5 py-2.5 rounded-xl text-white font-medium"
            style={{ backgroundColor: accent }}
          >
            Retry
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 rounded-xl border border-[#c1c8c7] text-[#161d1d] font-medium hover:bg-[#e8efef] transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>
    )
  }

  const optionStates = (i: number) => {
    if (answer === null) return { bg: "white", border: "#c1c8c7", color: "#161d1d" }
    if (i === question.answer) return { bg: "#f0fdf4", border: "#16a34a", color: "#15803d" }
    if (i === answer.selected && !answer.correct)
      return { bg: "#fff1f2", border: "#e11d48", color: "#be123c" }
    return { bg: "white", border: "#c1c8c7", color: "#9ca3af" }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-5">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-[#e8efef] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${((index) / questions.length) * 100}%`, backgroundColor: accent }}
          />
        </div>
        <span
          className="text-xs flex-shrink-0"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}
        >
          {index + 1}/{questions.length}
        </span>
      </div>

      {/* Passage (reading) */}
      {question.passage && (
        <div
          className="p-4 rounded-xl text-body-md leading-relaxed"
          style={{
            backgroundColor: "#f6f4ec",
            border: "1px solid #c1c8c7",
            color: "#161d1d",
            fontFamily: "Source Serif 4, serif",
          }}
        >
          {question.passage}
        </div>
      )}

      {/* Audio (listening) */}
      {question.audio_text && <AudioPlayer text={question.audio_text} />}

      {/* Question prompt */}
      <p
        className="text-body-lg font-medium"
        style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
      >
        {question.prompt}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const s = optionStates(i)
          return (
            <button
              key={i}
              onClick={() => selectOption(i)}
              disabled={answer !== null}
              className="w-full text-left p-4 rounded-xl border transition-colors text-body-md"
              style={{
                backgroundColor: s.bg,
                borderColor: s.border,
                color: s.color,
                fontFamily: "Source Serif 4, serif",
              }}
            >
              <span
                className="inline-block w-6 h-6 rounded-full border mr-3 text-xs font-bold text-center leading-6 flex-shrink-0"
                style={{ borderColor: s.border, color: s.color }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {/* Explanation (after answer) */}
      {answer !== null && (
        <div
          className="p-4 rounded-xl flex flex-col gap-2"
          style={{
            backgroundColor: "#f0fdf4",
            borderLeft: `4px solid ${accent}`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "18px", color: answer.correct ? "#16a34a" : "#e11d48" }}
            >
              {answer.correct ? "check_circle" : "cancel"}
            </span>
            <span
              className="font-semibold text-sm"
              style={{ color: answer.correct ? "#15803d" : "#be123c" }}
            >
              {answer.correct ? "Correct!" : "Incorrect"}
            </span>
          </div>
          <p
            className="text-body-md"
            style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
          >
            {question.explanation}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-1">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  backgroundColor: `${accent}22`,
                  color: accent,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hint toggle (practice only) */}
      {mode === "practice" && answer !== null && question.skill === "grammar" && (
        <button
          onClick={() => setShowHint((h) => !h)}
          className="self-start text-sm underline"
          style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
        >
          {showHint ? "Hide hint" : "Show grammar rule"}
        </button>
      )}
      {showHint && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: "#f6f4ec",
            border: "1px solid #c1c8c7",
            fontFamily: "JetBrains Mono, monospace",
            color: "#414848",
          }}
        >
          Tags: {question.tags.join(", ")}
        </div>
      )}

      {/* Next button */}
      {answer !== null && (
        <button
          onClick={next}
          disabled={saving}
          className="self-end px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
          style={{ backgroundColor: accent }}
        >
          {saving ? "Saving…" : index < questions.length - 1 ? "Next →" : "See Results"}
        </button>
      )}
    </div>
  )
}
