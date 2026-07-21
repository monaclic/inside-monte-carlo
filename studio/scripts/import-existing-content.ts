import {createReadStream, existsSync, mkdirSync, readFileSync, appendFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'
import {editorialCards, sectionPages} from '../../src/data/content'

type ImportConfig = {
  assetRoot: string
  logFile: string
  homePageId: string
  homeHeroImage: string
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(
  readFileSync(join(scriptDirectory, 'import-content.config.json'), 'utf8'),
) as ImportConfig
const assetRoot = join(scriptDirectory, config.assetRoot)
const logFile = join(scriptDirectory, config.logFile)
const client = getCliClient({apiVersion: '2026-07-21'})

function log(message: string) {
  const line = `${new Date().toISOString()} ${message}`
  mkdirSync(dirname(logFile), {recursive: true})
  appendFileSync(logFile, `${line}\n`)
  console.log(message)
}

function localAssetPath(publicPath: string) {
  return join(assetRoot, publicPath.replace(/^\//, ''))
}

async function imageValue(publicPath: string) {
  const filePath = localAssetPath(publicPath)
  if (!existsSync(filePath)) {
    throw new Error(`Image introuvable : ${filePath}`)
  }

  const filename = publicPath.split('/').at(-1)!
  const existing = await client.fetch<{_id: string} | null>(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    {filename},
  )
  const asset =
    existing ??
    (await client.assets.upload('image', createReadStream(filePath), {
      filename,
    }))

  return {
    _type: 'image',
    asset: {_type: 'reference', _ref: asset._id},
  }
}

function portableText(paragraphs: string[]) {
  return paragraphs.map((paragraph, index) => ({
    _key: `paragraph-${index + 1}`,
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _key: `span-${index + 1}`,
        _type: 'span',
        marks: [],
        text: paragraph,
      },
    ],
  }))
}

async function importHomePage() {
  const existing = await client.getDocument(config.homePageId)
  if (existing) {
    log("Page d'accueil déjà présente, import ignoré")
    return
  }

  const featuredStories = []
  for (const [index, card] of editorialCards.entries()) {
    featuredStories.push({
      _key: `featured-${index + 1}`,
      _type: 'featuredStory',
      category: card.category,
      title: card.title,
      description: card.description,
      href: card.href,
      image: await imageValue(card.image),
    })
  }

  await client.create({
    _id: config.homePageId,
    _type: 'homePage',
    title: "Page d'accueil",
    heroImage: await imageValue(config.homeHeroImage),
    featuredStories,
  })
  log("Page d'accueil importée")
}

async function importSectionPages() {
  for (const section of sectionPages) {
    const existing = await client.fetch<{_id: string} | null>(
      '*[_type == "sectionPage" && slug.current == $slug][0]{_id}',
      {slug: section.slug},
    )
    if (existing) {
      log(`Page ${section.slug} déjà présente, import ignoré`)
      continue
    }

    await client.create({
      _type: 'sectionPage',
      title: section.title,
      slug: {_type: 'slug', current: section.slug},
      eyebrow: section.eyebrow,
      intro: section.intro,
      image: await imageValue(section.image),
      body: portableText(section.paragraphs),
      seo: {
        _type: 'object',
        title: `${section.title} | Inside Monte-Carlo`,
        description: section.intro,
      },
    })
    log(`Page ${section.slug} importée`)
  }
}

async function main() {
  try {
    log("Début de l'import Sanity")
    await importHomePage()
    await importSectionPages()
    log("Import Sanity terminé avec succès")
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error)
    log(`Échec de l'import : ${message}`)
    process.exitCode = 1
  }
}

void main()
