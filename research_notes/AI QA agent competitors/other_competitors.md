# AI QA / Testing Competitors vs. the SQA Target Experience

Target experience being compared against: a developer pastes one prompt into a coding agent (Claude Code, Codex, Cursor), gets an API key, the agent drives a CLI/MCP that explores the live web app for about an hour, and returns ~5 high-quality, reproducible bug reports (screenshots, video, repro steps) that the coding agent can fix and re-verify.

Research date: 2026-10-16. Desk research only (no sign-ups, no product runs). Most claims come from vendor pages; third-party aggregator figures are flagged.

## Core job: exploratory bug finding vs. regression tests vs. visual diffing vs. managed QA vs. usability personas

### Takeaway
Almost every player has converged on "AI agents in a real browser," but most still sell a **regression-test suite** (generate, run, self-heal tests in CI/PRs). Only a few lead with **open-ended exploratory bug finding**: AutoExplore, Ghostship, Propolis (acquired by Datadog), QA.tech's "exploratory pass," Spur's Exploratory agent, and desplega's `explore` skill. Swarm is a usability-persona tool that incidentally surfaces functional bugs.

### Cited Findings
- **Swarm (useswarm.co)** — usability personas. "Sends AI personas through your product like real users to surface friction, drop-offs, and usability issues." Personas have name, device, goal and temperament. Example findings include functional defects (promo code rejected with no error, disabled payment button) — [Swarm](https://www.useswarm.co/)
- **QA.tech** — autonomous agents for E2E, regression, exploratory and PR testing; "every pull request gets a full exploratory pass"; maps the app and verifies affected journeys — [QA.tech](https://qa.tech)
- **desplega.ai / Argus** — "vibe testing platform" that generates, maintains and runs E2E tests; Argus is an "agentic QA teammate" built on qa-use, with on-demand QA environments mirroring localhost and an "in-depth discovery pass on every pull request" — [desplega.ai](https://desplega.ai). qa-use is an "Agent-first E2E testing CLI" with skills `verify`, `verify-pr`, `explore`, `record`, `test-run`, `test-validate` — [GitHub qa-use](https://github.com/desplega-ai/qa-use)
- **Shiplight** — AI-native E2E testing; intent-based YAML tests in your repo, self-healing, built on Playwright; browser MCP for coding agents to verify their own UI changes — [Shiplight llms.txt](https://www.shiplight.ai/llms.txt), [Shiplight coding agents](https://www.shiplight.ai/coding-agents)
- **QA Wolf** — regression test coverage (open-source Playwright/Appium); self-serve pay-per-run plus managed "Coverage-as-a-Service" with 80%+ coverage guarantee — [QA Wolf pricing](https://www.qawolf.com/pricing)
- **Bug0** — managed AI QA: a forward-deployed engineer builds E2E tests on Bug0's AI platform; up to 500 user flows — [Bug0](https://bug0.com), [Bug0 pricing](https://bug0.com/pricing)
- **AutoExplore** — autonomous exploratory testing, "navigates your web app like a real user to find errors, security vulnerabilities, and accessibility issues," no scripts — [AutoExplore](https://www.autoexplore.ai). A Ministry of Testing reviewer said coverage resembled older "test monkey" approaches — [MoT feedback thread](https://club.ministryoftesting.com/t/feedback-for-autoexplore-autonomous-software-testing-tool/84916)
- **Testers.ai / CARBON** — "AI Agentic Verification Harness" for coding agents; `/carbon` runs evaluate → create tests → execute → collect evidence → analyze confidence; specialized AI "testers" (security, accessibility, performance, privacy) — [CARBON](https://testers.ai/carbon-landing.html). Parent platform pitches catching AI-generated-code issues (hallucinated APIs, silent error handling) — [testers.ai how](https://testers.ai/how.html)
- **Octomind** — was AI agents that discover, generate, run and auto-fix Playwright tests; **announced shutdown April 2026**, product terminated end of May 2026 (secondary source; farewell letter not checked directly) — [rywalker research](https://rywalker.com/research/octomind). octomind.dev domain did not resolve when fetched on 2026-10-16.
- **Checksum** — generates and maintains Playwright E2E and API tests; "Your coding agent needs a testing buddy"; heals failures via PRs (~70% resolved without humans) — [Checksum](https://checksum.ai)
- **Meticulous** — visual regression from recorded sessions; recorder script captures interactions, replays with stored backend responses, shows PR impact — [Meticulous](https://www.meticulous.ai)
- **Reflect (SmartBear)** — agentic test automation for web/mobile from plain-English steps; March 2026 added MCP-based test generation from coding environments — [SmartBear news](https://smartbear.com/news/news-releases/ai-enhancements-across-entire-testing-lifecycle), [SmartBear blog](https://smartbear.com/blog/agentic-test-creation-with-reflect)
- **Rainforest QA** — AI test planner + self-healing tests; sales-led — [Rainforest pricing](https://www.rainforestqa.com/pricing)
- **Autonoma** — agentic E2E platform; Planner CLI reads repo and generates suites; vision agent runs tests on PR preview deploys — [GitHub autonoma](https://github.com/autonoma-ai/autonoma)
- **Spur (YC S24)** — five agents: Exploratory, Localization, UI/UX, Functional, AI Feature testing; heavily e-commerce — [Spur](https://www.spurtest.com)
- **Propolis (YC Spring 2025)** — "simulates real users via swarms of autonomous browser agents"; give URL + credentials, agents explore and map flows; **acquired by Datadog (news dated Jan 27, 2026)** — [YC Propolis](https://www.ycombinator.com/companies/propolis)
- **Ranger** — repositioned to "Verify work as fast as your agents can write it"; `ranger go` CLI spins up a browser, tests the new feature, returns a verdict — [Ranger](https://www.ranger.net). Earlier (Jan 2025) pitched as writing/running/maintaining Playwright QA tests with human QA review — [Ranger raise post](https://www.ranger.net/post/ranger-raises-8-9m-to-find-bugs-faster), [Ranger vs Spur](https://www.ranger.net/post/ranger-vs-spur-qa)
- **Carbonate** — no-code record-in-remote-browser → plain-English tests, self-healing; info only from directories — [G2](https://www.g2.com/products/carbonate/discuss), [Packagist SDK](https://packagist.org/packages/carbonate/sdk)
- **Tusk (YC W24)** — unit and API test generation from PRs and production traffic (not browser exploration) — [AWS startups](https://aws.amazon.com/aws-startups/learn/from-yc-to-aws-tusk-turns-production-traffic-into-ai-powered-tests-on-aws/)
- **Additional players found:**
  - **TestSprite** — reads code/PRD, explores the running app, writes and runs E2E tests after code changes; MCP for Cursor/Claude Code — [TestSprite](https://www.testsprite.com)
  - **Canary (YC W26)** — "first AI QA Engineer that understands your codebase"; reads routes/validation/API schemas, tests preview app end to end, comments on PRs — [YC Canary](https://www.ycombinator.com/companies/canary)
  - **Ghostship (YC S25, per link tags)** — "spins up AI agents to find bugs in your product" by crawling the UI and simulating users — [YC launch](https://www.ycombinator.com/launches/O8z-ghostship-qa-agents-to-find-bugs-in-your-product)
  - **Momentic (YC)** — plain-English tests, AI navigates flows; $15M Series A Nov 2025 — [TechCrunch](https://techcrunch.com/2025/11/24/momentic-raises-15m-to-automate-software-testing)
  - **Mockingbird** — paste a URL, AI personas browse, returns video replay + severity-sorted findings — [hunted.space](https://www.hunted.space/product/mockingbird-3)
  - **Versive Snap** — AI-persona usability tests on Figma, images, live sites — [Versive blog](https://getversive.com/blog/introducing-snap)
  - CB Insights notes 11 software dev/testing agent companies in YC Spring 2025, including Operative (browser agents to test coding agents) and Propolis — [CB Insights](https://www.cbinsights.com/research/y-combinator-spring25-agentic-ai)

### Inferences
- The "exploratory bug finding for an hour, return a handful of real bugs" job is under-served. Most vendors optimize for test-suite coverage and PR gating, where the deliverable is a passing/failing suite, not a curated short bug list.
- Propolis was the closest conceptual match (URL + creds → swarm explores → bug reports with video/traces/repro). Its acquisition by Datadog removes it as an independent self-serve option but signals strategic interest from observability incumbents.
- Octomind's shutdown suggests the plain "AI-generated Playwright tests" niche is crowded and hard to monetize.

### Gaps
- No primary-source confirmation of Octomind's farewell letter; dates are from a secondary research page.
- Could not reach getautonoma.com (404s); Autonoma details come from its GitHub README only.
- Carbonate's current status and official site content not verified (only directory listings).
- Did not find a distinct product called "Argus" on desplega.ai beyond the homepage mention; several unrelated "Argus" QA tools exist (argus-qa.com MCP, argustest.com) — [mcpservers.org](https://mcpservers.org/de/servers/ironclawdevs27/argus), [Product Hunt](https://www.producthunt.com/p/argus-9/argus-11).

## Onboarding friction: self-serve vs. sales-led, brief required, CLI/MCP, coding-agent setup path

### Takeaway
Self-serve + CLI/MCP + coding-agent install path exists today at **Shiplight, TestSprite, Swarm, desplega qa-use, QA Wolf (self-serve tier), Ranger, and CARBON**. QA.tech has an MCP but gates it behind Growth/Enterprise and a booked setup session. Bug0, Spur, Rainforest, Checksum, Meticulous, Canary, Ghostship are sales/demo-led.

### Cited Findings
- **Swarm** — web app, CLI, or MCP server inside Cursor, Claude Code, Codex; supports localhost; describe the flow in plain language; login via agent login or cookie injection; CI/CD on Startup tier and up — [Swarm](https://www.useswarm.co/)
- **QA.tech** — all plans show "Talk to us"; Starter has self-serve onboarding but **no MCP**; MCP on Growth/Enterprise with guided PoC — [QA.tech pricing](https://qa.tech/pricing.md). MCP has 16 tools (e.g., `start_run`, `create_test_case`, `create_remote_tunnel` to reach local dev server); access "rolled out hands-on: you book a session" — [QA.tech MCP](https://qa.tech/product/mcp.md). Free POC starts with 2–3 critical journeys — same pricing page.
- **desplega qa-use** — MIT CLI + MCP server (Claude Desktop, VS Code Copilot, Cursor) + Claude Code plugin + skills via `npx skills`; requires desplega API key via `QA_USE_API_KEY` — [GitHub qa-use](https://github.com/desplega-ai/qa-use). Free (€0) and Subscription tiers self-serve; Enterprise via sales — [desplega pricing](https://desplega.ai/pricing)
- **Shiplight** — self-serve install: `npx -y add-mcp "npx -y @shiplightai/mcp@latest"`; local use needs no account; hosted needs only app URL + test account; every customer also gets an onboarding session and shared Slack — [Shiplight llms.txt](https://www.shiplight.ai/llms.txt). Supports Claude Code, Cursor, Codex, Copilot — [Shiplight coding agents](https://www.shiplight.ai/coding-agents)
- **QA Wolf** — self-serve pay-as-you-go with free trial and "Start now" sign-up; MCP server at `https://app.qawolf.com/api/mcp` for Claude Code, Codex, Cursor — [QA Wolf pricing](https://www.qawolf.com/pricing)
- **Bug0** — managed only on current pricing page; ~10 min setup on GitHub Actions; no MCP/CLI mentioned — [Bug0 pricing](https://bug0.com/pricing), [Bug0](https://bug0.com). A search snippet referenced a self-serve "Studio" tier from $250/mo, but the fetched pricing page did not show it (conflict, unverified).
- **AutoExplore** — "connect to your web application and define testing boundaries," ~1 hour to start, 7-day guided trial; no CLI/MCP mentioned; has a Public API page — [AutoExplore](https://www.autoexplore.ai)
- **CARBON** — downloadable plugin for Claude, Codex, Cursor, Antigravity and MCP-compatible agents; local execution default; Cloud is optional add-on — [CARBON](https://testers.ai/carbon-landing.html). Search snippet says "private beta" (not confirmed on fetched page).
- **TestSprite** — "Agent chat, CLI, and IDE plugin (MCP)" on Free through Pro — [TestSprite pricing](https://www.testsprite.com/pricing)
- **Ranger** — CLI install script, `ranger go`; Free tier "self-serve install" — [Ranger](https://www.ranger.net), [Ranger pricing](https://www.ranger.net/pricing)
- **Spur** — 1–2 week pilot starting with a call; URL + test accounts; static IP whitelisting for bot-protected sites; "Spur MCP" link exists but page 404'd — [Spur](https://www.spurtest.com)
- **Reflect** — MCP via SmartBear MCP server (since March 2026) for test generation from coding env — [SmartBear news](https://smartbear.com/news/news-releases/ai-enhancements-across-entire-testing-lifecycle)
- **Autonoma** — Planner CLI via `npx` with API token; no MCP mentioned; self-hostable — [GitHub autonoma](https://github.com/autonoma-ai/autonoma)
- **Checksum / Meticulous / Rainforest** — no MCP/CLI-for-agents found; demo/sales-led; Meticulous installs via script tag/npm recorder + click-to-install CI — [Checksum](https://checksum.ai), [Meticulous](https://www.meticulous.ai), [Rainforest](https://www.rainforestqa.com/pricing)
- **Canary / Ghostship / Propolis** — founder email / book-a-call onboarding — [Canary](https://www.ycombinator.com/companies/canary), [Ghostship](https://www.ycombinator.com/launches/O8z-ghostship-qa-agents-to-find-bugs-in-your-product), [Propolis](https://www.ycombinator.com/companies/propolis)

### Inferences
- The "paste one prompt into your coding agent, get an API key" path is effectively what desplega qa-use (API key + skills incl. `explore`), Shiplight (`npx add-mcp`), TestSprite and Swarm already offer. SQA's onboarding is not a differentiator on its own; the differentiator must be the output quality and exploratory depth.
- No vendor found advertises a pure "one prompt pasted into the agent bootstraps everything" flow verbatim, though several are one command.

### Gaps
- Did not verify whether any vendor offers an agent-readable onboarding prompt (e.g., llms.txt-driven install). QA.tech and Shiplight publish llms.txt files.
- Ranger CLI supported agents not named on the page.

## How it sees/acts (DOM, Playwright, vision, models)

### Takeaway
Vision-first browser agents are the norm (QA.tech, Autonoma, Spur, Swarm real browsers); Playwright is the dominant execution substrate (Shiplight, QA Wolf, Bug0, qa-use, Checksum, Ranger). Canary is the outlier, reading source code instead of DOM/screens. Almost no vendor names its LLMs.

### Cited Findings
- QA.tech agents are vision-based, "test what users see rather than the underlying DOM"; models not named — [QA.tech MCP](https://qa.tech/product/mcp.md)
- Shiplight: YAML intent steps on Playwright; cached deterministic steps run without LLM; supports bring-your-own LLM keys; DOM vs. vision not specified — [Shiplight llms.txt](https://www.shiplight.ai/llms.txt)
- qa-use installs Playwright browsers; LLM usage not documented on README — [GitHub qa-use](https://github.com/desplega-ai/qa-use)
- Bug0 AI is an open-source Playwright library that resolves each step from intent — [Bug0](https://bug0.com)
- Autonoma: agent "looks at the screen, decides what to click," real browser — [GitHub autonoma](https://github.com/autonoma-ai/autonoma)
- Spur: isolated browser sessions with real screens; captures DOM, console, network — [Spur](https://www.spurtest.com)
- Swarm: real browser per persona, mobile devices; Enterprise adds iOS/Android — [Swarm](https://www.useswarm.co/)
- AutoExplore: "machine-learning algorithms" exploring via browser UI; models not named — [AutoExplore](https://www.autoexplore.ai)
- Canary avoids "flaky DOM scraping or screenshot analysis," uses codebase routes/schemas — [YC Canary](https://www.ycombinator.com/companies/canary)
- Ranger: tests generated with LLMs as Playwright tests; worked with OpenAI pre-o1 — [Ranger raise post](https://www.ranger.net/post/ranger-raises-8-9m-to-find-bugs-faster)
- Meticulous: recorder + deterministic replay of stored backend responses, not an LLM explorer — [Meticulous](https://www.meticulous.ai)
- TestSprite: real browser or live API, cloud-parallel; DOM snapshots in failure bundle — [TestSprite](https://www.testsprite.com)

### Inferences
- A hybrid "accessibility tree/DOM + screenshots" approach on Playwright is table stakes; model choice is not a visible differentiator in the market.

### Gaps
- No vendor disclosed which foundation models it uses (beyond Ranger's OpenAI research relationship).

## Output evidence: screenshots, video, logs, repro steps, false-positive handling

### Takeaway
Video + screenshots + logs + repro steps are common among the managed/PR-gating players (QA Wolf, Bug0, Spur, Propolis, Autonoma, TestSprite). Explicit false-positive handling is rarer: Bug0 and Checksum use human verification; Swarm and testers.ai use confidence labels; Autonoma separates real bugs from infra failures.

### Cited Findings
- Swarm: session replays with think-aloud transcript, step timeline, ranked findings with severity (High/Medium/Low) and confidence (Confirmed/Likely), suggested code fixes, push to Linear/Jira/GitHub, PDF reports — [Swarm](https://www.useswarm.co/). Comparisons advise treating findings as hypotheses to validate with real users — [runmeerkat comparison](https://runmeerkat.com/ai-usability-testing-tools)
- QA.tech: pass/fail, screenshots, agent reasoning, trace links, logs, network activity; video not mentioned; Jira/Linear export — [QA.tech MCP](https://qa.tech/product/mcp.md), [QA.tech](https://qa.tech)
- QA Wolf: verified pass/fail, video, traces, step-by-step repros; bug reports to Linear/Jira — [QA Wolf pricing](https://www.qawolf.com/pricing)
- Bug0: failure reports with video, network/console logs, repro steps; "every failure" human-verified — [Bug0](https://bug0.com), [Bug0 pricing](https://bug0.com/pricing)
- AutoExplore: reports with steps taken, network traffic, client scripts, screenshots, "reproducible issues"; video not stated — [AutoExplore](https://www.autoexplore.ai)
- testers.ai: per-issue confidence score, priority, reasoning for and against being a real bug, suggested fix, routing role — [testers.ai how](https://testers.ai/how.html). CARBON reports observed results separately from blocked/deferred/unmeasured areas — [CARBON](https://testers.ai/carbon-landing.html)
- Shiplight: execution traces and screenshots on failure; distinguishes app bug from test drift — [Shiplight coding agents](https://www.shiplight.ai/coding-agents)
- Autonoma: separates real bugs from infra problems; bug reports with expected vs. actual, screenshot, video, suspected code — [GitHub autonoma](https://github.com/autonoma-ai/autonoma)
- Spur: video, screenshots, DOM, console/network logs, step-level evidence; "Bug Book" — [Spur](https://www.spurtest.com)
- Propolis: bug reports to Slack/Linear/GitHub with videos, traces, repro steps — [YC Propolis](https://www.ycombinator.com/companies/propolis)
- TestSprite: video replays; failure bundle with failing step, screenshots, DOM snapshots, root-cause hypothesis, suggested fix — [TestSprite](https://www.testsprite.com)
- Ranger: screenshots, video, traces; shareable review record attached to PR — [Ranger](https://www.ranger.net)
- Checksum: human engineers verify final tests — [Checksum](https://checksum.ai)
- Rainforest: videos, logs, human-readable results — [Rainforest](https://www.rainforestqa.com/pricing)
- qa-use: screenshots via browser command; video/repro not mentioned — [GitHub qa-use](https://github.com/desplega-ai/qa-use)

### Inferences
- Evidence richness alone is not a moat; the SQA edge would have to be **precision** (few, real, high-severity bugs) and **repro reliability**, which few vendors quantify publicly.

### Gaps
- No vendor publishes false-positive rates or bug-acceptance rates.

## Coding-agent handoff and re-verification

### Takeaway
Explicit "find → hand to coding agent → fix → re-verify" loops are marketed by **Ranger, Shiplight, TestSprite, CARBON, qa-use (`verify`/`verify-pr`)**, and partially QA.tech (run targeted tests after edits). These are mostly verification of the agent's *own change*, not open-ended exploration of the whole app.

### Cited Findings
- Ranger: "When Ranger finds a bug, the agent fixes it and re-tests without a human in the loop" — [Ranger](https://www.ranger.net)
- Shiplight: hands failure diagnosis back to agent to fix code or update test; `/shiplight verify`, `create-yaml-tests`, `review` — [Shiplight llms.txt](https://www.shiplight.ai/llms.txt), [Shiplight coding agents](https://www.shiplight.ai/coding-agents)
- TestSprite: suggested fix per failure, tests rerun on every change, PR checks — [TestSprite](https://www.testsprite.com)
- QA.tech MCP: run only tests touching an edited file, validate preview deploys, pull failure analysis into editor — [QA.tech MCP](https://qa.tech/product/mcp.md)
- qa-use skills `verify`, `verify-pr`, `explore` for Claude Code — [GitHub qa-use](https://github.com/desplega-ai/qa-use)
- Swarm: suggested code fixes; personas keep memory across updates to see whether changes helped — [Swarm](https://www.useswarm.co/), [GrepBeat](https://grepbeat.com/2026/04/21/chapel-hills-swarm-is-rethinking-user-testing-with-ai-generated-personas/)
- QA Wolf MCP lets you request tests from the agent — [QA Wolf pricing](https://www.qawolf.com/pricing)
- Checksum explicitly positions against coding agents writing tests only when prompted; runs in background, heals via PRs — [Checksum](https://checksum.ai)
- Canary integrates at PR comment level, not coding agent — [YC Canary](https://www.ycombinator.com/companies/canary)

### Inferences
- The gap SQA can target: an **exploratory, whole-app, long-running (≈1 hour) session** whose output is a short, ranked, agent-consumable bug list, with a re-verify command per bug. Existing loops are diff-scoped verification.

### Gaps
- Could not verify how any vendor formats bug reports for machine consumption (e.g., structured JSON for agents).

## Pricing (as of Oct 2026) and target customer

### Takeaway
Two price clusters: **indie/dev self-serve ($0–$150/mo)**: Shiplight, TestSprite, Swarm, Ranger, desplega, QA Wolf pay-per-run; and **managed/enterprise ($2.5K/mo to $90K+/yr)**: Bug0, QA Wolf managed, Spur, Checksum, Rainforest, AutoExplore.

### Cited Findings
- Swarm: Free (5 lifetime runs, 3 personas/run); Startup $150/mo (10 personas/run, 50 screenshot + 20 live runs/mo, 3 members); Enterprise custom — [Swarm](https://www.useswarm.co/)
- QA.tech: no public prices ("Talk to us") — [QA.tech pricing](https://qa.tech/pricing.md). Third-party list: $499/$999/$1,999 per month (unverified) — [EveryDev](https://www.everydev.ai/tools/qa-tech)
- desplega: Free €0; Subscription (price not rendered); Enterprise custom; token-based billing — [desplega pricing](https://desplega.ai/pricing). Third-party: €0–€299/mo (unverified) — [TrustMRR](https://trustmrr.com/startup/desplega-ai)
- Shiplight: Free $0; Pro $60/mo or $600/yr + metered compute/model usage; Enterprise contract — [Shiplight llms.txt](https://www.shiplight.ai/llms.txt)
- QA Wolf: $1/web run, $2/mobile run (5-minute blocks), no seats; managed services via sales — [QA Wolf pricing](https://www.qawolf.com/pricing). Vendr median $90K/yr for managed (33 purchases) — [Vendr](https://vendr.com/marketplace/qa-wolf)
- Bug0: $2,500/mo flat managed, up to 500 flows — [Bug0 pricing](https://bug0.com/pricing). Conflicting older figures ($699/$4,999) in search snippets — unverified.
- AutoExplore: from $1,490/mo (third-party) — [AlternativeTo](https://alternativeto.net/software/autoexplore/about)
- TestSprite: Free 150 credits; Starter $19; Standard $39; Pro $69; Enterprise $199+/mo from 10 seats — [TestSprite pricing](https://www.testsprite.com/pricing)
- Ranger: Free (5 reviews); Growth $50/user/mo; Enterprise usage-based — [Ranger pricing](https://www.ranger.net/pricing)
- Spur: annual plans by test-run volume, demo required; customers Sephora, Bombas, Vuori, Abercrombie — [Spur](https://www.spurtest.com)
- Reflect: Team $225/mo per ToolRadar (conflicts with SourceForge $100/mo) — unverified, per search summary of [ToolRadar](https://toolradar.com/tools/reflect-tests)
- Tusk: ~$50/active dev/mo Team (third-party) — [EveryDev](https://www.everydev.ai/developers/tusk-ai)
- Carbonate: "from $49" per one directory (unverified) — [Techjockey](https://www.techjockey.com/ae/detail/carbonate)
- Checksum, Meticulous, Rainforest, Canary, Ghostship, CARBON: no public prices — [Checksum](https://checksum.ai), [Meticulous](https://www.meticulous.ai), [Rainforest](https://www.rainforestqa.com/pricing), [Canary](https://www.ycombinator.com/companies/canary)
- QA.tech customers: Lovable, AstraZeneca, Upsales, Pricer — [QA.tech](https://qa.tech). Meticulous customers: Notion, ElevenLabs, Dropbox, Wiz — [TheSaaSNews](https://thesaasnews.com/news/meticulous-raises-15m-series-a). Bug0: "teams shipping 10+ deploys a week," 200+ teams — [Bug0](https://bug0.com)

### Inferences
- Indie/dev self-serve pricing is converging at $0–$150/mo with free tiers. An SQA "one-hour exploration → 5 bugs" offering likely needs per-run pricing (QA Wolf's $1/run model shows appetite) since an hour of LLM browser time is costly.

### Gaps
- Desplega Subscription price not rendered on page. QA.tech list prices unverified.

## Funding / stage

### Takeaway
Most are seed-stage; Meticulous and Momentic are Series A ($15M each). Propolis exited to Datadog; Octomind shut down.

### Cited Findings
- Swarm: >$100K from LeapYear and Afore Capital; founded 2026 by UNC students Krish Vazirani and Aryan Aladar; 2-person team — [GrepBeat](https://grepbeat.com/2026/04/21/chapel-hills-swarm-is-rethinking-user-testing-with-ai-generated-personas/)
- QA.tech: €3M seed May 2024 (PROfounders lead) + €1M pre-seed; Stockholm — [Silicon Canals](https://siliconcanals.com/qa-tech-secures-3m/)
- Shiplight: Pear VC and Embedding VC; amount undisclosed — [Shiplight llms.txt](https://www.shiplight.ai/llms.txt)
- Meticulous: $15M Series A July 2026 led by Chemistry, Menlo participating; London; prior YC/Coatue seed — [TheSaaSNews](https://thesaasnews.com/news/meticulous-raises-15m-series-a); Caplight lists conflicting $16M BlackRock/Fin Capital (likely aggregator error) — [Caplight](https://www.caplight.com/company/meticulous)
- Momentic: $15M Series A Nov 2025, Standard Capital lead; YC alum — [TechCrunch](https://techcrunch.com/2025/11/24/momentic-raises-15m-to-automate-software-testing)
- Ranger: $2.4M pre-seed (XYZ) + $6.5M seed (General Catalyst) = $8.9M — [Ranger](https://www.ranger.net/post/ranger-raises-8-9m-to-find-bugs-faster)
- TestSprite: $6.7M seed Oct 2025 led by Trilogy Equity Partners (~$8.1M total) — [VCA Online](https://www.vcaonline.com/news/2025102908/testsprite-raises-6-7-million-seed-round-to-become-the-testing-backbone-of-the-ai-native-development-era/)
- Spur: YC S24; $4.5M seed led by First Round (secondary source) — [Neuronfeed](https://neuronfeed.com/startups/spur-qa)
- Propolis: YC Spring 2025, acquired by Datadog (Jan 2026) — [YC Propolis](https://www.ycombinator.com/companies/propolis)
- Canary: YC W26, 2 people — [YC Canary](https://www.ycombinator.com/companies/canary)
- Tusk: YC W24 — [AWS startups](https://aws.amazon.com/aws-startups/learn/from-yc-to-aws-tusk-turns-production-traffic-into-ai-powered-tests-on-aws/)
- Checksum: $750K seed (Sept 2023, aggregator only; unverified) — [Bouncewatch](https://bouncewatch.com/company/checksumai)
- Reflect: owned by SmartBear — [SmartBear Reflect](https://smartbear.com/product/reflect/)
- Octomind: shut down (April–June 2026) — [rywalker](https://rywalker.com/research/octomind)

### Inferences
- Datadog buying Propolis suggests observability vendors may bundle "autonomous user simulation" into monitoring — a potential future competitor channel.

### Gaps
- No funding info found for Bug0, AutoExplore, desplega, testers.ai, Ghostship, Carbonate, Autonoma.

## One-line verdict: how close to the SQA target experience

### Takeaway
No product fully matches SQA's "agent-installed, one-hour exploratory run → ~5 curated reproducible bugs → agent fixes and re-verifies." The closest are **desplega qa-use** (API key + CLI/MCP + `explore` skill), **Swarm** (CLI/MCP in coding agents, but usability-focused), **QA.tech** (exploratory, MCP, but sales-gated), **Ranger / Shiplight / TestSprite** (agent loop, but diff-scoped verification/regression), and the now-acquired **Propolis**.

### Cited Findings
See per-product citations above. Summary verdicts:

| Product | Core job | Self-serve + CLI/MCP | Verdict vs. SQA |
|---|---|---|---|
| desplega qa-use / Argus | E2E gen + explore/verify | Yes (API key, CLI, MCP, Claude Code plugin) | **Close** (structurally nearest; output/bug-report depth unverified) |
| Swarm | Usability personas | Yes (CLI, MCP, $150/mo) | **Partial** (same delivery path, usability not bug-hunting; ~10-min runs) |
| QA.tech | Exploratory + regression on PRs | MCP only on Growth+, sales-led | **Partial** (right job, wrong onboarding) |
| Ranger | Verify coding-agent work | Yes (`ranger go`, free tier) | **Partial** (agent loop, diff-scoped) |
| Shiplight | YAML regression + agent verify | Yes (`npx add-mcp`, free) | **Partial** (agent loop, regression focus) |
| TestSprite | Agent-triggered E2E gen/run | Yes (MCP/CLI, $0–$69) | **Partial** (agent loop, test-suite output) |
| Testers.ai CARBON | Agent verification harness | Plugin; beta (unconfirmed) | **Partial** |
| Propolis | Swarm exploration → bug reports | Sales; acquired by Datadog | **Close in concept, no longer independent** |
| AutoExplore | Autonomous exploratory | Trial; no MCP | **Partial** (right job, no agent path, $1.5K/mo) |
| Ghostship | Agents crawl to find bugs | Demo-led | **Partial** (right job, no agent path seen) |
| Spur | Multi-agent incl. exploratory, e-com | Pilot/sales | **Different segment** (enterprise e-com) |
| QA Wolf | Regression coverage (+ managed) | Self-serve $1/run + MCP | **Different category** (test suites) |
| Bug0 | Managed AI QA | Managed $2.5K/mo | **Different category** |
| Autonoma | PR-preview E2E, BSL | CLI, no MCP | **Different category** (regression) |
| Canary | Codebase-aware PR QA | Sales | **Different category** |
| Checksum | Test gen/maintenance | Sales | **Different category** |
| Meticulous | Visual regression from sessions | Sales | **Different category** |
| Reflect (SmartBear) | Agentic regression tests | MCP for test gen | **Different category** |
| Rainforest QA | AI test planner/regression | Sales | **Different category** |
| Momentic | Plain-English regression tests | Not verified | **Different category** |
| Tusk | Unit/API tests from traffic | Self-serve | **Different category** |
| Carbonate | Record-to-test no-code | Unclear | **Different category** |
| Octomind | Playwright test gen | Shut down 2026 | **N/A (defunct)** |

### Inferences
- SQA's wedge should be: whole-app exploration over a long session, a strict precision bar (few, high-severity, reproducible bugs), and a per-bug re-verify command for the coding agent. Onboarding via coding agent alone is already matched by several rivals.

### Gaps
- None of the verdicts are based on running the products; actual exploratory depth and bug precision are unverified.
