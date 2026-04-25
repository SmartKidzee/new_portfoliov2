import { HomePageLoaderShell } from "@/components/home-page-loader-shell";
import { getLatestBlogs } from "@/lib/blogs";
import { portfolioContent } from "@/lib/content";
import { getSkillShowcaseCategories } from "@/lib/skill-radar";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [latestPosts, skillCategories] = await Promise.all([getLatestBlogs(4), getSkillShowcaseCategories()]);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${portfolioContent.metadata.canonicalUrl}/#person`,
        name: portfolioContent.metadata.personStructuredData.name,
        jobTitle: "AI Systems & Full-Stack Builder",
        description: portfolioContent.metadata.description,
        url: portfolioContent.metadata.canonicalUrl,
        image: `${portfolioContent.metadata.canonicalUrl}/hero_image.webp`,
        sameAs: portfolioContent.metadata.personStructuredData.sameAsLinks,
        knowsAbout: [
          "Artificial Intelligence",
          "Machine Learning",
          "Full-Stack Development",
          "Next.js",
          "React",
          "TypeScript",
          "Product Design",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${portfolioContent.metadata.canonicalUrl}/#website`,
        name: portfolioContent.metadata.title,
        url: portfolioContent.metadata.canonicalUrl,
        description: portfolioContent.metadata.description,
        publisher: {
          "@id": `${portfolioContent.metadata.canonicalUrl}/#person`,
        },
        inLanguage: "en-US",
      },
      {
        "@type": "WebPage",
        "@id": `${portfolioContent.metadata.canonicalUrl}/#webpage`,
        url: portfolioContent.metadata.canonicalUrl,
        name: `${portfolioContent.metadata.personStructuredData.name} — AI Systems & Full-Stack Builder`,
        isPartOf: {
          "@id": `${portfolioContent.metadata.canonicalUrl}/#website`,
        },
        about: {
          "@id": `${portfolioContent.metadata.canonicalUrl}/#person`,
        },
        description: portfolioContent.metadata.description,
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <HomePageLoaderShell
        content={portfolioContent}
        latestPosts={latestPosts}
        skillCategories={skillCategories}
      />
    </>
  );
}
