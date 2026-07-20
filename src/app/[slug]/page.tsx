import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSectionPage, sectionPages } from "@/data/content";

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
    },
  };
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug } = await params;
  const section = getSectionPage(slug);

  if (!section) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="section-page">
        <header className="section-page__hero">
          <div className="section-page__title">
            <span className="eyebrow eyebrow--light">{section.eyebrow}</span>
            <h1>{section.title}</h1>
          </div>
          <div className="section-page__image" data-reveal>
            <span
              aria-hidden="true"
              className="asset-placeholder asset-placeholder--light"
              data-asset="IMAGE À VENIR"
              style={{ backgroundImage: `url(${section.image})` }}
            />
          </div>
        </header>
        <article className="article-layout" data-reveal>
          <aside>
            <span>Inside Monte-Carlo</span>
            <span>Lecture · 02 min</span>
          </aside>
          <div className="article-layout__body">
            <p className="article-layout__lead">{section.intro}</p>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <blockquote>Les histoires que Monaco ne raconte pas.</blockquote>
            <Link className="button" href="/magazine">
              Revenir au magazine
            </Link>
          </div>
        </article>
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
