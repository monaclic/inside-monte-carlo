import {appendFileSync, createReadStream, existsSync, mkdirSync, readFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

type Config = {
  logFile: string
  assetRoot: string
  defaultArticleDescription: string
  articleTitles: Record<string, string[]>
  staticImages: Record<string, string>
}

type HomeDocument = {
  _id: string
  featuredStories?: Array<{image?: {asset?: {_ref?: string}}}>
  magazineImages?: Array<{asset?: {_ref?: string}}>
  keyImages?: Array<{asset?: {_ref?: string}}>
  experiencesImages?: Array<{asset?: {_ref?: string}}>
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(
  readFileSync(join(scriptDirectory, 'backfill-home-images.config.json'), 'utf8'),
) as Config
const logFile = join(scriptDirectory, config.logFile)
const client = getCliClient({apiVersion: '2026-07-21'})

function log(message: string) {
  mkdirSync(dirname(logFile), {recursive: true})
  appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`)
  console.log(message)
}

function image(reference: string, key: string) {
  return {
    _key: key,
    _type: 'image',
    asset: {_type: 'reference', _ref: reference},
  }
}

function articles(
  section: string,
  images: Array<{asset?: {_ref?: string}}> | undefined,
  withDescription: boolean,
) {
  const titles = config.articleTitles[section] ?? []
  if (!images || images.length !== titles.length) {
    throw new Error(`Nombre d'images incorrect pour la section ${section}`)
  }
  return titles.map((title, index) => {
    const reference = images[index]?.asset?._ref
    if (!reference) throw new Error(`Référence d'image absente pour ${section} ${index + 1}`)
    return {
      _key: `${section}-article-${index + 1}`,
      _type: 'homeArticle',
      title,
      description: withDescription ? config.defaultArticleDescription : '',
      image: image(reference, `${section}-article-image-${index + 1}`),
    }
  })
}

async function assetReference(filename: string) {
  const existing = await client.fetch<{_id: string} | null>(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    {filename},
  )
  if (existing) return existing._id

  const filePath = join(scriptDirectory, config.assetRoot, filename)
  if (!existsSync(filePath)) throw new Error(`Image locale introuvable : ${filePath}`)
  const uploaded = await client.assets.upload('image', createReadStream(filePath), {filename})
  log(`Image importée : ${filename}`)
  return uploaded._id
}

async function main() {
  try {
    const homes = await client.fetch<HomeDocument[]>(
      '*[_type == "homePage"]{_id, featuredStories, magazineImages, keyImages, experiencesImages}',
    )
    if (homes.length === 0) throw new Error("Aucune page d'accueil trouvée")

    const staticReferences = Object.fromEntries(
      await Promise.all(
        Object.entries(config.staticImages).map(async ([name, filename]) => [
          name,
          await assetReference(filename),
        ]),
      ),
    )

    for (const home of homes) {
      const featured = home.featuredStories?.map((story) => story.image?.asset?._ref) ?? []
      if (featured.length < 6 || featured.some((reference) => !reference)) {
        throw new Error(`Les 6 images mises en avant sont requises dans ${home._id}`)
      }

      const featuredReference = (index: number) => featured[index] as string
      await client
        .patch(home._id)
        .setIfMissing({
          magazineImages: featured.slice(0, 5).map((reference, index) =>
            image(reference as string, `magazine-${index + 1}`),
          ),
          guardiansImage: image(staticReferences.guardians, 'guardians'),
          keyImages: [
            image(featuredReference(5), 'key-1'),
            image(staticReferences.keySecond, 'key-2'),
            image(staticReferences.keyThird, 'key-3'),
            image(featuredReference(0), 'key-4'),
          ],
          experiencesImages: [1, 2, 3, 4, 5].map((index) =>
            image(featuredReference(index), `experiences-${index}`),
          ),
          premiumImages: [
            image(staticReferences.premiumFirst, 'premium-1'),
            image(staticReferences.premiumSecond, 'premium-2'),
            image(staticReferences.premiumThird, 'premium-3'),
            image(featuredReference(0), 'premium-4'),
            image(featuredReference(1), 'premium-5'),
          ],
        })
        .commit()
      const updatedHome = await client.getDocument<HomeDocument>(home._id)
      if (!updatedHome) throw new Error(`Page introuvable après mise à jour : ${home._id}`)
      await client
        .patch(home._id)
        .setIfMissing({
          magazineArticles: articles('magazine', updatedHome.magazineImages, true),
          keyArticles: articles('key', updatedHome.keyImages, false),
          experiencesArticles: articles('experiences', updatedHome.experiencesImages, true),
        })
        .commit()
      log(`Images ajoutées à ${home._id}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error)
    log(`Échec de la migration : ${message}`)
    process.exitCode = 1
  }
}

void main()
