import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env.local") })
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const speakingTasks = [
  {
    type: "read_aloud",
    difficulty: "B1",
    content: "Every morning, I wake up at seven o'clock and make myself a cup of tea. After breakfast, I usually read the news for about twenty minutes before getting ready for work. I find that starting the day calmly helps me focus better throughout the afternoon.",
  },
  {
    type: "read_aloud",
    difficulty: "B2",
    content: "The accelerating pace of climate change poses significant challenges for governments and individuals alike. Rising temperatures, increasingly frequent extreme weather events, and the gradual loss of biodiversity are reshaping ecosystems across the globe. Urgent, coordinated action is required to mitigate the most severe consequences.",
  },
  {
    type: "read_aloud",
    difficulty: "C1",
    content: "Persistent economic inequality undermines social cohesion and constrains upward mobility, disproportionately affecting marginalised communities. Policymakers must grapple with the tension between market efficiency and equitable distribution of resources, navigating complex trade-offs that have profound implications for democratic governance.",
  },
  {
    type: "free_response",
    difficulty: "B1",
    content: "Describe your hometown. What do you like most about it? What would you change if you could?",
  },
  {
    type: "free_response",
    difficulty: "B2",
    content: "How has technology changed the way people work in the last decade? Do you think these changes have been mostly positive or negative? Give reasons for your answer.",
  },
]

const writingPrompts = [
  {
    difficulty: "B1",
    prompt: "A friend has just started university and is feeling overwhelmed. Write a letter giving them practical advice on how to manage their time and studies effectively.",
    word_min: 150,
    word_max: 200,
  },
  {
    difficulty: "B2",
    prompt: "Some people believe that social media has made communication easier and more efficient. Others argue it has damaged the quality of human relationships. Discuss both views and give your own opinion.",
    word_min: 220,
    word_max: 260,
  },
  {
    difficulty: "C1",
    prompt: "\"Economic growth and environmental sustainability are fundamentally incompatible goals.\" To what extent do you agree with this statement? Support your argument with relevant examples and evidence.",
    word_min: 280,
    word_max: 320,
  },
]

const flashcards = [
  { word: "meticulous", pos: "adjective", definition: "Showing great attention to detail; very careful and precise.", example: "She was meticulous in her proofreading, catching every minor error.", difficulty: "C1" },
  { word: "concede", pos: "verb", definition: "Admit or acknowledge something reluctantly; yield or surrender.", example: "He finally conceded that the evidence against him was overwhelming.", difficulty: "B2" },
  { word: "ambiguous", pos: "adjective", definition: "Open to more than one interpretation; not having one obvious meaning.", example: "The contract contained several ambiguous clauses that led to disputes.", difficulty: "B2" },
  { word: "resilient", pos: "adjective", definition: "Able to recover quickly from difficult conditions.", example: "Resilient communities bounce back faster after natural disasters.", difficulty: "B2" },
  { word: "deteriorate", pos: "verb", definition: "Become progressively worse.", example: "Air quality tends to deteriorate during rush hour traffic.", difficulty: "B2" },
  { word: "prevalent", pos: "adjective", definition: "Widespread in a particular area or at a particular time.", example: "Smartphone addiction is increasingly prevalent among teenagers.", difficulty: "B2" },
  { word: "scrutinise", pos: "verb", definition: "Examine or inspect closely and thoroughly.", example: "The committee scrutinised every line of the financial report.", difficulty: "C1" },
  { word: "feasible", pos: "adjective", definition: "Possible and practical to do easily or conveniently.", example: "The engineer concluded that the project was technically feasible.", difficulty: "B2" },
  { word: "reluctant", pos: "adjective", definition: "Unwilling and hesitant; disinclined.", example: "She was reluctant to speak in front of a large audience.", difficulty: "B1" },
  { word: "substantial", pos: "adjective", definition: "Of considerable importance, size, or worth.", example: "The company made a substantial profit in the third quarter.", difficulty: "B2" },
  { word: "undermine", pos: "verb", definition: "Erode the base or foundation of; weaken or damage.", example: "Constant interruptions undermine a speaker's confidence.", difficulty: "B2" },
  { word: "inevitable", pos: "adjective", definition: "Certain to happen; unavoidable.", example: "Change is inevitable in a fast-moving industry.", difficulty: "B2" },
  { word: "comprehensive", pos: "adjective", definition: "Including all or nearly all elements or aspects of something.", example: "The report provided a comprehensive overview of market trends.", difficulty: "B2" },
  { word: "diminish", pos: "verb", definition: "Make or become less; reduce.", example: "Repeated failure can diminish a student's motivation to try.", difficulty: "B2" },
  { word: "versatile", pos: "adjective", definition: "Able to adapt or be adapted to many different functions or activities.", example: "A versatile employee is an asset to any organisation.", difficulty: "B1" },
]

async function main() {
  console.log("Seeding speaking tasks...")
  const { error: s1 } = await supabase.from("speaking_tasks").insert(speakingTasks)
  if (s1) console.error("Speaking error:", s1.message)
  else console.log(`  ✓ ${speakingTasks.length} speaking tasks`)

  console.log("Seeding writing prompts...")
  const { error: s2 } = await supabase.from("writing_prompts").insert(writingPrompts)
  if (s2) console.error("Writing error:", s2.message)
  else console.log(`  ✓ ${writingPrompts.length} writing prompts`)

  console.log("Seeding flashcards...")
  const { error: s3 } = await supabase.from("flashcards").insert(flashcards)
  if (s3) console.error("Flashcards error:", s3.message)
  else console.log(`  ✓ ${flashcards.length} flashcards`)

  console.log("Done.")
}

main()
