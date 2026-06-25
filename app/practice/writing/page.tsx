import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import WritingEditor from "@/components/WritingEditor"

export default async function WritingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const { data: tasks } = await supabase
    .from("writing_prompts")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(10)

  const task = tasks?.[0] ?? null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <span className="text-label-caps" style={{ color: "#8e5d44" }}>
          WRITING
        </span>
        <h1
          className="text-headline-md mt-1"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          Writing Practice
        </h1>
        <p
          className="text-body-md mt-1"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          Develop academic writing skills — clarity, structure, and vocabulary range.
        </p>
      </div>

      {task ? (
        <div className="flex flex-col gap-4">
          {/* Task meta */}
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-bold uppercase"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                backgroundColor: "#e8efef",
                color: "#414848",
              }}
            >
              {task.difficulty}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                backgroundColor: "#e8efef",
                color: "#727878",
              }}
            >
              min {task.word_min} words
            </span>
          </div>

          <WritingEditor
            prompt={task.prompt}
            taskId={String(task.id)}
            minWords={task.word_min ?? 100}
          />
        </div>
      ) : (
        <div className="card p-8 text-center">
          <span
            className="material-symbols-outlined block mb-3"
            style={{ fontSize: "48px", color: "#c1c8c7" }}
          >
            edit_off
          </span>
          <p
            className="text-body-md italic"
            style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
          >
            No writing tasks yet. Add some via the admin panel.
          </p>
        </div>
      )}
    </div>
  )
}
