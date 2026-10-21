import type { Answer, Check, Phase, Tags, When } from './types.ts'

export type Verdict = 'pass' | 'fail' | 'unsure'
export type CheckStatus = Verdict | 'not-checked' | 'error'

export interface FrameResult {
  frameId: number
  step: number
  tags: Tags
  phase: Phase
  expected: Answer
  /** Jev's probability that the answer is "yes". */
  p: number
  verdict: Verdict
  /** Path of the cropped image Jev saw, relative to the run folder. */
  image: string
}

export const DEFAULT_THRESHOLDS = { yes: 0.7, no: 0.3 }

export function matchesWhen(when: When, tags: Tags): boolean {
  return Object.entries(when).every(([key, value]) => {
    const tag = tags[key]
    if (Array.isArray(value)) return typeof tag === 'number' && tag >= value[0] && tag <= value[1]
    return tag === value
  })
}

/** The answer this frame should get, or undefined if the check doesn't apply to it. */
export function expectedAnswer(check: Check, tags: Tags, phase: Phase): Answer | undefined {
  if (phase === 'during' && check.frames !== 'all') return undefined
  return check.expect.find((e) => matchesWhen(e.when, tags))?.answer
}

/** Confident answers are trusted. Anything in between is "unsure" and goes to a human (later: Claude). */
export function judge(p: number, expected: Answer, thresholds = DEFAULT_THRESHOLDS): Verdict {
  const answer = p >= thresholds.yes ? 'yes' : p <= thresholds.no ? 'no' : undefined
  if (!answer) return 'unsure'
  return answer === expected ? 'pass' : 'fail'
}

/** A check fails if any frame confidently contradicts it. */
export function checkStatus(results: FrameResult[]): CheckStatus {
  if (results.length === 0) return 'not-checked'
  if (results.some((r) => r.verdict === 'fail')) return 'fail'
  if (results.some((r) => r.verdict === 'unsure')) return 'unsure'
  return 'pass'
}

export function describeTags(tags: Tags): string {
  const entries = Object.entries(tags)
  return entries.length ? entries.map(([k, v]) => `${k} = ${v}`).join(', ') : '(before the first step)'
}

/** Tells Jev which moment of the flow a frame shows, so it doesn't have to work that out from pixels. */
export function describeMoment(tags: Tags, phase: Phase): string {
  if (Object.keys(tags).length === 0) return 'This frame was taken before the first step of the test.'
  return phase === 'settled'
    ? `This frame was taken after this step finished: ${describeTags(tags)}.`
    : `This frame was taken while this step was still running: ${describeTags(tags)}.`
}
