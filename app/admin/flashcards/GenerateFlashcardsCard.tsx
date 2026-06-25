"use client"

import { useState } from "react"

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
})

export default function GenerateFlashcardsCard({ onDone }: { onDone: () => void }) {
  const [difficulty, setDifficulty] = useState("B2")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ inserted: number; errors: string[] } | null>(null)

  async function generate() {
    setLoading(true)
    setResult(null)

    const res = await fetch("/api/admin/generate-flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty }),
    })

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
        Generate Flashcards with AI
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", alignItems: "end", marginBottom: "0" }}>
        <div>
          <label style={labelStyle}>Difficulty</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={selectStyle}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <button onClick={generate} disabled={loading} style={btnStyle(loading)}>
            {loading ? "Generating..." : "Generate 30 Flashcards"}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: "12px" }}>
          {result.inserted > 0 && (
            <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "13px", color: "#2e7d5a" }}>
              ✓ {result.inserted} flashcards inserted
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
