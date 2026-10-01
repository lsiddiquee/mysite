import { execFileSync } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'

function section(source, heading, nextHeading) {
  const start = source.indexOf(`${heading}:\n`)
  const end = start < 0 ? -1 : source.indexOf(`\n${nextHeading}:`, start)
  if (end < 0) throw new Error(`Sidecar must contain ${heading}: followed by ${nextHeading}:`)
  const text = source.slice(start + heading.length + 2, end).trim()
  if (!text) throw new Error(`${heading}: is empty`)
  return text
}

async function main() {
  const [sidecarPath, option] = process.argv.slice(2)
  if (
    !sidecarPath ||
    (option && option !== '--dry-run') ||
    !sidecarPath.endsWith('.image-prompt.txt')
  ) {
    throw new Error(
      'Usage: node --env-file=scripts/.env scripts/generate-artwork.mjs <sidecar.image-prompt.txt> [--dry-run]',
    )
  }

  const source = await readFile(sidecarPath, 'utf8')
  const positive = section(source, 'IMAGE PROMPT', 'NEGATIVE PROMPT')
  const negative = section(source, 'NEGATIVE PROMPT', 'RECOMMENDED SIZE')
  const maxChars = Number(process.env.FOUNDRY_MAX_PROMPT_CHARS ?? 2000)
  if (!Number.isInteger(maxChars) || maxChars < 1)
    throw new Error('FOUNDRY_MAX_PROMPT_CHARS must be a positive integer')
  const exclusions = negative
    .replace(/\s+/g, ' ')
    .split(',')
    .map((item) => item.trim())
  let prompt = positive
  let included = 0
  for (const exclusion of exclusions) {
    const candidate = `${prompt}${included ? ', ' : '\n\nAvoid: '}${exclusion}`
    if (candidate.length > maxChars) break
    prompt = candidate
    included++
  }
  if (!included)
    throw new Error(
      `Positive prompt leaves no room for exclusions under ${maxChars} characters; shorten it or set the verified deployment limit with FOUNDRY_MAX_PROMPT_CHARS.`,
    )

  if (option === '--dry-run') {
    console.log(
      `Prompt ready: ${prompt.length}/${maxChars} characters; ${included}/${exclusions.length} exclusions included; no request sent.`,
    )
    return
  }
  console.log(
    `Using ${included}/${exclusions.length} exclusions (${prompt.length}/${maxChars} characters).`,
  )

  const { FOUNDRY_ENDPOINT: endpoint, FOUNDRY_DEPLOYMENT: deployment } = process.env
  if (!endpoint || !deployment)
    throw new Error('Set FOUNDRY_ENDPOINT and FOUNDRY_DEPLOYMENT in scripts/.env')
  if (endpoint.includes('your-resource') || deployment === 'your-image-deployment')
    throw new Error('Replace the placeholders in scripts/.env before generating an image')
  const url = new URL(endpoint)
  if (
    url.protocol !== 'https:' ||
    (!url.hostname.endsWith('.openai.azure.com') &&
      !url.hostname.endsWith('.services.ai.azure.com')) ||
    url.username ||
    url.password ||
    !['', '/', '/openai/v1', '/openai/v1/'].includes(url.pathname) ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'FOUNDRY_ENDPOINT must be an HTTPS Azure OpenAI-compatible resource endpoint (optionally ending in /openai/v1)',
    )
  }
  let token
  try {
    token = execFileSync(
      'az',
      [
        'account',
        'get-access-token',
        '--resource',
        'https://ai.azure.com/',
        '--query',
        'accessToken',
        '-o',
        'tsv',
      ],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim()
  } catch {
    throw new Error(
      'Azure CLI token unavailable. Rebuild the dev container, run az login --use-device-code, and select a subscription with access to the deployment.',
    )
  }
  if (!token) throw new Error('Azure CLI returned an empty access token; run az login')

  const response = await fetch(`${url.origin}/openai/v1/images/generations`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: deployment,
      prompt,
      ...(process.env.FOUNDRY_SIZE ? { size: process.env.FOUNDRY_SIZE } : {}),
      ...(process.env.FOUNDRY_QUALITY ? { quality: process.env.FOUNDRY_QUALITY } : {}),
    }),
  })
  if (!response.ok)
    throw new Error(
      `Image request failed (${response.status}): ${(await response.text()).slice(0, 1000)}`,
    )
  const result = await response.json()
  const image = result.data?.[0]?.b64_json
  if (typeof image !== 'string' || !image)
    throw new Error('Image response did not contain data[0].b64_json')

  const directory = resolve('.local/artwork')
  await mkdir(directory, { recursive: true })
  const name = basename(sidecarPath, '.image-prompt.txt')
  const target = resolve(directory, `${name}-${new Date().toISOString().replaceAll(':', '-')}.png`)
  await writeFile(target, Buffer.from(image, 'base64'), { flag: 'wx' })
  console.log(`Saved candidate: ${target}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
