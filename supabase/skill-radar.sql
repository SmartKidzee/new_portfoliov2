begin;

create table if not exists public.portfolio_skill_categories (
  id text primary key,
  label text not null,
  title text not null,
  emoji text not null,
  description text not null,
  accent_from text not null,
  accent_to text not null,
  glow text not null,
  sort_order integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.portfolio_skill_progress (
  slug text primary key,
  category_id text not null references public.portfolio_skill_categories(id) on delete cascade,
  label text not null,
  icon_key text not null,
  summary text not null,
  progress smallint not null check (progress between 0 and 100),
  sort_order integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.portfolio_skill_categories
  add column if not exists glow text;

alter table public.portfolio_skill_progress
  add column if not exists summary text;

create unique index if not exists portfolio_skill_categories_sort_order_uidx
  on public.portfolio_skill_categories (sort_order);

create unique index if not exists portfolio_skill_progress_category_sort_uidx
  on public.portfolio_skill_progress (category_id, sort_order);

create index if not exists portfolio_skill_progress_category_idx
  on public.portfolio_skill_progress (category_id);

update public.portfolio_skill_categories
set glow = case id
  when 'top-tier' then 'rgba(255, 138, 91, 0.28)'
  when 'development-skills' then 'rgba(96, 165, 250, 0.26)'
  when 'ai-skills' then 'rgba(45, 212, 191, 0.24)'
  when 'programming' then 'rgba(74, 222, 128, 0.22)'
  when 'core-cs' then 'rgba(251, 146, 60, 0.22)'
  when 'tools' then 'rgba(148, 163, 184, 0.24)'
  else 'rgba(137, 170, 204, 0.24)'
end
where glow is null;

update public.portfolio_skill_progress
set summary = case slug
  when 'ai-product-development' then 'Ships AI-led product ideas from concept to usable execution with clear workflows and iteration.'
  when 'ai-assisted-development' then 'Uses AI pair-programming and agentic workflows to move faster without losing code quality.'
  when 'tool-integration' then 'Connects APIs, platforms, and services into one product flow that feels clean and reliable.'
  when 'full-stack-product-thinking' then 'Balances UX, backend structure, data flow, and shipping priorities as one product system.'
  when 'full-stack-development' then 'Builds end-to-end web products across frontend, backend, database, and deployment layers.'
  when 'frontend-engineering' then 'Creates polished, responsive interfaces with modern frontend stacks and strong interaction detail.'
  when 'backend-integration' then 'Wires app logic to auth, data, storage, and third-party services in production-friendly ways.'
  when 'responsive-ui-design' then 'Designs layouts that stay sharp and usable across mobile, tablet, and desktop breakpoints.'
  when 'generative-ai-applications' then 'Builds practical GenAI experiences around content, automation, and assistant-style interfaces.'
  when 'prompt-engineering' then 'Designs prompt structures that improve output consistency, control, and system usefulness.'
  when 'vertex-gemini-integration' then 'Works with hosted model platforms and Google AI tooling for integrated product workflows.'
  when 'ai-workflow-design' then 'Plans multi-step AI flows with retrieval, tooling, orchestration, and user-facing output in mind.'
  when 'python' then 'Uses Python for automation, scripting, AI experimentation, and backend-oriented problem solving.'
  when 'c' then 'Understands low-level programming fundamentals through core C syntax, memory, and logic building.'
  when 'cpp-dsa' then 'Applies C++ mainly for data structures, algorithms, and competitive problem-solving practice.'
  when 'typescript' then 'Uses TypeScript to keep app code safer, clearer, and easier to scale across frontend work.'
  when 'sql' then 'Works comfortably with relational queries, filtering, joins, and structured app data design.'
  when 'data-structures-algorithms' then 'Uses core algorithmic thinking to improve problem solving, debugging, and implementation quality.'
  when 'dbms' then 'Understands relational database concepts, normalization, indexing, and data modeling basics.'
  when 'computer-networks' then 'Knows the networking fundamentals that help with APIs, deployment, and system communication flow.'
  when 'linear-algebra-for-ml' then 'Uses linear algebra foundations to better understand ML concepts and model-related reasoning.'
  when 'git-github' then 'Uses GitHub-based workflows for versioning, collaboration, and shipping projects cleanly.'
  when 'docker' then 'Uses containers for repeatable local setups, cleaner deployment flow, and service isolation.'
  when 'claude-code' then 'Uses Claude Code for structured editing, reasoning-heavy implementation, and faster iteration.'
  when 'codex' then 'Leverages OpenAI coding workflows to accelerate implementation, exploration, and refactors.'
  when 'opencode' then 'Explores code-focused tooling that helps streamline editing, understanding, and delivery speed.'
  when 'vercel' then 'Deploys frontend apps with a fast preview workflow and simple production hosting setup.'
  when 'firebase' then 'Uses Firebase services where real-time data, auth, and lightweight backend tooling fit best.'
  when 'supabase' then 'Uses Supabase for relational data, storage, and frontend-friendly backend workflows.'
  when 'oracle-cloud-oci' then 'Works with OCI as part of cloud experimentation, deployment learning, and infra exposure.'
  when 'figma' then 'Uses Figma to translate ideas into cleaner UI structure, layout planning, and visual direction.'
  when 'claude-design' then 'Uses AI-assisted design workflows to refine interface concepts, hierarchy, and presentation.'
  when 'google-stitch' then 'Experiments with Google tooling that supports AI-assisted building and visual workflow design.'
  else 'Tracked skill entry for the portfolio skills showcase.'
end
where summary is null;

alter table public.portfolio_skill_categories
  alter column glow set not null;

alter table public.portfolio_skill_progress
  alter column summary set not null;

create or replace function public.set_portfolio_skill_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists portfolio_skill_categories_set_updated_at on public.portfolio_skill_categories;
create trigger portfolio_skill_categories_set_updated_at
before update on public.portfolio_skill_categories
for each row
execute function public.set_portfolio_skill_updated_at();

drop trigger if exists portfolio_skill_progress_set_updated_at on public.portfolio_skill_progress;
create trigger portfolio_skill_progress_set_updated_at
before update on public.portfolio_skill_progress
for each row
execute function public.set_portfolio_skill_updated_at();

alter table public.portfolio_skill_categories enable row level security;
alter table public.portfolio_skill_progress enable row level security;

grant select on public.portfolio_skill_categories to anon, authenticated;
grant select on public.portfolio_skill_progress to anon, authenticated;

drop policy if exists "portfolio_skill_categories_public_read" on public.portfolio_skill_categories;
create policy "portfolio_skill_categories_public_read"
on public.portfolio_skill_categories
for select
to anon, authenticated
using (true);

drop policy if exists "portfolio_skill_progress_public_read" on public.portfolio_skill_progress;
create policy "portfolio_skill_progress_public_read"
on public.portfolio_skill_progress
for select
to anon, authenticated
using (true);

drop policy if exists "portfolio_skill_categories_authenticated_write" on public.portfolio_skill_categories;
create policy "portfolio_skill_categories_authenticated_write"
on public.portfolio_skill_categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "portfolio_skill_progress_authenticated_write" on public.portfolio_skill_progress;
create policy "portfolio_skill_progress_authenticated_write"
on public.portfolio_skill_progress
for all
to authenticated
using (true)
with check (true);

insert into public.portfolio_skill_categories (
  id,
  label,
  title,
  emoji,
  description,
  accent_from,
  accent_to,
  glow,
  sort_order
)
values
  ('top-tier', 'Category 1', 'Core Strengths', '💥', 'The strongest layer of the stack: product thinking, AI-first execution, and integration-heavy delivery.', '#ff8a5b', '#ffd166', 'rgba(255, 138, 91, 0.28)', 10),
  ('development-skills', 'Category 2', 'Development Skills', '💻', 'Frontend to backend execution for real products, with clean UI, integrations, and responsive delivery.', '#60a5fa', '#22d3ee', 'rgba(96, 165, 250, 0.26)', 20),
  ('ai-skills', 'Category 3', 'AI Skills', '🤖', 'Applied GenAI work focused on prompting, orchestration, workflow design, and model integration.', '#2dd4bf', '#06b6d4', 'rgba(45, 212, 191, 0.24)', 30),
  ('programming', 'Category 4', 'Programming', '⚙️', 'Core languages used for shipping products, solving problems, and building practical systems.', '#4ade80', '#22c55e', 'rgba(74, 222, 128, 0.22)', 40),
  ('core-cs', 'Category 5', 'Core CS', '🧠', 'Foundational CS concepts that support better system design, implementation, and debugging.', '#fb923c', '#ef4444', 'rgba(251, 146, 60, 0.22)', 50),
  ('tools', 'Category 6', 'Tools', '🛠', 'Deployment, design, cloud, and AI tooling used across product workflows and daily development.', '#cbd5e1', '#7c3aed', 'rgba(148, 163, 184, 0.24)', 60)
on conflict (id) do update
set
  label = excluded.label,
  title = excluded.title,
  emoji = excluded.emoji,
  description = excluded.description,
  accent_from = excluded.accent_from,
  accent_to = excluded.accent_to,
  glow = excluded.glow,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

insert into public.portfolio_skill_progress (
  slug,
  category_id,
  label,
  icon_key,
  summary,
  progress,
  sort_order
)
values
  ('ai-product-development', 'top-tier', 'AI Product Development', 'brain-circuit', 'Ships AI-led product ideas from concept to usable execution with clear workflows and iteration.', 92, 10),
  ('ai-assisted-development', 'top-tier', 'AI-assisted Development', 'sparkles', 'Uses AI pair-programming and agentic workflows to move faster without losing code quality.', 90, 20),
  ('tool-integration', 'top-tier', 'Tool Integration', 'blocks', 'Connects APIs, platforms, and services into one product flow that feels clean and reliable.', 88, 30),
  ('full-stack-product-thinking', 'top-tier', 'Full Stack Product Thinking', 'layers-3', 'Balances UX, backend structure, data flow, and shipping priorities as one product system.', 89, 40),

  ('full-stack-development', 'development-skills', 'Full Stack Development', 'boxes', 'Builds end-to-end web products across frontend, backend, database, and deployment layers.', 88, 10),
  ('frontend-engineering', 'development-skills', 'Frontend Engineering (React, Next.js, Svelte)', 'react', 'Creates polished, responsive interfaces with modern frontend stacks and strong interaction detail.', 90, 20),
  ('backend-integration', 'development-skills', 'Backend Integration (Firebase, Supabase, Postgres, APIs)', 'server-cog', 'Wires app logic to auth, data, storage, and third-party services in production-friendly ways.', 86, 30),
  ('responsive-ui-design', 'development-skills', 'Responsive UI Design', 'monitor-smartphone', 'Designs layouts that stay sharp and usable across mobile, tablet, and desktop breakpoints.', 91, 40),

  ('generative-ai-applications', 'ai-skills', 'Generative AI Applications', 'stars', 'Builds practical GenAI experiences around content, automation, and assistant-style interfaces.', 89, 10),
  ('prompt-engineering', 'ai-skills', 'Prompt Engineering', 'bot', 'Designs prompt structures that improve output consistency, control, and system usefulness.', 93, 20),
  ('vertex-gemini-integration', 'ai-skills', 'Vertex AI & Gemini Integration', 'google', 'Works with hosted model platforms and Google AI tooling for integrated product workflows.', 84, 30),
  ('ai-workflow-design', 'ai-skills', 'AI Workflow Design', 'workflow', 'Plans multi-step AI flows with retrieval, tooling, orchestration, and user-facing output in mind.', 87, 40),

  ('python', 'programming', 'Python', 'python', 'Uses Python for automation, scripting, AI experimentation, and backend-oriented problem solving.', 88, 10),
  ('c', 'programming', 'C', 'c', 'Understands low-level programming fundamentals through core C syntax, memory, and logic building.', 77, 20),
  ('cpp-dsa', 'programming', 'C++ (DSA)', 'cplusplus', 'Applies C++ mainly for data structures, algorithms, and competitive problem-solving practice.', 82, 30),
  ('typescript', 'programming', 'TypeScript', 'typescript', 'Uses TypeScript to keep app code safer, clearer, and easier to scale across frontend work.', 87, 40),
  ('sql', 'programming', 'SQL', 'database', 'Works comfortably with relational queries, filtering, joins, and structured app data design.', 84, 50),

  ('data-structures-algorithms', 'core-cs', 'Data Structures & Algorithms', 'binary', 'Uses core algorithmic thinking to improve problem solving, debugging, and implementation quality.', 84, 10),
  ('dbms', 'core-cs', 'DBMS', 'database-zap', 'Understands relational database concepts, normalization, indexing, and data modeling basics.', 81, 20),
  ('computer-networks', 'core-cs', 'Computer Networks', 'network', 'Knows the networking fundamentals that help with APIs, deployment, and system communication flow.', 76, 30),
  ('linear-algebra-for-ml', 'core-cs', 'Linear Algebra for ML', 'sigma', 'Uses linear algebra foundations to better understand ML concepts and model-related reasoning.', 74, 40),

  ('git-github', 'tools', 'Git & GitHub', 'github', 'Uses GitHub-based workflows for versioning, collaboration, and shipping projects cleanly.', 90, 10),
  ('docker', 'tools', 'Docker', 'docker', 'Uses containers for repeatable local setups, cleaner deployment flow, and service isolation.', 76, 20),
  ('claude-code', 'tools', 'Claude Code', 'anthropic', 'Uses Claude Code for structured editing, reasoning-heavy implementation, and faster iteration.', 89, 30),
  ('codex', 'tools', 'Codex', 'openai', 'Leverages OpenAI coding workflows to accelerate implementation, exploration, and refactors.', 91, 40),
  ('opencode', 'tools', 'OpenCode', 'code-2', 'Explores code-focused tooling that helps streamline editing, understanding, and delivery speed.', 82, 50),
  ('vercel', 'tools', 'Vercel', 'vercel', 'Deploys frontend apps with a fast preview workflow and simple production hosting setup.', 88, 60),
  ('firebase', 'tools', 'Firebase', 'firebase', 'Uses Firebase services where real-time data, auth, and lightweight backend tooling fit best.', 83, 70),
  ('supabase', 'tools', 'Supabase', 'supabase', 'Uses Supabase for relational data, storage, and frontend-friendly backend workflows.', 88, 80),
  ('oracle-cloud-oci', 'tools', 'Oracle Cloud (OCI)', 'oracle', 'Works with OCI as part of cloud experimentation, deployment learning, and infra exposure.', 72, 90),
  ('figma', 'tools', 'Figma', 'figma', 'Uses Figma to translate ideas into cleaner UI structure, layout planning, and visual direction.', 85, 100),
  ('claude-design', 'tools', 'Claude Design', 'palette', 'Uses AI-assisted design workflows to refine interface concepts, hierarchy, and presentation.', 81, 110),
  ('google-stitch', 'tools', 'Google Stitch', 'google', 'Experiments with Google tooling that supports AI-assisted building and visual workflow design.', 78, 120)
on conflict (slug) do update
set
  category_id = excluded.category_id,
  label = excluded.label,
  icon_key = excluded.icon_key,
  summary = excluded.summary,
  progress = excluded.progress,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());

commit;
