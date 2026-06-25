"use client"

import { useState, useRef, useEffect, useCallback } from "react"

type Role = "user" | "assistant"
type Message = { role: Role; content: string }

const STARTERS = [
  "What's the difference between 'affect' and 'effect'?",
  "How do I use the subjunctive mood correctly?",
  "Can you explain academic paraphrasing?",
  "When should I use 'which' vs 'that'?",
]

export default function TutorChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = useCallback(async (userText: string) => {
    const trimmed = userText.trim()
    if (!trimmed || streaming) return

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ]
    setMessages(newMessages)
    setInput("")
    setStreaming(true)

    // Placeholder for streaming assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }])

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: abort.signal,
      })

      if (!res.ok || !res.body) throw new Error("Stream failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: "assistant", content: accumulated }
          return updated
        })
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Sorry, I couldn't respond. Please try again.",
          }
          return updated
        })
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [messages, streaming])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const stop = () => {
    abortRef.current?.abort()
    setStreaming(false)
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-140px)] max-w-2xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col gap-4 pt-4">
            <p
              className="text-body-md text-center italic"
              style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
            >
              Ask me anything about English.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-xl border border-[#c1c8c7] hover:bg-[#e8efef] transition-colors"
                  style={{ fontFamily: "Source Serif 4, serif", color: "#414848", fontSize: "15px" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "rounded-br-sm"
                  : "rounded-bl-sm"
              }`}
              style={{
                backgroundColor: msg.role === "user" ? "#051f1f" : "#fff",
                color: msg.role === "user" ? "#e8efef" : "#161d1d",
                fontFamily: "Source Serif 4, serif",
                fontSize: "15px",
                lineHeight: "1.7",
                border: msg.role === "assistant" ? "1px solid #e8efef" : "none",
                boxShadow: msg.role === "assistant" ? "0 2px 0 0 #c1c8c7" : "none",
              }}
            >
              {msg.content || (
                <span className="inline-flex gap-1 items-center" aria-label="Thinking">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="flex gap-2 items-end pt-3 border-t border-[#e8efef]"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={streaming}
          rows={1}
          placeholder="Ask about grammar, vocabulary, writing…"
          className="flex-1 rounded-xl border border-[#c1c8c7] px-4 py-3 resize-none focus:outline-none focus:border-[#051f1f] transition-colors disabled:opacity-60"
          style={{
            fontFamily: "Source Serif 4, serif",
            fontSize: "15px",
            color: "#161d1d",
            maxHeight: "120px",
            overflowY: "auto",
          }}
        />
        {streaming ? (
          <button
            onClick={stop}
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border border-[#c1c8c7] hover:bg-[#e8efef] transition-colors"
            aria-label="Stop"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#414848" }}>
              stop
            </span>
          </button>
        ) : (
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            style={{ backgroundColor: "#051f1f" }}
            aria-label="Send"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px", color: "#e8efef" }}>
              send
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
