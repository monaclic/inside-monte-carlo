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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function replaceImageOccurrences(
  markup: string,
  source: string,
  replacements: Array<string | undefined>,
) {
  let occurrence = 0;
  return markup.replaceAll(source, () => {
    const replacement = replacements[occurrence];
    occurrence += 1;
    return replacement ? escapeHtml(replacement) : source;
  });
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


    const featuredImages = home.featuredStories?.map((story) => story.imageUrl) ?? [];
    const magazine = home.magazineArticles?.length
      ? home.magazineArticles.map((article) => article.imageUrl)
      : home.magazineImages?.map((image) => image.url) ?? [];
    const key = home.keyArticles?.length
      ? home.keyArticles.map((article) => article.imageUrl)
      : home.keyImages?.map((image) => image.url) ?? [];
    const experiences = home.experiencesArticles?.length
      ? home.experiencesArticles.map((article) => article.imageUrl)
      : home.experiencesImages?.map((image) => image.url) ?? [];
    const premium = home.premiumImages?.map((image) => image.url) ?? [];

    const imageSlots: Array<[string, Array<string | undefined>]> = [
      ["/assets/images/inside-monte-carlo-06.jpg", [magazine[0] ?? featuredImages[0], premium[3] ?? featuredImages[0]]],
      ["/assets/images/inside-monte-carlo-07.jpg", [magazine[1] ?? featuredImages[1], premium[4] ?? featuredImages[1]]],
      ["/assets/images/inside-monte-carlo-08.jpg", [magazine[2] ?? featuredImages[2]]],
      ["/assets/images/inside-monte-carlo-09.jpg", [magazine[3] ?? featuredImages[3]]],
      ["/assets/images/inside-monte-carlo-10.jpg", [magazine[4] ?? featuredImages[4]]],
      ["/assets/images/inside-monte-carlo-11.jpg", [home.guardiansImageUrl]],
      ["/assets/images/inside-monte-carlo-12.jpg", [key[0] ?? featuredImages[5]]],
      ["/assets/images/inside-monte-carlo-13.jpg", [key[1]]],
      ["/assets/images/inside-monte-carlo-15.jpg", [key[2]]],
      ["/assets/images/inside-monte-carlo-16.jpg", [key[3] ?? featuredImages[0]]],
      ["/assets/images/inside-monte-carlo-18.jpg", [experiences[0] ?? featuredImages[1]]],
      ["/assets/images/inside-monte-carlo-19.jpg", [experiences[1] ?? featuredImages[2]]],
      ["/assets/images/inside-monte-carlo-20.jpg", [experiences[2] ?? featuredImages[3]]],
      ["/assets/images/inside-monte-carlo-21.jpg", [experiences[3] ?? featuredImages[4]]],
      ["/assets/images/inside-monte-carlo-22.jpg", [experiences[4] ?? featuredImages[5]]],
      ["/assets/images/inside-monte-carlo-25.jpg", [premium[0]]],
      ["/assets/images/inside-monte-carlo-26.jpg", [premium[1]]],
      ["/assets/images/inside-monte-carlo-27.jpg", [premium[2]]],
    ];

    imageSlots.forEach(([source, replacements]) => {
      markup = replaceImageOccurrences(markup, source, replacements);
    });

    const magazineArticles = home.magazineArticles ?? [];
    const keyArticles = home.keyArticles ?? [];
    const experiencesArticles = home.experiencesArticles ?? [];
    const titleSlots: Array<[string, Array<string | undefined>]> = [
      ["Le Rocher, à l’heure silencieuse", [magazineArticles[0]?.title, keyArticles[3]?.title]],
      ["Une porte habituellement fermée", [magazineArticles[1]?.title, experiencesArticles[0]?.title]],
      ["Dans l’atelier, le temps du geste", [magazineArticles[2]?.title, experiencesArticles[1]?.title]],
      ["Avant que les portes ne s’ouvrent", [magazineArticles[3]?.title, experiencesArticles[2]?.title]],
      ["Monaco, loin du premier regard", [magazineArticles[4]?.title, experiencesArticles[3]?.title]],
      ["La voix derrière le lieu", [keyArticles[0]?.title, experiencesArticles[4]?.title]],
      ["La matière et le temps", [keyArticles[1]?.title]],
      ["Une lumière sur la Principauté", [keyArticles[2]?.title]],
    ];
    titleSlots.forEach(([source, replacements]) => {
      markup = replaceImageOccurrences(markup, source, replacements);
    });

    const articleDescriptions = [...magazineArticles, ...experiencesArticles].map(
      (article) => article.description,
    );
    markup = replaceImageOccurrences(
      markup,
      "Un récit éditorial à venir. Le contenu définitif sera intégré après validation.",
      articleDescriptions,
    );

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
        markup = markup.replaceAll(previous.image, imageUrl);
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
