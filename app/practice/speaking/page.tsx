import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import SpeakingRecorder from "@/components/SpeakingRecorder"

export default async function SpeakingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const supabase = createServiceClient()
  const { data: tasks } = await supabase
    .from("speaking_tasks")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(10)

  const task = tasks?.[0] ?? null

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="mb-6">
        <span className="text-label-caps" style={{ color: "#3f51b5" }}>
          SPEAKING
        </span>
        <h1
          className="text-headline-md mt-1"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          Speaking Practice
        </h1>
        <p
          className="text-body-md mt-1"
          style={{ color: "#414848", fontFamily: "Source Serif 4, serif" }}
        >
          Train your spoken English — pronunciation, fluency, and expression.
        </p>
      </div>

      {task ? (
        <div className="flex flex-col gap-6">
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
              {task.type === "read_aloud" ? "Read Aloud" : "Free Response"}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                backgroundColor: "#e8efef",
                color: "#727878",
              }}
            >
              {task.difficulty}
            </span>
          </div>

          <SpeakingRecorder
            mode={task.type === "read_aloud" ? "read_aloud" : "free_speak"}
            prompt={task.content}
            taskId={String(task.id)}
          />
        </div>
      ) : (
        <div className="card p-8 text-center">
          <span
            className="material-symbols-outlined block mb-3"
            style={{ fontSize: "48px", color: "#c1c8c7" }}
          >
            mic_off
          </span>
          <p
            className="text-body-md italic"
            style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}
          >
            No speaking tasks yet. Add some via the admin panel.
          </p>
        </div>
      )}
    </div>
  )
}
