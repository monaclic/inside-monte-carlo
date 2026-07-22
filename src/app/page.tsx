import { readFileSync } from "node:fs";
import path from "node:path";
import { WebflowRuntime } from "@/components/webflow-runtime";
import { editorialCards } from "@/data/content";
import {
  HOME_PAGE_QUERY,
  sanityClient,
  type SanityHomePage,
} from "@/sanity/client";

const HOME_PAGE_ID = "66cc288225154d2a15304038";
const homeMarkup = readFileSync(
  path.join(process.cwd(), "src/content/blogwear-home.html"),
  "utf8",
);

const featuredImageSlots = [
  ["/assets/images/inside-monte-carlo-06.jpg", "/assets/images/inside-monte-carlo-16.jpg"],
  ["/assets/images/inside-monte-carlo-07.jpg", "/assets/images/inside-monte-carlo-18.jpg"],
  ["/assets/images/inside-monte-carlo-08.jpg", "/assets/images/inside-monte-carlo-19.jpg"],
  ["/assets/images/inside-monte-carlo-09.jpg", "/assets/images/inside-monte-carlo-20.jpg"],
  ["/assets/images/inside-monte-carlo-10.jpg", "/assets/images/inside-monte-carlo-21.jpg"],
  ["/assets/images/inside-monte-carlo-12.jpg", "/assets/images/inside-monte-carlo-22.jpg"],
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getHomeMarkup() {
  try {
    const home = await sanityClient.fetch<SanityHomePage | null>(
      HOME_PAGE_QUERY,
      {},
      { next: { revalidate: 30 } },
    );

    if (!home) return homeMarkup;

    let markup = homeMarkup;

    if (home.heroImageUrl) {
      markup = markup.replaceAll(
        "/assets/images/inside-monte-carlo-hero.webp",
        escapeHtml(home.heroImageUrl),
      );
    }

    home.featuredStories?.forEach((story, index) => {
      const previous = editorialCards[index];
      if (!previous) return;

      markup = markup
        .replaceAll(previous.title, escapeHtml(story.title))
        .replaceAll(previous.category, escapeHtml(story.category))
        .replaceAll(previous.description, escapeHtml(story.description ?? ""))
        .replaceAll(`href="${previous.href}"`, `href="${escapeHtml(story.href)}"`);

      if (story.imageUrl) {
        const imageUrl = escapeHtml(story.imageUrl);
        const imageSlots = [previous.image, ...(featuredImageSlots[index] ?? [])];
        imageSlots.forEach((imageSlot) => {
          markup = markup.replaceAll(imageSlot, imageUrl);
        });
      }
    });

    return markup;
  } catch (error) {
    console.error("Impossible de charger la page d'accueil depuis Sanity", error);
    return homeMarkup;
  }
}

export default async function Home() {
  const markup = await getHomeMarkup();

  return (
    <>
      <WebflowRuntime pageId={HOME_PAGE_ID} />
      <div
        className="webflow-page-host"
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    </>
  );
}
