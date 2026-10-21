import type { Page } from 'playwright'

/** Labels a flow attaches to a step, e.g. `{ line: 9 }`. Frames inherit them. */
export type Tags = Record<string, string | number | boolean>

export type Answer = 'yes' | 'no'

/** Matches a frame's tags. A `[min, max]` pair matches a number in that range. An empty object matches every frame. */
export type When = Record<string, string | number | boolean | [number, number]>

export interface Expect {
  when: When
  answer: Answer
}

/** One line of capabilities.md, turned into something Jev can check. */
export interface Check {
  /** Short tag from capabilities.md, e.g. "scrollbar". */
  tag: string
  /** The capabilities.md sentence, shown in the report. */
  line: string
  /** One or two sentences about the feature, sent to Jev with every frame. */
  context?: string
  /** Flow file name in `flows/`, without `.ts`. */
  flow: string
  /** Playwright selector of the element to crop to. Omit to send the whole screen. */
  crop?: string
  /** Narrow yes/no question asked about each matching frame. */
  question: string
  /** Expected answer per frame. Frames that match no `when` are not asked. */
  expect: Expect[]
  /** "settled" (default): only frames after each step finished. "all": also frames taken while a step ran. */
  frames?: 'settled' | 'all'
}

export interface ChecksFile {
  checks: Check[]
}

export interface Config {
  /** Where the app runs, e.g. "http://localhost:3000". Flows can use relative URLs. */
  baseUrl: string
  viewport?: { width: number; height: number }
  /** Playwright storage state file (cookies) for a signed-in session, relative to the sqa folder. */
  storageState?: string
  /** Extra wait after each step so animations finish. Default 300 ms. */
  settleMs?: number
  /** Jev's yes-probability must be at least `yes` to count as yes, at most `no` to count as no. Default 0.7 / 0.3. */
  thresholds?: { yes: number; no: number }
  /** Jev calls in flight at once. Default 6. */
  concurrency?: number
}

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export type Phase = 'during' | 'settled'

export interface Frame {
  id: number
  file: string
  step: number
  tags: Tags
  phase: Phase
  /** Image pixels per CSS pixel. */
  scale: number
  /** CSS pixels between the top of the image and the top of the page viewport. */
  offsetTop: number
}

export interface StepRecord {
  index: number
  tags: Tags
  /** Where each crop element was once the step settled, keyed by selector. */
  boxes: Record<string, Box | null>
}

export interface Sqa {
  /**
   * Runs `action`, waits for the page to settle, then labels the following frames with `tags`.
   * Frames taken while `action` runs are labelled with the same tags, as phase "during".
   */
  step(tags: Tags, action?: () => Promise<unknown>): Promise<void>
}

export interface FlowContext {
  page: Page
  sqa: Sqa
  baseUrl: string
}

export type Flow = (ctx: FlowContext) => Promise<void>
