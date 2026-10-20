# SQA

SQA is an attempt to make a better Momentic (Mo): an automated QA tool that explores a web app and returns a short list of real, reproducible bug reports that a coding agent can fix.

## Rules

1. `CLAUDE.md` and `AGENTS.md` must always be identical. When you change one, make the same change in the other. A pre-commit hook in `.githooks/pre-commit` blocks any commit where they differ. Turn it on in every clone with `git config core.hooksPath .githooks`.
2. After every change to the repo, commit and push to `master` so cloud sessions stay in sync. If it isn't obvious which branch to use, ask before pushing.
3. Only edit files in this repo when I explicitly tell you to. Never make changes on your own initiative. Agreeing with an idea is not permission to edit. If you're unsure, ask first.
