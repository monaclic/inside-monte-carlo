import Link from "next/link";
import { navigation } from "@/data/content";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__lead">
        <BrandMark inverted />
        <p>Les histoires que Monaco ne raconte pas.</p>
      </div>
      <div className="site-footer__grid">
        <div>
          <span className="footer-heading">Navigation</span>
          {navigation.slice(0, 5).map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <span className="footer-heading">Rubriques</span>
          {navigation.slice(5).map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <span className="footer-heading">Réseaux</span>
          <span>Instagram</span>
          <span>LinkedIn</span>
          <span>YouTube</span>
          <span>Spotify</span>
        </div>
        <div>
          <span className="footer-heading">Informations</span>
          <span>Mentions légales</span>
          <span>Politique de confidentialité</span>
          <span>Gestion des cookies</span>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>© {new Date().getFullYear()} Inside Monte-Carlo</span>
        <span>Monaco</span>
      </div>
    </footer>
  );
}
