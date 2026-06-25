"use client"

import { useState } from "react"

const COMBINATIONS = [
  { skill: "grammar",   difficulty: "B1" },
  { skill: "grammar",   difficulty: "B2" },
  { skill: "grammar",   difficulty: "C1" },
  { skill: "vocab",     difficulty: "B1" },
  { skill: "vocab",     difficulty: "B2" },
  { skill: "vocab",     difficulty: "C1" },
  { skill: "reading",   difficulty: "B1" },
  { skill: "reading",   difficulty: "B2" },
  { skill: "reading",   difficulty: "C1" },
  { skill: "listening", difficulty: "B1" },
  { skill: "listening", difficulty: "B2" },
  { skill: "listening", difficulty: "C1" },
  { skill: "speaking",  difficulty: "B1" },
  { skill: "speaking",  difficulty: "B2" },
  { skill: "writing",   difficulty: "B1" },
  { skill: "writing",   difficulty: "B2" },
  { skill: "writing",   difficulty: "C1" },
]

const FLASHCARD_DIFFICULTIES = ["B1", "B2", "C1"]

type FailedItem =
  | { kind: "question"; skill: string; difficulty: string; error: string }
  | { kind: "flashcard"; difficulty: string; error: string }

export default function GenerateAllCard() {
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState("")
  const [progress, setProgress] = useState(0)
  const [totalSteps] = useState(COMBINATIONS.length + FLASHCARD_DIFFICULTIES.length)
  const [questionsInserted, setQuestionsInserted] = useState(0)
  const [flashcardsInserted, setFlashcardsInserted] = useState(0)
  const [failed, setFailed] = useState<FailedItem[]>([])
  const [done, setDone] = useState(false)

  async function generateAll() {
    setRunning(true)
    setDone(false)
    setFailed([])
    setQuestionsInserted(0)
    setFlashcardsInserted(0)
    setProgress(0)

    let qTotal = 0
    const failures: FailedItem[] = []

    for (let i = 0; i < COMBINATIONS.length; i++) {
      const { skill, difficulty } = COMBINATIONS[i]
      setStep(`[${i + 1}/${totalSteps}] Generating ${skill} ${difficulty}… (${qTotal} questions so far)`)

      try {
        const res = await fetch("/api/admin/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill, difficulty }),
        })
        const data = await res.json()
        qTotal += data.inserted ?? 0
        setQuestionsInserted(qTotal)
        if (data.errors?.length) {
          failures.push({ kind: "question", skill, difficulty, error: data.errors.join("; ") })
        }
      } catch (e) {
        failures.push({ kind: "question", skill, difficulty, error: String(e) })
      }

      setProgress(i + 1)
    }

    let fcTotal = 0
    for (let i = 0; i < FLASHCARD_DIFFICULTIES.length; i++) {
      const difficulty = FLASHCARD_DIFFICULTIES[i]
      const stepIdx = COMBINATIONS.length + i + 1
      setStep(`[${stepIdx}/${totalSteps}] Generating flashcards ${difficulty}…`)

      try {
        const res = await fetch("/api/admin/generate-flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ difficulty }),
        })
        const data = await res.json()
        fcTotal += data.inserted ?? 0
        setFlashcardsInserted(fcTotal)
        if (data.errors?.length) {
          failures.push({ kind: "flashcard", difficulty, error: data.errors.join("; ") })
        }
      } catch (e) {
        failures.push({ kind: "flashcard", difficulty, error: String(e) })
      }

      setProgress(COMBINATIONS.length + i + 1)
    }

    setFailed(failures)
    setStep("")
    setRunning(false)
    setDone(true)
  }

  const pct = Math.round((progress / totalSteps) * 100)

  return (
    <div
      style={{
        background: "#051f1f",
        border: "2px solid #c9a84c",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "32px",
        boxShadow: "0 4px 0 0 #c9a84c",
      }}
    >
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", letterSpacing: "2px", color: "#c9a84c", marginBottom: "6px" }}>
        AI BULK GENERATION
      </p>
      <p style={{ fontFamily: "Source Serif 4, serif", fontSize: "20px", fontWeight: 700, color: "#f4f7f6", marginBottom: "4px" }}>
        Generate All Content
      </p>
      <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#6f8988", marginBottom: "20px" }}>
        17 skill×difficulty combos × 60 questions + 3 flashcard sets × 30 cards
      </p>

      {!running && !done && (
        <>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#c9a84c", marginBottom: "16px" }}>
            ⚠ This will take ~15 minutes. Don&apos;t close this tab.
          </p>
          <button
            onClick={generateAll}
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "14px",
              fontWeight: 700,
              color: "#051f1f",
              background: "#c9a84c",
              border: "none",
              borderRadius: "10px",
              padding: "12px 24px",
              cursor: "pointer",
              boxShadow: "0 2px 0 0 #a07830",
            }}
          >
            🚀 Generate All Content (1,080 questions + 90 flashcards)
          </button>
        </>
      )}

      {running && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: "#f4f7f6" }}>
            {step}
          </p>
          {/* progress bar */}
          <div style={{ background: "#0d3535", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
            <div
              style={{
                background: "#c9a84c",
                height: "100%",
                width: `${pct}%`,
                borderRadius: "999px",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#6f8988" }}>
            {pct}% — {questionsInserted} questions, {flashcardsInserted} flashcards inserted
          </p>
        </div>
      )}

      {done && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "14px", color: "#4caf81" }}>
            ✓ Done — {questionsInserted.toLocaleString()} questions + {flashcardsInserted} flashcards inserted
          </p>
          {failed.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#c9a84c" }}>
                {failed.length} combination(s) failed — retry individually:
              </p>
              {failed.map((f, i) => (
                <p key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#e57373" }}>
                  ✗ {f.kind === "question" ? `${f.skill} ${f.difficulty}` : `flashcards ${f.difficulty}`}: {f.error}
                </p>
              ))}
            </div>
          )}
          <button
            onClick={generateAll}
            style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: "12px",
              color: "#6f8988",
              background: "transparent",
              border: "1px solid #0d3535",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              alignSelf: "flex-start",
            }}
          >
            Run again
          </button>
        </div>
      )}
    </div>
  )
}
