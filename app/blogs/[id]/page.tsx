import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { BlogAiAssistant } from "@/components/blog-ai-assistant";
import { BlogPostHero } from "@/components/blog-post-hero";
import { ClientShareButtons } from "@/components/client-share-buttons";
import { LikeButton } from "@/components/like-button";
import { buildBlogContentSignature, getDefaultBlogPromptSuggestions } from "@/lib/blog-ai";
import { buildBlogExcerpt, estimateReadTime } from "@/lib/blog-content";
import { getBlogById } from "@/lib/blogs";

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

type ParsedImage = {
  alt: string;
  src: string;
};

type ParsedTableRow = Record<string, string>;

export const dynamic = "force-dynamic";

// Generate metadata for each blog post
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogById(id);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const description = buildBlogExcerpt(post.content, 155);

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/blogs/${id}`,
    },
    openGraph: {
      title: post.title,
      description,
      url: `/blogs/${id}`,
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: ["Shreyas J"],
      images: post.src ? [{ url: post.src, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.src ? [post.src] : undefined,
    },
  };
}


function decodeJsString(value: string) {
  return value.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
}

function extractQuotedStrings(value: string) {
  return [...value.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((match) => decodeJsString(match[1]));
}

function extractAttribute(tag: string, attribute: string) {
  const match = tag.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"));
  return match?.[1] ?? "";
}

function createImageFigure(key: string, image: ParsedImage) {
  return (
    <figure key={key} className="h-full w-full">
      <div className="h-full w-full overflow-hidden">
        <img src={image.src} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
      </div>
      {image.alt ? (
        <figcaption className="mt-2 px-2 text-center text-xs text-muted">
          {parseInlineFormatting(image.alt)}
        </figcaption>
      ) : null}
    </figure>
  );
}

function parseBlogTableBlock(block: string) {
  const headersMatch = block.match(/headers=\{\s*\[([\s\S]*?)\]\s*\}/);
  const rowsMatch = block.match(/rows=\{\s*\[([\s\S]*?)\]\s*\}/);

  if (!headersMatch || !rowsMatch) {
    return null;
  }

  const headers = extractQuotedStrings(headersMatch[1]);
  const rows = [...rowsMatch[1].matchAll(/\{([\s\S]*?)\}/g)]
    .map((rowMatch) => {
      const row: ParsedTableRow = {};

      for (const cellMatch of rowMatch[1].matchAll(/"((?:\\.|[^"\\])*)"\s*:\s*"((?:\\.|[^"\\])*)"/g)) {
        row[decodeJsString(cellMatch[1])] = decodeJsString(cellMatch[2]);
      }

      return row;
    })
    .filter((row) => Object.keys(row).length > 0);

  if (headers.length === 0 || rows.length === 0) {
    return null;
  }

  return { headers, rows };
}

function parseBlogImageGridBlock(block: string) {
  return [...block.matchAll(/<img[^>]*>/gi)]
    .map((match) => ({
      alt: extractAttribute(match[0], "alt"),
      src: extractAttribute(match[0], "src"),
    }))
    .filter((image) => image.src);
}

function normalizeMarkdownTable(headers: string[], rows: string[][]) {
  const resolvedHeaders =
    headers.length > 0 ? headers.map((header) => header.trim()) : rows[0]?.map((_, index) => `Column ${index + 1}`) ?? [];

  const normalizedRows = rows.map(
    (row) =>
      Object.fromEntries(
        resolvedHeaders.map((header, index) => [header, row[index]?.trim() ?? ""]),
      ) as ParsedTableRow,
  );

  return { headers: resolvedHeaders, rows: normalizedRows };
}

function ResponsiveTable({ headers, rows }: { headers: string[]; rows: ParsedTableRow[] }) {
  return (
    <div className="my-8">
      <div className="grid gap-4 md:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={`mobile-row-${rowIndex}`}
            className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
          >
            {headers.map((header, cellIndex) => (
              <div
                key={`${header}-${rowIndex}`}
                className={`grid grid-cols-[minmax(96px,112px)_1fr] gap-3 px-4 py-3 ${
                  cellIndex > 0 ? "border-t border-white/8" : ""
                }`}
              >
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted">{header}</span>
                <span className={cellIndex === 0 ? "font-semibold text-text-primary" : "text-muted"}>
                  {parseInlineFormatting(row[header] ?? "")}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.04]">
                {headers.map((header) => (
                  <th
                    key={header}
                    className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-text-primary"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={`desktop-row-${rowIndex}`}
                  className="border-b border-white/6 align-top last:border-b-0 hover:bg-white/[0.025]"
                >
                  {headers.map((header, cellIndex) => (
                    <td
                      key={`${header}-${rowIndex}`}
                      className={`px-5 py-4 leading-7 ${cellIndex === 0 ? "font-semibold text-text-primary" : "text-muted"}`}
                    >
                      {parseInlineFormatting(row[header] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Bento grid for grouped images
function BentoImageGrid({ images }: { images: React.ReactNode[] }) {
  const count = images.length;

  const getGridClass = () => {
    if (count === 2) return "grid-cols-2";
    if (count === 3) return "grid-cols-2 grid-rows-2";
    if (count === 4) return "grid-cols-2 grid-rows-2";
    return "grid-cols-2 md:grid-cols-3";
  };

  const getItemClass = (index: number) => {
    if (count === 3 && index === 0) return "row-span-2";
    if (count >= 5 && index === 0) return "col-span-2 row-span-2 md:col-span-2";
    if (count >= 5 && index === 1) return "md:col-span-1";
    return "";
  };

  return (
    <div className={`my-6 grid ${getGridClass()} gap-3`}>
      {images.map((image, index) => (
        <div
          key={index}
          className={`overflow-hidden rounded-xl border border-white/10 bg-surface/20 ${getItemClass(index)}`}
        >
          <div className="h-full w-full">{image}</div>
        </div>
      ))}
    </div>
  );
}

// Group consecutive images into bento grids
function groupConsecutiveImages(elements: React.ReactNode[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let imageGroup: React.ReactNode[] = [];
  let bentoKey = 0;

  const flushImages = () => {
    if (imageGroup.length === 0) return;

    const currentKey = bentoKey;
    bentoKey += 1;

    if (imageGroup.length === 1) {
      result.push(
        <div key={`single-img-${currentKey}`} className="my-6">
          {imageGroup[0]}
        </div>,
      );
    } else {
      result.push(<BentoImageGrid key={`bento-${currentKey}`} images={imageGroup} />);
    }

    imageGroup = [];
  };

  for (const element of elements) {
    const reactElement = element as React.ReactElement;
    const key = reactElement?.key;
    const isImage = typeof key === "string" && (key.startsWith("img-") || key.startsWith("html-img-"));

    if (isImage) {
      imageGroup.push(element);
    } else {
      flushImages();
      result.push(element);
    }
  }

  flushImages();
  return result;
}

// Parse markdown-like content to JSX with image and table support
const parseContent = (content: string) => {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let unorderedItems: React.ReactNode[] = [];
  let orderedItems: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaders: string[] = [];

  const flushUnorderedList = () => {
    if (unorderedItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-4 space-y-2">
          {unorderedItems}
        </ul>,
      );
      unorderedItems = [];
    }
  };

  const flushOrderedList = () => {
    if (orderedItems.length > 0) {
      elements.push(
        <ol key={`ordered-list-${elements.length}`} className="my-4 ml-5 list-decimal space-y-2 marker:text-[#89AACC]">
          {orderedItems}
        </ol>,
      );
      orderedItems = [];
    }
  };

  const flushLists = () => {
    flushUnorderedList();
    flushOrderedList();
  };

  const flushCodeBlock = () => {
    if (codeContent) {
      elements.push(
        <pre
          key={`code-${elements.length}`}
          className="my-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-4"
        >
          <code className="text-sm text-text-primary/90">{codeContent.trim()}</code>
        </pre>,
      );
      codeContent = "";
    }
    inCodeBlock = false;
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const normalizedTable = normalizeMarkdownTable(tableHeaders, tableRows);

      elements.push(
        <ResponsiveTable key={`table-${elements.length}`} headers={normalizedTable.headers} rows={normalizedTable.rows} />,
      );
      tableRows = [];
      tableHeaders = [];
    }
    inTable = false;
  };

  const parseTableRow = (line: string) => line.split("|").filter((cell) => cell.trim() !== "");

  const isTableSeparator = (line: string) => line.trim().startsWith("|") && line.includes("---");

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("```")) {
      flushLists();
      if (inTable) {
        flushTable();
      }

      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += `${line}\n`;
      continue;
    }

    if (trimmedLine.startsWith("<BlogTable")) {
      flushLists();
      if (inTable) {
        flushTable();
      }

      const blockLines = [line];
      while (index + 1 < lines.length && !lines[index].includes("/>")) {
        index += 1;
        blockLines.push(lines[index]);
        if (lines[index].includes("/>")) {
          break;
        }
      }

      const parsedTable = parseBlogTableBlock(blockLines.join("\n"));
      if (parsedTable) {
        elements.push(
          <ResponsiveTable
            key={`blog-table-${elements.length}`}
            headers={parsedTable.headers}
            rows={parsedTable.rows}
          />,
        );
      }
      continue;
    }

    if (trimmedLine.startsWith("<div") && trimmedLine.includes("blog-image-grid")) {
      flushLists();
      if (inTable) {
        flushTable();
      }

      const blockLines = [line];
      while (index + 1 < lines.length && !lines[index].includes("</div>")) {
        index += 1;
        blockLines.push(lines[index]);
        if (lines[index].includes("</div>")) {
          break;
        }
      }

      const gridImages = parseBlogImageGridBlock(blockLines.join("\n"));
      if (gridImages.length > 0) {
        elements.push(
          <BentoImageGrid
            key={`image-grid-${elements.length}`}
            images={gridImages.map((image, imageIndex) => createImageFigure(`grid-img-${index}-${imageIndex}`, image))}
          />,
        );
      }
      continue;
    }

    if (trimmedLine.startsWith("|")) {
      if (isTableSeparator(trimmedLine)) {
        continue;
      }

      const cells = parseTableRow(trimmedLine);
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    }

    if (inTable) {
      flushTable();
    }

    if (!trimmedLine) {
      flushLists();
      continue;
    }

    const markdownImageMatch = trimmedLine.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (markdownImageMatch) {
      flushLists();
      const [, alt, src] = markdownImageMatch;
      elements.push(createImageFigure(`img-${index}`, { alt, src }));
      continue;
    }

    if (trimmedLine.toLowerCase().includes("<img")) {
      flushLists();
      const image = {
        alt: extractAttribute(trimmedLine, "alt"),
        src: extractAttribute(trimmedLine, "src"),
      };

      if (image.src) {
        elements.push(createImageFigure(`html-img-${index}`, image));
      }
      continue;
    }

    if (trimmedLine.startsWith("## ")) {
      flushLists();
      elements.push(
        <h2 key={`h2-${index}`} className="mb-4 mt-8 text-2xl font-semibold text-text-primary">
          {parseInlineFormatting(trimmedLine.replace("## ", ""))}
        </h2>,
      );
      continue;
    }

    if (trimmedLine.startsWith("### ")) {
      flushLists();
      elements.push(
        <h3 key={`h3-${index}`} className="mb-3 mt-6 text-xl font-semibold text-text-primary">
          {parseInlineFormatting(trimmedLine.replace("### ", ""))}
        </h3>,
      );
      continue;
    }

    if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**") && trimmedLine.length < 100) {
      flushLists();
      elements.push(
        <p key={`p-bold-${index}`} className="mb-4 text-lg font-semibold text-text-primary">
          {parseInlineFormatting(trimmedLine)}
        </p>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      flushUnorderedList();
      orderedItems.push(
        <li key={`ol-${index}`} className="pl-2 text-muted leading-relaxed">
          {parseInlineFormatting(trimmedLine.replace(/^\d+\.\s+/, ""))}
        </li>,
      );
      continue;
    }

    if (/^(-|\*|\u2022)\s+/.test(trimmedLine)) {
      flushOrderedList();
      unorderedItems.push(
        <li key={`li-${index}`} className="flex items-start gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#89AACC]" />
          <span className="leading-relaxed text-muted">
            {parseInlineFormatting(trimmedLine.replace(/^(-|\*|\u2022)\s+/, ""))}
          </span>
        </li>,
      );
      continue;
    }

    flushLists();

    elements.push(
      <p key={`p-${index}`} className="mb-4 leading-relaxed text-muted">
        {parseInlineFormatting(trimmedLine)}
      </p>,
    );
  }

  flushLists();
  flushCodeBlock();
  flushTable();

  return groupConsecutiveImages(elements);
};

// Parse inline formatting (bold, italic, links, inline code)
function parseInlineFormatting(text: string): React.ReactNode {
  const inlinePattern =
    /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*(.*?)\*\*|\*(.*?)\*/gis;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlinePattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      const href = match[1].trim();
      const isExternal = /^https?:\/\//i.test(href);

      nodes.push(
        <a
          key={`inline-link-${match.index}`}
          href={href}
          className="text-[#89AACC] underline decoration-white/10 underline-offset-4 transition hover:text-[#b8d4ef]"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {parseInlineFormatting(match[2])}
        </a>,
      );
    } else if (match[4]) {
      const href = match[4].trim();
      const isExternal = /^https?:\/\//i.test(href);

      nodes.push(
        <a
          key={`markdown-link-${match.index}`}
          href={href}
          className="text-[#89AACC] underline decoration-white/10 underline-offset-4 transition hover:text-[#b8d4ef]"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {parseInlineFormatting(match[3])}
        </a>,
      );
    } else if (match[5] !== undefined) {
      nodes.push(
        <code
          key={`inline-code-${match.index}`}
          className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[0.95em] text-text-primary"
        >
          {match[5]}
        </code>,
      );
    } else if (match[6] !== undefined) {
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-text-primary">
          {parseInlineFormatting(match[6])}
        </strong>,
      );
    } else if (match[7] !== undefined) {
      nodes.push(
        <em key={`italic-${match.index}`} className="italic text-text-primary/90">
          {parseInlineFormatting(match[7])}
        </em>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length === 1 ? nodes[0] : nodes;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogById(id);

  if (!post) {
    notFound();
  }

  const readTime = estimateReadTime(post.content);
  const contentElements = parseContent(post.content);
  const contentSignature = buildBlogContentSignature({
    id: post.id,
    title: post.title,
    content: post.content,
    updatedAt: post.updated_at,
  });

  return (
    <main className="min-h-screen bg-bg text-text-primary">
      <BlogPostHero
        post={{
          id: post.id,
          title: post.title,
          category: post.category,
          created_at: post.created_at,
          src: post.src,
          tags: post.tags,
          isAchievement: post.isAchievement,
        }}
        readTime={readTime}
      />

      <section className="mx-auto max-w-[800px] px-6 py-12 md:px-10 md:py-16">
        <BlogAiAssistant
          blogId={post.id}
          blogTitle={post.title}
          contentSignature={contentSignature}
          defaultPrompts={getDefaultBlogPromptSuggestions()}
        />

        <div className="min-w-0">
          <article className="mt-8 prose prose-invert prose-lg max-w-none">{contentElements}</article>

          {post.video && (
            <div className="mt-10">
              <h3 className="mb-4 text-lg font-semibold text-text-primary">Watch the Video</h3>
              <div className="aspect-video overflow-hidden rounded-2xl border border-white/10">
                <iframe
                  src={post.video}
                  title="Video"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div className="mt-12 rounded-3xl border border-white/10 bg-surface/30 p-6 md:p-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Enjoyed this article?</h3>
                <p className="mt-1 text-sm text-muted">Show your appreciation and share with others</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <LikeButton blogId={post.id} initialLikes={0} />
                <ClientShareButtons title={post.title} blogId={post.id} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6 md:px-10">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            All blogs
          </Link>
          <Link href="/" className="text-sm text-muted transition hover:text-text-primary">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
