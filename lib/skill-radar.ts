import { createClient } from "@supabase/supabase-js";

type SkillSeed = {
  slug: string;
  label: string;
  iconKey: string;
  summary: string;
  defaultProgress: number;
};

type SupabaseSkillMetricRow = {
  slug?: string | null;
  progress?: number | null;
};

type SupabaseSkillCategoryRow = {
  id?: string | null;
  label?: string | null;
  title?: string | null;
  emoji?: string | null;
  description?: string | null;
  accent_from?: string | null;
  accent_to?: string | null;
  glow?: string | null;
};

type SupabaseSkillRow = {
  slug?: string | null;
  category_id?: string | null;
  label?: string | null;
  icon_key?: string | null;
  summary?: string | null;
  progress?: number | null;
};

export type SkillShowcaseSkill = {
  slug: string;
  label: string;
  iconKey: string;
  summary: string;
  progress: number;
  categoryId: string;
};

export type SkillShowcaseCategory = {
  id: string;
  label: string;
  title: string;
  emoji: string;
  description: string;
  accentFrom: string;
  accentTo: string;
  glow: string;
  progress: number;
  totalSkills: number;
  skills: SkillShowcaseSkill[];
};

function getNormalizedCategoryTitle(categoryId: string, title: string) {
  if (categoryId === "top-tier" && title.trim().toLowerCase() === "your real strength") {
    return "Core Strengths";
  }

  return title;
}

const skillCategorySeeds: Array<
  Omit<SkillShowcaseCategory, "progress" | "totalSkills" | "skills"> & {
    skills: SkillSeed[];
  }
> = [
  {
    id: "top-tier",
    label: "Category 1",
    title: "Core Strengths",
    emoji: "💥",
    description: "The strongest layer of the stack: product thinking, AI-first execution, and integration-heavy delivery.",
    accentFrom: "#ff8a5b",
    accentTo: "#ffd166",
    glow: "rgba(255, 138, 91, 0.28)",
    skills: [
      {
        slug: "ai-product-development",
        label: "AI Product Development",
        iconKey: "brain-circuit",
        summary: "Ships AI-led product ideas from concept to usable execution with clear workflows and iteration.",
        defaultProgress: 92,
      },
      {
        slug: "ai-assisted-development",
        label: "AI-assisted Development",
        iconKey: "sparkles",
        summary: "Uses AI pair-programming and agentic workflows to move faster without losing code quality.",
        defaultProgress: 90,
      },
      {
        slug: "tool-integration",
        label: "Tool Integration",
        iconKey: "blocks",
        summary: "Connects APIs, platforms, and services into one product flow that feels clean and reliable.",
        defaultProgress: 88,
      },
      {
        slug: "full-stack-product-thinking",
        label: "Full Stack Product Thinking",
        iconKey: "layers-3",
        summary: "Balances UX, backend structure, data flow, and shipping priorities as one product system.",
        defaultProgress: 89,
      },
    ],
  },
  {
    id: "development-skills",
    label: "Category 2",
    title: "Development Skills",
    emoji: "💻",
    description: "Frontend to backend execution for real products, with clean UI, integrations, and responsive delivery.",
    accentFrom: "#60a5fa",
    accentTo: "#22d3ee",
    glow: "rgba(96, 165, 250, 0.26)",
    skills: [
      {
        slug: "full-stack-development",
        label: "Full Stack Development",
        iconKey: "boxes",
        summary: "Builds end-to-end web products across frontend, backend, database, and deployment layers.",
        defaultProgress: 88,
      },
      {
        slug: "frontend-engineering",
        label: "Frontend Engineering (React, Next.js, Svelte)",
        iconKey: "react",
        summary: "Creates polished, responsive interfaces with modern frontend stacks and strong interaction detail.",
        defaultProgress: 90,
      },
      {
        slug: "backend-integration",
        label: "Backend Integration (Firebase, Supabase, Postgres, APIs)",
        iconKey: "server-cog",
        summary: "Wires app logic to auth, data, storage, and third-party services in production-friendly ways.",
        defaultProgress: 86,
      },
      {
        slug: "responsive-ui-design",
        label: "Responsive UI Design",
        iconKey: "monitor-smartphone",
        summary: "Designs layouts that stay sharp and usable across mobile, tablet, and desktop breakpoints.",
        defaultProgress: 91,
      },
    ],
  },
  {
    id: "ai-skills",
    label: "Category 3",
    title: "AI Skills",
    emoji: "🤖",
    description: "Applied GenAI work focused on prompting, orchestration, workflow design, and model integration.",
    accentFrom: "#2dd4bf",
    accentTo: "#06b6d4",
    glow: "rgba(45, 212, 191, 0.24)",
    skills: [
      {
        slug: "generative-ai-applications",
        label: "Generative AI Applications",
        iconKey: "stars",
        summary: "Builds practical GenAI experiences around content, automation, and assistant-style interfaces.",
        defaultProgress: 89,
      },
      {
        slug: "prompt-engineering",
        label: "Prompt Engineering",
        iconKey: "bot",
        summary: "Designs prompt structures that improve output consistency, control, and system usefulness.",
        defaultProgress: 93,
      },
      {
        slug: "vertex-gemini-integration",
        label: "Vertex AI & Gemini Integration",
        iconKey: "google",
        summary: "Works with hosted model platforms and Google AI tooling for integrated product workflows.",
        defaultProgress: 84,
      },
      {
        slug: "ai-workflow-design",
        label: "AI Workflow Design",
        iconKey: "workflow",
        summary: "Plans multi-step AI flows with retrieval, tooling, orchestration, and user-facing output in mind.",
        defaultProgress: 87,
      },
    ],
  },
  {
    id: "programming",
    label: "Category 4",
    title: "Programming",
    emoji: "⚙️",
    description: "Core languages used for shipping products, solving problems, and building practical systems.",
    accentFrom: "#4ade80",
    accentTo: "#22c55e",
    glow: "rgba(74, 222, 128, 0.22)",
    skills: [
      {
        slug: "python",
        label: "Python",
        iconKey: "python",
        summary: "Uses Python for automation, scripting, AI experimentation, and backend-oriented problem solving.",
        defaultProgress: 88,
      },
      {
        slug: "c",
        label: "C",
        iconKey: "c",
        summary: "Understands low-level programming fundamentals through core C syntax, memory, and logic building.",
        defaultProgress: 77,
      },
      {
        slug: "cpp-dsa",
        label: "C++ (DSA)",
        iconKey: "cplusplus",
        summary: "Applies C++ mainly for data structures, algorithms, and competitive problem-solving practice.",
        defaultProgress: 82,
      },
      {
        slug: "typescript",
        label: "TypeScript",
        iconKey: "typescript",
        summary: "Uses TypeScript to keep app code safer, clearer, and easier to scale across frontend work.",
        defaultProgress: 87,
      },
      {
        slug: "sql",
        label: "SQL",
        iconKey: "database",
        summary: "Works comfortably with relational queries, filtering, joins, and structured app data design.",
        defaultProgress: 84,
      },
    ],
  },
  {
    id: "core-cs",
    label: "Category 5",
    title: "Core CS",
    emoji: "🧠",
    description: "Foundational CS concepts that support better system design, implementation, and debugging.",
    accentFrom: "#fb923c",
    accentTo: "#ef4444",
    glow: "rgba(251, 146, 60, 0.22)",
    skills: [
      {
        slug: "data-structures-algorithms",
        label: "Data Structures & Algorithms",
        iconKey: "binary",
        summary: "Uses core algorithmic thinking to improve problem solving, debugging, and implementation quality.",
        defaultProgress: 84,
      },
      {
        slug: "dbms",
        label: "DBMS",
        iconKey: "database-zap",
        summary: "Understands relational database concepts, normalization, indexing, and data modeling basics.",
        defaultProgress: 81,
      },
      {
        slug: "computer-networks",
        label: "Computer Networks",
        iconKey: "network",
        summary: "Knows the networking fundamentals that help with APIs, deployment, and system communication flow.",
        defaultProgress: 76,
      },
      {
        slug: "linear-algebra-for-ml",
        label: "Linear Algebra for ML",
        iconKey: "sigma",
        summary: "Uses linear algebra foundations to better understand ML concepts and model-related reasoning.",
        defaultProgress: 74,
      },
    ],
  },
  {
    id: "tools",
    label: "Category 6",
    title: "Tools",
    emoji: "🛠",
    description: "Deployment, design, cloud, and AI tooling used across product workflows and daily development.",
    accentFrom: "#cbd5e1",
    accentTo: "#7c3aed",
    glow: "rgba(148, 163, 184, 0.24)",
    skills: [
      {
        slug: "git-github",
        label: "Git & GitHub",
        iconKey: "github",
        summary: "Uses GitHub-based workflows for versioning, collaboration, and shipping projects cleanly.",
        defaultProgress: 90,
      },
      {
        slug: "docker",
        label: "Docker",
        iconKey: "docker",
        summary: "Uses containers for repeatable local setups, cleaner deployment flow, and service isolation.",
        defaultProgress: 76,
      },
      {
        slug: "claude-code",
        label: "Claude Code",
        iconKey: "anthropic",
        summary: "Uses Claude Code for structured editing, reasoning-heavy implementation, and faster iteration.",
        defaultProgress: 89,
      },
      {
        slug: "codex",
        label: "Codex",
        iconKey: "openai",
        summary: "Leverages OpenAI coding workflows to accelerate implementation, exploration, and refactors.",
        defaultProgress: 91,
      },
      {
        slug: "opencode",
        label: "OpenCode",
        iconKey: "code-2",
        summary: "Explores code-focused tooling that helps streamline editing, understanding, and delivery speed.",
        defaultProgress: 82,
      },
      {
        slug: "vercel",
        label: "Vercel",
        iconKey: "vercel",
        summary: "Deploys frontend apps with a fast preview workflow and simple production hosting setup.",
        defaultProgress: 88,
      },
      {
        slug: "firebase",
        label: "Firebase",
        iconKey: "firebase",
        summary: "Uses Firebase services where real-time data, auth, and lightweight backend tooling fit best.",
        defaultProgress: 83,
      },
      {
        slug: "supabase",
        label: "Supabase",
        iconKey: "supabase",
        summary: "Uses Supabase for relational data, storage, and frontend-friendly backend workflows.",
        defaultProgress: 88,
      },
      {
        slug: "oracle-cloud-oci",
        label: "Oracle Cloud (OCI)",
        iconKey: "oracle",
        summary: "Works with OCI as part of cloud experimentation, deployment learning, and infra exposure.",
        defaultProgress: 72,
      },
      {
        slug: "figma",
        label: "Figma",
        iconKey: "figma",
        summary: "Uses Figma to translate ideas into cleaner UI structure, layout planning, and visual direction.",
        defaultProgress: 85,
      },
      {
        slug: "claude-design",
        label: "Claude Design",
        iconKey: "palette",
        summary: "Uses AI-assisted design workflows to refine interface concepts, hierarchy, and presentation.",
        defaultProgress: 81,
      },
      {
        slug: "google-stitch",
        label: "Google Stitch",
        iconKey: "google",
        summary: "Experiments with Google tooling that supports AI-assisted building and visual workflow design.",
        defaultProgress: 78,
      },
    ],
  },
];

const seedSkillBySlug = new Map(
  skillCategorySeeds.flatMap((category) =>
    category.skills.map((skill) => [
      skill.slug,
      {
        ...skill,
        categoryId: category.id,
      },
    ]),
  ),
);

function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isNonEmptyText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function averageProgress(skills: Array<{ progress: number }>) {
  if (skills.length === 0) {
    return 0;
  }

  const total = skills.reduce((sum, skill) => sum + skill.progress, 0);
  return Math.round(total / skills.length);
}

function buildSeedCategories(progressOverrides = new Map<string, number>()): SkillShowcaseCategory[] {
  return skillCategorySeeds.map((category) => {
    const skills = category.skills.map((skill) => ({
      slug: skill.slug,
      label: skill.label,
      iconKey: skill.iconKey,
      summary: skill.summary,
      categoryId: category.id,
      progress: progressOverrides.get(skill.slug) ?? clampProgress(skill.defaultProgress),
    }));

    return {
      id: category.id,
      label: category.label,
      title: getNormalizedCategoryTitle(category.id, category.title),
      emoji: category.emoji,
      description: category.description,
      accentFrom: category.accentFrom,
      accentTo: category.accentTo,
      glow: category.glow,
      progress: averageProgress(skills),
      totalSkills: skills.length,
      skills,
    };
  });
}

async function getSupabaseSkillProgressMap() {
  const client = getServerSupabaseClient();

  if (!client) {
    return new Map<string, number>();
  }

  try {
    const { data, error } = await client.from("portfolio_skill_progress").select("slug, progress");

    if (error) {
      const legacy = await client.from("portfolio_skill_metrics").select("slug, progress");

      if (legacy.error || !legacy.data) {
        return new Map<string, number>();
      }

      return new Map(
        legacy.data
          .filter(
            (row): row is SupabaseSkillMetricRow & { slug: string; progress: number } =>
              typeof row.slug === "string" && typeof row.progress === "number",
          )
          .map((row) => [row.slug, clampProgress(row.progress)]),
      );
    }

    if (!data) {
      return new Map<string, number>();
    }

    return new Map(
      data
        .filter(
          (row): row is SupabaseSkillMetricRow & { slug: string; progress: number } =>
            typeof row.slug === "string" && typeof row.progress === "number",
        )
        .map((row) => [row.slug, clampProgress(row.progress)]),
    );
  } catch {
    return new Map<string, number>();
  }
}

async function getSupabaseSkillShowcaseCategories() {
  const client = getServerSupabaseClient();

  if (!client) {
    return null;
  }

  try {
    const [categoryResult, skillResult] = await Promise.all([
      client
        .from("portfolio_skill_categories")
        .select("id, label, title, emoji, description, accent_from, accent_to, glow")
        .order("sort_order", { ascending: true }),
      client
        .from("portfolio_skill_progress")
        .select("slug, category_id, label, icon_key, summary, progress")
        .order("category_id", { ascending: true })
        .order("sort_order", { ascending: true }),
    ]);

    if (
      categoryResult.error ||
      skillResult.error ||
      !categoryResult.data?.length ||
      !skillResult.data?.length
    ) {
      return null;
    }

    const validCategories = categoryResult.data.filter(
      (row): row is SupabaseSkillCategoryRow & {
        id: string;
        label: string;
        title: string;
        emoji: string;
        description: string;
        accent_from: string;
        accent_to: string;
        glow: string;
      } =>
        isNonEmptyText(row.id) &&
        isNonEmptyText(row.label) &&
        isNonEmptyText(row.title) &&
        isNonEmptyText(row.emoji) &&
        isNonEmptyText(row.description) &&
        isNonEmptyText(row.accent_from) &&
        isNonEmptyText(row.accent_to) &&
        isNonEmptyText(row.glow),
    );

    const validSkills = skillResult.data.filter(
      (row): row is SupabaseSkillRow & {
        slug: string;
        category_id: string;
        label: string;
        icon_key: string;
        summary: string | null;
        progress: number;
      } =>
        isNonEmptyText(row.slug) &&
        isNonEmptyText(row.category_id) &&
        isNonEmptyText(row.label) &&
        isNonEmptyText(row.icon_key) &&
        typeof row.progress === "number",
    );

    if (validCategories.length === 0 || validSkills.length === 0) {
      return null;
    }

    const skillsByCategory = new Map<string, SkillShowcaseSkill[]>();

    validSkills.forEach((row) => {
      const seedSkill = seedSkillBySlug.get(row.slug);
      const nextSkill: SkillShowcaseSkill = {
        slug: row.slug,
        label: row.label,
        iconKey: row.icon_key,
        summary:
          isNonEmptyText(row.summary) ?
            row.summary
          : seedSkill?.summary ?? `${row.label} tracked from Supabase for the portfolio skills showcase.`,
        progress: clampProgress(row.progress),
        categoryId: row.category_id,
      };
      const categorySkills = skillsByCategory.get(row.category_id) ?? [];
      categorySkills.push(nextSkill);
      skillsByCategory.set(row.category_id, categorySkills);
    });

    const categories = validCategories
      .map((row) => {
        const skills = skillsByCategory.get(row.id) ?? [];

        if (skills.length === 0) {
          return null;
        }

        return {
          id: row.id,
          label: row.label,
          title: getNormalizedCategoryTitle(row.id, row.title),
          emoji: row.emoji,
          description: row.description,
          accentFrom: row.accent_from,
          accentTo: row.accent_to,
          glow: row.glow,
          progress: averageProgress(skills),
          totalSkills: skills.length,
          skills,
        };
      })
      .filter((category): category is SkillShowcaseCategory => category !== null);

    return categories.length > 0 ? categories : null;
  } catch {
    return null;
  }
}

export async function getSkillShowcaseCategories(): Promise<SkillShowcaseCategory[]> {
  const supabaseCategories = await getSupabaseSkillShowcaseCategories();

  if (supabaseCategories) {
    return supabaseCategories;
  }

  const supabaseProgress = await getSupabaseSkillProgressMap();
  return buildSeedCategories(supabaseProgress);
}
