export function estimateReadTime(content: string) {
  const wordCount = content.replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;
  return Math.max(3, Math.round(wordCount / 220));
}

export function buildBlogExcerpt(content: string, maxLength = 180) {
  return content
    .replace(/<BlogTable[\s\S]*?\/>/g, " ")
    .replace(/<div\s+class=["']blog-image-grid["'][\s\S]*?<\/div>/gi, " ")
    .replace(/\!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/<img[^>]*>/gi, " ")
    .replace(/<a\s+[^>]*href=["'][^"']+["'][^>]*>(.*?)<\/a>/gi, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
    .trim();
}
