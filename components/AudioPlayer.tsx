"use client"

import { useState, useCallback } from "react"

type Props = {
  text: string
}

export default function AudioPlayer({ text }: Props) {
  const [playing, setPlaying] = useState(false)

  const speak = useCallback(() => {
    if (typeof window === "undefined") return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-GB"
    utterance.rate = 0.95

    utterance.onstart = () => setPlaying(true)
    utterance.onend = () => setPlaying(false)
    utterance.onerror = () => setPlaying(false)

    window.speechSynthesis.speak(utterance)
  }, [text])

  const stop = useCallback(() => {
    if (typeof window === "undefined") return
    window.speechSynthesis.cancel()
    setPlaying(false)
  }, [])

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-xl"
      style={{ borderLeft: "4px solid #266a4b", backgroundColor: "#f0f7f4" }}
    >
      <button
        onClick={playing ? stop : speak}
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        style={{ backgroundColor: "#266a4b" }}
        aria-label={playing ? "Stop audio" : "Play audio"}
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: "20px" }}>
          {playing ? "stop" : "play_arrow"}
        </span>
      </button>

      {/* Waveform bars */}
      <div className="flex items-center gap-0.5 h-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full"
            style={{
              backgroundColor: "#266a4b",
              height: playing ? `${Math.random() * 60 + 20}%` : "30%",
              opacity: playing ? 1 : 0.4,
              transition: playing ? `height 0.15s ease ${i * 0.05}s` : "none",
            }}
          />
        ))}
      </div>

      <span
        className="text-sm ml-auto"
        style={{ fontFamily: "JetBrains Mono, monospace", color: "#266a4b" }}
      >
        {playing ? "PLAYING" : "TAP TO PLAY"}
      </span>
    </div>
  )
}
