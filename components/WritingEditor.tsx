"use client"

import { useState, useCallback } from "react"

type Props = {
  prompt: string
  taskId: string
  minWords?: number
}

type Feedback = {
  feedback: string
  score_content: number
  score_language: number
  score_structure: number
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>
          {label}
        </span>
        <span className="text-xs font-bold" style={{ fontFamily: "JetBrains Mono, monospace", color: "#051f1f" }}>
          {value}%
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[#e8efef] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: "#051f1f" }}
        />
      </div>
    </div>
  )
}

export default function WritingEditor({ prompt, taskId, minWords = 100 }: Props) {
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Feedback | null>(null)

  const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length
  const canSubmit = wordCount >= minWords && !loading && !result

  const submit = useCallback(async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      const res = await fetch("/api/writing-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, prompt, taskId }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({
        feedback: "Could not get feedback. Please try again.",
        score_content: 0,
        score_language: 0,
        score_structure: 0,
      })
    }
    setLoading(false)
  }, [canSubmit, text, prompt, taskId])

  const reset = useCallback(() => {
    setText("")
    setResult(null)
  }, [])

  return (
    <div className="flex flex-col gap-5">
      {/* Prompt */}
      <div
        className="p-4 rounded-xl"
        style={{ borderLeft: "4px solid #8e5d44", backgroundColor: "#fdf3ec" }}
      >
        <span
          className="text-label-caps mb-2 block"
          style={{ color: "#8e5d44" }}
        >
          WRITING TASK
        </span>
        <p
          className="text-body-lg"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          {prompt}
        </p>
      </div>

      {/* Editor */}
      {!result && (
        <>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={loading}
              rows={10}
              placeholder="Write your response here…"
              className="w-full rounded-xl border border-[#c1c8c7] p-4 resize-none focus:outline-none focus:border-[#051f1f] transition-colors disabled:opacity-60"
              style={{
                fontFamily: "Source Serif 4, serif",
                fontSize: "16px",
                color: "#161d1d",
                backgroundColor: "#fff",
                lineHeight: "1.7",
              }}
            />
            <span
              className="absolute bottom-3 right-4 text-xs"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: wordCount >= minWords ? "#15803d" : "#727878",
              }}
            >
              {wordCount} / {minWords} words
            </span>
          </div>

          <div className="flex items-center justify-between">
            {wordCount < minWords && (
              <p className="text-sm" style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}>
                Write at least {minWords - wordCount} more word{minWords - wordCount !== 1 ? "s" : ""} to submit.
              </p>
            )}
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="ml-auto px-6 py-3 rounded-xl text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}
            >
              {loading ? "Evaluating…" : "Get AI Feedback →"}
            </button>
          </div>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="flex flex-col gap-5">
          {/* Scores */}
          <div className="card p-5 flex flex-col gap-4">
            <span className="text-label-caps" style={{ color: "#727878" }}>
              SCORES
            </span>
            <ScoreBar label="CONTENT" value={result.score_content} />
            <ScoreBar label="LANGUAGE" value={result.score_language} />
            <ScoreBar label="STRUCTURE" value={result.score_structure} />
          </div>

          {/* Feedback */}
          <div
            className="p-4 rounded-xl"
            style={{ borderLeft: "4px solid #051f1f", backgroundColor: "#e8efef" }}
          >
            <span className="text-label-caps block mb-2" style={{ color: "#051f1f" }}>
              AI FEEDBACK
            </span>
            <p
              className="text-body-md"
              style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
            >
              {result.feedback}
            </p>
          </div>

          {/* Show submitted text */}
          <details className="cursor-pointer">
            <summary
              className="text-sm select-none"
              style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}
            >
              VIEW YOUR RESPONSE
            </summary>
            <div className="mt-3 p-4 rounded-xl bg-white border border-[#c1c8c7]">
              <p
                className="text-body-md whitespace-pre-wrap"
                style={{ color: "#414848", fontFamily: "Source Serif 4, serif", lineHeight: "1.7" }}
              >
                {text}
              </p>
            </div>
          </details>

          <button
            onClick={reset}
            className="self-start flex items-center gap-2 px-4 py-2 rounded-xl border border-[#c1c8c7] hover:bg-[#e8efef] transition-colors"
            style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              refresh
            </span>
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
