# Leading autonomous AI QA products vs. the SQA target experience (Momentic Mo, TestSprite, Explorbot, ScoutQA)

Research date: 2026-10-16. Desk research only (no sign-ups, no runs). All claims are vendor-stated unless noted.

SQA target experience used as the yardstick: "Developer pastes one prompt into a coding agent → gets an API key → agent drives a CLI/MCP that explores the live web app for ~1 hour → developer gets ~5 high-quality, reproducible bug reports (screenshots, video, repro steps) → coding agent fixes and re-verifies."

## Overall: how close is each product to the SQA target?

### Takeaway
Momentic Mo is already very close to the SQA target: it publishes a literal "paste this into your coding agent" setup prompt, a `qa` CLI plus `mo-qa` skill, autonomous swarm exploration, a separate reproducer agent to filter false positives, a JSON report export for coding agents, and `qa send` rechecks. Its gaps are run shape (10–30+ min swarm vs. 1-hour deep run), unbounded findings count (not a curated ~5), and a still-alpha localhost tunnel. TestSprite is mostly a plan → generate test scripts → run → fix loop (test verdicts, not curated bug reports), Explorbot is a self-hosted, BYO-model open-source CLI (ELv2) without a hosted API key flow, and ScoutQA (Katalon Scout) has the right CLI shape (URL + prompt, issues with severity, `issue-verify`) but thin evidence of video and reproducer verification and low adoption.

### Cited Findings
- Mo quickstart contains a copy-paste prompt for the coding agent beginning "Help me set up Mo, Momentic's AI QA engineer, in this project." that walks the agent through installing `qa`, authenticating, `qa skills -y`, asking for the target/credentials, tunnelling localhost, and kicking off the bash — [Momentic docs: Run your first Mo session](https://momentic.ai/docs/mo/quickstart.md)
- Mo: "A separate agent reproduces functional bugs before they're reported"; findings come with a recording and repro steps — [Momentic Mo page](https://momentic.ai/mo)
- TestSprite MCP workflow is bootstrap → code summary → standardized PRD → test plan → generate code and execute → report → IDE fixes → rerun — [TestSprite MCP Tools Reference](https://docs.testsprite.com/mcp/core/tools.md)
- Explorbot is a CLI the coding agent drives "the same way it drives git or npm"; MCP: "Not yet"; license Elastic License 2.0 — [Explorbot agentic usage doc](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/agentic-usage.md); [Explorbot GitHub README](https://github.com/testomatio/explorbot/)
- ScoutQA skill: `scoutqa --url "https://example.com" --prompt "..."`, `scoutqa list-issues`, `scoutqa issue-verify --issue-id <id>`; runs remotely; supports localhost — [awesome-copilot scoutqa-test skill](https://awesome-copilot.github.com/skill/scoutqa-test/)
- npm last-month downloads (2026-09-13 to 2026-10-12): `@testsprite/testsprite-mcp` 44,102; `qa` (Mo CLI) 13,021; `explorbot` 4,328; `@scoutqa/cli` 316 — [npm downloads API: testsprite-mcp](https://api.npmjs.org/downloads/point/last-month/@testsprite/testsprite-mcp), [qa](https://api.npmjs.org/downloads/point/last-month/qa), [explorbot](https://api.npmjs.org/downloads/point/last-month/explorbot), [@scoutqa/cli](https://api.npmjs.org/downloads/point/last-month/@scoutqa/cli)

### Inferences
- Rough closeness ranking to the SQA target: Mo (closest; most of the flow exists) > ScoutQA (right CLI shape, weaker evidence/rigor) > TestSprite (strong coding-agent loop, but test-script-centric, not bug-hunt-centric) > Explorbot (strong exploration engine and report format, but self-hosted BYO-keys, no hosted API key, no video by default).
- The main open differentiation space for SQA vs. Mo: (a) a deliberately long, deep single run (~1 hour) optimized for a small number of curated, high-confidence bugs, rather than a broad swarm that returns every reproduced bug; (b) GA-quality localhost access (Mo tunnelling is alpha); (c) a richer evidence bundle per bug (console/network logs are not documented in Mo's report export); (d) price predictability.
- TestSprite's install base (44k monthly MCP downloads) shows strong demand for "testing from inside the coding agent", even though its output is test verdicts rather than exploratory bug reports.

### Gaps
- No product was run, so actual finding quality, false-positive rates, and real run durations are unverified.

## Onboarding: what does a user have to do to get a first run? Is there a "paste into your coding agent" path?

### Takeaway
Mo and TestSprite CLI both have explicit coding-agent-first onboarding (Mo has a literal paste-in prompt; TestSprite says you can paste its two setup commands into the agent). Both still require a human-created API key from a web dashboard (or browser login). Explorbot needs a model-provider key (e.g., OpenRouter) and local Node 24/Bun + Playwright. ScoutQA needs `npm i -g @scoutqa/cli` and `scoutqa auth login`, plus a skill install.

### Cited Findings
**Momentic Mo**
- Onboarding paths: "Try for free" at app.momentic.ai/mo, or CLI `npm install -g qa`, `qa login`, `qa start "..."`; requires Node.js 22.12+ or 24+ — [Momentic Mo page](https://momentic.ai/mo)
- Alternative standalone installer: `curl -fsSL https://cli.momentic.ai/qa | sh` — [Mo CLI docs](https://momentic.ai/docs/mo/cli.md)
- Paste-in prompt for the coding agent ("Help me set up Mo, Momentic's AI QA engineer, in this project.") with steps: install qa; authenticate using `MOMENTIC_API_KEY` or `~/.momentic/auth.json` ("ask me to run `qa login` or paste a key"); `qa skills -y` (installs mo-qa plus maintain, spec, triage skills); ask for target URL, credentials, "what counts as a bug"; for local targets run `qa tunnel start`; write the brief and kick off — [Mo quickstart](https://momentic.ai/docs/mo/quickstart.md)
- Docs state the agent "cannot complete the browser sign-in" itself; key must come from `MOMENTIC_API_KEY` or be created by the user at app.momentic.ai/settings/api-keys — [Momentic agentic testing docs](https://momentic.ai/docs/core-concepts/agentic-testing)
- After setup, the user types `/mo-qa bug bash the cart on https://staging.example.com/cart.` and the agent writes the brief, starts and follows the session, and exports the report — [Mo quickstart](https://momentic.ai/docs/mo/quickstart.md)
- Inputs: URL (or uploaded iOS/Android build), a brief covering expected behaviour, test accounts, data rules, scope, actions to avoid; credentials via env vars; knowledge base; GitHub App for repo/PR context — [Momentic Mo page](https://momentic.ai/mo); [Mo docs overview](https://momentic.ai/docs/mo.md)
- Localhost: "Mo runs in a hosted browser. Use a tunnel when the app you want to test is on your machine or a private network"; `qa tunnel start localhost:3000` then `qa start ... --tunnel <id>`; "Tunneling is in alpha. Behavior may change, and performance is not guaranteed." A Connector Docker image exists for private networks — [Mo tunneling docs](https://momentic.ai/docs/mo/tunneling.md)

**TestSprite**
- MCP install: create API key in the web portal (Settings → API Keys), then e.g. `claude mcp add TestSprite --env API_KEY=your_api_key -- npx @testsprite/testsprite-mcp@latest`; supports Trae, Cursor, Claude Code, Windsurf, VS Code, GitHub Copilot — [TestSprite MCP installation](https://docs.testsprite.com/mcp/getting-started/installation.md)
- Trigger prompt: "Help me test this project with TestSprite" — [TestSprite MCP Tools Reference](https://docs.testsprite.com/mcp/core/tools.md)
- CLI path: `npm install -g @testsprite/testsprite-cli` + `testsprite setup` (prompts for API key, stores in `~/.testsprite/credentials`, installs `testsprite-onboard` and `testsprite-verify` skills into e.g. `.claude/skills/`); "You can even delegate this step: paste the two commands above into your agent"; non-interactive `TESTSPRITE_API_KEY=$KEY testsprite setup --from-env --yes` — [TestSprite CLI Quickstart for Coding Agents](https://docs.testsprite.com/cli/getting-started/quickstart-for-agents.md)
- Skill targets: Claude Code is GA; Cursor, Cline, Antigravity, Kiro, Windsurf, Copilot, Codex are "experimental" — [TestSprite CLI What's Included](https://docs.testsprite.com/cli/reference/whats-included.md)
- Localhost: "The CLI tests reachable http(s):// deployments and rejects localhost. If your change only runs locally, the agent will hand off to the MCP Server (which owns the localhost tunnel)" — [TestSprite CLI Quickstart for Coding Agents](https://docs.testsprite.com/cli/getting-started/quickstart-for-agents.md)
- Login credentials for tested apps are entered in the TestSprite configuration portal (MCP) — [TestSprite MCP Tools Reference](https://docs.testsprite.com/mcp/core/tools.md)
- Vendor time claims: MCP install 1–2 minutes; "Most tests complete within 10-20 minutes" — [TestSprite FAQ](https://docs.testsprite.com/learn/faq.md)

**Explorbot**
- Requires Node.js 24+ or Bun and an AI provider key (OpenRouter recommended); `npm i explorbot --save`, `npx playwright install`, `npx explorbot init`, `npx explorbot start /admin/users` — [Explorbot README](https://github.com/testomatio/explorbot/)
- Agent-friendly global setup: `npx explorbot init --global --provider openrouter --api-key sk-...` then `npx explorbot explore https://app.example.com/login --max-tests 3`; "with --provider there is no wizard, so an agent can run it unattended"; config-free one-liner via `EXPLORBOT_URL` + `EXPLORBOT_AI_PROVIDER` — [Explorbot agentic usage](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/agentic-usage.md)
- Credentials passed as "knowledge", e.g. `EXPLORBOT_KNOWLEDGE="Log in as admin@example.com / secret123..."` — [Explorbot agentic usage](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/agentic-usage.md)
- Runs locally (headless by default), on CI, or own infra — [Testomat.io blog: Meet Explorbot](https://testomat.io/blog/meet-automated-exploratory-testing/)

**ScoutQA (Katalon Scout)**
- CLI: `npm i -g @scoutqa/cli@latest`; skill: `gh skills install github/awesome-copilot scoutqa-test`; `scoutqa auth login` when auth expires; localhost and 127.0.0.1 supported "with no manual setup required" — [scoutqa-test skill](https://awesome-copilot.github.com/skill/scoutqa-test/)
- Web onboarding: "Drop a link", share staging credentials or pre-authenticated sessions, set persona intent/guardrails/risk appetite; "launch a first exploration in under ten minutes" — [Scout docs](https://docs.scoutqa.ai/)
- Product Hunt community note: Lovable/Replit apps can be tested by changing the URL to a scoutqa.app subdomain — [Katalon Community forum](https://forum.katalon.com/t/scout-is-live-on-product-hunt-today/183294) (as summarised in search results; not fetched)
- CLI launched Jan 5, 2026 alongside a Claude Code skill and Kiro Power; API key management in account settings added Mar 10, 2026 — [Scout changelog](https://docs.scoutqa.ai/changelog)

### Inferences
- Mo's paste-in prompt is essentially the SQA target's onboarding step 1, already shipped. SQA cannot differentiate on "paste a prompt" alone; it would need to beat Mo on friction (e.g., API key issuance without a dashboard detour) or on localhost (Mo tunnel is alpha; TestSprite CLI rejects localhost; ScoutQA claims zero-setup localhost).
- ScoutQA's "localhost with no manual setup" claim is notable but unexplained (no tunnel mechanism documented in the sources read).

### Gaps
- Could not confirm whether any product issues an API key fully from the CLI without a web dashboard step (Mo uses `qa login` browser flow; TestSprite needs portal-created key).
- ScoutQA localhost mechanism not documented in sources reviewed.

## Does it truly explore autonomously from a URL, or mostly generate/run test scripts from a plan?

### Takeaway
Mo and Explorbot genuinely explore from a URL + brief (Mo with a planner/explore/bug-bash/reproducer swarm; Explorbot with a multi-agent "crew"). TestSprite's Web Portal explores the live app (~3 min) before planning, but its MCP flow is code-analysis-driven (code summary → PRD → test plan → generated Playwright scripts), and its CLI creates tests from plan files with no exploration mode. ScoutQA does URL-driven autonomous exploration, but recently added test cases/suites/Playwright replay.

### Cited Findings
- Mo agents: Session agent (plans coverage, dispatches sub-agents, dedups cases/bugs), Explore agent (maps an area, records cases, reports suspected bugs but does not confirm them), Bug bash agent (works one case, submits verdict), Bug reproducer agent (retries one suspected bug from clean start in a separate browser) — [Mo docs overview](https://momentic.ai/docs/mo.md)
- Mo: "Mo tests your app from a prompt"; "plans test cases and runs them in parallel, up to your plan limit"; "A hundred or more on a single bug bash"; homepage stat "116 agents exploring at once" — [Momentic Mo page](https://momentic.ai/mo)
- Mo launch: "No script to write. No test suite to maintain."; Mo "launches hundreds of agents" exploring "thousands of permutations and edge cases" — [Momentic blog: Mo launch](https://momentic.ai/blog/mo-launch)
- Mo limitation: flows needing OS-level dialogs (print dialogs, `mailto:` links) can block verification — [Mo docs overview](https://momentic.ai/docs/mo.md)
- Third-party critique (biased competitor): Mo sessions may choose different cases on later runs, so results may not be repeatable — [TestMu AI: Momentic Mo Alternative](https://www.testmuai.com/momentic-mo-alternative/)
- TestSprite Web Portal: "Before writing any UI tests, TestSprite's testing agent visits your live app and explores it feature by feature"; typically ~3 minutes; features explored in parallel; exploration then grounds the test plan — [TestSprite Feature Exploration](https://docs.testsprite.com/web-portal/core/ui/feature-exploration.md)
- TestSprite MCP: `testsprite_bootstrap` (localPort, type, projectPath, testScope "codebase"|"diff") → `testsprite_generate_code_summary` (writes `code_summary.json`) → `testsprite_generate_standardized_prd` → `testsprite_generate_frontend_test_plan` → `testsprite_generate_code_and_execute`; no exploration tool is listed among the 8 MCP tools — [TestSprite MCP Tools Reference](https://docs.testsprite.com/mcp/core/tools.md)
- TestSprite CLI: tests are created from a plan file (`--plan-from`) written by you, your coding agent, or TestSprite; the overview describes no exploration mode; `testsprite-onboard` skill "reads your codebase first ... instead of blindly crawling" and authors ~8–15 tests — [TestSprite CLI overview](https://docs.testsprite.com/cli/getting-started/overview); [TestSprite CLI Quickstart for Coding Agents](https://docs.testsprite.com/cli/getting-started/quickstart-for-agents.md)
- Explorbot: "Give it a URL and it works out what to test"; Researcher, Planner, Tester, Pilot, Captain, Navigator, Analyst, Historian, Fisherman agents; "Cheap, fast workers do the clicking and reading; smart managers make the calls"; "When tuned, Explorbot runs autonomously for hours" — [Explorbot README](https://github.com/testomatio/explorbot/)
- Explorbot also tries negative inputs: it "will try SQL and JS injection in your inputs" — [Testomat.io blog: Meet Explorbot](https://testomat.io/blog/meet-automated-exploratory-testing/)
- Explorbot can alternatively execute agent-written markdown test plans (`npx explorbot test checkout-plan.md '*'`); "the agent decides what to test ... Explorbot figures out how to click through the app" — [Explorbot agentic usage](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/agentic-usage.md)
- ScoutQA: "Give Scout a URL ... and it returns focused feedback instead of noise"; explores "like newcomers, power users, and bad actors" — [Scout docs](https://docs.scoutqa.ai/); v0.12.0 (Jun 15, 2026) added test cases, suites, a parallel Test Runner and Playwright replay — [Scout changelog](https://docs.scoutqa.ai/changelog)
- ScoutQA open-source repo architecture: Test Lead Agent plans scenarios, Manual Tester Agent executes steps and "Retries failures once" — [scoutqa GitHub](https://github.com/scoutqa-dot-ai/scoutqa)

### Inferences
- The "TestSprite local projects skip exploration" caveat is consistent with the docs: the MCP (the only path that handles localhost) runs a code-derived plan pipeline with no exploration tool, while live-site exploration is documented only for Web Portal UI projects. I could not find an explicit doc sentence saying exploration is skipped for local projects.
- TestSprite finds bugs as a side-effect of failing generated tests against a PRD; that is closer to "spec-based test generation" than open-ended exploratory bug hunting.

### Gaps
- No explicit TestSprite statement found that local/MCP projects skip live exploration (searched docs and web; [web search](https://dev.to/sabo_yanhdjo/testsprite-hands-on-dev-review-autonomous-ai-testing-in-a-real-project-and-what-happens-when-2egh) surfaced only general cloud/tunnel constraints).
- Whether the hosted ScoutQA product uses the same architecture as the public GitHub repo (0 stars) is unverified.

## How does each product see and act (DOM/a11y tree, Playwright, screenshots/vision) and which models?

### Takeaway
Explorbot is the most transparent: ARIA snapshot primary, HTML secondary, screenshot fallback, with a multi-model setup (cheap gpt-oss for page reading, a vision model, Claude Haiku as agentic planner, and an optional "Jev" decision model). Mo and TestSprite run cloud-hosted Chromium/Playwright but do not disclose models. ScoutQA's public repo uses Claude Sonnet 4.5/Haiku 4.5 plus Amazon Nova Act on AWS Bedrock AgentCore Browser.

### Cited Findings
- Mo: web runs in "hosted browsers"; iOS on Momentic-hosted simulator; Android on hosted emulator; each sub-agent gets its own browser/device — [Momentic Mo page](https://momentic.ai/mo); hosted Chromium — [Mo docs overview](https://momentic.ai/docs/mo.md); models not named on Mo page or About page — [Momentic About](https://momentic.ai/about)
- Mo bills "inference the agents use, which Momentic bills at cost" — [Mo sessions docs](https://momentic.ai/docs/mo/sessions.md)
- TestSprite generated code is Python + Playwright (sample uses `playwright.async_api`, headless Chromium, XPath locators like `xpath=html/body/div/header/div/a[3]`) — [TestSprite MCP Demo](https://docs.testsprite.com/learn/mcp-demo.md)
- TestSprite UI execution artifacts: video recordings, step-by-step screenshots, console output; Step-by-Step Replay has per-action HTML snapshots and full video — [TestSprite Testing Lifecycle](https://docs.testsprite.com/web-portal/concepts/testing-lifecycle.md); [TestSprite docs index](https://docs.testsprite.com/llms.txt)
- TestSprite Enterprise offers "Customized AI model"; models otherwise undisclosed — [TestSprite pricing](https://www.testsprite.com/pricing); FAQ only says "Advanced machine learning models" — [TestSprite FAQ](https://docs.testsprite.com/learn/faq.md)
- Explorbot perception: "ARIA snapshot | Roles, labels, states, hierarchy"; "HTML | Classes, IDs, data attributes"; "Screenshot | Layout, colors, icons, coordinates"; "The accessibility tree is the primary source. HTML adds detail. The screenshot is a fallback" — [Explorbot page interaction doc](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/web-testing/page-interaction.md)
- Explorbot model roles: `model` for token-heavy ARIA/HTML reading (cheap & fast), `visionModel` for screenshots, `agenticModel` as advisor/planner, optional `decisionModel`. OpenRouter recommended config: `openai/gpt-oss-20b:nitro`, vision `openai/gpt-5.6-luna`, agentic `anthropic/claude-haiku-5.5`, decision `typesafe/jev-latest` — [Explorbot providers doc](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/basics/providers.md)
- Explorbot: "Anthropic is recommended only for agenticModel, since Claude models are accurate but costly for token-heavy page reading"; supported providers openai, anthropic, google, groq, mistral, openrouter, sambanova; `EXPLORBOT_DECISION_MODEL` e.g. `openrouter/typesafe/jev-1.13` — [Explorbot agentic usage](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/agentic-usage.md)
- Explorbot built on React Ink, CodeceptJS and Playwright — [npm registry: explorbot](https://registry.npmjs.org/explorbot)
- ScoutQA repo: Test Lead Agent default Claude Sonnet 4.5; Manual Tester Agent default Claude Haiku 4.5; browser control via Playwright MCP and Nova Act CLI; browsers on AWS Bedrock AgentCore Browser (default) or Browserbase; Langfuse observability — [scoutqa GitHub](https://github.com/scoutqa-dot-ai/scoutqa)
- ScoutQA changelog mentions Chrome DevTools MCP v0.9.0 (Oct 28, 2025) and Playwright MCP fixes — [Scout changelog](https://docs.scoutqa.ai/changelog); Katalon says Scout is built on AWS agentic AI technologies — [Katalon launch blog](https://katalon.com/resources-center/blog/katalon-officially-launches-katalon-scout-the-ai-quality-companion-for-the-vibe-coding-era) (as summarised in search results)

### Inferences
- Explorbot's split-model design (cheap reader + stronger planner + tiny decision model) is the main reason it claims ~$1/hour, and is a useful cost template for a 1-hour SQA run.

### Gaps
- Momentic and TestSprite model choices are undisclosed. Whether Momentic uses its own or third-party models is unknown.

## Output: format of findings, evidence, severity, dedup, false-positive filtering (with sample output)

### Takeaway
Mo has the most rigorous, machine-readable bug output: a `qa report` directory (`report.json` manifest + `bugs.json`, `testCases.json`, `verdicts.json`, `triage.json` + recordings), each bug with expected/actual/reproSteps/recording, deduped, and only filed after an independent reproducer confirms it. Explorbot's Analyst writes a root-cause-clustered markdown report with `[High]/[Medium]/[Low]` severity, repro steps and evidence, plus optional per-test video. TestSprite outputs per-test verdicts with severity and suggested fix (Markdown/HTML/PDF + JSON), and CLI failure bundles. ScoutQA gives issues with severity (critical–low), category, impact and location, screenshots in a web report, and Markdown download.

### Cited Findings
**Momentic Mo**
- Report fields per bug: `kind` (bug | flag), `name`, `summary`, `expected`, `actual`, `reproSteps`, `recording` (metadata incl. start/end times), `screenshot` (static findings); "Functional bugs reach the report after a separate agent reproduces them"; the reproducer's conversation is recorded — [Mo session reports](https://momentic.ai/docs/mo/reports.md)
- Verdicts per case: Verified / Issues found / Blocked, with summary, verified parts, gaps; controls marked checked/failed/partial/out of scope; Mo "merges or removes duplicate entries as agents submit results" — [Mo session reports](https://momentic.ai/docs/mo/reports.md)
- Export: `qa report <session-id> --require-idle --output mo-report` writes `report.json` (manifest), `bugs.json`, `testCases.json`, `verdicts.json`, `triage.json`, plus downloaded recordings in `artifacts` as `{ bugName, path }` or `{ bugName, error }`; export "does not download screenshots for static findings" — [Mo session reports](https://momentic.ai/docs/mo/reports.md)
- Reproducer: starts from clean browser/device, follows auth/setup, equivalent test data; a functional bug it cannot reproduce "is not filed as confirmed" — [Momentic Mo page](https://momentic.ai/mo)
- Launch post: each finding includes "a recording, reproduction steps, and Mo's reasoning" — [Momentic blog: Mo launch](https://momentic.ai/blog/mo-launch)
- Severity and console/network logs are not mentioned on the Mo page or report docs — [Momentic Mo page](https://momentic.ai/mo); [Mo session reports](https://momentic.ai/docs/mo/reports.md)

**TestSprite**
- MCP output files: `testsprite_tests/tmp/test_results.json`, `tmp/report_prompt.json` (for AI analysis), `TestSprite_MCP_Test_Report.md`, `.html` (and `.pdf` in demo), `standard_prd.json`, test plan JSON, and one Python file per test case (e.g., `TC001_Login_Success_with_Valid_Credentials.py`) — [TestSprite MCP Tools Reference](https://docs.testsprite.com/mcp/core/tools.md); [TestSprite MCP Demo](https://docs.testsprite.com/learn/mcp-demo.md)
- Public sample (e-commerce demo): per-test entries such as "TC009: Admin can add a new product — Severity: High | Error: Admin dashboard page became empty after form submission — Fix: Add error boundaries and validate backend response handling"; TC002 failed because invalid login "redirects to the Product Catalog page instead of showing an error message"; summary "73% of product requirements tested", "56% of tests passed"; 16 test cases generated — [TestSprite MCP Demo](https://docs.testsprite.com/learn/mcp-demo.md)
- CLI failure bundle: failing step with neighbours, DOM snapshots as text, test source, root-cause hypothesis, recommended fix target; JSON output contract with exit codes 0/1; JUnit export — [TestSprite CLI overview](https://docs.testsprite.com/cli/getting-started/overview); [TestSprite CLI What's Included](https://docs.testsprite.com/cli/reference/whats-included.md)
- Web Portal: per-step screenshots, video of each run, severity-ranked failures, PDF download — [TestSprite docs overview](https://docs.testsprite.com/); Jira/Linear ticketing "with dedup so the same failure is never filed twice" — [TestSprite docs index](https://docs.testsprite.com/llms.txt)
- `testsprite test flaky` replays a test with auto-heal off and reports a stability score — [TestSprite CLI What's Included](https://docs.testsprite.com/cli/reference/whats-included.md)

**Explorbot**
- Analyst report: plain markdown — headline sentence, `## Coverage`, `## What works`, `## Defects` (each with `[High]`/`[Medium]`/`[Low]` severity tag, reproduce steps and one-line evidence), `## UX issues`, `## Execution Issues`; clusters by root cause ("three tests that fail on the same control become one defect with three test references"); separates product defects from automation problems — [Explorbot agents doc](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/web-testing/agents.md)
- Output tree: `reports/<mode>-<session>.md`, `plans/<page>.md`, `states/` (per-state HTML, ARIA snapshots, screenshots), `research/`; "The report is the artifact to parse ... written for a reader, not a machine"; exit code 0 whenever the session completes — [Explorbot agentic usage](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/agentic-usage.md)
- Optional screencasts (`historian: { screencast: true }`) — one video per test with action overlay; HTML and markdown reports; Testomat.io cloud reporter — [Explorbot reporting doc](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/reporting.md)

**ScoutQA**
- Issues with severity (critical, high, medium, low), category (accessibility, usability, functional), impact, location; status via `list-issues`; full interactive report with screenshots at `https://app.scoutqa.ai/t/<executionId>` — [scoutqa-test skill](https://awesome-copilot.github.com/skill/scoutqa-test/)
- "Structured insights with reproduction steps, screenshots, and suggested fixes" — [Scout docs](https://docs.scoutqa.ai/)
- Duplicate issue handling (Nov 20, 2025), Critical severity (Dec 26, 2025), Markdown report download and bug verification by re-running flows (Jan 27, 2026); no report-video feature listed — [Scout changelog](https://docs.scoutqa.ai/changelog)
- Product Hunt community description mentions "Traffic Light Reports with AI Fix Prompts" — [Katalon Community forum](https://forum.katalon.com/t/scout-is-live-on-product-hunt-today/183294) (from search summary; not fetched)

### Inferences
- Mo's `bugs.json` schema (expected/actual/reproSteps/recording + reproducer transcript) is effectively the SQA target's bug report format. SQA's evidence edge could be adding console/network logs and screenshots per step to each bug, and a confidence/severity ranking to surface "the top ~5".
- TestSprite "findings" are test failures against a generated PRD, so a failing test may reflect a wrong PRD assumption rather than a real bug (inference; sample shows 7+ failures out of 16 on a toy app).

### Gaps
- No public sample Mo `bugs.json` or Mo report screenshot was found.
- No public sample ScoutQA or Explorbot defect report contents (real bugs) found; only format descriptions.

## Coding-agent handoff: CLI commands, MCP tools, export formats, re-verify after fix

### Takeaway
All four can be driven by a coding agent, but Mo and TestSprite have the most complete fix-and-recheck loops. Mo: `/mo-qa bug bash` skill → `qa report` export → agent fixes → `qa send` asks Mo to rerun the original reproduction. TestSprite: `testsprite test failure get` / `artifact get` → fix → `testsprite test rerun`. ScoutQA: `scoutqa issue-verify --issue-id`. Explorbot: `npx explorbot rerun` of generated CodeceptJS tests; no MCP yet.

### Cited Findings
- Mo CLI commands: `qa start "<brief>"` (`--tunnel`, `--environment`, `--env-file`, `--env-var`, `--interaction-speed default|human`, `--max-concurrency`), `qa read <id> --from start|latest`, `qa status <id> --full`, `qa wait <id> --json` (exit 0 finished, 2 needs input, 4 stopped; no timeout flag), `qa send`, `qa stop --subagents`, `qa archive`, `qa report`, `qa cost`, `qa upload/download`, `qa tunnel start|stop|list`, `qa skills --target codex` — [Mo CLI docs](https://momentic.ai/docs/mo/cli.md)
- Mo has no `qa recheck`/`qa rerun` command; rechecks are done via `qa send`, then a new export: "After the fix deploys to the same target, `qa send` asks Mo to rerun the original reproduction, and a second export into a separate directory shows the new verdicts" — [Mo CLI docs](https://momentic.ai/docs/mo/cli.md); [Mo session reports](https://momentic.ai/docs/mo/reports.md)
- Mo report handoff: "hand `mo-report/` to Claude Code, Codex, Devin, or Cursor" — [Mo session reports](https://momentic.ai/docs/mo/reports.md); `/mo-qa bug bash <scope>` skill "can fix and recheck the bugs it finds"; PR sessions via `qa start --pr <n> --url <deployment>` — [Mo quickstart](https://momentic.ai/docs/mo/quickstart.md); [Mo coding agents integration](https://momentic.ai/docs/mo/integrations/coding-agents.md)
- Mo also: covered flows can become YAML tests via the Momentic MCP server; GitHub App PR comments/status checks; Jira/Linear for accepted bugs; TestRail/Qase/Testiny — [Momentic Mo page](https://momentic.ai/mo); [Momentic blog: Mo launch](https://momentic.ai/blog/mo-launch)
- TestSprite MCP tools (8): `testsprite_bootstrap`, `testsprite_generate_code_summary`, `testsprite_generate_standardized_prd`, `testsprite_generate_frontend_test_plan`, `testsprite_generate_backend_test_plan`, `testsprite_generate_code_and_execute` (with `testIds`, `additionalInstruction`), `testsprite_open_test_result_dashboard`, `testsprite_check_account_info`; workflow ends "IDE Fixes Issues → Rerun the tests and check the fixes" — [TestSprite MCP Tools Reference](https://docs.testsprite.com/mcp/core/tools.md)
- TestSprite CLI loop: `testsprite test create --plan-from ... --run --wait --output json` → `testsprite test artifact get <run> --out ./.testsprite/failure` → fix → `testsprite test rerun <test> --wait`; reruns billed like fresh runs; `testsprite-verify` skill makes the agent verify every change before saying "done" and report "shipped but unverified because X" when it can't — [TestSprite CLI Quickstart for Coding Agents](https://docs.testsprite.com/cli/getting-started/quickstart-for-agents.md)
- ScoutQA: agent starts `scoutqa --url ... --prompt ...` in background (Bash timeout 5000 ms) to capture execution ID and live URL; `send-message` for credentials/next flows; `issue-verify` creates a verification execution; "Fix with Agent" sends bug context to Cursor, Codex, Windsurf (Mar 10, 2026) — [scoutqa-test skill](https://awesome-copilot.github.com/skill/scoutqa-test/); [Scout changelog](https://docs.scoutqa.ai/changelog)
- Explorbot: coding agents drive it as a terminal command; `help-json` prints full command tree as JSON; `npx explorbot context /login` makes no AI calls; `npx explorbot rerun output/tests/dashboard.js --session` reruns generated tests with AI healing; MCP "Not yet" — [Explorbot agentic usage](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/agentic-usage.md); [Explorbot rerun doc](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/web-testing/rerun.md); [Explorbot README](https://github.com/testomatio/explorbot/)

### Inferences
- None of the four uses MCP as the primary bug-hunt interface; the converged pattern is CLI + agent skill file (Mo `mo-qa`, TestSprite `testsprite-verify`/`testsprite-onboard`, ScoutQA `scoutqa-test`). SQA's "CLI/MCP" plan should probably lead with CLI + skill and treat MCP as secondary.
- Mo's recheck is conversational (`qa send`), not a first-class deterministic `recheck <bug-id>` command; ScoutQA's `issue-verify --issue-id` is closer to a per-bug re-verify primitive.

### Gaps
- Exact JSON shape of `scoutqa get-execution` output not documented in sources reviewed.

## Run time and typical number of findings

### Takeaway
None targets a ~1-hour single run with ~5 curated bugs. Mo bashes "typically run 10–30+ minutes" with swarms and can return many bugs (beta: ~3.2 verified bugs per bash on average; one customer "27 bugs in an afternoon"). TestSprite: exploration ~3 min, first results 10–20 min. Explorbot: designed to run for hours at ~30–50 tests/hour. ScoutQA: "findings appear in your workspace within minutes"; no counts published.

### Cited Findings
- Mo: "A bash is a hosted session that typically runs 10-30+ minutes" — [Mo quickstart](https://momentic.ai/docs/mo/quickstart.md); "bugs can appear within minutes"; concurrency "changes how long the pass takes, not how many cases run" — [Mo sessions docs](https://momentic.ai/docs/mo/sessions.md)
- Mo beta totals: "1,100+ bug bashes" and 3,500 verified bugs — [Momentic blog: Mo launch](https://momentic.ai/blog/mo-launch); homepage stat "117,010 bugs caught before deploy"; customer "27 bugs in an afternoon" — [Momentic Mo page](https://momentic.ai/mo)
- Mo vendor benchmark claim: 3.8x more bugs than Codex with Playwright MCP in its own evals — reported via Momentic's X account per search summary ([Momentic on X](https://x.com/momenticai?lang=en-GB)); not fetched or verified; SiliconANGLE coverage does not mention it — [SiliconANGLE](https://siliconangle.com/2026/09/28/momentic-debuts-mo-ai-agent-to-automate-software-testing-without-scripts/)
- TestSprite: exploration "typically takes about 3 minutes for an average app" — [TestSprite Feature Exploration](https://docs.testsprite.com/web-portal/core/ui/feature-exploration.md); "Most tests complete within 10-20 minutes" — [TestSprite FAQ](https://docs.testsprite.com/learn/faq.md); onboarding skill authors ~8–15 tests and smoke-runs ~3 — [TestSprite CLI Quickstart for Coding Agents](https://docs.testsprite.com/cli/getting-started/quickstart-for-agents.md)
- Explorbot: "30 to 50 meaningful tests per hour"; "2-hour continuous sessions in 4 parallel threads" — [Testomat.io blog: Meet Explorbot](https://testomat.io/blog/meet-automated-exploratory-testing/); `EXPLORBOT_MAX_DURATION` sets wall-clock budget in minutes — [Explorbot agentic usage](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/agentic-usage.md)
- ScoutQA: "Findings appear in your workspace within minutes" — [Scout docs](https://docs.scoutqa.ai/); Quick/Deep mode selector (Feb 6, 2026) — [Scout changelog](https://docs.scoutqa.ai/changelog); an HN user who tried it said it "didn't find any major problems" — [Show HN: Scout QA](https://news.ycombinator.com/item?id=45887738)
- AWS case study: developers have identified 11,000+ issues with Scout (vendor-reported) — [AWS case study: Katalon](https://aws.amazon.com/solutions/case-studies/katalon/) (from search summary; not fetched)

### Inferences
- 3,500 verified bugs / 1,100 bashes ≈ 3 verified bugs per Mo bash on average (derived; beta population, likely skewed).
- Explorbot is the only product explicitly designed for multi-hour runs, which is closest to SQA's "~1 hour" shape.

### Gaps
- No published distribution of findings per run or false-positive rate for any product.

## Pricing and limits (as of Oct 2026), free tier, licensing

### Takeaway
Mo: $250 free Mo credits on sign-up, then usage-based (agent runtime + hosted browser minutes + inference at cost) on Momentic credit plans (Free 2,000 credits/mo; PAYG $125/mo for 10,000 credits). TestSprite: Free 150 credits, Starter $19, Standard $39, Pro $69, Enterprise $199+/mo (10 seats); MCP package BUSL-1.1. Explorbot: free, Elastic License 2.0, BYO model costs (~$1/hour). ScoutQA: homepage says "Scout is free"; changelog references "Vibe" and "Ship" plans with 5/10 concurrent cases; prices not found.

### Cited Findings
- Mo: new sign-ups get "$250 in Mo credits on us"; sessions bill active agent runtime, hosted runtime and inference against a separate Mo balance — [Momentic Mo page](https://momentic.ai/mo); a session "bills the active runtime of its agents, not the wall time"; inference billed at cost — [Mo sessions docs](https://momentic.ai/docs/mo/sessions.md)
- Momentic plans: Free $0 (2,000 credits/mo, ~200 runs, 5 concurrent browsers, 30-day retention, no overage); Pay-as-you-go $125/mo + usage (10,000 credits/mo, overage $0.01875/credit, 25 concurrent browsers); Enterprise custom. Rates: hosted browser 1 credit/min; AI step 2 credits; Android emulator 8 credits/min; iOS simulator 15 credits/min — [Momentic pricing](https://momentic.ai/pricing)
- Mo concurrency is "up to your plan limit" — [Momentic Mo page](https://momentic.ai/mo)
- `qa` npm package has no license field — [npm registry: qa](https://registry.npmjs.org/qa)
- TestSprite plans: Free $0 (150 credits, 1 environment, 30-day history), Starter $0 first month then $19/mo (400 credits), Standard $39/mo (800), Pro $69/mo (1,600), Enterprise $199+/mo min 10 seats (5,000+ credits); yearly saves 35%; credit consumption per action not published — [TestSprite pricing](https://www.testsprite.com/pricing)
- Conflict: competitor Bug0 lists Standard at $69/mo with 1,600 credits (older/mislabelled tier) — [Bug0 TestSprite pricing](https://bug0.com/knowledge-base/testsprite-pricing); reviewers note credit costs are hard to budget — [agent-finder review](https://agent-finder.co/reviews/testsprite) (from search summary)
- TestSprite reruns are "billed the same as fresh runs" — [TestSprite CLI overview](https://docs.testsprite.com/cli/getting-started/overview)
- `@testsprite/testsprite-mcp` license BUSL-1.1, latest 0.0.47 — [npm registry: testsprite-mcp](https://registry.npmjs.org/@testsprite%2Ftestsprite-mcp)
- Explorbot license: Elastic License 2.0 — commercial use free but it may not be offered as a hosted/managed service; cost "~$1/hour of continuous run" with fast open models — [Explorbot README](https://github.com/testomatio/explorbot/); npm license "Elastic-2.0" — [npm registry: explorbot](https://registry.npmjs.org/explorbot); ~$110/month at five hours a day — [Testomat.io blog: Meet Explorbot](https://testomat.io/blog/meet-automated-exploratory-testing/)
- Testomat.io cloud reporter is "free with unlimited test runs" — [Explorbot reporting doc](https://raw.githubusercontent.com/testomatio/explorbot/main/docs/workflow/reporting.md)
- ScoutQA: "Scout is free"; waitlist for "something bigger" — [scoutqa.ai](https://scoutqa.ai/); plan names Vibe and Ship with 5 and 10 concurrent cases (Jun 15, 2026) — [Scout changelog](https://docs.scoutqa.ai/changelog); launched with a freemium model — [Show HN: Scout QA (Katalon)](https://news.ycombinator.com/item?id=45482519) (from search summary)
- `@scoutqa/cli` latest 0.10.4-alpha.1, last modified 2026-03-04, no license field — [npm registry: @scoutqa/cli](https://registry.npmjs.org/@scoutqa%2Fcli)

### Inferences
- Rough Mo cost illustration (derived, excludes inference): 100 agents × 20 min hosted browser = 2,000 credits ≈ $37.50 at overage rate; inference is extra and unpublished. A 1-hour, single-agent SQA run would cost far less in browser time, making a flat per-run price a plausible differentiator.
- ELv2 means a competitor (e.g., SQA) cannot host Explorbot as a service; it can only be used as inspiration or self-hosted by end users.

### Gaps
- Mo per-session typical cost and inference rates not published (`qa cost` exists but no sample).
- ScoutQA Vibe/Ship plan prices not found (scoutqa.ai/pricing returned 404).
- TestSprite credits-per-action table not published.

## Company stage, funding, team size, launch dates

### Takeaway
Momentic: SF, founded 2023, YC W24, $15M Series A (Nov 2025, Standard Capital); Mo launched Sep 28, 2026. TestSprite: Seattle, $6.7M seed (Oct 2025, Trilogy Equity Partners), ~$8.1M total. Explorbot: open-source project by Testomat.io (repo Jul 2025, npm since Apr 2026, v0.5.8 Oct 14, 2026). ScoutQA: Katalon product (Scout), launched Oct 2025; CLI Jan 2026; last changelog entry Jun 15, 2026.

### Cited Findings
- Momentic founded 2023, YC W24, HQ San Francisco; co-founders Wei-Wei Wu (CEO) and Jeff An (CTO); customers include Notion, Xero, Webflow, Whatnot, Retool, Quora — [Momentic About](https://momentic.ai/about)
- Momentic $15M Series A led by Standard Capital, with Dropbox Ventures, YC, FCVC and others; seed March 2025; ~2,600 users reported — [SaaS News](https://www.thesaasnews.com/news/momentic-raises-15-million-series-a); [Signalbase](https://www.trysignalbase.com/news/funding/momentic-secures-15m-series-a-to-advance-ai-testing-platform) (from search summary)
- Mo launched Sep 28, 2026; beta users Notion, Superpower, Iris, Committee for Children, Boundless; CEO quote "Our bet is that there's no tests in the future." — [SiliconANGLE](https://siliconangle.com/2026/09/28/momentic-debuts-mo-ai-agent-to-automate-software-testing-without-scripts/); launch post by Wei-Wei Wu; beta included Notion, Glide, Superpower — [Momentic blog: Mo launch](https://momentic.ai/blog/mo-launch)
- Mo followed a June 2026 platform update adding an Explore agent and Failure Classification agent — [Beri overview](https://www.beri.net/tools/momentic) (from search summary)
- `qa` CLI latest 0.23.0, modified 2026-10-14 (49 versions) — [npm registry: qa](https://registry.npmjs.org/qa)
- TestSprite $6.7M seed announced late Oct 2025 led by Trilogy Equity Partners (with Techstars, Jinqiu Capital, MiraclePlus, Hat-trick Capital, Baidu Ventures, EdgeCase), ~$8.1M total; Seattle; founders Yunhao Jiao (CEO) and Rui Li — [GeekWire](https://www.geekwire.com/2025/seattle-startup-testsprite-raises-6-7m-to-become-testing-backbone-for-ai-generated-code/); [TestSprite blog](https://www.testsprite.com/blog/building-the-testing-backbone-announcing-our-seed-round) (from search summary); secondary sources conflict on round size/dates ($7M, earlier $2M/$1.5M) — [StartupIntros](https://startupintros.com/news/2025-10-01-testsprite-seed-2)
- `@testsprite/testsprite-mcp` first published 2025-07-13, latest modified 2026-10-06 — [npm registry: testsprite-mcp](https://registry.npmjs.org/@testsprite%2Ftestsprite-mcp)
- Explorbot repo created 2025-07-19, last push 2026-10-14, 93 stars, 15 forks — GitHub API (`gh api repos/testomatio/explorbot`) / [Explorbot GitHub](https://github.com/testomatio/explorbot/); npm first published 2026-04-08, latest 0.5.8 on 2026-10-14 (65 versions) — [npm registry: explorbot](https://registry.npmjs.org/explorbot); blog author Michael Bodnarchuk, updated Aug 7, 2026 — [Testomat.io blog: Meet Explorbot](https://testomat.io/blog/meet-automated-exploratory-testing/)
- ScoutQA is Katalon, Inc. (copyright on scoutqa.ai) — [scoutqa.ai](https://scoutqa.ai/); Katalon officially launched Katalon Scout on Oct 20, 2025, "AI quality companion for the vibe coding era" — [Katalon launch blog](https://katalon.com/resources-center/blog/katalon-officially-launches-katalon-scout-the-ai-quality-companion-for-the-vibe-coding-era) (from search summary); initial release v0.1 Oct 7, 2025; latest changelog v0.12.0 Jun 15, 2026 — [Scout changelog](https://docs.scoutqa.ai/changelog)
- Public `scoutqa-dot-ai/scoutqa` repo: 0 stars, 3 forks — [scoutqa GitHub](https://github.com/scoutqa-dot-ai/scoutqa); `@scoutqa/cli` 316 downloads last month — [npm downloads API](https://api.npmjs.org/downloads/point/last-month/@scoutqa/cli)

### Inferences
- Momentic is the best-funded, most active direct competitor and just launched (Sep 2026) exactly in SQA's lane; expect rapid iteration (49 `qa` versions, recent tunnel/skills work).
- ScoutQA appears to have slowed (no changelog entries after Jun 2026; CLI last published Mar 2026) despite Katalon's backing.

### Gaps
- Team sizes for Momentic, TestSprite, Testomat.io, and the Katalon Scout team not found.
- Testomat.io funding not researched/found.
- Momentic seed amount not verified.
