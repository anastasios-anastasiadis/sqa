import { mkdirSync, readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium, type Browser } from 'playwright'
import { tsImport } from 'tsx/esm/api'
import { Camera } from './camera.ts'
import {
  checkStatus,
  DEFAULT_THRESHOLDS,
  describeMoment,
  expectedAnswer,
  judge,
  type CheckStatus,
  type FrameResult,
} from './checker.ts'
import { cropForJev, cropRect, pngSize } from './image.ts'
import { askJev, type JevOptions, type JevQuestion } from './jev.ts'
import { flowFile, loadProject, type Project } from './project.ts'
import { Robot } from './robot.ts'
import type { Check, Flow, Frame, StepRecord } from './types.ts'

export interface RunOptions {
  dir: string
  /** Only run these flows. Default: every flow that has checks. */
  flows?: string[]
  headed?: boolean
  jev: JevOptions
  log?: (message: string) => void
}

export interface CheckResult {
  check: Check
  status: CheckStatus
  frames: FrameResult[]
  error?: string
}

export interface RunResult {
  runId: string
  runDir: string
  baseUrl: string
  results: CheckResult[]
}

interface Recording {
  flow: string
  frames: Frame[]
  steps: StepRecord[]
  error?: string
}

export async function runCheck(options: RunOptions): Promise<RunResult> {
  const log = options.log ?? (() => {})
  const project = loadProject(options.dir)
  const checks = options.flows?.length
    ? project.checks.filter((c) => options.flows!.includes(c.flow))
    : project.checks
  if (checks.length === 0) throw new Error('No checks to run.')

  const runId = new Date().toISOString().replace(/[:.]/g, '-')
  const runDir = join(project.dir, 'runs', runId)
  mkdirSync(join(runDir, 'frames'), { recursive: true })
  mkdirSync(join(runDir, 'crops'), { recursive: true })

  // 1. Robot and camera: run each flow once and record every frame.
  const flows = [...new Set(checks.map((c) => c.flow))]
  const recordings: Recording[] = []
  const browser = await chromium.launch({
    headless: !options.headed,
    // Playwright hides scrollbars by default when headless. Scrollbars are part of what we check.
    ignoreDefaultArgs: ['--hide-scrollbars'],
  })
  try {
    for (const flow of flows) {
      log(`Recording flow "${flow}"...`)
      const crops = [...new Set(checks.filter((c) => c.flow === flow && c.crop).map((c) => c.crop!))]
      const recording = await recordFlow(browser, project, flow, crops, join(runDir, 'frames'))
      log(
        recording.error
          ? `  Flow failed: ${recording.error}`
          : `  ${recording.steps.length} steps, ${recording.frames.length} frames`,
      )
      recordings.push(recording)
    }
  } finally {
    await browser.close()
  }

  // 2. Jev: ask each check's question about the frames it applies to.
  log('Asking Jev...')
  const results = await judgeRecordings(project, checks, recordings, runDir, options.jev)
  return { runId, runDir, baseUrl: project.config.baseUrl, results }
}

async function recordFlow(
  browser: Browser,
  project: Project,
  flow: string,
  crops: string[],
  framesDir: string,
): Promise<Recording> {
  const { config } = project
  const context = await browser.newContext({
    baseURL: config.baseUrl,
    viewport: config.viewport ?? { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    storageState: config.storageState ? resolve(project.dir, config.storageState) : undefined,
  })
  const page = await context.newPage()
  const camera = new Camera(page, framesDir, flow)
  const robot = new Robot(page, camera, crops, config.settleMs ?? 300)
  let error: string | undefined
  try {
    const run = await loadFlow(flowFile(project, flow))
    await camera.start()
    await run({ page, sqa: robot, baseUrl: config.baseUrl })
  } catch (e) {
    error = (e as Error).message
  } finally {
    await camera.stop()
    await context.close()
  }
  return { flow, frames: camera.frames, steps: robot.steps, error }
}

async function loadFlow(file: string): Promise<Flow> {
  const mod = (await tsImport(pathToFileURL(file).href, import.meta.url)) as {
    default?: Flow | { default?: Flow }
  }
  const run = typeof mod.default === 'function' ? mod.default : mod.default?.default
  if (typeof run !== 'function') throw new Error(`${file} must have a default export: async ({ page, sqa }) => {...}`)
  return run
}

async function judgeRecordings(
  project: Project,
  checks: Check[],
  recordings: Recording[],
  runDir: string,
  jev: JevOptions,
): Promise<CheckResult[]> {
  const thresholds = project.config.thresholds ?? DEFAULT_THRESHOLDS
  const limit = limiter(project.config.concurrency ?? 6)
  const results = new Map<string, CheckResult>(
    checks.map((check) => [check.tag, { check, status: 'not-checked', frames: [] }]),
  )
  // Identical crop + same questions + same moment = same answer, so each is asked once.
  const asked = new Map<string, Promise<Record<string, number>>>()
  const tasks: Promise<void>[] = []

  for (const recording of recordings) {
    const flowChecks = checks.filter((c) => c.flow === recording.flow)
    if (recording.error) {
      for (const check of flowChecks) {
        Object.assign(results.get(check.tag)!, { status: 'error', error: `Flow failed: ${recording.error}` })
      }
      continue
    }

    const groups = Map.groupBy(flowChecks, (c) => c.crop ?? '')
    for (const frame of recording.frames) {
      for (const [crop, group] of groups) {
        const applicable = group.flatMap((check) => {
          const expected = expectedAnswer(check, frame.tags, frame.phase)
          return expected ? [{ check, expected }] : []
        })
        if (applicable.length === 0) continue
        const box = crop ? recording.steps[frame.step]?.boxes[crop] : null
        if (crop && !box) continue // Element not on screen at this step.

        tasks.push(
          limit(async () => {
            const image = pngSize(readFileSync(frame.file))
            const { png, hash } = await cropForJev(frame.file, cropRect(box ?? null, image, frame.scale, frame.offsetTop))
            const imagePath = join('crops', `${hash}.png`)
            await writeFile(join(runDir, imagePath), png)

            const moment = describeMoment(frame.tags, frame.phase)
            const questions: Record<string, JevQuestion> = Object.fromEntries(
              applicable.map(({ check }) => [check.tag, { context: check.context, question: check.question }]),
            )
            const key = [hash, moment, ...Object.keys(questions).sort()].join('|')
            if (!asked.has(key)) asked.set(key, askJev(jev, png, moment, questions))
            const answers = await asked.get(key)!

            for (const { check, expected } of applicable) {
              const p = answers[check.tag]
              results.get(check.tag)!.frames.push({
                frameId: frame.id,
                step: frame.step,
                tags: frame.tags,
                phase: frame.phase,
                expected,
                p,
                verdict: judge(p, expected, thresholds),
                image: imagePath,
              })
            }
          }),
        )
      }
    }
  }

  const settled = await Promise.allSettled(tasks)
  const failure = settled.find((s): s is PromiseRejectedResult => s.status === 'rejected')
  if (failure) throw failure.reason

  for (const result of results.values()) {
    if (result.status === 'error') continue
    result.frames.sort((a, b) => a.frameId - b.frameId)
    result.status = checkStatus(result.frames)
  }
  return [...results.values()]
}

function limiter(max: number) {
  let active = 0
  const queue: (() => void)[] = []
  return async <T>(fn: () => Promise<T>): Promise<T> => {
    // A finished task hands its slot straight to the next waiter, so `active` never exceeds `max`.
    if (active >= max) await new Promise<void>((resolve) => queue.push(resolve))
    else active++
    try {
      return await fn()
    } finally {
      const next = queue.shift()
      if (next) next()
      else active--
    }
  }
}

export function relativeToCwd(path: string): string {
  return relative(process.cwd(), path) || '.'
}
