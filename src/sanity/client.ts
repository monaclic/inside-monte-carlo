import {createClient, defineQuery} from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? 'vhkergwc',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  apiVersion: '2026-07-21',
  useCdn: true,
})

export const HOME_PAGE_QUERY = defineQuery(`
  *[_type == "homePage"][0]{
    _id,
    "heroImageUrl": heroImage.asset->url,
    featuredStories[]{
      _key,
      category,
      title,
      description,
      href,
      "imageUrl": image.asset->url
    }
  }
`)

export const SECTION_PAGE_QUERY = defineQuery(`
  *[_type == "sectionPage" && slug.current == $slug][0]{
    _id,
    title,
    eyebrow,
    intro,
    "slug": slug.current,
    "imageUrl": image.asset->url,
    body,
    seo
  }
`)

export const SECTION_SLUGS_QUERY = defineQuery(`
  *[_type == "sectionPage" && defined(slug.current)].slug.current
`)

export type SanityHomePage = {
  _id: string
  heroImageUrl?: string
  featuredStories?: Array<{
    _key: string
    category: string
    title: string
    description?: string
    href: string
    imageUrl?: string
  }>
}

type PortableTextBlock = {
  _key: string
  _type: 'block'
  children?: Array<{_key: string; text?: string}>
}

export type SanitySectionPage = {
  _id: string
  title: string
  eyebrow?: string
  intro: string
  slug: string
  imageUrl?: string
  body?: PortableTextBlock[]
  seo?: {title?: string; description?: string}
}

export function blockToText(block?: PortableTextBlock) {
  return block?.children?.map((child) => child.text ?? '').join('') ?? ''
}
