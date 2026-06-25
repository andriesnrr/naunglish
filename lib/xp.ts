import { createServiceClient } from "@/lib/supabase"

type SupabaseClient = ReturnType<typeof createServiceClient>

export const XP = {
  question_correct: 10,
  question_wrong: 2,
  flashcard_viewed: 1,
  mock_test_complete: 100,
  writing_submitted: 50,
  speaking_completed: 30,
  daily_goal_achieved: 25,
} as const

export type XPType = keyof typeof XP

export async function updateStreak(userId: string, supabase: SupabaseClient): Promise<boolean> {
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0]

  const { data } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (!data) {
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_active: today,
    })
    return true
  }

  if (data.last_active === today) return false

  const newStreak = data.last_active === yesterday ? (data.current_streak ?? 0) + 1 : 1
  const longest = Math.max(newStreak, data.longest_streak ?? 0)

  await supabase
    .from("streaks")
    .update({ current_streak: newStreak, longest_streak: longest, last_active: today })
    .eq("user_id", userId)

  return true // new day advanced → caller can award daily_goal bonus
}

export async function awardXP(userId: string, amount: number, supabase: SupabaseClient): Promise<void> {
  const { data } = await supabase
    .from("leaderboard_scores")
    .select("xp, weekly_xp")
    .eq("user_id", userId)
    .maybeSingle()

  if (!data) {
    await supabase.from("leaderboard_scores").insert({
      user_id: userId,
      xp: amount,
      weekly_xp: amount,
    })
    return
  }

  await supabase
    .from("leaderboard_scores")
    .update({
      xp: (data.xp ?? 0) + amount,
      weekly_xp: (data.weekly_xp ?? 0) + amount,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
}

// Award XP for an activity type + handle streak + optional daily goal bonus
export async function awardActivityXP(
  userId: string,
  type: XPType,
  supabase: SupabaseClient
): Promise<{ xpAwarded: number; streakBonusAwarded: boolean }> {
  const base = XP[type]
  const streakAdvanced = await updateStreak(userId, supabase)
  const bonus = streakAdvanced ? XP.daily_goal_achieved : 0

  await awardXP(userId, base + bonus, supabase)
  return { xpAwarded: base + bonus, streakBonusAwarded: streakAdvanced }
}
