import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebflowRuntime } from "@/components/webflow-runtime";
import { getSectionPage, sectionPages } from "@/data/content";

const ARTICLE_PAGE_ID = "66cc44585d9587bf6b8b2aff";
const articleTemplate = readFileSync(
  path.join(process.cwd(), "src/content/blogwear-article.html"),
  "utf8",
);

type SectionPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return sectionPages.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const section = getSectionPage(slug);

  if (!section) {
    return {};
  }

  return {
    title: section.title,
    description: section.intro,
    openGraph: {
      title: `${section.title} | Inside Monte-Carlo`,
      description: section.intro,
      images: [section.image],
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
  const section = getSectionPage(slug);

  if (!section) {
    notFound();
  }

  const firstParagraph = section.paragraphs[0] ?? section.intro;
  const secondParagraph = section.paragraphs[1] ?? firstParagraph;
  const markup = articleTemplate
    .replaceAll("{{TITLE}}", escapeHtml(section.title))
    .replaceAll("{{INTRO}}", escapeHtml(section.intro))
    .replaceAll("{{PARAGRAPH_ONE}}", escapeHtml(firstParagraph))
    .replaceAll("{{PARAGRAPH_TWO}}", escapeHtml(secondParagraph))
    .replaceAll("/assets/images/inside-monte-carlo-04.jpg", section.image)
    .replaceAll("/assets/images/inside-monte-carlo-05.jpg", section.image);

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
