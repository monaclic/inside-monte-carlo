#!/usr/bin/env python3
"""Importe et adapte les gabarits BlogWear avec une configuration externe."""

from __future__ import annotations

import logging
import os
import sys
from pathlib import Path
from urllib.request import Request, urlopen

import yaml
from bs4 import BeautifulSoup, NavigableString, Tag
from dotenv import load_dotenv
from tqdm import tqdm


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = PROJECT_ROOT / "config" / "site.yaml"
LOG_PATH = PROJECT_ROOT / "data" / "logs" / "adapt_blogwear.log"


def configure_logging() -> None:
    """Configure les journaux du script dans le projet."""
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
        handlers=[logging.FileHandler(LOG_PATH, encoding="utf-8"), logging.StreamHandler()],
    )


def load_config() -> dict:
    """Charge la configuration YAML du site."""
    with CONFIG_PATH.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def download_html(url: str) -> str:
    """Télécharge une page HTML avec un agent utilisateur explicite."""
    request = Request(url, headers={"User-Agent": "InsideMonteCarloTemplateImporter/1.0"})
    with urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8")


def asset_path(index: int) -> str:
    """Retourne le chemin public d'une image optimisée."""
    return f"/assets/images/inside-monte-carlo-{index:02d}.jpg"


def set_image(image: Tag, source: str, alt: str) -> None:
    """Remplace une source d'image tout en supprimant les variantes distantes."""
    image["src"] = source
    image["alt"] = alt
    image.attrs.pop("srcset", None)
    image.attrs.pop("sizes", None)


def replace_exact_text(root: Tag, source: str, target: str) -> None:
    """Remplace les nœuds texte correspondant exactement à une valeur."""
    normalized_source = " ".join(source.replace("\xa0", " ").split())
    for node in root.find_all(string=True):
        normalized_node = " ".join(node.replace("\xa0", " ").split())
        if isinstance(node, NavigableString) and normalized_node == normalized_source:
            node.replace_with(target)


def replace_long_copy(root: Tag, replacement: str, minimum_length: int = 80) -> None:
    """Neutralise les textes marketing du template par un contenu temporaire."""
    for node in root.find_all(string=True):
        value = " ".join(node.strip().split())
        if len(value) >= minimum_length and node.parent.name not in {"script", "style"}:
            node.replace_with(replacement)


def remove_commerce(root: Tag) -> None:
    """Retire uniquement le panier e-commerce, non pertinent pour le média."""
    for cart in list(root.select(".w-commerce-commercecartwrapper")):
        container = cart.find_parent(class_="nav-black-circle")
        (container or cart).decompose()


def adapt_navigation(soup: BeautifulSoup, config: dict) -> None:
    """Adapte les liens rapides, le menu et les liens internes."""
    quick_items = config["quick_navigation"]
    quick_selectors = ["a.primary-button-wrapper", "a.primary-button-wrapper-mobile"]
    for selector in quick_selectors:
        for anchor, item in zip(soup.select(selector), quick_items):
            anchor["href"] = item["href"]
            for label in anchor.select(".link-text"):
                label.string = item["label"]

    menu_links = soup.select("a.menu-link")
    menu_items = config["navigation"][:4]
    for group_start in range(0, len(menu_links), 4):
        for anchor, item in zip(menu_links[group_start : group_start + 4], menu_items):
            anchor["href"] = item["href"]
            text_node = anchor.find(string=True)
            if text_node:
                text_node.replace_with(item["label"])

    path_mapping = {
        "/topic/fashion": "/magazine",
        "/topic/beauty": "/la-cle-monte-carlo",
        "/topic/news": "/les-coulisses",
        "/topic/lifestyle": "/experiences",
        "/editors": "/les-gardiens-du-geste",
        "/pricing": "/la-cle-monte-carlo",
        "/contact-us": "/a-propos",
        "/checkout": "/newsletter",
    }
    for anchor in soup.find_all("a", href=True):
        href = anchor["href"]
        if href.startswith("/articles/") or href.startswith("/city/"):
            anchor["href"] = "/magazine"
        elif href.startswith("/product/") or href.startswith("/utilities/"):
            anchor["href"] = "/magazine"
        elif href in path_mapping:
            anchor["href"] = path_mapping[href]


def adapt_logos_and_images(soup: BeautifulSoup, config: dict) -> None:
    """Affecte les logos de marque et les 27 images fournies."""
    brand = config["brand"]
    image_config = config["images"]

    for logo in soup.select("img.nav-logo, img.preloader-logo-shrink"):
        set_image(logo, brand["logo_black"], brand["name"])
    for logo in soup.select("img.preloader-logo, .logo-wrapper-footer img"):
        set_image(logo, brand["logo_white"], brand["name"])
    for logo in list(soup.select("img.logo-wrapper-hero")):
        monogram = soup.new_tag(
            "div",
            attrs={
                "class": "logo-wrapper-hero inside-hero-letters",
                "aria-label": brand["name"],
                "role": "img",
            },
        )
        first_letters = soup.new_tag("span")
        first_letters.string = "IM"
        final_letter = soup.new_tag("span", attrs={"class": "inside-hero-letter-gold"})
        final_letter.string = "C"
        monogram.extend([first_letters, final_letter])
        logo.replace_with(monogram)
    for logo in soup.find_all("img", src=True):
        if "66d1af205d59d33f46dd0769_Logo.svg" in logo["src"]:
            set_image(logo, brand["logo_black"], brand["name"])

    template_assets = config.get("template_asset_replacements", {})
    for image in soup.find_all("img", src=True):
        for source_fragment, local_path in template_assets.items():
            if source_fragment in image["src"]:
                set_image(image, local_path, image.get("alt", ""))
                break

    preloader_images = soup.select("img.preloader-image")
    for image, index in zip(preloader_images, image_config["preloader"]):
        set_image(image, asset_path(index), brand["name"])

    hero_image = soup.select_one("img.image-content.hero")
    if hero_image:
        hero_source = image_config.get("hero_background") or asset_path(image_config["hero"])
        set_image(hero_image, hero_source, "Casino de Monte-Carlo de nuit")

    menu_image = soup.select_one("img.menu-image")
    if menu_image:
        set_image(menu_image, asset_path(image_config["menu"]), brand["name"])

    search_image = soup.select_one("img.image-search")
    if search_image:
        set_image(search_image, asset_path(image_config["search"]), brand["name"])

    content_images = []
    for image in soup.select("img.image-content, img.image-article-content"):
        if "hero" not in image.get("class", []) and image not in content_images:
            content_images.append(image)
    for position, image in enumerate(content_images):
        index = image_config["content"][position % len(image_config["content"])]
        set_image(image, asset_path(index), brand["name"])


def adapt_home(soup: BeautifulSoup, config: dict) -> None:
    """Adapte le contenu de la page d'accueil sans changer sa structure."""
    brand = config["brand"]
    temporary_titles = config["temporary_titles"]
    temporary_description = config["text"]["temporary_description"]

    hero = soup.select_one(".home-hero-section")
    if hero:
        heading = hero.find("h1")
        if heading:
            heading.string = brand["name"]
        replace_long_copy(hero, brand["tagline"], 100)

    section_settings = [
        (".section-home-articles-fashion", "Magazine", "/magazine"),
        (".section-home-articles-beauty", "La Clé Monte-Carlo", "/la-cle-monte-carlo"),
        (".section-home-articles-lifestyle", "Expériences", "/experiences"),
    ]
    title_cursor = 0
    for selector, title, href in section_settings:
        section = soup.select_one(selector)
        if not section:
            continue
        heading = section.find(["h1", "h2"])
        if heading:
            heading.string = title
        for article_heading in section.find_all(["h1", "h3"]):
            if article_heading is heading:
                continue
            article_heading.string = temporary_titles[title_cursor % len(temporary_titles)]
            title_cursor += 1
        replace_long_copy(section, temporary_description)
        for anchor in section.find_all("a", href=True):
            anchor["href"] = href

        category_replacements = {
            "Fashion": "Magazine",
            "FASHION": "MAGAZINE",
            "Beauty": "La Clé",
            "BEAUTY": "LA CLÉ",
            "Lifestyle": "Expériences",
            "LIFESTYLE": "EXPÉRIENCES",
            "lifestyle": "Expériences",
        }
        for source, target in category_replacements.items():
            replace_exact_text(section, source, target)

    about = soup.select_one(".section-home-about")
    if about:
        heading = about.find("h3")
        if heading:
            heading.string = "Les Gardiens du Geste"
        replace_long_copy(about, temporary_description, 60)
        for anchor in about.find_all("a", href=True):
            anchor["href"] = "/les-gardiens-du-geste"

    premium = soup.select_one(".section-home-premium-access")
    if premium:
        replace_exact_text(premium, "ALL ACCESS", "LA CLÉ MONTE-CARLO")
        replace_long_copy(premium, temporary_description)
        premium_titles = ["Accès aux récits", "Invitations", "Rencontres", "Éditions privées"]
        for heading, title in zip(premium.find_all("h3"), premium_titles):
            heading.string = title
        for anchor in premium.find_all("a", href=True):
            anchor["href"] = "/la-cle-monte-carlo"


def adapt_shared_content(soup: BeautifulSoup, config: dict) -> None:
    """Adapte les textes communs sans toucher à la structure Webflow."""
    footer = soup.select_one(".footer")
    if footer:
        footer_heading = footer.find("h3")
        if footer_heading:
            footer_heading.string = config["text"]["newsletter_title"]
        address = footer.select_one(".footer-grid-inner p")
        if address:
            address.clear()
            address.append("Monte-Carlo")
            address.append(soup.new_tag("br"))
            address.append("Principauté de Monaco")
        for form in footer.find_all("form"):
            form["action"] = "/newsletter"
            form["method"] = "get"
        for submit in footer.select('input[type="submit"]'):
            submit["value"] = "S'INSCRIRE"
            submit["data-wait"] = "ENVOI..."
        replace_exact_text(footer, "Thank you! Your submission has been received!", "Merci, votre inscription a bien été reçue.")
        replace_exact_text(footer, "Oops! Something went wrong while submitting the form.", "Une erreur est survenue. Veuillez réessayer.")

        footer_bottom = footer.select_one(".footer-bottom")
        if footer_bottom:
            footer_bottom.clear()
            copyright_text = soup.new_tag("div", attrs={"class": "footer-text-small"})
            copyright_text.string = "© INSIDE MONTE-CARLO"
            footer_bottom.append(copyright_text)

    menu_bottom = soup.select_one(".menu-bottom")
    if menu_bottom:
        menu_bottom.clear()
        menu_label = soup.new_tag("div", attrs={"class": "text-style-small text-style-all-caps"})
        menu_label.string = "INSIDE MONTE-CARLO"
        menu_bottom.append(menu_label)

    global_replacements = {
        "Scroll Down": config["text"]["hero_cta"],
        "Read Article": "Découvrir",
        "All Articles": "Tout voir",
        "Other Articles": "À découvrir",
        "Topics": "Rubriques",
        "TOPICS": "RUBRIQUES",
        "Sites": "Navigation",
        "SITES": "NAVIGATION",
        "Other": "INFORMATIONS",
        "OTHER": "INFORMATIONS",
        "HOME": "ACCUEIL",
        "Home": "Accueil",
        "Editors": "Les Gardiens du Geste",
        "EDITORS": "LES GARDIENS DU GESTE",
        "Pricing": "La Clé Monte-Carlo",
        "MEMBERSHIP": "LA CLÉ MONTE-CARLO",
        "Contact": "À propos",
        "CONTACT": "À PROPOS",
        "Fashion": "Magazine",
        "FASHION": "MAGAZINE",
        "Beauty": "La Clé",
        "BEAUTY": "LA CLÉ",
        "Lifestyle": "Expériences",
        "LIFESTYLE": "EXPÉRIENCES",
        "lifestyle": "Expériences",
        "New York": "Monaco",
        "Berlin": "Monaco",
        "London": "Monaco",
        "Shop": "La Clé",
        "Licensing": "À propos",
        "Error Page": "Newsletter",
        "Article CMS": "Magazine",
        "Shop CMS": "Expériences",
        "Socials": "Réseaux",
        "View Pricing": "Découvrir",
        "About Us": "Découvrir",
        "ALL ACCESS": "LA CLÉ MONTE-CARLO",
        "Subscribers enjoy more with all pass access": "Des récits, des rencontres et des invitations au plus près de Monaco.",
        "Milan": "Monaco",
        "Search for our most recent articles": "Rechercher dans les récits Inside Monte-Carlo",
    }
    for source, target in global_replacements.items():
        replace_exact_text(soup, source, target)

    for anchor in soup.find_all("a", href=True):
        href = anchor["href"]
        if "blogwear.webflow.io" in href:
            anchor["href"] = "/magazine"
        label = " ".join(anchor.get_text(" ", strip=True).split())
        shared_link_targets = {
            "Newsletter": "/newsletter",
            "À propos": "/a-propos",
            "Expériences": "/experiences",
            "Magazine": "/magazine",
            "La Clé": "/la-cle-monte-carlo",
        }
        if label in shared_link_targets:
            anchor["href"] = shared_link_targets[label]

    for search_form in soup.select("form.search-page"):
        search_form["action"] = "/magazine"
    for search_input in soup.select("input.search-input"):
        search_input["placeholder"] = "Rechercher…"


def adapt_article(soup: BeautifulSoup, config: dict) -> None:
    """Transforme le gabarit Article en modèle générique Inside Monte-Carlo."""
    article = soup.select_one(".section-hero-article")
    if article:
        heading = article.find("h1")
        if heading:
            heading.string = "{{TITLE}}"
        long_nodes = [
            node
            for node in article.find_all(string=True)
            if len(" ".join(node.strip().split())) >= 80 and node.parent.name not in {"style", "script"}
        ]
        tokens = ["{{INTRO}}", "{{PARAGRAPH_ONE}}", "{{PARAGRAPH_TWO}}"]
        for index, node in enumerate(long_nodes):
            node.replace_with(tokens[min(index, len(tokens) - 1)])
        replace_exact_text(article, "October 16, 2023", "PROCHAINEMENT")
        replace_exact_text(article, "5 minutes read", "2 MIN DE LECTURE")

    replace_exact_text(soup, "Other Articles", "À découvrir")
    replace_exact_text(soup, "Read Article", "Découvrir")
    replace_long_copy(soup.select_one(".page-subwrapper") or soup, config["text"]["temporary_description"])

    rich_text = soup.select_one(".rich-text")
    if rich_text:
        section_titles = [
            "Une histoire à découvrir",
            "Le regard Inside Monte-Carlo",
            "Ce qui se joue en coulisses",
            "Le temps du geste",
            "Une autre manière de voir Monaco",
        ]
        for index, heading in enumerate(rich_text.find_all(["h3", "h4"])):
            heading.string = section_titles[index % len(section_titles)]

    other_posts = soup.select_one(".section-article-other-posts")
    if other_posts:
        for index, heading in enumerate(other_posts.find_all("h3")):
            heading.string = config["temporary_titles"][index % len(config["temporary_titles"])]


def serialize_page(soup: BeautifulSoup) -> str:
    """Sérialise les styles initiaux et le contenu du body."""
    inline_styles = "".join(str(style) for style in soup.head.find_all("style"))
    for script in soup.body.find_all("script"):
        script.decompose()
    return inline_styles + soup.body.decode_contents()


def build_page(url: str, output: Path, config: dict, page_kind: str) -> None:
    """Télécharge, adapte puis écrit une page de template."""
    html = download_html(url)
    soup = BeautifulSoup(html, "html.parser")
    remove_commerce(soup)
    for badge in list(soup.select(".buy-badge")):
        badge.decompose()
    adapt_navigation(soup, config)
    adapt_logos_and_images(soup, config)
    if page_kind == "home":
        adapt_home(soup, config)
    else:
        adapt_article(soup, config)
    adapt_shared_content(soup, config)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(serialize_page(soup), encoding="utf-8")
    logging.info("Page %s générée dans %s", page_kind, output)


def main() -> int:
    """Point d'entrée du script autonome."""
    load_dotenv(os.path.expanduser("~/.Codex/.env"))
    configure_logging()
    try:
        config = load_config()
        tasks = [
            ("home", config["template"]["home_url"], config["template"]["home_output"]),
            ("article", config["template"]["article_url"], config["template"]["article_output"]),
        ]
        for page_kind, url, relative_output in tqdm(tasks, desc="Adaptation BlogWear"):
            build_page(url, PROJECT_ROOT / relative_output, config, page_kind)
        return 0
    except Exception as exc:
        logging.exception("Échec de l'adaptation BlogWear : %s", exc)
        return 1


if __name__ == "__main__":
    sys.exit(main())
