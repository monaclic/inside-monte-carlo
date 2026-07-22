import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebflowRuntime } from "@/components/webflow-runtime";
import { getSectionPage, sectionPages } from "@/data/content";
import {
  blockToText,
  sanityClient,
  SECTION_PAGE_QUERY,
  SECTION_SLUGS_QUERY,
  type SanitySectionPage,
} from "@/sanity/client";

const ARTICLE_PAGE_ID = "66cc44585d9587bf6b8b2aff";
const articleTemplate = readFileSync(
  path.join(process.cwd(), "src/content/blogwear-article.html"),
  "utf8",
);

type SectionPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const sanitySlugs = await sanityClient.fetch<string[]>(SECTION_SLUGS_QUERY);
    const slugs = new Set([
      ...sectionPages.map((section) => section.slug),
      ...sanitySlugs,
    ]);
    return [...slugs].map((slug) => ({ slug }));
  } catch {
    return sectionPages.map((section) => ({ slug: section.slug }));
  }
}

async function getSection(slug: string) {
  try {
    const section = await sanityClient.fetch<SanitySectionPage | null>(
      SECTION_PAGE_QUERY,
      { slug },
      { next: { revalidate: 30 } },
    );
    return section;
  } catch (error) {
    console.error(`Impossible de charger la page ${slug} depuis Sanity`, error);
    return null;
  }
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sanitySection = await getSection(slug);
  const fallbackSection = getSectionPage(slug);
  const section = sanitySection ?? fallbackSection;

  if (!section) {
    return {};
  }

  return {
    title: section.title,
    description: section.intro,
    openGraph: {
      title: `${section.title} | Inside Monte-Carlo`,
      description: section.intro,
      images: [sanitySection?.imageUrl ?? fallbackSection?.image ?? ""],
    },
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug } = await params;
  const sanitySection = await getSection(slug);
  const fallbackSection = getSectionPage(slug);
  const section = sanitySection ?? fallbackSection;

  if (!section) {
    notFound();
  }

  const sanityParagraphs = sanitySection?.body
    ?.map((block) => blockToText(block))
    .filter(Boolean);
  const paragraphs = sanityParagraphs?.length
    ? sanityParagraphs
    : fallbackSection?.paragraphs ?? [];
  const firstParagraph = paragraphs[0] ?? section.intro;
  const secondParagraph = paragraphs[1] ?? firstParagraph;
  const image =
    sanitySection?.linkedArticleImageUrl ??
    sanitySection?.imageUrl ??
    fallbackSection?.image;
  const contentImage = sanitySection?.contentImageUrl ?? image;
  const markup = articleTemplate
    .replaceAll("{{TITLE}}", escapeHtml(section.title))
    .replaceAll("{{INTRO}}", escapeHtml(section.intro))
    .replaceAll("{{PARAGRAPH_ONE}}", escapeHtml(firstParagraph))
    .replaceAll("{{PARAGRAPH_TWO}}", escapeHtml(secondParagraph))
    .replaceAll("/assets/images/inside-monte-carlo-04.jpg", image ?? "")
    .replaceAll("/assets/images/inside-monte-carlo-05.jpg", contentImage ?? "");

  return (
    <>
      <WebflowRuntime pageId={ARTICLE_PAGE_ID} />
      <div
        className="webflow-page-host"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}
