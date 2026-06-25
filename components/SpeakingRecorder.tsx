"use client"

import { useState, useCallback, useRef } from "react"

// Web Speech API types not in default TS lib — declare minimal shapes needed
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance
    webkitSpeechRecognition: new () => SpeechRecognitionInstance
  }
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

type Word = { text: string; status: "correct" | "missed" | "pending" }

type Props =
  | { mode: "read_aloud"; prompt: string; taskId: string }
  | { mode: "free_speak"; prompt: string; taskId: string }

export default function SpeakingRecorder(props: Props) {
  const { mode, prompt, taskId } = props
  const [recording, setRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [words, setWords] = useState<Word[]>([])
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const recogRef = useRef<SpeechRecognitionInstance | null>(null)

  const promptWords = mode === "read_aloud"
    ? prompt.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean)
    : []

  const startRecording = useCallback(() => {
    if (typeof window === "undefined") return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert("Speech recognition not supported in this browser.")
      return
    }

    const recognition = new SR() as SpeechRecognitionInstance
    recognition.lang = "en-GB"
    recognition.continuous = true
    recognition.interimResults = true
    recogRef.current = recognition

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = ""
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript
      }
      setTranscript(full)

      if (mode === "read_aloud") {
        const spokenWords = full.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean)
        const tagged: Word[] = promptWords.map((pw, i) => ({
          text: pw,
          status: spokenWords[i] === pw ? "correct" : spokenWords[i] !== undefined ? "missed" : "pending",
        }))
        setWords(tagged)
        const correctCount = tagged.filter((w) => w.status === "correct").length
        setAccuracy(Math.round((correctCount / promptWords.length) * 100))
      }
    }

    recognition.onerror = () => setRecording(false)
    recognition.onend = () => setRecording(false)

    recognition.start()
    setRecording(true)
    setTranscript("")
    setWords([])
    setAccuracy(null)
    setFeedback(null)
    setDone(false)
  }, [mode, promptWords])

  const stopRecording = useCallback(() => {
    recogRef.current?.stop()
    setRecording(false)
  }, [])

  const submit = useCallback(async () => {
    if (!transcript.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/speaking-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, prompt, mode, taskId }),
      })
      const data = await res.json()
      setFeedback(data.feedback ?? "No feedback received.")
      if (data.score_accuracy !== undefined) setAccuracy(data.score_accuracy)
    } catch {
      setFeedback("Could not get feedback. Try again.")
    }
    setLoading(false)
    setDone(true)
  }, [transcript, prompt, mode, taskId])

  return (
    <div className="flex flex-col gap-5">
      {/* Prompt card */}
      <div
        className="p-4 rounded-xl"
        style={{
          borderLeft: "4px solid #3f51b5",
          backgroundColor: "#f0f1fb",
        }}
      >
        <span
          className="text-label-caps mb-2 block"
          style={{ color: "#3f51b5" }}
        >
          {mode === "read_aloud" ? "READ ALOUD" : "RESPOND TO PROMPT"}
        </span>
        <p
          className="text-body-lg"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          {prompt}
        </p>
      </div>

      {/* Record button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-transform active:scale-95"
          style={{
            backgroundColor: recording ? "#e11d48" : "#3f51b5",
            boxShadow: recording ? "0 0 0 8px #fecdd3" : "0 0 0 4px #c5cae9",
          }}
          aria-label={recording ? "Stop recording" : "Start recording"}
        >
          <span className="material-symbols-outlined text-white" style={{ fontSize: "32px" }}>
            {recording ? "stop" : "mic"}
          </span>
        </button>
        <span
          className="text-xs"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}
        >
          {recording ? "RECORDING… TAP TO STOP" : "TAP TO RECORD"}
        </span>
      </div>

      {/* Live transcript — read aloud mode: word-by-word highlight */}
      {mode === "read_aloud" && words.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-4 rounded-xl bg-white border border-[#c1c8c7]">
          {words.map((w, i) => (
            <span
              key={i}
              className="text-body-md"
              style={{
                fontFamily: "Source Serif 4, serif",
                color:
                  w.status === "correct"
                    ? "#15803d"
                    : w.status === "missed"
                    ? "#be123c"
                    : "#9ca3af",
                textDecoration: w.status === "missed" ? "line-through" : w.status === "correct" ? "underline" : "none",
                textDecorationColor: w.status === "correct" ? "#16a34a" : "#e11d48",
              }}
            >
              {w.text}
            </span>
          ))}
        </div>
      )}

      {/* Free speak transcript */}
      {mode === "free_speak" && transcript && (
        <div className="p-4 rounded-xl bg-white border border-[#c1c8c7]">
          <p
            className="text-body-md italic"
            style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
          >
            {transcript}
          </p>
        </div>
      )}

      {/* Accuracy meter */}
      {accuracy !== null && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-xs" style={{ fontFamily: "JetBrains Mono, monospace", color: "#3f51b5" }}>
              ACCURACY
            </span>
            <span className="text-xs font-bold" style={{ fontFamily: "JetBrains Mono, monospace", color: "#3f51b5" }}>
              {accuracy}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#e8efef] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${accuracy}%`, backgroundColor: "#3f51b5" }}
            />
          </div>
        </div>
      )}

      {/* Submit for AI feedback (free speak only) */}
      {mode === "free_speak" && transcript && !done && (
        <button
          onClick={submit}
          disabled={loading}
          className="px-6 py-3 rounded-xl text-white font-medium self-end"
          style={{ backgroundColor: "#3f51b5", fontFamily: "Source Serif 4, serif" }}
        >
          {loading ? "Evaluating…" : "Get AI Feedback →"}
        </button>
      )}

      {/* AI Feedback */}
      {feedback && (
        <div
          className="p-4 rounded-xl"
          style={{ borderLeft: "4px solid #3f51b5", backgroundColor: "#f0f1fb" }}
        >
          <span className="text-label-caps block mb-2" style={{ color: "#3f51b5" }}>
            AI FEEDBACK
          </span>
          <p
            className="text-body-md"
            style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
          >
            {feedback}
          </p>
        </div>
      )}
    </div>
  )
}
