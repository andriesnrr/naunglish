-- ============================================================
-- Naunglish — Full Schema + RLS
-- Run this in Supabase SQL Editor (once, in order)
-- ============================================================

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  avatar_url text,
  starting_cefr text,
  current_cefr text,
  exam_date date,
  role text default 'user',
  created_at timestamptz default now()
);

-- Questions
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  skill text not null,
  difficulty text not null,
  type text not null,
  prompt text not null,
  passage text,
  audio_text text,
  options jsonb not null,
  answer int not null,
  explanation text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Flashcards
create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  pos text not null,
  definition text not null,
  example text not null,
  difficulty text not null,
  created_at timestamptz default now()
);

-- Speaking tasks
create table if not exists speaking_tasks (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  content text not null,
  difficulty text not null,
  created_at timestamptz default now()
);

-- Writing prompts
create table if not exists writing_prompts (
  id uuid primary key default gen_random_uuid(),
  prompt text not null,
  difficulty text not null,
  word_min int default 150,
  word_max int default 250,
  created_at timestamptz default now()
);

-- User progress (per question attempt)
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  correct boolean not null,
  answered_at timestamptz default now()
);

-- User scores (per skill per session)
create table if not exists user_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  skill text not null,
  score_pct int not null,
  cefr_band text not null,
  taken_at timestamptz default now()
);

-- Mock test results
create table if not exists mock_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  total_score int not null,
  cefr_band text not null,
  breakdown jsonb not null,
  taken_at timestamptz default now()
);

-- Speaking attempts
create table if not exists speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  task_id uuid references speaking_tasks(id) on delete cascade,
  transcript text,
  score_accuracy int,
  score_fluency int,
  ai_feedback text,
  recorded_at timestamptz default now()
);

-- Writing submissions
create table if not exists writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  prompt_id uuid references writing_prompts(id) on delete cascade,
  content text not null,
  feedback jsonb,
  score int,
  submitted_at timestamptz default now()
);

-- Notebook entries
create table if not exists notebook_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  content text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- Streaks
create table if not exists streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  current_streak int default 0,
  longest_streak int default 0,
  last_active date
);

-- Study plans
create table if not exists study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  exam_date date,
  daily_targets jsonb,
  generated_at timestamptz default now()
);

-- Leaderboard scores
create table if not exists leaderboard_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  xp int default 0,
  weekly_xp int default 0,
  updated_at timestamptz default now()
);

-- Placement test results
create table if not exists placement_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  cefr_result text not null,
  answers jsonb,
  taken_at timestamptz default now()
);

-- User settings
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  daily_goal int default 20,
  notif_email boolean default true,
  privacy_public boolean default false
);

-- Tutor sessions
create table if not exists tutor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  messages jsonb not null,
  context jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table users enable row level security;
alter table user_progress enable row level security;
alter table user_scores enable row level security;
alter table mock_results enable row level security;
alter table speaking_attempts enable row level security;
alter table writing_submissions enable row level security;
alter table notebook_entries enable row level security;
alter table streaks enable row level security;
alter table study_plans enable row level security;
alter table leaderboard_scores enable row level security;
alter table placement_results enable row level security;
alter table user_settings enable row level security;
alter table tutor_sessions enable row level security;

-- Public read for content tables (no RLS needed for anon read)
-- questions, flashcards, speaking_tasks, writing_prompts are read-only for users

-- Users: own row only
create policy "users_select_own" on users for select using (id = auth.uid());
create policy "users_update_own" on users for update using (id = auth.uid());

-- User progress
create policy "user_progress_select_own" on user_progress for select using (user_id = auth.uid());
create policy "user_progress_insert_own" on user_progress for insert with check (user_id = auth.uid());

-- User scores
create policy "user_scores_select_own" on user_scores for select using (user_id = auth.uid());
create policy "user_scores_insert_own" on user_scores for insert with check (user_id = auth.uid());

-- Mock results
create policy "mock_results_select_own" on mock_results for select using (user_id = auth.uid());
create policy "mock_results_insert_own" on mock_results for insert with check (user_id = auth.uid());

-- Speaking attempts
create policy "speaking_attempts_select_own" on speaking_attempts for select using (user_id = auth.uid());
create policy "speaking_attempts_insert_own" on speaking_attempts for insert with check (user_id = auth.uid());

-- Writing submissions
create policy "writing_submissions_select_own" on writing_submissions for select using (user_id = auth.uid());
create policy "writing_submissions_insert_own" on writing_submissions for insert with check (user_id = auth.uid());

-- Notebook entries
create policy "notebook_entries_select_own" on notebook_entries for select using (user_id = auth.uid());
create policy "notebook_entries_insert_own" on notebook_entries for insert with check (user_id = auth.uid());
create policy "notebook_entries_delete_own" on notebook_entries for delete using (user_id = auth.uid());

-- Streaks
create policy "streaks_select_own" on streaks for select using (user_id = auth.uid());
create policy "streaks_upsert_own" on streaks for insert with check (user_id = auth.uid());
create policy "streaks_update_own" on streaks for update using (user_id = auth.uid());

-- Study plans
create policy "study_plans_select_own" on study_plans for select using (user_id = auth.uid());
create policy "study_plans_upsert_own" on study_plans for insert with check (user_id = auth.uid());
create policy "study_plans_update_own" on study_plans for update using (user_id = auth.uid());

-- Leaderboard: all users can read (for leaderboard feature), own row write
create policy "leaderboard_select_all" on leaderboard_scores for select using (true);
create policy "leaderboard_upsert_own" on leaderboard_scores for insert with check (user_id = auth.uid());
create policy "leaderboard_update_own" on leaderboard_scores for update using (user_id = auth.uid());

-- Placement results
create policy "placement_results_select_own" on placement_results for select using (user_id = auth.uid());
create policy "placement_results_insert_own" on placement_results for insert with check (user_id = auth.uid());

-- User settings
create policy "user_settings_select_own" on user_settings for select using (user_id = auth.uid());
create policy "user_settings_upsert_own" on user_settings for insert with check (user_id = auth.uid());
create policy "user_settings_update_own" on user_settings for update using (user_id = auth.uid());

-- Tutor sessions
create policy "tutor_sessions_select_own" on tutor_sessions for select using (user_id = auth.uid());
create policy "tutor_sessions_insert_own" on tutor_sessions for insert with check (user_id = auth.uid());
create policy "tutor_sessions_update_own" on tutor_sessions for update using (user_id = auth.uid());
