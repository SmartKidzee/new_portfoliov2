"use client";

import { ShareButtons } from "./share-buttons";

interface ClientShareButtonsProps {
  title: string;
  blogId: string;
}

export function ClientShareButtons({ title, blogId }: ClientShareButtonsProps) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  return <ShareButtons title={title} url={url} />;
}
