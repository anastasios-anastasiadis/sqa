import { parseArgs } from 'node:util'
import { jevOptionsFromEnv } from './jev.ts'
import { writeReport } from './report.ts'
import { relativeToCwd, runCheck } from './run.ts'

const HELP = `Usage: sqa check [flow ...] [--dir sqa] [--headed]

Runs each flow in <dir>/flows, records every frame, and asks Jev the
questions in <dir>/checks.json. Writes <dir>/runs/<run>/report.md.

Options:
  --dir <path>   Folder with config.json, checks.json and flows/ (default: sqa)
  --headed       Show the browser window
  -h, --help     Show this help

Environment:
  TYPESAFE_API_KEY   Jev API key (required)
  SQA_JEV_URL        Override the Jev endpoint
  SQA_JEV_MODEL      Override the Jev model (default: jev-latest)
`

async function main(): Promise<number> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      dir: { type: 'string', default: 'sqa' },
      headed: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })
  const [command, ...flows] = positionals
  if (values.help || command !== 'check') {
    console.log(HELP)
    return values.help ? 0 : 1
  }

  const jev = jevOptionsFromEnv()
  if (!jev) {
    console.error('Set TYPESAFE_API_KEY to your Jev API key.')
    return 1
  }

  const run = await runCheck({ dir: values.dir!, flows, headed: values.headed, jev, log: console.log })
  const reportPath = writeReport(run)

  const count = (status: string) => run.results.filter((r) => r.status === status).length
  console.log(
    `\n${count('pass')} passed, ${count('fail')} failed, ${count('unsure')} unsure, ` +
      `${count('not-checked') + count('error')} not checked`,
  )
  console.log(`Report: ${relativeToCwd(reportPath)}`)
  return run.results.some((r) => ['fail', 'error', 'not-checked'].includes(r.status)) ? 1 : 0
}

main().then(
  (code) => process.exit(code),
  (error: Error) => {
    console.error(error.message)
    process.exit(1)
  },
)
