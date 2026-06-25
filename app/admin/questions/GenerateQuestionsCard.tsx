"use client"

import { useState } from "react"

const SKILLS = ["grammar", "vocab", "reading", "listening", "speaking", "writing"]
const DIFFICULTIES = ["A2", "B1", "B2", "C1", "C2"]

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8efef",
  boxShadow: "0 2px 0 0 #c1c8c7",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "24px",
}

const labelStyle: React.CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: "11px",
  color: "#727878",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "6px",
}

const selectStyle: React.CSSProperties = {
  fontFamily: "JetBrains Mono, monospace",
  fontSize: "13px",
  color: "#161d1d",
  background: "#f4f7f6",
  border: "1px solid #e8efef",
  borderRadius: "8px",
  padding: "8px 12px",
  width: "100%",
  cursor: "pointer",
}

const btnStyle = (disabled: boolean): React.CSSProperties => ({
  fontFamily: "JetBrains Mono, monospace",
  fontSize: "13px",
  fontWeight: 700,
  color: disabled ? "#727878" : "#fff",
  background: disabled ? "#e8efef" : "#051f1f",
  border: "none",
  borderRadius: "8px",
  padding: "10px 20px",
  cursor: disabled ? "not-allowed" : "pointer",
  boxShadow: disabled ? "none" : "0 2px 0 0 #c1c8c7",
  transition: "background 0.15s",
})

export default function GenerateQuestionsCard({ onDone }: { onDone: () => void }) {
  const [skill, setSkill] = useState("grammar")
  const [difficulty, setDifficulty] = useState("B1")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState("")
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null)

  async function generate() {
    setLoading(true)
    setResult(null)
    setProgress("Calling Groq — batch 1/3...")

    const res = await fetch("/api/admin/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill, difficulty }),
    })

    setProgress("")
    setLoading(false)

    if (res.ok) {
      const data = await res.json()
      setResult(data)
      onDone()
    } else {
      setResult({ inserted: 0, errors: ["Request failed"] })
    }
  }

  return (
    <div style={cardStyle}>
      <p style={{ fontFamily: "Source Serif 4, serif", fontSize: "16px", fontWeight: 700, color: "#161d1d", marginBottom: "16px" }}>
        Generate Questions with AI
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        <div>
          <label style={labelStyle}>Skill</label>
          <select value={skill} onChange={e => setSkill(e.target.value)} style={selectStyle}>
            {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={selectStyle}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <button onClick={generate} disabled={loading} style={btnStyle(loading)}>
        {loading ? (progress || "Generating...") : "Generate 60 Questions"}
      </button>

      {result && (
        <div style={{ marginTop: "12px" }}>
          {result.inserted > 0 && (
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: "#2e7d5a" }}>
              ✓ {result.inserted} questions inserted
            </p>
          )}
          {result.errors.map((e, i) => (
            <p key={i} style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#b94040", marginTop: "4px" }}>
              ✗ {e}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
