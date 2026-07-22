import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebflowRuntime } from "@/components/webflow-runtime";
import { editorialCards, getSectionPage, sectionPages } from "@/data/content";
import {
  blockToText,
  sanityClient,
  SECTION_PAGE_QUERY,
  SECTION_SLUGS_QUERY,
  type SanityRelatedArticle,
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

function relatedArticles(
  slug: string,
  section: SanitySectionPage | null,
): SanityRelatedArticle[] {
  const home = section?.homeContent;
  const sectionArticles =
    slug === "magazine"
      ? home?.magazineArticles
      : slug === "la-cle-monte-carlo"
        ? home?.keyArticles
        : slug === "experiences"
          ? home?.experiencesArticles
          : undefined;

  if (sectionArticles?.length) {
    const category =
      slug === "magazine"
        ? "Magazine"
        : slug === "la-cle-monte-carlo"
          ? "La Clé"
          : "Expériences";
    return sectionArticles.slice(0, 4).map((article) => ({
      ...article,
      category,
      href: `/${slug}`,
    }));
  }

  return (home?.featuredStories ?? [])
    .filter((article) => article.href !== `/${slug}`)
    .slice(0, 4);
}

function replaceRecommendationCards(
  markup: string,
  recommendations: SanityRelatedArticle[],
) {
  const marker = '<div class="category-latest-post w-dyn-item"';
  const parts = markup.split(marker);
  recommendations.slice(0, 4).forEach((recommendation, index) => {
    const partIndex = index + 1;
    if (!parts[partIndex]) return;
    const href = escapeHtml(recommendation.href ?? "/magazine");
    const imageSource = `/assets/images/inside-monte-carlo-${String(index + 8).padStart(2, "0")}.jpg`;
    const previous = editorialCards[index];
    parts[partIndex] = parts[partIndex]
      .replace(
        imageSource,
        recommendation.imageUrl ? escapeHtml(recommendation.imageUrl) : imageSource,
      )
      .replace(previous.title, escapeHtml(recommendation.title))
      .replace(
        "Un récit éditorial à venir. Le contenu définitif sera intégré après validation.",
        escapeHtml(recommendation.description ?? ""),
      )
      .replace('href="/magazine"', `href="${href}"`)
      .replace(">Magazine<", `>${escapeHtml(recommendation.category ?? "Magazine")}<`);
  });
  return parts.join(marker);
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
  const image = sanitySection?.imageUrl ?? fallbackSection?.image;
  const contentImage = image;
  const recommendations = relatedArticles(slug, sanitySection);
  let markup = articleTemplate
    .replaceAll("{{TITLE}}", escapeHtml(section.title))
    .replaceAll("{{INTRO}}", escapeHtml(section.intro))
    .replaceAll("{{PARAGRAPH_ONE}}", escapeHtml(firstParagraph))
    .replaceAll("{{PARAGRAPH_TWO}}", escapeHtml(secondParagraph))
    .replaceAll("/assets/images/inside-monte-carlo-17.jpg", image ?? "")
    .replaceAll("/assets/images/inside-monte-carlo-06.jpg", image ?? "")
    .replaceAll("/assets/images/inside-monte-carlo-07.jpg", contentImage ?? "");

  markup = replaceRecommendationCards(markup, recommendations);

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
