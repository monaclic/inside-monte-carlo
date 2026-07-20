import Link from "next/link";
import { navigation, quickNavigation } from "@/data/content";
import { BrandMark } from "./brand-mark";
import { PillLink } from "./pill-link";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.75" cy="10.75" r="5.75" />
      <path d="m15 15 4.25 4.25" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8h14M5 12h14M5 16h14" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <div className="site-header__left">
          <BrandMark />
          <nav className="quick-nav" aria-label="Navigation principale rapide">
            {quickNavigation.map((item) => (
              <PillLink href={item.href} key={item.href} label={item.label} />
            ))}
          </nav>
        </div>

        <div className="site-header__actions">
          <Link className="circle-control" href="/magazine" aria-label="Rechercher dans le magazine">
            <SearchIcon />
          </Link>
          <details className="menu-disclosure">
            <summary className="menu-trigger" aria-label="Ouvrir le menu">
              <MenuIcon />
            </summary>
            <div className="menu-panel">
              <div className="menu-panel__top">
                <BrandMark inverted />
                <span className="menu-panel__label">Menu</span>
              </div>
              <nav className="menu-panel__nav" aria-label="Navigation complète">
                {navigation.map((item, index) => (
                  <Link href={item.href} key={item.href}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <p className="menu-panel__tagline">Les histoires que Monaco ne raconte pas.</p>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
