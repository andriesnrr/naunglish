"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import Image from "next/image"

type Props = {
  name: string
  email: string
  image: string | null
  examDate: string | null
  dailyGoal: number
  notifEmail: boolean
  privacyPublic: boolean
}

export default function ProfileClient(props: Props) {
  const [name, setName] = useState(props.name)
  const [examDate, setExamDate] = useState(props.examDate ?? "")
  const [dailyGoal, setDailyGoal] = useState(props.dailyGoal)
  const [notifEmail, setNotifEmail] = useState(props.notifEmail)
  const [privacyPublic, setPrivacyPublic] = useState(props.privacyPublic)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, examDate: examDate || null, dailyGoal, notifEmail, privacyPublic }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-5 max-w-lg mx-auto px-4 py-6">
      {/* Avatar + identity */}
      <div
        className="rounded-xl p-5 flex items-center gap-4"
        style={{ background: "#fff", boxShadow: "0 2px 0 0 #c1c8c7", border: "1px solid #e8efef" }}
      >
        {props.image ? (
          <Image
            src={props.image}
            alt={name}
            width={56}
            height={56}
            className="rounded-full"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "#051f1f" }}
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: "28px" }}>person</span>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span
            className="text-xs"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878", letterSpacing: "1px" }}
          >
            GOOGLE ACCOUNT
          </span>
          <span className="text-body-md font-semibold" style={{ color: "#161d1d" }}>{props.email}</span>
        </div>
      </div>

      {/* Editable fields */}
      <div
        className="rounded-xl p-5 flex flex-col gap-5"
        style={{ background: "#fff", boxShadow: "0 2px 0 0 #c1c8c7", border: "1px solid #e8efef" }}
      >
        <h2 className="text-headline-md" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>
          Account Settings
        </h2>

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}>
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-body-md outline-none focus:ring-2"
            style={{ borderColor: "#c1c8c7", color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
          />
        </div>

        {/* Exam date */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}>
            Target exam date <span style={{ color: "#727878" }}>(optional)</span>
          </label>
          <input
            type="date"
            value={examDate}
            onChange={e => setExamDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-body-md outline-none"
            style={{ borderColor: "#c1c8c7", color: "#161d1d", fontFamily: "JetBrains Mono, monospace" }}
          />
        </div>

        {/* Daily goal */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}>
            Daily goal <span style={{ color: "#727878", fontFamily: "JetBrains Mono, monospace" }}>({dailyGoal} questions)</span>
          </label>
          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={dailyGoal}
            onChange={e => setDailyGoal(Number(e.target.value))}
            className="w-full accent-[#051f1f]"
          />
          <div className="flex justify-between text-xs" style={{ color: "#727878", fontFamily: "JetBrains Mono, monospace" }}>
            <span>5</span><span>100</span>
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div
        className="rounded-xl p-5 flex flex-col gap-4"
        style={{ background: "#fff", boxShadow: "0 2px 0 0 #c1c8c7", border: "1px solid #e8efef" }}
      >
        <h2 className="text-headline-md" style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}>
          Preferences
        </h2>

        <Toggle
          label="Email reminders"
          description="Daily practice nudge when you haven't studied"
          checked={notifEmail}
          onChange={setNotifEmail}
        />
        <Toggle
          label="Public leaderboard"
          description="Show your name and XP on the leaderboard"
          checked={privacyPublic}
          onChange={setPrivacyPublic}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl text-white font-semibold text-body-md transition-opacity"
          style={{ backgroundColor: "#051f1f", opacity: saving ? 0.6 : 1 }}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full py-3 rounded-xl text-body-md font-medium border transition-colors"
          style={{ borderColor: "#c1c8c7", color: "#414848", backgroundColor: "transparent" }}
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-body-md font-medium" style={{ color: "#161d1d" }}>{label}</span>
        <span className="text-xs" style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}>{description}</span>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ backgroundColor: checked ? "#051f1f" : "#c1c8c7" }}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ left: checked ? "calc(100% - 20px)" : "4px" }}
        />
      </button>
    </div>
  )
}
