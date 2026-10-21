import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Check, ChecksFile, Config } from './types.ts'

export interface Project {
  /** Absolute path of the sqa folder inside the app, e.g. `<app>/sqa`. */
  dir: string
  config: Config
  checks: Check[]
}

export function flowFile(project: Project, flow: string): string {
  return join(project.dir, 'flows', `${flow}.ts`)
}

export function loadProject(dir: string): Project {
  const root = resolve(dir)
  const config = readJson<Config>(join(root, 'config.json'))
  const { checks } = readJson<ChecksFile>(join(root, 'checks.json'))
  const project = { dir: root, config, checks }

  const problems: string[] = []
  if (!config.baseUrl) problems.push('config.json: "baseUrl" is required')
  if (!Array.isArray(checks)) problems.push('checks.json: "checks" must be a list')

  const seen = new Set<string>()
  for (const [i, check] of (checks ?? []).entries()) {
    const where = `checks.json: check ${check.tag ? `"${check.tag}"` : `#${i + 1}`}`
    for (const field of ['tag', 'line', 'flow', 'question'] as const) {
      if (typeof check[field] !== 'string' || !check[field]) problems.push(`${where}: "${field}" is required`)
    }
    if (seen.has(check.tag)) problems.push(`${where}: tag is used twice`)
    seen.add(check.tag)
    if (!Array.isArray(check.expect) || check.expect.length === 0) {
      problems.push(`${where}: "expect" needs at least one { when, answer }`)
    } else if (check.expect.some((e) => e.answer !== 'yes' && e.answer !== 'no')) {
      problems.push(`${where}: every "answer" must be "yes" or "no"`)
    }
    if (check.flow && !existsSync(flowFile(project, check.flow))) {
      problems.push(`${where}: flow file flows/${check.flow}.ts not found`)
    }
  }
  if (problems.length) throw new Error(`Invalid sqa setup in ${root}:\n- ${problems.join('\n- ')}`)
  return project
}

function readJson<T>(file: string): T {
  if (!existsSync(file)) throw new Error(`Missing ${file}`)
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T
  } catch (error) {
    throw new Error(`Could not parse ${file}: ${(error as Error).message}`)
  }
}
