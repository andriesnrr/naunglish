"use client"

import { useState, useCallback } from "react"

type Tab = "questions" | "flashcards" | "speaking" | "writing" | "users"

type User = { id: string; email: string; name: string | null; current_cefr: string | null; role: string }
type AnyRow = Record<string, unknown> & { id: string }

type Props = {
  users: User[]
}

const TABS: { key: Tab; label: string }[] = [
  { key: "questions", label: "Questions" },
  { key: "flashcards", label: "Flashcards" },
  { key: "speaking", label: "Speaking" },
  { key: "writing", label: "Writing" },
  { key: "users", label: "Users" },
]

const SKILLS = ["grammar", "vocab", "reading", "listening"]
const DIFFICULTIES = ["A2", "B1", "B2", "C1", "C2"]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase" style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full rounded-lg border border-[#c1c8c7] px-3 py-2 text-sm focus:outline-none focus:border-[#051f1f] transition-colors"
const inputStyle = { fontFamily: "Source Serif 4, serif", color: "#161d1d" }

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
      style={inputStyle}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function AdminClient({ users }: Props) {
  const [tab, setTab] = useState<Tab>("questions")
  const [rows, setRows] = useState<AnyRow[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Question form
  const [qSkill, setQSkill] = useState("grammar")
  const [qDiff, setQDiff] = useState("B1")
  const [qPrompt, setQPrompt] = useState("")
  const [qOptions, setQOptions] = useState(["", "", "", ""])
  const [qAnswer, setQAnswer] = useState(0)
  const [qExplanation, setQExplanation] = useState("")
  const [qPassage, setQPassage] = useState("")

  // Flashcard form
  const [fWord, setFWord] = useState("")
  const [fPos, setFPos] = useState("noun")
  const [fDef, setFDef] = useState("")
  const [fExample, setFExample] = useState("")
  const [fDiff, setFDiff] = useState("B1")

  // Speaking form
  const [sType, setSType] = useState("read_aloud")
  const [sContent, setSContent] = useState("")
  const [sDiff, setSDiff] = useState("B1")

  // Writing form
  const [wPrompt, setWPrompt] = useState("")
  const [wDiff, setWDiff] = useState("B1")
  const [wMin, setWMin] = useState("150")
  const [wMax, setWMax] = useState("250")

  const post = useCallback(async (resource: string, data: object) => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource, data }),
      })
      const row = await res.json()
      if (!row.error) setRows((prev) => [row, ...prev])
      return !row.error
    } catch { return false }
    finally { setSaving(false) }
  }, [])

  const remove = useCallback(async (resource: string, id: string) => {
    setDeletingId(id)
    try {
      await fetch("/api/admin", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource, id }),
      })
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch {/* ignore */}
    setDeletingId(null)
  }, [])

  const saveQuestion = async () => {
    if (!qPrompt.trim() || qOptions.some((o) => !o.trim())) return
    const ok = await post("questions", {
      skill: qSkill,
      difficulty: qDiff,
      type: "mcq",
      prompt: qPrompt,
      passage: qPassage || null,
      audio_text: null,
      options: qOptions,
      answer: qAnswer,
      explanation: qExplanation,
      tags: [],
    })
    if (ok) { setQPrompt(""); setQOptions(["","","",""]); setQExplanation(""); setQPassage("") }
  }

  const saveFlashcard = async () => {
    if (!fWord.trim() || !fDef.trim()) return
    const ok = await post("flashcards", { word: fWord, pos: fPos, definition: fDef, example: fExample, difficulty: fDiff })
    if (ok) { setFWord(""); setFDef(""); setFExample("") }
  }

  const saveSpeaking = async () => {
    if (!sContent.trim()) return
    const ok = await post("speaking", { type: sType, content: sContent, difficulty: sDiff })
    if (ok) setSContent("")
  }

  const saveWriting = async () => {
    if (!wPrompt.trim()) return
    const ok = await post("writing", { prompt: wPrompt, difficulty: wDiff, word_min: parseInt(wMin), word_max: parseInt(wMax) })
    if (ok) setWPrompt("")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex gap-1 flex-wrap border-b border-[#e8efef] pb-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setRows([]) }}
            className="px-4 py-2 rounded-t-lg text-sm transition-colors"
            style={{
              fontFamily: "Source Serif 4, serif",
              backgroundColor: tab === key ? "#051f1f" : "transparent",
              color: tab === key ? "#e8efef" : "#414848",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* QUESTIONS */}
      {tab === "questions" && (
        <div className="flex flex-col gap-5">
          <div className="card p-5 flex flex-col gap-4">
            <span className="text-label-caps" style={{ color: "#727878" }}>ADD QUESTION</span>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Skill">
                <SelectField value={qSkill} onChange={setQSkill} options={SKILLS} />
              </Field>
              <Field label="Difficulty">
                <SelectField value={qDiff} onChange={setQDiff} options={DIFFICULTIES} />
              </Field>
            </div>
            <Field label="Passage (optional)">
              <textarea rows={2} value={qPassage} onChange={(e) => setQPassage(e.target.value)} className={inputCls} style={inputStyle} placeholder="Reading/listening passage…" />
            </Field>
            <Field label="Question">
              <textarea rows={2} value={qPrompt} onChange={(e) => setQPrompt(e.target.value)} className={inputCls} style={inputStyle} placeholder="Question text…" />
            </Field>
            <Field label="Options (select correct)">
              <div className="flex flex-col gap-2">
                {qOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="answer"
                      checked={qAnswer === i}
                      onChange={() => setQAnswer(i)}
                      className="accent-[#051f1f]"
                    />
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => { const next = [...qOptions]; next[i] = e.target.value; setQOptions(next) }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className={`flex-1 ${inputCls}`}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
            </Field>
            <Field label="Explanation">
              <input type="text" value={qExplanation} onChange={(e) => setQExplanation(e.target.value)} className={inputCls} style={inputStyle} placeholder="Why this answer is correct…" />
            </Field>
            <button onClick={saveQuestion} disabled={saving} className="self-start px-5 py-2 rounded-xl text-white text-sm disabled:opacity-40" style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}>
              {saving ? "Saving…" : "Add Question"}
            </button>
          </div>
          <RowList rows={rows} resource="questions" onDelete={remove} deletingId={deletingId} labelKey="prompt" />
        </div>
      )}

      {/* FLASHCARDS */}
      {tab === "flashcards" && (
        <div className="flex flex-col gap-5">
          <div className="card p-5 flex flex-col gap-4">
            <span className="text-label-caps" style={{ color: "#727878" }}>ADD FLASHCARD</span>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Word">
                <input type="text" value={fWord} onChange={(e) => setFWord(e.target.value)} className={inputCls} style={inputStyle} placeholder="e.g. ephemeral" />
              </Field>
              <Field label="Part of Speech">
                <SelectField value={fPos} onChange={setFPos} options={["noun","verb","adjective","adverb","phrase"]} />
              </Field>
            </div>
            <Field label="Definition">
              <input type="text" value={fDef} onChange={(e) => setFDef(e.target.value)} className={inputCls} style={inputStyle} placeholder="Clear, concise definition…" />
            </Field>
            <Field label="Example sentence">
              <input type="text" value={fExample} onChange={(e) => setFExample(e.target.value)} className={inputCls} style={inputStyle} placeholder="Context sentence…" />
            </Field>
            <Field label="Difficulty">
              <SelectField value={fDiff} onChange={setFDiff} options={DIFFICULTIES} />
            </Field>
            <button onClick={saveFlashcard} disabled={saving} className="self-start px-5 py-2 rounded-xl text-white text-sm disabled:opacity-40" style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}>
              {saving ? "Saving…" : "Add Flashcard"}
            </button>
          </div>
          <RowList rows={rows} resource="flashcards" onDelete={remove} deletingId={deletingId} labelKey="word" />
        </div>
      )}

      {/* SPEAKING */}
      {tab === "speaking" && (
        <div className="flex flex-col gap-5">
          <div className="card p-5 flex flex-col gap-4">
            <span className="text-label-caps" style={{ color: "#727878" }}>ADD SPEAKING TASK</span>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <SelectField value={sType} onChange={setSType} options={["read_aloud","prompt"]} />
              </Field>
              <Field label="Difficulty">
                <SelectField value={sDiff} onChange={setSDiff} options={DIFFICULTIES} />
              </Field>
            </div>
            <Field label="Content / Prompt">
              <textarea rows={3} value={sContent} onChange={(e) => setSContent(e.target.value)} className={inputCls} style={inputStyle} placeholder="Text to read aloud or prompt to respond to…" />
            </Field>
            <button onClick={saveSpeaking} disabled={saving} className="self-start px-5 py-2 rounded-xl text-white text-sm disabled:opacity-40" style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}>
              {saving ? "Saving…" : "Add Task"}
            </button>
          </div>
          <RowList rows={rows} resource="speaking" onDelete={remove} deletingId={deletingId} labelKey="content" />
        </div>
      )}

      {/* WRITING */}
      {tab === "writing" && (
        <div className="flex flex-col gap-5">
          <div className="card p-5 flex flex-col gap-4">
            <span className="text-label-caps" style={{ color: "#727878" }}>ADD WRITING PROMPT</span>
            <Field label="Prompt">
              <textarea rows={3} value={wPrompt} onChange={(e) => setWPrompt(e.target.value)} className={inputCls} style={inputStyle} placeholder="Discuss the advantages and disadvantages of…" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Difficulty">
                <SelectField value={wDiff} onChange={setWDiff} options={DIFFICULTIES} />
              </Field>
              <Field label="Min words">
                <input type="number" value={wMin} onChange={(e) => setWMin(e.target.value)} className={inputCls} style={inputStyle} min={50} />
              </Field>
              <Field label="Max words">
                <input type="number" value={wMax} onChange={(e) => setWMax(e.target.value)} className={inputCls} style={inputStyle} min={100} />
              </Field>
            </div>
            <button onClick={saveWriting} disabled={saving} className="self-start px-5 py-2 rounded-xl text-white text-sm disabled:opacity-40" style={{ backgroundColor: "#051f1f", fontFamily: "Source Serif 4, serif" }}>
              {saving ? "Saving…" : "Add Prompt"}
            </button>
          </div>
          <RowList rows={rows} resource="writing" onDelete={remove} deletingId={deletingId} labelKey="prompt" />
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div className="card p-5 flex flex-col gap-3">
          <span className="text-label-caps" style={{ color: "#727878" }}>USERS ({users.length})</span>
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-2 border-b border-[#e8efef] last:border-0">
              <div>
                <p className="text-sm font-medium" style={{ fontFamily: "Source Serif 4, serif", color: "#161d1d" }}>
                  {u.name ?? "—"} <span style={{ color: "#727878", fontWeight: 400 }}>({u.email})</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {u.current_cefr && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ fontFamily: "JetBrains Mono, monospace", backgroundColor: "#e8efef", color: "#414848" }}>
                    {u.current_cefr}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded text-xs" style={{ fontFamily: "JetBrains Mono, monospace", backgroundColor: u.role === "admin" ? "#c5cae9" : "#e8efef", color: u.role === "admin" ? "#3f51b5" : "#727878" }}>
                  {u.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RowList({
  rows, resource, onDelete, deletingId, labelKey,
}: {
  rows: AnyRow[]
  resource: string
  onDelete: (resource: string, id: string) => void
  deletingId: string | null
  labelKey: string
}) {
  if (rows.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      <span className="text-label-caps" style={{ color: "#727878" }}>JUST ADDED</span>
      {rows.map((row) => (
        <div key={row.id} className="card p-3 flex items-start justify-between gap-3">
          <p className="text-sm flex-1 truncate" style={{ fontFamily: "Source Serif 4, serif", color: "#414848" }}>
            {String(row[labelKey] ?? row.id)}
          </p>
          <button
            onClick={() => onDelete(resource, row.id)}
            disabled={deletingId === row.id}
            className="shrink-0 p-1 rounded hover:bg-[#e8efef] disabled:opacity-40"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "#727878" }}>delete</span>
          </button>
        </div>
      ))}
    </div>
  )
}
