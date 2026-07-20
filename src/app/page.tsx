import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { editorialCards } from "@/data/content";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__media">
            <video
              aria-label="Emplacement réservé à la vidéo de présentation"
              muted
              playsInline
              poster="/assets/images/inside-monte-carlo-24.jpg"
            />
            <div className="hero__overlay">
              <span className="eyebrow eyebrow--light">Le média de la Principauté</span>
              <h1 id="hero-title">Inside Monte-Carlo</h1>
              <a className="scroll-cue" href="#magazine">
                <span aria-hidden="true">↓</span>
                Découvrir
              </a>
            </div>
          </div>
          <div className="hero__editorial">
            <div className="hero__monogram" aria-hidden="true">
              <span>I</span>
              <span>M</span>
              <span>C</span>
            </div>
            <div className="hero__copy">
              <p>Les histoires que Monaco ne raconte pas.</p>
              <Link className="button" href="/magazine">
                Découvrir
              </Link>
            </div>
          </div>
        </section>

        <section className="editorial-section" data-reveal id="magazine">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Derniers récits</span>
              <h2>Magazine</h2>
            </div>
            <Link className="text-link" href="/magazine">
              Tous les articles <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="article-grid">
            {editorialCards.slice(0, 5).map((article, index) => (
              <ArticleCard article={article} featured={index === 0} key={article.title} />
            ))}
          </div>
        </section>

        <section className="key-feature" data-reveal>
          <div className="key-feature__media">
            <span
              aria-hidden="true"
              className="asset-placeholder asset-placeholder--light"
              data-asset="IMAGE 07"
              style={{ backgroundImage: "url(/assets/images/inside-monte-carlo-23.jpg)" }}
            />
          </div>
          <div className="key-feature__content">
            <span className="eyebrow eyebrow--light">Accès exclusif</span>
            <h2>La Clé<br />Monte-Carlo</h2>
            <p>
              Des lieux, des rencontres et des histoires dévoilés avec retenue, au-delà des
              apparences.
            </p>
            <Link className="button button--light" href="/la-cle-monte-carlo">
              Ouvrir la porte
            </Link>
          </div>
        </section>

        <section className="guardians editorial-section" data-reveal>
          <div className="section-heading section-heading--centered">
            <div>
              <span className="eyebrow">Portraits</span>
              <h2>Les Gardiens du Geste</h2>
            </div>
            <p>
              Celles et ceux qui perpétuent un savoir-faire, une précision et une manière de
              faire.
            </p>
          </div>
          <div className="guardian-grid">
            {[
              { asset: "IMAGE 08", image: "/assets/images/inside-monte-carlo-14.jpg" },
              { asset: "IMAGE 09", image: "/assets/images/inside-monte-carlo-15.jpg" },
              { asset: "IMAGE 10", image: "/assets/images/inside-monte-carlo-16.jpg" },
            ].map(({ asset, image }, index) => (
              <Link className="guardian-card" href="/les-gardiens-du-geste" key={asset}>
                <span
                  aria-hidden="true"
                  className="asset-placeholder"
                  data-asset={asset}
                  style={{ backgroundImage: `url(${image})` }}
                />
                <span className="guardian-card__index">0{index + 1}</span>
                <h3>{["Le trait", "La matière", "Le temps"][index]}</h3>
                <p>Portrait éditorial à venir.</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="experiences editorial-section" data-reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">Sélection</span>
              <h2>Expériences</h2>
            </div>
            <Link className="text-link" href="/experiences">
              Explorer <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="experience-grid">
            <div className="experience-grid__lead">
              <span
                aria-hidden="true"
                className="asset-placeholder asset-placeholder--dark"
                data-asset="IMAGE 11"
                style={{ backgroundImage: "url(/assets/images/inside-monte-carlo-24.jpg)" }}
              />
              <div>
                <span>Expérience · Prochainement</span>
                <h3>Monaco, loin du premier regard</h3>
              </div>
            </div>
            {editorialCards.slice(3, 6).map((article) => (
              <ArticleCard article={article} key={article.title} />
            ))}
          </div>
        </section>

        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
