# DIY and Open-Source Alternatives: Letting a Coding Agent QA a Web App Without a Paid QA Product

Research date: 2026-10-16. Desk research only. Star counts were read from GitHub pages on that date unless noted.

Headline: The free DIY stack already covers most of SQA's pitch. Vercel's open-source `dogfood` skill for `agent-browser` targets "5-10 well-documented issues" with repro videos, step screenshots and repro steps. That is almost exactly SQA's promised output, and it costs nothing beyond the developer's own LLM tokens. What DIY lacks is hosting, reliability, verification and a polished artifact. It does not lack the core idea.

## 1. Coding-agent-native QA skills and commands (gstack, dogfood, Claude Code/Cursor/Codex workflows)

### Takeaway
At least two widely installed, free, MIT/Apache skills do "paste a command, the agent explores the app, you get a bug report". gstack offers `/qa` and `/qa-only` (Garry Tan, ~137k stars). Vercel offers `dogfood` on agent-browser (~44k stars, skill listing shows ~1.1M installs). `dogfood` is the closest direct substitute for SQA. It is a structured exploratory run that targets 5-10 reproducible issues, each with video, screenshots and repro steps.

### Cited Findings
**Vercel agent-browser `dogfood` skill (closest DIY substitute)**
- Purpose: "Systematically explore a web app as a user would, find bugs and UX issues, and document each with reproduction evidence." Only the target URL is required. Output goes to `./dogfood-output/` by default. — [dogfood SKILL.md (raw)](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- Phases: Initialize, then Authenticate (log in, save `auth-state.json`), Orient (annotated screenshot plus snapshot to map sections), Explore (nav, forms, modals, empty states, error handling, boundary inputs, periodic console checks), Document (append each issue immediately, not batched), Wrap up (severity counts). — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- Target output: "Aim to find 5-10 well-documented issues, then wrap up." It favors depth of evidence over count. "Every issue must be reproducible." It verifies reproducibility with at least one retry before collecting evidence. — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- Evidence rules: interactive issues get a repro video, a screenshot at each step and an annotated result screenshot. Static issues (typos, clipped text, console errors on load) get one annotated screenshot, with video marked N/A. Videos are "paced for humans" (`sleep 1` between actions). It types character by character while recording. — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- Report: built from a markdown template with an issue counter (ISSUE-001...) and severity counts. Severity levels are critical, high, medium and low, per registry mirrors. — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md); [search summary of skill mirrors, e.g. claudemarketplaces](https://claudemarketplaces.com/skills/vercel-labs/agent-browser/dogfood)
- Auth: fills login forms itself. For OTP or email codes it asks the user and waits. — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- Hard rule: "Never read the target app's source code" (black-box testing). There are no time or budget limits in the skill. — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- Install: `npx skills add vercel-labs/agent-browser --skill dogfood`. It triggers on phrases like "dogfood", "QA", "exploratory test", "bug hunt". — [vibeindex](https://vibeindex.ai/skills/vercel-labs/agent-browser/dogfood); [Tessl registry](https://tessl.io/registry/skills/github/vercel-labs/agent-browser/dogfood/review)
- The agent-browser skill listing on skills.sh shows 1.1M installs, first seen Jan 19, 2026. This counts the base skill, not dogfood alone. — [skills.sh](https://skills.sh/vercel-labs/agent-browser/dogfood)
- Many forks and copies of `dogfood` exist on skill registries (coder/mux, connorads, somtougeh, matrixy, etc.). The pattern is spreading. — [skills.sh coder/mux](https://skills.sh/coder/mux/dogfood); [playbooks.com](https://playbooks.com/skills/gwenwindflower/.charmschool/dogfood)
- A community (non-Vercel) project wires dogfood into CI. It polls Vercel for the preview URL, then runs `claude -p` headless with agent-browser. — per search summary of [awesome.ecosyste.ms / related listings](https://awesome.ecosyste.ms/projects/github.com%2Fjacobsmith%2Fdogfood-presentation) (not verified directly)

**gstack (Garry Tan)**
- Repo stats: 136.6k stars, 20.3k forks, MIT license, tested release v1.91.13.0 (read 2026-10-16). — [garrytan/gstack](https://github.com/garrytan/gstack)
- Testing skills: `/qa`, `/qa-only`, `/test-audit`, `/benchmark`, `/canary`. Browser skills: `/browse`, `/scrape`, `/setup-browser-cookies`, `/open-gstack-browser`, `/pair-agent`. There are also iOS QA skills. — [garrytan/gstack](https://github.com/garrytan/gstack)
- `/qa` tests browser, API, CLI, job and webhook behavior. It will "Reproduce bugs, write failing regressions, fix the cause and re-verify before committing." A bug must reproduce, and its new test must fail before the fix and pass after. It saves `exploration-NNN.json` evidence and "explicitly reports missing test coverage". It uses an executable deadline guard for bounded exploration. — [garrytan/gstack](https://github.com/garrytan/gstack)
- `/qa-only` explores and reports "with replayable evidence" without changing code. Each finding has the exact command, expected vs actual, untested checks and suggested regression cases. — [garrytan/gstack](https://github.com/garrytan/gstack)
- `/browse` drives the "Aside" browser with the user's real logged-in sessions, or falls back to gstack's own Chromium daemon at "~100ms per command". `/setup-browser-cookies` imports cookies from the user's browser. `$B handoff` gives control to a human for login steps. — [garrytan/gstack](https://github.com/garrytan/gstack)
- The README does not mention video recording or screenshots for `/qa`. — [garrytan/gstack](https://github.com/garrytan/gstack)
- gstack works across Claude Code, Codex CLI, Cursor and Factory Droid. A March 2026 write-up counted 31 skills, and later aggregators list more. — [Daniel Vaughan blog, 2026-03-30](https://codex.danielvaughan.com/2026/03/30/gstack-garry-tan-production-skills-toolkit/)

**Other agent-native workflows**
- Playwright ships built-in "Test Agents" (planner, generator, healer) since v1.56. `npx playwright init-agents --loop=vscode|claude|opencode` installs them. The planner explores the app and writes a Markdown test plan. The generator writes tests. The healer repairs failing tests or marks them `test.fixme()` if the feature looks broken. — [Playwright docs: Test Agents](https://playwright.dev/docs/test-agents); [Debbie Codes](https://debbie.codes/blog/playwright-agents-planner-generator-and-healer-in-action)
- Community Cursor skill "visual-qa-testing" opens the app in Cursor's browser, takes screenshots, checks console errors and audits network requests after UI changes. — [claudeskills.info](https://claudeskills.info/skills/spencerpauly/awesome-cursor-skills/visual-qa-testing/)
- Blog guides show Claude Code with Playwright doing nightly exploratory crawls that file issues (including to Jira). They also advise against using agent testing as a merge gate because it is non-deterministic. — [agentpedia](https://agentpedia.codes/blog/qa-app-with-claude-code); [TestCollab guide](https://testcollab.com/claude-code-for-qa-testing); [alexop.dev "AI QA engineer"](https://alexop.dev/posts/building_ai_qa_engineer_claude_code_playwright/)

### Inferences
- `dogfood` already matches SQA's value proposition in shape: one prompt, about 5-10 issues, video, screenshots, repro steps, reproducibility check. SQA cannot win on "the agent produces bug reports with video". It has to win on quality, reliability, hosting, verification, or not burning the developer's own context and tokens.
- gstack `/qa` goes further than SQA in one direction (it fixes bugs and writes regression tests) but is weaker on media evidence. The DIY ecosystem is splitting into "find and fix" (gstack) and "find and report with evidence" (dogfood).
- Because these are free, MIT/Apache and installed via one command, a "paste one prompt into your agent" install flow is not a differentiator by itself.

### Gaps
- I found no public sample `dogfood` reports or measured results (bug precision, run length, token cost per run).
- The exact report template fields and the issue taxonomy file for dogfood were not read (`templates/dogfood-report-template.md`, `references/issue-taxonomy.md`).
- Release dates for gstack and agent-browser were not visible on the fetched pages.
- I found no official Anthropic "QA" plugin for Claude Code. Search returned only third-party guides.

## 2. Browser tools for coding agents (Playwright MCP, Chrome DevTools MCP, Claude in Chrome, browser-use, Stagehand, Skyvern, Magnitude, Steel, Hyperbrowser, agent-browser)

### Takeaway
Developers have many free, mature browser primitives. Playwright MCP (38k stars) and agent-browser (44k stars) already support video recording, screenshots, console and network capture, and saved auth state. These are exactly the evidence pieces an SQA report needs. The general-purpose agent frameworks (browser-use, Stagehand, Skyvern) are built for task automation, not exploratory QA. They are building blocks, not QA products.

### Cited Findings
- **agent-browser (Vercel Labs):** 44.1k stars, Apache-2.0, "Browser automation CLI for AI agents", native Rust. It supports `record start/stop` video (.webm/.mp4, 30-60 fps, needs ffmpeg), `screenshot --annotate` (numbered element labels), `console`, `errors`, `network requests`, HAR capture, `state save/load`, an auth vault, and named isolated sessions. — [vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)
- **Playwright MCP (Microsoft):** 38.2k stars, Apache-2.0. It has screenshots, video (`browser_start_video/stop_video`), tracing, storage state and cookies, opt-in vision mode, a persistent profile by default, and an `--extension` mode to attach to the user's logged-in Chrome/Edge. — [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- The Playwright MCP README itself says coding agents "might benefit from using the CLI+SKILLS instead" because the CLI avoids large tool schemas and verbose accessibility trees. — [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- Blog guides say MCP suits exploratory debugging and self-QA, while the CLI suits repeated test generation and CI. — [TestDino](https://www.testdino.com/blog/claude-code-with-playwright)
- **Chrome DevTools MCP (Google):** lets a coding agent drive real Chrome for navigation, clicks, performance traces, network inspection, console and screenshots. Google's sample prompt is "Verify in the browser that your change works as expected." — [Chrome for Developers blog](https://developer.chrome.com/blog/chrome-devtools-mcp)
- A dev.to guide recommends Chrome DevTools MCP for runtime evidence (console, network, DOM) and Playwright for repeatable E2E. — [dev.to](https://dev.to/ahab_indieseek/chrome-devtools-mcp-for-ai-coding-agents-a-practical-debugging-workflow-4m48)
- **Claude in Chrome / Claude Code `/chrome`:** Claude Code drives the user's real Chrome (with login state), reads console errors and can record a GIF of a flow. It needs a paid Claude plan and has no headless mode. — [Claude Code docs (chrome)](https://code.claude.com/docs/zh-CN/chrome.md); [claude-code-playbook](https://claude-code-playbook.pages.dev/en/docs/level-1/chrome-integration)
- Security caveat: a July 2026 report says Claude for Chrome v1.0.80 accepted forged clicks from other extensions, with no patch as of July 14. — [The Hacker News, 2026-07](https://thehackernews.com/2026/07/claude-for-chrome-flaw-lets-other.html)
- **browser-use:** about 109.1k stars, MIT, Python agent framework (v0.13.7). **Stagehand:** about 23.9k stars, MIT, code-first SDK mixing Playwright with AI actions (v4.0.0). **Skyvern:** about 22.7k stars, AGPL-3.0, vision-first. **Steel:** about 7.5k stars, Apache-2.0, browser infrastructure. All figures as reported in August 2026. — [DevToolLab, Aug 2026](https://devtoollab.com/blog/best-ai-browser-automation-tools)
- Hyperbrowser is browser infrastructure for agents (anti-detection, sessions, stealth). No star count was found. — [Notte comparison](https://ai.notte.cc/answers/hyperbrowser-vs-skyvern)
- WebVoyager benchmark scores quoted by these vendors use different task counts, so they cannot be compared directly. — [DevToolLab](https://devtoollab.com/blog/best-ai-browser-automation-tools)
- **Magnitude:** open-source, vision-first browser agent. It uses pixel coordinates from a visually grounded LLM rather than the DOM. It claims 94% on WebVoyager (self-reported) and has a built-in test runner with visual assertions and CI support. — [Magnitude README](https://raw.githubusercontent.com/magnitudedev/browser-agent/main/README.md); [docs.magnitude.run](https://docs.magnitude.run/llms.txt)

### Inferences
- The evidence pieces SQA would deliver (video, annotated screenshots, console and network logs, HAR, auth state) are each one CLI flag in free tools. The hard part is orchestration and judgement, not capture.
- browser-use, Stagehand, Skyvern and Magnitude are aimed at task automation or scripted tests. None ships an "explore and report bugs" mode as its main use case. A developer using them for exploratory QA still has to write the QA loop.
- The ecosystem is moving from MCP to CLI plus skill for coding agents, mainly to save tokens. That is the same shape SQA proposes (a CLI or MCP behind a prompt).

### Gaps
- Star counts for Chrome DevTools MCP, Magnitude and Hyperbrowser were not retrieved.
- I found no head-to-head evaluation of these tools specifically for exploratory bug finding (as opposed to task completion).

## 3. Built-in features of coding agents and platforms that overlap

### Takeaway
Most major AI builders now let the agent check its own work in a browser: Cursor, Codex, Replit, Lovable, and Claude Code via Chrome. But these are short "verify my change" checks scoped to the current edit. They are not hour-long exploratory hunts and do not produce standalone bug reports with video.

### Cited Findings
- **Cursor:** a built-in Browser tool (@browser) navigates, clicks, types, screenshots, and reads console and network output. It asks for approval per action by default, and enterprise admins control it through MCP allow/deny lists. Its integrated browser runs Playwright, and recorded actions can be turned into an integration test. — [learncursor.dev](https://www.learncursor.dev/learn/cursor-agents/agent-browser-tool); [learncursor.dev guide](https://www.learncursor.dev/guides/cursor-integrated-browser-tests)
- A January 2026 Cursor forum report says the agent claimed to have no browser tools even though browser automation was connected. — [Cursor forum](https://forum.cursor.com/t/agent-can-t-access-browser-automation-tools-navigate-click-screenshot-even-though-browser-capabilities-page-lists-them-and-browser-automation-is-connected/148651)
- **Codex:** an in-app browser (Cmd+Shift+B) for local dev servers and public pages. Per OpenAI docs, it does not support authentication flows, signed-in pages, cookies or the user's profile. A separate Codex Chrome extension handles logged-in sites in task-specific tab groups. OpenAI recommends keeping each browser task small. — [OpenAI Codex docs: browser](https://developers.openai.com/codex/app/browser); [Daniel Vaughan, 2026-05-11](https://codex.danielvaughan.com/2026/05/11/codex-chrome-extension-parallel-browser-workflows-devtools-tab-groups/)
- Codex has known issues: Windows Browser Use becomes unusable after a crash, and enterprise network policy can block even example.com (GitHub issues). — [openai/codex #35311](https://github.com/openai/codex/issues/35311); [issue #24814 mirror](https://upd.dev/openai/codex/issues/24814)
- **Replit Agent App Testing:** the agent tests apps it builds in a real browser "the way a real user would". It decides when to test based on what changed. It supports Full Stack JS and Streamlit apps, and shows a browser preview and a test summary. — [Replit docs: App Testing](https://docs.replit.com/features/agent/app-testing)
- **Lovable browser testing:** the agent drives a real browser in a virtual environment, clicks and fills forms, verifies with screenshots, reads console and network, and checks screen sizes. It is used selectively, after faster checks. — [Lovable docs: browser testing](https://docs.lovable.dev/features/browser-testing); [Lovable FAQ](https://lovable.dev/faq/testing/is-this-real-browser)
- Trade coverage says Lovable now runs automated browser tests before finishing builds, which conflicts with the docs' "selective" wording. — [createwith.com](https://www.createwith.com/tool/lovable/updates/lovable-adds-automated-browser-tests-and-plan-mode)
- **Claude Code + Chrome:** see section 2. It covers a short verify loop with GIF capture. — [Claude Code docs](https://code.claude.com/docs/zh-CN/chrome.md)

### Inferences
- Built-in checks shrink the "I didn't even click it" class of bugs. That reduces the easy wins left for a standalone QA run, especially on vibe-coded apps. Remaining bugs will skew toward cross-feature, state, auth and edge-case issues that need longer exploration.
- None of the built-in features is positioned as an independent tester. They test the code the same agent just wrote, with the same blind spots. "A separate agent that never read the code" (dogfood's rule) is a real angle SQA can claim, but dogfood already claims it too.

### Gaps
- I found no reliable information on Bolt, Devin, GitHub Copilot coding agent, or Vercel/Netlify preview-deployment testing features. Searches returned nothing specific.
- I found no data on how often these built-in checks catch real bugs.

## 4. Open-source autonomous QA and exploration projects on GitHub

### Takeaway
Outside the big skill packs (gstack, dogfood) and Playwright's test agents, open-source "autonomous exploratory QA" projects are small, early experiments with single-digit to low star counts. No standalone OSS project dominates this niche. The real OSS competition is the skill files layered on agent-browser and Playwright.

### Cited Findings
| Project | What it does | License / stars / status | Source |
|---|---|---|---|
| vercel-labs/agent-browser + `dogfood` skill | Exploratory QA, 5-10 issues, video, screenshots, repro | Apache-2.0, 44.1k stars (repo) | [GitHub](https://github.com/vercel-labs/agent-browser) |
| garrytan/gstack `/qa`, `/qa-only` | Explore, reproduce, fix, regression test, or report only | MIT, 136.6k stars | [GitHub](https://github.com/garrytan/gstack) |
| Playwright Test Agents (planner/generator/healer) | Explore, write test plan, generate and heal tests | Part of Playwright (Apache-2.0), since v1.56 | [Playwright docs](https://playwright.dev/docs/test-agents) |
| srbarrios/agentic-test-explorer | LangGraph Swarm + Playwright + Claude/Gemini exploratory testing; outputs reproducible Playwright scripts | MIT, ~7 stars when indexed | [ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fsrbarrios%2Fagentic-test-explorer) |
| brentkastner/ai-qa-framework | Claude + Playwright; URL plus optional creds, then plans, explores, runs tests, collects evidence, tracks regressions | Experiment; stars not retrieved | per search summary ([letsdatascience](https://letsdatascience.com/news/open-source-agent-runs-autonomous-qa-tests-12b49f35)) |
| GhassenAZZOUZ/claude-qa-agent | Claude QA agent with an open issue for an "exploratory tester" that would drive a live browser, which it does not yet do | Early | [GitHub issue #8](https://github.com/GhassenAZZOUZ/claude-qa-agent/issues/8) |
| Replay.io "Loop QA" | Described in search results as open source: given a URL it explores, maps journeys, records sessions, writes bug reports with root cause; "free to use at low volume" | Blog post now returns 404; status unclear | [replay.io/blog/loop-qa (404 on 2026-10-16)](https://www.replay.io/blog/loop-qa) |

- Replay also sells a hosted commercial "Replay QA" (freemium). — [tooldirectory.ai, reviewed 2026-07-25](https://tooldirectory.ai/tools/replay-qa)

### Inferences
- The OSS "product" for this job is really a markdown skill plus a browser CLI. That is cheap to copy and fork, so any SQA prompt or skill design can be copied the same way. The defensible part has to sit server-side (verification, dedup, hosting, media pipeline, accumulated learnings).

### Gaps
- Loop QA's license, repo and current status could not be verified because the blog URL returned 404.
- Star counts and last-commit dates for the small projects were not checked directly.

## 5. Practical limits developers report (cost, time, flakiness, auth, false positives, video, context)

### Takeaway
The recurring pain points are context and token bloat from browser snapshots on long runs, auth and OTP needing a human, non-determinism, and safety risks on live sites. I found little hard data on false-positive rates or the cost per hour of DIY exploratory runs.

### Cited Findings
- **Tokens and context:** one source reports complex pages can cost 50k+ tokens per snapshot with Playwright MCP. Another says the Playwright CLI uses about 4x fewer tokens than MCP for equivalent work. Both are individual or vendor benchmarks. — [dev.to: Playwright CLI vs MCP](https://dev.to/aswani25/playwright-cli-vs-playwright-mcp-which-should-you-use-with-claude-code-1olh); [mejba.me](https://www.mejba.me/blog/playwright-cli-claude-code-browser-automation)
- MCP streams full page state and accessibility trees into context after every action, which makes long sessions costly. — [TestDino](https://www.testdino.com/blog/claude-code-with-playwright); [microsoft/playwright-mcp README](https://github.com/microsoft/playwright-mcp)
- Long Playwright sessions burn tokens fast, especially when Claude reads DOM snapshots and retries flaky steps. — [usagebar.com](https://usagebar.com/blog/how-to-do-playwright-testing-on-claude-code)
- CLI summaries can miss an error banner after submit unless the agent opens the full saved page. This is a false-negative risk from token-saving. — [dev.to](https://dev.to/aswani25/playwright-cli-vs-playwright-mcp-which-should-you-use-with-claude-code-1olh)
- **Auth:** Playwright MCP's default isolated profile does not share the user's Chrome login. Reusing it needs extension mode. — [besthub.dev](https://www.besthub.dev/articles/how-to-let-claude-code-control-chrome-skip-login-auto-fill-backend-data-and-solve-captchas-visually-cc16cbbd919d); [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
- Codex's in-app browser does not support signed-in pages. — [OpenAI docs](https://developers.openai.com/codex/app/browser)
- dogfood stops and asks the user for OTP and email codes. — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- gstack works around auth with cookie import and human handoff. — [gstack](https://github.com/garrytan/gstack)
- **Non-determinism:** guides advise keeping deterministic tests as the merge gate and using agents only for smoke passes and discovery. — [agentpedia](https://agentpedia.codes/blog/qa-app-with-claude-code)
- A vendor blog cites roughly 72% validity for AI-generated tests on simple scenarios, dropping about 25% on complex ones. It quotes an HN commenter saying LLM test suites can add more flakiness than they remove. This is a vendor source citing unnamed "early research". — [Bug0 blog](https://bug0.com/blog/ai-testing-browser-agent-tools-wont-fix-qa-2026)
- **Safety on live sites:** Anthropic halted live internet access for internal evals after agents acted on real websites. A Haiku 4.5 agent filled in a real police tip form. This is relevant when pointing exploratory agents at production. — [The Hacker News, 2026-10](https://thehackernews.com/2026/10/anthropic-cuts-live-internet-access-for.html)
- **Setup friction:** Cursor agents sometimes fail to see connected browser tools. Codex Browser Use has crash and enterprise-policy bugs. — [Cursor forum](https://forum.cursor.com/t/agent-can-t-access-browser-automation-tools-navigate-click-screenshot-even-though-browser-capabilities-page-lists-them-and-browser-automation-is-connected/148651); [openai/codex #35311](https://github.com/openai/codex/issues/35311)
- **Video:** this is no longer a hard limit. agent-browser and Playwright MCP both record video, and Claude in Chrome records GIFs. — [agent-browser](https://github.com/vercel-labs/agent-browser); [playwright-mcp](https://github.com/microsoft/playwright-mcp); [Claude Code docs](https://code.claude.com/docs/zh-CN/chrome.md)

### Inferences
- A one-hour run inside the developer's own coding agent will hit context limits and use the developer's own subscription or tokens. Running the exploration on SQA's side (off the developer's context) is a concrete benefit to sell.
- Auth, OTP and destructive actions on live apps are unsolved in DIY. They are a likely differentiator if SQA handles test accounts, safe-action rules and data cleanup.

### Gaps
- No Reddit threads surfaced in searches (r/ClaudeAI, r/cursor, r/vibecoding, r/QualityAssurance). Developer sentiment here comes from blogs, forums and GitHub issues instead.
- I found no published false-positive rates for agent exploratory QA, and no measured cost or time per hour-long DIY run.

## 6. What a DIY setup still lacks vs a dedicated product

### Takeaway
DIY already delivers the format (video, screenshots, repro steps, about 5-10 issues). It lacks independent verification, dedup across runs, hosting and sharing, parallelism, managed auth and test data, and freedom from the developer's context and token budget. These gaps, plus proven report quality, are where SQA must compete.

### Cited Findings
- dogfood saves reports and media to a local folder (`./dogfood-output/`). There is no hosted, shareable report or issue-tracker sync, and no time or budget limits. — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- dogfood's reproducibility check is "at least one retry" by the same agent in the same session. There is no independent re-verification step. — [dogfood SKILL.md](https://raw.githubusercontent.com/vercel-labs/agent-browser/main/skill-data/dogfood/SKILL.md)
- gstack `/qa` has the strongest DIY verification: a failing regression test before the fix and passing after. Its outputs are JSON evidence and tests, not video. — [gstack](https://github.com/garrytan/gstack)
- Built-in agent browser checks are scoped to small tasks. OpenAI explicitly recommends keeping browser tasks small. — [OpenAI Codex docs](https://developers.openai.com/codex/app/browser)
- Agent testing is non-deterministic and not trusted as a gate. — [agentpedia](https://agentpedia.codes/blog/qa-app-with-claude-code)
- One vendor argues that buying or plugging in a browser-agent tool does not by itself fix QA, because process, coverage and ownership still matter. This is a vendor opinion. — [Bug0 blog](https://bug0.com/blog/ai-testing-browser-agent-tools-wont-fix-qa-2026)

### Inferences
Comparison of SQA's promise vs best free DIY (dogfood or gstack):

| Capability | Best free DIY today | Gap SQA could fill |
|---|---|---|
| One-prompt start | Yes (`npx skills add ... dogfood`, gstack setup) | None |
| ~5 issues with repro steps | Yes (dogfood targets 5-10) | Proven quality and precision |
| Video + screenshots | Yes (agent-browser record and annotated screenshots) | Polished, hosted, shareable player |
| Repro verification | Self-retry (dogfood); failing test (gstack) | Independent fresh-session re-run, ideally by a different agent |
| Dedup across runs | Not found | Memory of past findings per app |
| ~1-hour runs | Limited by user's context and tokens | Off-loaded compute and context |
| Parallelism | Manual (sessions exist) | Many parallel explorers |
| Auth / OTP / test data | Manual handoff | Managed test accounts and inboxes |
| Safety on prod | User's responsibility | Guardrails against destructive actions |
| Cost | Free tool plus user's LLM tokens | Must justify price over "free plus tokens" |

- The "do nothing" baseline is strong for cost-sensitive solo developers already using Claude Code or Cursor. SQA's buyers are more likely people who want reliable, low-noise results without spending their own agent time and context, or teams that want shareable reports.

### Gaps
- No user reviews compare dogfood or gstack `/qa` output quality against paid QA products.
- I could not find how many developers actually run dogfood or `/qa` regularly, as opposed to just installing them.
