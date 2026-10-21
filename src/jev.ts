import { randomBytes } from 'node:crypto'

const DEFAULT_URL = 'https://api.typesafe.ai/v1/systemone'
const DEFAULT_MODEL = 'jev-latest'

export interface JevOptions {
  apiKey: string
  url?: string
  model?: string
}

export interface JevQuestion {
  /** Feature description the question belongs to. */
  context?: string
  question: string
}

export function jevOptionsFromEnv(): JevOptions | undefined {
  const apiKey = process.env.TYPESAFE_API_KEY
  if (!apiKey) return undefined
  return { apiKey, url: process.env.SQA_JEV_URL, model: process.env.SQA_JEV_MODEL }
}

/**
 * Asks Jev several yes/no questions about one image in a single call.
 * Returns the probability of "yes" for each question id.
 */
export async function askJev(
  options: JevOptions,
  image: Buffer,
  moment: string,
  questions: Record<string, JevQuestion>,
): Promise<Record<string, number>> {
  const assetId = `frame-${randomBytes(6).toString('hex')}`
  const contexts = [...new Set(Object.values(questions).map((q) => q.context).filter(Boolean))]
  const body = {
    model: options.model ?? DEFAULT_MODEL,
    state: {
      ...(contexts.length ? { feature: contexts.join('\n') } : {}),
      moment,
      frame: assetId,
    },
    assets: {
      [assetId]: { type: 'image', format: 'png', data_base64: image.toString('base64') },
    },
    questions: Object.fromEntries(
      Object.entries(questions).map(([id, q]) => [
        id,
        { type: 'noul', instructions: `Looking at \`frame\`: ${q.question}` },
      ]),
    ),
  }

  const response = await postWithRetry(options, JSON.stringify(body))
  const json = (await response.json()) as { answers?: Record<string, { noul?: number }> }
  const result: Record<string, number> = {}
  for (const id of Object.keys(questions)) {
    const p = json.answers?.[id]?.noul
    if (typeof p !== 'number') throw new Error(`Jev returned no answer for question "${id}"`)
    result[id] = p
  }
  return result
}

async function postWithRetry(options: JevOptions, body: string, attempts = 4): Promise<Response> {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(options.url ?? DEFAULT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json',
        // Image input is a preview feature and must be switched on per request.
        'TypeSafe-Danger-Zone-Images': 'true',
      },
      body,
    })
    if (response.ok) return response
    const retryable = response.status === 429 || response.status >= 500
    if (!retryable || attempt >= attempts) {
      throw new Error(`Jev request failed: ${response.status} ${await response.text()}`)
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
  }
}
