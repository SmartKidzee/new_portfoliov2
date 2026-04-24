import aboutData from "@/content-data/about.json";
import contactData from "@/content-data/contact.json";
import educationData from "@/content-data/education.json";
import experienceData from "@/content-data/experience.json";
import footerData from "@/content-data/footer.json";
import homeData from "@/content-data/home.json";
import projectsData from "@/content-data/projects.json";
import siteMetadata from "@/content-data/site-metadata.json";
import statsData from "@/content-data/stats.json";
import timelineData from "@/content-data/timeline.json";

type Project = (typeof projectsData.projects)[number];

const safeMediaSource = (src?: string | null) =>
  src && (/^https?:\/\//.test(src) || src.startsWith("/")) ? src : null;

const safeProjectHref = (project: Project) => {
  if (project.links.live && !project.links.live.includes("shreyas.cloud")) {
    return project.links.live;
  }

  return project.links.repository ?? "#";
};

const featuredWorks = projectsData.projects.map((project, index) => ({
    id: project.id,
    title: project.name,
    subtitle: project.tagline,
    description: project.summary,
    href: safeProjectHref(project),
    image: safeMediaSource(project.media.coverImage),
    accent:
      index % 2 === 0
        ? "from-[#132133] via-[#213d5d] to-[#0b111a]"
        : "from-[#1c1c2f] via-[#2a4d78] to-[#0f1017]",
    meta: project.stack.primary.slice(0, 4),
    pillLabel: project.status,
  }));

export const portfolioContent = {
  metadata: siteMetadata.content,
  home: homeData.content,
  about: aboutData.content,
  contact: contactData.content,
  education: educationData.content,
  experience: experienceData.content,
  footer: footerData.content,
  stats: statsData.content,
  timeline: timelineData.content,
  projects: projectsData.projects as Project[],
  featuredWorks,
  roles: [
    "Student, Content Creator & Builder",
    "Upcoming Agentic Engineer & Full Stack Developer",
    "Building AI Systems & Scalable Web Apps",
  ],
};

export type PortfolioContent = typeof portfolioContent;
export type PortfolioProject = Project;
