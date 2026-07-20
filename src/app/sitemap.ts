import type { MetadataRoute } from "next";
import { sectionPages } from "@/data/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://inside-monte-carlo.vercel.app";

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    ...sectionPages.map((section) => ({
      url: `${baseUrl}/${section.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
