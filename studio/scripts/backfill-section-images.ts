import {appendFileSync, createReadStream, existsSync, mkdirSync, readFileSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'
import {getCliClient} from 'sanity/cli'

type Config = {
  assetRoot: string
  logFile: string
  contentImages: Record<string, string>
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(
  readFileSync(join(scriptDirectory, 'backfill-section-images.config.json'), 'utf8'),
) as Config
const logFile = join(scriptDirectory, config.logFile)
const client = getCliClient({apiVersion: '2026-07-21'})

function log(message: string) {
  mkdirSync(dirname(logFile), {recursive: true})
  appendFileSync(logFile, `${new Date().toISOString()} ${message}\n`)
  console.log(message)
}

async function imageAsset(filename: string) {
  const existing = await client.fetch<{_id: string} | null>(
    '*[_type == "sanity.imageAsset" && originalFilename == $filename][0]{_id}',
    {filename},
  )
  if (existing) return existing._id

  const filePath = join(scriptDirectory, config.assetRoot, filename)
  if (!existsSync(filePath)) throw new Error(`Image locale introuvable : ${filePath}`)
  const uploaded = await client.assets.upload('image', createReadStream(filePath), {filename})
  return uploaded._id
}

async function main() {
  try {
    for (const [slug, filename] of Object.entries(config.contentImages)) {
      const document = await client.fetch<{_id: string} | null>(
        '*[_type == "sectionPage" && slug.current == $slug][0]{_id}',
        {slug},
      )
      if (!document) throw new Error(`Page Sanity introuvable : ${slug}`)

      const reference = await imageAsset(filename)
      await client
        .patch(document._id)
        .setIfMissing({
          contentImage: {
            _type: 'image',
            asset: {_type: 'reference', _ref: reference},
          },
        })
        .commit()
      log(`Deuxième image ajoutée à ${slug}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.stack ?? error.message : String(error)
    log(`Échec de la migration : ${message}`)
    process.exitCode = 1
  }
}

void main()
