"use client";

import { ShareButtons } from "./share-buttons";

interface ClientShareButtonsProps {
  title: string;
  blogId: string;
}

export function ClientShareButtons({ title, blogId }: ClientShareButtonsProps) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/blogs/${blogId}` : `https://shreyas.cloud/blogs/${blogId}`;
  return <ShareButtons title={title} url={url} />;
}
