import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { describeTags, type CheckStatus } from './checker.ts'
import type { RunResult } from './run.ts'

const LABEL: Record<CheckStatus, string> = {
  fail: 'FAIL',
  error: 'ERROR',
  'not-checked': 'NOT CHECKED',
  unsure: 'UNSURE',
  pass: 'PASS',
}
const ORDER: CheckStatus[] = ['fail', 'error', 'not-checked', 'unsure', 'pass']

/** Writes report.md and results.json into the run folder. Returns the report path. */
export function writeReport(run: RunResult): string {
  const results = [...run.results].sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status))
  const lines: string[] = [
    '# SQA check report',
    '',
    `Run \`${run.runId}\` against ${run.baseUrl}`,
    '',
    '| Status | Tag | Line | Frames |',
    '|---|---|---|---|',
  ]
  for (const { check, status, frames } of results) {
    const failed = frames.filter((f) => f.verdict === 'fail').length
    const unsure = frames.filter((f) => f.verdict === 'unsure').length
    const summary = frames.length
      ? `${frames.length} checked, ${failed} failed, ${unsure} unsure`
      : '0 checked'
    lines.push(`| ${LABEL[status]} | \`${check.tag}\` | ${escape(check.line)} | ${summary} |`)
  }

  for (const { check, status, frames, error } of results) {
    if (status === 'pass') continue
    lines.push('', `## ${LABEL[status]}: \`${check.tag}\``, '', `> ${check.line}`, '')
    lines.push(`- Flow: \`${check.flow}\``, `- Question: ${check.question}`)
    if (error) lines.push(`- Error: ${error}`)
    if (status === 'not-checked') {
      lines.push('- No frame matched this check. Check its `expect.when` tags and `crop` selector.')
    }
    const shown = frames.filter((f) => f.verdict !== 'pass')
    if (shown.length) {
      lines.push('', '| Frame | Moment | Expected | Jev yes-probability | Verdict | Image |', '|---|---|---|---|---|---|')
      for (const f of shown) {
        lines.push(
          `| ${f.frameId} | ${escape(describeTags(f.tags))} (${f.phase}) | ${f.expected} | ${f.p.toFixed(2)} | ${f.verdict} | ![frame ${f.frameId}](${f.image}) |`,
        )
      }
    }
  }

  const reportPath = join(run.runDir, 'report.md')
  writeFileSync(reportPath, `${lines.join('\n')}\n`)
  writeFileSync(join(run.runDir, 'results.json'), `${JSON.stringify(run, null, 2)}\n`)
  return reportPath
}

function escape(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}
