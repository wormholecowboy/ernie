# ernie — beads_rust (`br`) research + spike (2026-10-10)

Source: github.com/Dicklesworthstone/beads_rust (README, docs/CLI_REFERENCE.md, LICENSE), v0.7.4 darwin_arm64 release (sha256 verified), run in session scratchpad only, never installed; binary deleted after reading the license. ✓ = ran / read · ~ = inferred · ✗ = unchecked.

## What it is

- ✓ Rust port by Jeffrey Emanuel that freezes "classic beads": SQLite + JSONL export committed to git. Command `br`. 1.1k stars, 125 forks, created 2026-01-18, pushed 2026-10-09, v0.7.x (pre-1.0), releases every few days.
- ✓ Why it exists: the author's Agent Flywheel (agent-flywheel.com — also on our inter-agent backlog) + MCP Agent Mail + beads_viewer are built on the SQLite+JSONL model that `bd` dropped. README says Steve Yegge endorsed the port.
- ✓ "Non-invasive": never commits, pushes, pulls, installs hooks or runs a daemon. "Git operations are YOUR responsibility."

## LICENSE — blocker to resolve

- ✓ "MIT License (with OpenAI/Anthropic Rider)". No rights granted to OpenAI, Anthropic, their affiliates, or "any person or entity acting directly or indirectly on behalf of, for the benefit of, or under the direction of" them. "Use" defined to include "executing, benchmarking, testing, analyzing … or incorporating the Software … into any … pipeline for machine learning or other automated systems."
- ~ Whether a user driving `br` through Claude Code falls under the rider is a legal question; not answered here. `bd` is plain MIT.

## Data model vs bd

- ✓ Issues: types (epic/task/bug…), priority, labels, `--parent` (ids `proj-cc2.1`), `--deps discovered-from:<id>`, description, acceptance, design/notes (update only).
- ✓ **No metadata JSON field.** README: "Custom fields: Via labels". Spike stored finding fields as labels (`owner:us`, `confidence:inferred`) + text in description.
- ✓ Custom statuses: `.beads/policy.yaml` `workflow.statuses` (e.g. `proposed`, `in_review`, `rework`); `workflow.status_groups.ready` decides what `br ready` returns (default `[open]`).
- ✓ Gates = transition rules, not blocker issues: `workflow.gates` maps `"from -> to"` → required gates; `br gate report <id> --gate <name> --provider <who> --status pass|fail --to <status>`. Built-in `min_reviewers: N` = N distinct `reviewer:<who>` providers passed. Also `workflow.required_fields` per transition (e.g. `acceptance_criteria_present`, `transition_comment`).
- ✓ Gate results are local only, NOT in JSONL → lost on clone restore (spike confirmed).

## Spike results

- ✓ `br init` in a git repo: wrote `.beads/` (SQLite db + `issues.jsonl` + config + its own .gitignore for db files). No commit, no hooks, no `core.hooksPath`. `.beads/` left untracked.
- ✓ Finding flow: bug `--deps discovered-from:<bead>`, status `proposed` → not in `br ready`. `proposed -> open` rejected ("requires gate 'user_approval' to pass") until `br gate report … --gate user_approval --provider user --status pass --to open`; then it entered `br ready`. Any caller (Claude included) can run `gate report` → same guard gap as bd.
- ✓ Plan review: `"in_review -> closed": min_reviewers: 2` → close rejected after 1 reviewer pass, accepted after `reviewer:r1` + `reviewer:r2`.
- ✓ Speed: `br show` 0.038 s (bd ~0.33 s). 20 parallel creates 1.25 s, 20/20 ok (bd 11.5 s).
- ✓ JSONL auto-flushed on every write (24 lines = 24 issues).
- ✓ Commit `.beads/` → fresh `git clone` → `br list --all` = 24/24 restored, labels + deps intact, no bootstrap step. Gate results gone.
- ✓ `BEADS_DIR=/elsewhere/.beads br init` → work repo stays clean (nothing written in it).
- ✓ No change feed / events journal (`br audit` = agent interaction log, `br history` = local backups). ~ ernie would watch `issues.jsonl` (rewritten per write) or poll `br list --json`.
- ✓ Release binary 16.8 MB (bd 144 MB). Needs `RUST_LOG=error` to silence dependency logs.

## Fit to the storage decision (personal autopush / work no-git)

- Personal: commit `.beads/issues.jsonl` with code → beads ride normal `git push`. ~ ernie must `git add .beads/` (br never does). Gate results not backed up.
- Work: `BEADS_DIR` outside repo ✓; no backup unless ernie copies it.
