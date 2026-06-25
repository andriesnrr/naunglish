import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { createServiceClient } from "@/lib/supabase"
import Link from "next/link"

type Tab = "weekly" | "alltime"

type Props = {
  searchParams: Promise<{ tab?: string }>
}

const MEDAL = ["🥇", "🥈", "🥉"]

export default async function LeaderboardPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { tab: tabParam } = await searchParams
  const tab: Tab = tabParam === "alltime" ? "alltime" : "weekly"

  const supabase = createServiceClient()

  const scoreCol = tab === "weekly" ? "weekly_xp" : "xp"

  // Fetch top 50 with user info
  const { data: rows } = await supabase
    .from("leaderboard_scores")
    .select(`${scoreCol}, user_id, users(name, avatar_url, current_cefr)`)
    .order(scoreCol, { ascending: false })
    .limit(50)

  const entries = (rows ?? []).map((r, i) => ({
    rank: i + 1,
    userId: r.user_id,
    xp: ((r as unknown as Record<string, number>)[scoreCol]) ?? 0,
    name: (r.users as unknown as { name: string | null; avatar_url: string | null; current_cefr: string | null } | null)?.name ?? "Anonymous",
    avatarUrl: (r.users as unknown as { name: string | null; avatar_url: string | null; current_cefr: string | null } | null)?.avatar_url ?? null,
    cefr: (r.users as unknown as { name: string | null; avatar_url: string | null; current_cefr: string | null } | null)?.current_cefr ?? null,
    isMe: r.user_id === session.user?.id,
  }))

  const myEntry = entries.find((e) => e.isMe)
  const myRank = myEntry?.rank ?? null

  return (
    <div className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <span className="text-label-caps" style={{ color: "#d4af37" }}>LEADERBOARD</span>
        <h1
          className="text-headline-md mt-1"
          style={{ color: "#161d1d", fontFamily: "Source Serif 4, serif" }}
        >
          Rankings
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {([
          { key: "weekly", label: "This Week" },
          { key: "alltime", label: "All Time" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <Link
            key={key}
            href={`/leaderboard?tab=${key}`}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              fontFamily: "Source Serif 4, serif",
              backgroundColor: tab === key ? "#051f1f" : "#e8efef",
              color: tab === key ? "#e8efef" : "#414848",
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* My rank banner (if not in top 50) */}
      {myRank && myRank > 10 && myEntry && (
        <div
          className="flex items-center gap-3 p-3 rounded-xl border-2"
          style={{ borderColor: "#d4af37", backgroundColor: "#fffbea" }}
        >
          <span
            className="text-sm font-bold w-8 text-center shrink-0"
            style={{ fontFamily: "JetBrains Mono, monospace", color: "#d4af37" }}
          >
            #{myRank}
          </span>
          <span className="flex-1 text-sm" style={{ fontFamily: "Source Serif 4, serif", color: "#161d1d" }}>
            You — {myEntry.xp.toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-body-md italic" style={{ color: "#727878", fontFamily: "Source Serif 4, serif" }}>
            No rankings yet. Complete activities to earn XP!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
              style={{
                backgroundColor: entry.isMe ? "#e8efef" : "#fff",
                border: entry.isMe ? "2px solid #051f1f" : "1px solid #e8efef",
                boxShadow: entry.rank <= 3 ? "0 2px 0 0 #c1c8c7" : "none",
              }}
            >
              {/* Rank */}
              <span
                className="w-8 text-center shrink-0 text-sm font-bold"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: entry.rank <= 3 ? "#d4af37" : "#727878",
                  fontSize: entry.rank <= 3 ? "20px" : "13px",
                }}
              >
                {entry.rank <= 3 ? MEDAL[entry.rank - 1] : `#${entry.rank}`}
              </span>

              {/* Avatar */}
              {entry.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.avatarUrl}
                  alt={entry.name}
                  className="w-8 h-8 rounded-full shrink-0"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: "#c1c8c7", color: "#051f1f" }}
                >
                  {entry.name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name + CEFR */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{
                    fontFamily: "Source Serif 4, serif",
                    color: "#161d1d",
                    fontWeight: entry.isMe ? 700 : 500,
                  }}
                >
                  {entry.name} {entry.isMe && <span style={{ color: "#727878", fontWeight: 400 }}>(you)</span>}
                </p>
                {entry.cefr && (
                  <span
                    className="text-xs"
                    style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}
                  >
                    {entry.cefr}
                  </span>
                )}
              </div>

              {/* XP */}
              <span
                className="text-sm font-bold shrink-0"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: entry.rank <= 3 ? "#d4af37" : "#051f1f",
                }}
              >
                {entry.xp.toLocaleString()} XP
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer note for weekly */}
      {tab === "weekly" && (
        <p
          className="text-center text-xs"
          style={{ fontFamily: "JetBrains Mono, monospace", color: "#727878" }}
        >
          WEEKLY XP RESETS EVERY MONDAY
        </p>
      )}
    </div>
  )
}
