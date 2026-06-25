export type Skill = "grammar" | "vocab" | "reading" | "listening" | "speaking" | "writing"
export type Difficulty = "A2" | "B1" | "B2" | "C1" | "C2"
export type CEFRBand = "A1" | "A2" | "B1" | "B2" | "C1" | "C2"

export type Question = {
  id: string
  skill: Skill
  difficulty: Difficulty
  type: "mcq" | "reading" | "listening"
  prompt: string
  passage?: string
  audio_text?: string
  options: string[]
  answer: number
  explanation: string
  tags: string[]
}

export type Flashcard = {
  id: string
  word: string
  pos: string
  definition: string
  example: string
  difficulty: Difficulty
}

export type SpeakingTask = {
  id: string
  type: "read_aloud" | "prompt"
  content: string
  difficulty: Difficulty
}

export type WritingPrompt = {
  id: string
  prompt: string
  difficulty: Difficulty
  word_min: number
  word_max: number
}

export type NotebookEntry = {
  id: string
  user_id: string
  type: "word" | "rule"
  content: string
  tags: string[]
  created_at: string
}

export type WritingFeedback = {
  score: number
  cefr_band: CEFRBand
  grammar_score: number
  vocab_score: number
  coherence_score: number
  task_response_score: number
  improvements: Array<{ issue: string; suggestion: string }>
  problem_phrases: Array<{ original: string; correction: string }>
}

export const SKILL_COLORS: Record<Skill, { label: string; accent: string }> = {
  grammar:   { label: "Structure",   accent: "#4a5d4e" },
  vocab:     { label: "Lexicon",     accent: "#8e5d44" },
  reading:   { label: "Analysis",    accent: "#d4af37" },
  listening: { label: "Reception",   accent: "#266a4b" },
  speaking:  { label: "Fluency",     accent: "#3f51b5" },
  writing:   { label: "Composition", accent: "#7d5a3c" },
}
