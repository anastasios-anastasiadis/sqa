# SQA

SQA is an attempt to make a better Momentic (Mo): an automated QA tool that explores a web app and returns a short list of real, reproducible bug reports that a coding agent can fix.

## Rules

1. `CLAUDE.md` and `AGENTS.md` must always be identical. When you change one, make the same change in the other. A pre-commit hook in `.githooks/pre-commit` blocks any commit where they differ. Turn it on in every clone with `git config core.hooksPath .githooks`.
2. After every change to the repo, commit and push to `master` so cloud sessions stay in sync. If it isn't obvious which branch to use, ask before pushing.
3. Only edit files in this repo when I explicitly tell you to. Never make changes on your own initiative. Agreeing with an idea is not permission to edit. If you're unsure, ask first.

## What's built

SQA has two planned modes. Only the first exists so far.

- `sqa check` (built, v0.1): checks that an app behaves as described in its `capabilities.md`.
- `sqa hunt` (not built): explores an app and returns the top 5 confirmed bugs.

### How `sqa check` works

1. **Robot:** runs each flow, a Playwright script in the app's `sqa/flows/`. The flow wraps each action in `sqa.step(tags, action)`, for example `{ line: 9 }`.
2. **Camera:** records a frame each time the screen changes (Chrome screencast), plus one key frame after each step settles. Every frame is labelled with its step's tags and a phase: `during` (step running) or `settled` (step finished).
3. **Jev:** for each frame a check applies to, crops to the check's element and sends one call with all the questions for that frame. The call includes the feature context and the moment, for example "after this step finished: line = 9". Identical crops are asked once.
4. **Checker:** a yes-probability ≥ 0.7 counts as yes, ≤ 0.3 as no, and anything between is "unsure". A check fails if any frame confidently contradicts its `expect`.
5. **Report:** `sqa/runs/<run>/report.md` lists failures with the cropped frames. `results.json` has everything. The command exits with 1 on any fail, error or not-checked check.

### Using it in an app

Install it with `npm install --save-dev github:anastasios-anastasiadis/sqa`, then `npx playwright install chromium`. Then add:

```
sqa/
  config.json       { "baseUrl": "http://localhost:3000", "storageState": ".auth/state.json" }
  checks.json       { "checks": [ ... ] }  (written by hand for now)
  flows/<name>.ts   export default async ({ page, sqa }) => { ... }
  runs/             output; add to .gitignore
```

Run it with `TYPESAFE_API_KEY=... npx sqa check [flow ...] [--dir sqa] [--headed]`.

One check in `checks.json`:

```json
{
  "tag": "scrollbar",
  "line": "From line 9 on, a scrollbar is visible in the box.",
  "context": "The box where users type messages, at the bottom of a chat.",
  "flow": "chat-input",
  "crop": "[data-testid=chat-input]",
  "question": "Is a scrollbar visible on the right edge of the box?",
  "expect": [
    { "when": { "line": [1, 8] }, "answer": "no" },
    { "when": { "line": [9, 12] }, "answer": "yes" }
  ]
}
```

- `when` matches frame tags exactly, or a `[min, max]` number range. `{}` matches every frame.
- Frames that match no `when` aren't sent to Jev.
- `"frames": "all"` also checks `during` frames. The default is `settled` frames only.
- Optional `config.json` fields: `viewport`, `settleMs` (default 300), `thresholds` (`{ "yes": 0.7, "no": 0.3 }`), `concurrency` (default 6).
- Optional environment variables: `SQA_JEV_URL` and `SQA_JEV_MODEL`. The defaults are TypeSafe's `https://api.typesafe.ai/v1/systemone` and `jev-latest`.

### Code map

- `bin/sqa.mjs`: CLI entry. It runs the TypeScript directly through tsx, so there's no build step.
- `src/cli.ts`: arguments and exit code.
- `src/run.ts`: records the flows, then asks Jev.
- `src/robot.ts`: `sqa.step`.
- `src/camera.ts`: screencast and key frames.
- `src/image.ts`: crops to at least 280 px per side using real page context, and resizes to fit Jev's 280–1568 px limits.
- `src/jev.ts`: Noul questions with an image, using the `TypeSafe-Danger-Zone-Images` header.
- `src/checker.ts`: matching and verdicts.
- `src/report.ts`: report files.
- `src/project.ts`: loads and validates `config.json` and `checks.json`.

Development: `npm test` (unit tests) and `npm run typecheck`.

### Targets

`targets/<app>/` holds the check files for an app we test, so that app's repo isn't touched. Each target has its own `.gitignore` for `.auth/` (saved login) and `.env` (`TYPESAFE_API_KEY`).

- `targets/s/`: S staging at `https://staging.s.norma.app`. Its first check covers the known timezone-search bug in the Schedule report dialog: searching "dubai" still lists every timezone. The checks are `tz-match` and `tz-only-matches`, and both should fail until S fixes the bug.
  - `targets/s/.env` holds `TYPESAFE_API_KEY`, plus `S_EMAIL` and `S_PASSWORD` for the staging test account.
  - `npm run login:s` signs in headlessly through `auth.staging.s.norma.app` and saves the session to `.auth/state.json`. Run it again when the session expires.
  - Run the check with `npm run check:s`.
  - First run (22 Oct 2026): both checks failed as expected. Jev gave a 1–2% chance that Asia/Dubai was listed, and a 100% chance that non-matching timezones were showing. It recorded 182 frames but asked Jev only 2.
- `targets/s-local/`: the same check against local S at `http://localhost:3000`, using the local acceptance user. The flow and `login.ts` are shared with `targets/s/`. Its `.env` also sets `S_BASE_URL`, `S_AUTH_HOST=zitadel.localhost`, `S_TARGET_DIR` and `S_DASHBOARD_PATH`, which is currently `foodics-bi/peak-hours`.
  - Sign in with `npm run login:s-local`, then run `npm run check:s-local`.
  - Before the fix (22 Oct 2026), both checks failed, the same as on staging.
  - After the fix, on local S branch `fix/timezone-search`, `tz-match` passed (p 0.99–1.0). `tz-only-matches` came back unsure (p 0.62) on the final frames. The 280 px minimum crop pulled in the timezone button below the list, which shows "Europe/Athens", and Jev counted it as part of the list.
  - Lesson: widening a crop to fit Jev's minimum size can bring in misleading nearby elements.

### Known limits and not built yet

- Headless Playwright hides scrollbars by default. SQA turns that off.
- Jev's image input is a preview with no published accuracy numbers. Measure it on known frames before trusting it.
- `during` frames use the element position from after the step settled, so their crops are approximate.
- Not built yet:
  - the `/sqa-compile` skill that turns `capabilities.md` into `checks.json`
  - line fingerprints
  - re-running a failure twice
  - the wide "does this match the expected behaviour?" question
  - sending unsure frames to Claude
  - CI
  - `sqa hunt`
