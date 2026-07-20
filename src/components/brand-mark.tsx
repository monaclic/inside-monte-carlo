import Link from "next/link";

type BrandMarkProps = {
  inverted?: boolean;
};

export function BrandMark({ inverted = false }: BrandMarkProps) {
  return (
    <Link
      className="brand-mark"
      data-inverted={inverted || undefined}
      href="/"
      aria-label="Inside Monte-Carlo, accueil"
    >
      <span>Inside</span>
      <span>Monte-Carlo</span>
    </Link>
  );
}
