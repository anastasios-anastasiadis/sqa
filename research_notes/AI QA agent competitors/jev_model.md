# Jev (TypeSafe AI) and its fit for screenshot-driven browser QA

Research date: 2026-10-16. Name resolution: "Jev" here is TypeSafe AI's **Jev** decision model (model IDs `jev-1.13.0`, `jev-1.14.0`; aliases `jev-latest`, `jev-preview`; OpenRouter IDs `typesafe/jev-1.13`, `~typesafe/jev-latest`). Unrelated projects share the name and should not be confused with it: "Jev-Spatial" (research pointing model on Hugging Face by Fr0zencr4nE), "jev-bot" (JSR screen-automation library), and "imajev" (an open "Jev-style" image model on GitHub) — [search results: HF jev-spatial](https://huggingface.co/Fr0zencr4nE/jev-spatial), [jsr jev-bot](https://jsr.io/@compootor/jev-bot), [GitHub imajev](https://github.com/mohit67890/imajev).

**Headline correction to the brief:** Jev is NOT a UI-grounding or computer-use model, and it does not return pixel click coordinates. It is a text-first "System One" decision model that answers typed questions (Choice / Score / yes-no "Noul") with probabilities. Since 14 Oct 2026 (two days ago) it accepts images in an explicitly non-production "danger zone" preview, and Jev 1.14 adds a "Box" answer that returns one bounding box as fractions of the image. A click point can be derived from the box centre, but this is a 2-day-old preview with no published UI-grounding benchmarks.

## What exactly is Jev, who makes it, when was it released, and what kind of model is it?

### Takeaway
Jev is a proprietary, hosted, non-generative "decision model" from TypeSafe AI (San Francisco), in early access since 15 Sep 2026. It is closest to a calibrated classifier/selector: it chooses among options you supply, scores, or gives yes/no probabilities. It is not an agent and does not plan or act.

### Cited Findings
- Jev is a non-generative decision model from TypeSafe, which calls it a "System One" model: takes text plus typed questions and returns typed answers with probabilities, generating no prose — [OpenRouter blog: What is Jev](https://openrouter.ai/blog/insights/what-is-jev/)
- Early access began 15 Sep 2026; Jev 1.13 was the current version at time of the OpenRouter article (published 21 Sep 2026) — [OpenRouter blog](https://openrouter.ai/blog/insights/what-is-jev/); intro date 15 Sep 2026 also given by [InfoWorld](https://www.infoworld.com/article/4236103/typesafe-ai-jev-even-more-susceptible-to-attack-than-llms-says-security-vendor.html)
- TypeSafe founders: Diogo Almeida, Erik Gafni, Sasha Sheng; Almeida described as former OpenAI researcher who co-invented RLHF; trained with a method TypeSafe calls "Reinforcement Learning for Calibrated Decisions" — [InfoQ, 1 Oct 2026](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)
- Three answer types at launch: **Choice** (one option from a fixed set, per-option probabilities + confidence), **Score** (ordered levels, max 10, probability-weighted score), **Noul** (probability a yes/no proposition holds) — [OpenRouter blog](https://openrouter.ai/blog/insights/what-is-jev/)
- Multiple questions are answered in one parallel pass against the same state — [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)
- Jev 1.14 announced 14 Oct 2026 with experimental images, a new Box type, and longer context; TypeSafe says its "bar for production-grade intelligence is quite high" — [TypeSafe on X](https://x.com/typesafeai/status/2110536685805355064); [TypeSafe models docs](https://docs.typesafe.ai/models)
- TypeSafe claims Jev 1.13 "was multimodal all along" — image input works on both 1.13 and 1.14 — [madewithjev.com (independent, not affiliated)](https://madewithjev.com/jev-images); [TypeSafe images docs](https://docs.typesafe.ai/images)
- Claim (unverified, secondary source only): TypeSafe raised ~$870M after the launch — [briefs.co](https://www.briefs.co/news/typesafe-raises-about-870-million-after-jev-launch-goes-vira/)

### Inferences
- For QA, Jev's natural role is the small yes/no and "pick one of these N" decisions inside a test agent (e.g., which of 4 "Billing" links to click; did this step succeed), not driving the browser end to end.
- The original brief's "screenshot + text → pixel coordinates" description most likely conflates Jev with Box-based demos built by third parties after 14 Oct.

### Gaps
- No paper, model card with architecture, or parameter count found; TypeSafe has not published weights or a paper ([OpenRouter blog](https://openrouter.ai/blog/insights/what-is-jev/)).
- Funding figure not confirmed by a primary source.

## What endpoints/APIs exist, and what are the request/response formats and limits?

### Takeaway
One decisions endpoint takes `model`, `state`, `questions` (and `assets` for images). There is no dedicated "pointing" endpoint: pointing = a Box question on an image (1.14 only, preview). Element selection from a list = Choice. Progress/success checks = Noul or Score.

### Cited Findings
- OpenRouter endpoint: `POST https://openrouter.ai/api/alpha/decisions` (also a "System One API" at `POST https://openrouter.ai/api/v1/systemone`); request: `model`, `state` (string or JSON), `questions` (each with `type`, `instructions`, `criteria` for Choice/Score); response: `model`, `answers` keyed by question ID, `usage` (`input_tokens`, `output_tokens`, `cost`), `id`, `provider` — [OpenRouter blog](https://openrouter.ai/blog/insights/what-is-jev/); [jevmodel.org (third party)](https://jevmodel.org/jev-openrouter/)
- Direct TypeSafe API also exists (provider `typesafe`, model `jev-latest`, `TYPESAFE_API_KEY`) — [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- **Images:** header `TypeSafe-Danger-Zone-Images: true` required on any request with an image or Box question (else HTTP 400); images go in a top-level `assets` map, each `type: "image"` with `data_base64` + `format` (png/jpg/jpeg) or a multipart `part`; every asset must be referenced in state/instructions/criteria — [TypeSafe images docs](https://docs.typesafe.ai/images)
- **Image limits:** still PNG/JPEG only (no animated PNG, GIF, WebP, HEIC); 16 MiB per image; width/height 280–1568 px each; total pixels 78,400–2,458,624; request body 32 MiB; out-of-range images are rejected, not resized — [TypeSafe images docs](https://docs.typesafe.ai/images). (Note: independent site madewithjev.com says 256 px minimum; official docs say 280 px — [madewithjev.com](https://madewithjev.com/jev-images))
- **Box spec (1.14 only, `jev-preview` / `jev-1.14.0`):** request `{"type":"box","instructions":"the coffee mug in `photo`"}`, no criteria; response `{"type":"box","box":{"top":0.25,"bottom":0.82,"left":0.44,"right":0.84},"confidence":0.92}`; edges are fractions (0–1) from the top-left — [TypeSafe Box docs](https://docs.typesafe.ai/primitives/box)
- Box returns exactly one box; there is **no "not found" answer** — an absent target still gets four edges; docs advise pairing with a Noul presence question; small targets in large images can be missed — crop/tile first — [TypeSafe Box docs](https://docs.typesafe.ai/primitives/box)
- Box docs give no recommended confidence threshold; apps must tune their own — [TypeSafe Box docs](https://docs.typesafe.ai/primitives/box)
- Box is labelled "Dreamer-ready" (not production-ready); format, answers and limits "can change between releases" — [TypeSafe Box docs](https://docs.typesafe.ai/primitives/box)
- **Context:** default 64k tokens per request / 32k per question; opt-in header `TypeSafe-Danger-Zone-Long-Context: true` raises both to 262k but is "slower and less accurate" — [TypeSafe models docs](https://docs.typesafe.ai/models). OpenRouter lists 32k context — [OpenRouter blog](https://openrouter.ai/blog/insights/what-is-jev/) (the two are not reconciled)
- **Rate limits:** per organization, in tokens/sec and requests/sec, shown in the developer console; 429 on excess; higher limits via enterprise plans; images share the same limits — [TypeSafe models docs](https://docs.typesafe.ai/models); [images docs](https://docs.typesafe.ai/images)
- **Latency:** TypeSafe quotes 70–500 ms end to end — [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/); [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- Official models page still listed input as text-only as of 15 Oct, contradicting the images page — [TypeSafe models docs](https://docs.typesafe.ai/models); [madewithjev.com](https://madewithjev.com/jev-images)
- English has the best accuracy; other languages (incl. CJK) less reliable — [TypeSafe models docs](https://docs.typesafe.ai/models)

### Inferences
- To click with Jev you would: screenshot → resize to ≤1568 px per side → Noul "is X present?" + Box "X" → take box centre × screenshot size → map back to CSS pixels. The coordinate-mapping and verification logic is all on the caller.
- The 1568 px cap means full-page or high-DPI screenshots must be downscaled or tiled, which hurts small-target accuracy (the docs themselves warn about small targets).
- Whether Box images are supported via OpenRouter (vs. TypeSafe direct) is not confirmed.

### Gaps
- No published per-call latency for image or Box requests; no image token-count formula ("coming soon") — [TypeSafe images docs](https://docs.typesafe.ai/images).
- Exact numeric rate limits are not public.

## Pricing, free tiers, and availability

### Takeaway
Very cheap: $0.042 per million input tokens, output free, images billed as input tokens with no per-image fee. Available direct, on OpenRouter, Vercel AI Gateway, Netlify, and via a LangChain integration.

### Cited Findings
- $0.042 per million input tokens (TypeSafe writes "$42 per Btok"); output free; same for 1.13 and 1.14 — [TypeSafe models docs](https://docs.typesafe.ai/models)
- Example call: 447 input tokens ≈ $0.000019 — [OpenRouter blog](https://openrouter.ai/blog/insights/what-is-jev/)
- Images: billed as input tokens at the text rate, no separate image charge; image tokens count toward context — [TypeSafe images docs](https://docs.typesafe.ai/images)
- Builder-reported image costs: doorbell camera ~$0.00008 per event at ~200 ms; 26 construction sheets in 2.9 s for $0.0052 — [madewithjev.com](https://madewithjev.com/jev-images)
- OpenRouter launched Jev in beta; also offers `typesafe/jev-router`, a Jev-powered model router — [OpenRouter on X](https://x.com/OpenRouter/status/2100744709589316009); [OpenRouter on X (router)](https://x.com/OpenRouter/status/2103610898690855161); [OpenRouter TypeSafe page](https://openrouter.ai/typesafe)
- Vercel AI Gateway added Jev on day two; Vercel says ~13% of paid teams used it within 24 h; also Netlify and LangChain `TypeSafeClassifier` — [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)
- Explorbot PR notes OpenRouter is the only provider among those it supports that offers a decision model — [Explorbot PR #269](https://github.com/testomatio/explorbot/pull/269)

### Inferences
- At these prices the model cost of a Jev decision is effectively negligible next to an LLM call; the cost question for SQA is about how many LLM calls Jev can replace, not Jev's own bill.

### Gaps
- No free tier found in official docs. Price could change (early access).

## Benchmarks and comparison with computer-use / grounding alternatives

### Takeaway
All Jev benchmarks are on text classification/decision tasks, and most are vendor- or partner-run on small sets. There are **no** ScreenSpot, ScreenSpot-Pro, OSWorld, WebArena or Mind2Web results for Jev. It cannot be compared like-for-like with Claude/OpenAI/Gemini computer use, UI-TARS, Holo, etc.

### Cited Findings
- OpenRouter test (19 Sep 2026, 60 support tickets): Jev 1.13 intent 98.3%, escalation 100%, p50 0.194 s, $0.0248 per 1,000; GPT Luna 98.3%/100%, p50 1.106 s, $0.0921/1k; Claude Opus 100%/98.3%, p50 1.957 s, $2.88/1k — [OpenRouter blog: Jev vs LLM](https://openrouter.ai/blog/tutorials/jev-vs-llm-when-to-use-each/)
- Same post, 40-message prompt-injection screen: Jev 100%, p50 0.194 s; Luna 97.5%; Opus 100%, p50 2.099 s. Author: small sets, single day, "the shape of the tradeoff, rather than a leaderboard" — [OpenRouter blog](https://openrouter.ai/blog/tutorials/jev-vs-llm-when-to-use-each/)
- TypeSafe self-reported: up to 193.6× faster, up to 444.6× cheaper than reference models; reference answers came from larger models — [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- Independent analysis of 12,759 launch tweets (OpenChamber): user-reported speedup median 7× (vs 193.6× headline), median cost saving 30×, median latency 76 ms, upper quartile 270 ms — [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)
- Bryo AI CTO: Gemini slightly more accurate on email classification but 10–20× more expensive — [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)
- Explorbot measurement: supervisor decisions ~0.3–0.4 s with Jev vs 2.5–2.8 s with the larger agent model; but for small page-reading questions a cheap non-reasoning model was as fast or faster — [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- Image accuracy: page explicitly says "no official benchmark numbers"; only small builder tests (e.g., doorbell 23/23 people found vs 14/23 for a prior pipeline) — [madewithjev.com](https://madewithjev.com/jev-images)
- Box edge-check in TypeSafe's own docs test: four per-edge Noul questions caught 30 of 36 cut-off cases — [TypeSafe Box docs](https://docs.typesafe.ai/primitives/box)
- Known weaknesses: unreliable at arithmetic, counting, date comparison; loses accuracy with irrelevant detail in state — [OpenRouter blog](https://openrouter.ai/blog/tutorials/jev-vs-llm-when-to-use-each/); [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/). Large HTML/ARIA states make calls slower/costlier and Jev can miscount elements — [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- **Alternatives (context only, third-party aggregators, unverified):** ScreenSpot-Pro Oct 2026: GPT-6 Astra 92.7%, Claude Opus 4.8 87.9%, GPT-5.4 85.4% — [benchlm.ai](https://benchlm.ai/benchmarks/screenspot-pro); Holo2-235B-A22B 78.5%, Holo2-30B-A3B 75.2% (different setup, older) — [Papers with Code](https://paperswithcode.co/benchmark/screenspot-pro?eval=5370). ScreenSpot-Pro only measures single-screenshot localization, not task completion — [benchlm.ai](https://benchlm.ai/benchmarks/screenspot-pro)
- Builder "computer use" demo using Jev (~90 ms per decision) actually uses local CoreML segmentation + OCR to list elements and Jev only picks which one — not Jev's image input — [madewithjev.com](https://madewithjev.com/jev-images)
- A "text-to-screenshot" demo moves a crosshair to a named element using Box (builder: Malay); prototype — [madewithjev.com](https://madewithjev.com/jev-images)

### Inferences
- Frontier models now score ~85–93% on ScreenSpot-Pro (per aggregators). Jev Box has no comparable number, so claims that Jev makes screenshot clicking "more reliable" are unsupported today.
- The most credible Jev pattern for browser QA is "DOM/accessibility list → Jev Choice", i.e., selecting from candidates you already have — this avoids pixel grounding entirely and is where Explorbot uses it.

### Gaps
- No Jev results on ScreenSpot, ScreenSpot-Pro, OSWorld, WebArena, Mind2Web, or any UI benchmark.
- I did not gather fresh per-call pricing/latency for Claude computer use, OpenAI CUA, Gemini computer use, UI-TARS, Moondream point, or OmniParser in this pass; other researchers may cover them.

## Known integrations (Explorbot / Testomat and others)

### Takeaway
Explorbot (Testomat.io's open-source exploratory-testing agent) uses Jev as an optional, off-by-default "decision model" for text-based choices with a 0.7 confidence gate and fallback to the main LLM. It does not use Jev for screenshots or coordinates.

### Cited Findings
- Testomat blog "Deterministic AI Decisions: Why Explorbot Added Jev", updated 30 Sep 2026, by Michael Bodnarchuk: Jev is a middle layer between deterministic rules and full LLM calls — [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- Decisions Jev makes in Explorbot: pick one element from several matches; judge whether a recent action sequence looks healthy; match a new expected result to a verified one; decide whether visible page state supports a narrow claim; choose which control most likely leads to a target page — [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- 70% confidence threshold (configurable, default 0.7); on low confidence, timeout or error it falls back; Explorbot code does the click — [Testomat blog](https://testomat.io/blog/deterministic-ai/); [Explorbot PR #249](https://github.com/testomatio/explorbot/pull/249)
- Explorbot does not use Jev for planning, exploration, recovery, or explanation; Jev does not verify results — browser assertions do — [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- Examples pass Jev a text list of candidates; screenshots/coordinates not mentioned; `visionModel` remains a separate Explorbot setting — [Testomat blog](https://testomat.io/blog/deterministic-ai/)
- Config: `ai.decisionModel`, `tool: true` (agent can ask Jev), `direct: true` (built-in decision points); env `EXPLORBOT_DECISION_MODEL` / `--decision-model` — [Testomat blog](https://testomat.io/blog/deterministic-ai/); [Explorbot PR #248](https://github.com/testomatio/explorbot/pull/248)
- PR #269 (merged 8 Oct 2026): `typesafe/jev-latest` recommended decision model on OpenRouter, auto-enabled with `EXPLORBOT_AI_PROVIDER=openrouter`; vision model recommendations are Claude Haiku 5.5 / GPT-6 Luna, not Jev — [Explorbot PR #269](https://github.com/testomatio/explorbot/pull/269)
- Decisions saved to a decision trace with answer and probability for replay — [Explorbot PR #249](https://github.com/testomatio/explorbot/pull/249)
- A CI run on beta.testomat.io reportedly had Jev answer 101 questions with no errors (search-result summary of Explorbot repo) — [Explorbot release 0.5.6](https://github.com/testomatio/explorbot/releases/tag/0.5.6)
- Other integrations: Vercel AI Gateway, Netlify, LangChain (`TypeSafeClassifier`, routing, AutoMode middleware that screens tool calls), several Elixir clients — [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/). A third-party GitHub issue characterises Jev as "closed hosted model, no weights" when comparing exploratory-testing tools — [noisy-studio issue #154](https://github.com/noisy/noisy-studio/issues/154)

### Inferences
- Explorbot is the clearest QA precedent: Jev saves time on small decisions (~0.3 s vs ~2.6 s) inside an LLM agent, but the LLM and a vision model remain in the loop.

### Gaps
- No accuracy or bug-finding impact data for Explorbot with vs without Jev.
- No other dedicated QA/testing product integrating Jev's image/Box features found (feature is two days old).
- The "101 questions, no errors" figure was seen only in a search summary; not re-verified on the release page.

## Practitioner feedback and failure modes

### Takeaway
Reaction is enthusiastic on speed and cost, sceptical on marketing ("never hallucinates"), and a security vendor reports Jev is easier to fool than LLMs — directly relevant to a browser agent that clicks on untrusted pages.

### Cited Findings
- HN commenter: Jev cannot emit an invalid type but can emit a wrong valid value; speed comparison seen as misleading — [InfoQ summary](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/); [HN thread](https://news.ycombinator.com/item?id=49847030)
- Armin Ronacher: design "delegates the hallucination problem a little bit to the user" — [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)
- Early-access HN user: "really neat" but out-of-distribution behaviour will differ from an LLM — [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)
- HiddenLayer (reported 15 Oct 2026): Jev vulnerable out-of-the-box to TokenBreak-style character perturbations that usually fail on large LLMs; in a simulated checkout page, a Jev-driven browser agent clicked an attacker's ad despite instructions to treat page text as untrusted; no success-rate numbers published; TypeSafe did not respond — [InfoWorld](https://www.infoworld.com/article/4236103/typesafe-ai-jev-even-more-susceptible-to-attack-than-llms-says-security-vendor.html)
- Analyst Frank Dickson: if the option menu includes "click any page element", an attacker's ad can end up on the menu — [InfoWorld](https://www.infoworld.com/article/4236103/typesafe-ai-jev-even-more-susceptible-to-attack-than-llms-says-security-vendor.html)
- Image-specific: a valid Box does not prove the target exists; confidence derives from the answer distribution, not an independent check; Jev handles colour names better than hex/RGB — [madewithjev.com](https://madewithjev.com/jev-images); [TypeSafe Box docs](https://docs.typesafe.ai/primitives/box)

### Inferences
- "Hallucinated clicks" risk for SQA: Box always returns a box, so without a presence check and post-click verification Jev will confidently point at something that isn't there.
- Testing third-party/customer web apps means untrusted page text; the HiddenLayer finding argues for a restricted candidate list and independent assertions.

### Gaps
- Reddit was not accessible to my tools; the r/QualityAssurance "Jev model for QA" thread could not be verified. InfoQ mentions one Reddit developer calling it "absolutely insane" for agent work at 200–300 ms ([InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)).
- No practitioner reports yet on Box accuracy for web UI screenshots specifically.

## Licensing and terms affecting a commercial product

### Takeaway
Jev is proprietary and hosted only. No weights, no self-hosting, no fine-tuning. A commercial product can call it via API, but depends on a single early-access vendor with changing preview features.

### Cited Findings
- Proprietary; no weights or paper; everyone calls the same hosted model — [OpenRouter blog](https://openrouter.ai/blog/insights/what-is-jev/)
- Customer fine-tuning and vision-adapter uploads not offered — [madewithjev.com](https://madewithjev.com/jev-images)
- TypeSafe `/legal` covers a DPA, Privacy Policy, and zero data retention for enterprise; docs state Jev is not trained on customer requests/responses — [TypeSafe models docs](https://docs.typesafe.ai/models)
- Images, Box, long context: format, answers and limits may change between releases — [TypeSafe images docs](https://docs.typesafe.ai/images)
- Early-access pricing "may still be adjusted" (unofficial page) — [toolnavs.com](https://toolnavs.com/article/2023-how-does-typesafe-ai-charge-input-price-output-fee-and-limit-explanation)

### Inferences
- Sending customer screenshots to Jev needs the DPA; ZDR appears to be enterprise-only.
- Lock-in risk is moderate: Jev calls are small and can fall back to an LLM, as Explorbot does.

### Gaps
- Terms of service / acceptable-use text, SLA, and deprecation policy not found.

## Does Jev make screenshot-driven browser testing cheaper or more reliable? (bottom line for SQA)

### Takeaway
Cheaper and faster for small text decisions inside an agent: yes, with credible evidence. More reliable for screenshot-based clicking: no evidence yet. Box is a two-day-old, non-production preview with no UI benchmarks and no "not found" answer.

### Cited Findings
- Jev is ~5–10× faster than LLMs on small decisions in practice (Explorbot 0.3–0.4 s vs 2.5–2.8 s; tweet median 7×) — [Testomat blog](https://testomat.io/blog/deterministic-ai/); [InfoQ](https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/)
- Per-call cost is fractions of a cent ($0.0248 per 1,000 ticket decisions) — [OpenRouter blog](https://openrouter.ai/blog/tutorials/jev-vs-llm-when-to-use-each/)
- TypeSafe itself says images/Box "aren't yet up to our standards" for production — [madewithjev.com quoting TypeSafe](https://madewithjev.com/jev-images); [TypeSafe on X](https://x.com/typesafeai/status/2110536685805355064)
- OpenRouter's guidance (pre-1.14) says not to use Jev for open-ended outputs, plans, or arithmetic/counting — [OpenRouter blog](https://openrouter.ai/blog/tutorials/jev-vs-llm-when-to-use-each/)

### Inferences
- Best fit for SQA today: use Jev as a gate/selector on text (DOM or accessibility-tree candidates, step success yes/no, flaky-vs-real-failure triage), with a confidence threshold and LLM fallback — the Explorbot pattern.
- For pixel clicking, keep a proven grounding/computer-use model as the primary path; if trialling Jev Box, measure it on your own app screenshots against that baseline before relying on it.

### Gaps
- No head-to-head data of Jev Box vs Claude/OpenAI/Gemini computer use or UI-TARS/Holo on web UI screenshots.
