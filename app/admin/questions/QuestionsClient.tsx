"use client"

import { useRouter } from "next/navigation"
import GenerateQuestionsCard from "./GenerateQuestionsCard"

type Question = {
  id: string
  skill: string
  difficulty: string
  type: string
  prompt: string
}

export default function QuestionsClient({ questions }: { questions: Question[] }) {
  const router = useRouter()

  return (
    <>
      <GenerateQuestionsCard onDone={() => router.refresh()} />

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #e8efef", boxShadow: "0 2px 0 0 #c1c8c7" }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "#051f1f" }}>
              {["Skill", "Difficulty", "Type", "Prompt"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: "#6f8988", fontFamily: "JetBrains Mono, monospace", letterSpacing: "1px" }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => (
              <tr key={q.id} style={{ background: i % 2 === 0 ? "#fff" : "#f4f7f6", borderBottom: "1px solid #e8efef" }}>
                <td className="px-4 py-3 font-medium" style={{ color: "#414848", fontFamily: "JetBrains Mono, monospace" }}>{q.skill}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "#e8efef", color: "#414848", fontFamily: "JetBrains Mono, monospace" }}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "#727878", fontFamily: "JetBrains Mono, monospace" }}>{q.type}</td>
                <td className="px-4 py-3 text-body-md truncate max-w-xs" style={{ color: "#161d1d" }}>{q.prompt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs mt-4 text-center" style={{ color: "#727878", fontFamily: "JetBrains Mono, monospace" }}>
        {questions.length} questions total
      </p>
    </>
  )
}
