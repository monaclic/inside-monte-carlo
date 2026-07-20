import Link from "next/link";
import type { EditorialCard } from "@/data/content";

type ArticleCardProps = {
  article: EditorialCard;
  featured?: boolean;
};

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <article className="article-card" data-featured={featured || undefined}>
      <Link className="article-card__media" href={article.href} aria-label={article.title}>
        <span
          aria-hidden="true"
          className="asset-placeholder"
          data-asset={article.asset}
          style={{ backgroundImage: `url(${article.image})` }}
        />
        <span className="article-card__read">Lire</span>
      </Link>
      <div className="article-card__meta">
        <Link href={article.href}>{article.category}</Link>
        <span>Prochainement</span>
      </div>
      <h3>
        <Link href={article.href}>{article.title}</Link>
      </h3>
      <p>{article.description}</p>
    </article>
  );
}
