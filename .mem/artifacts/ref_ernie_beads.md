# ernie — Beads research (P1, 2026-10-10)

Source: github.com/gastownhall/beads (README, ROADMAP, docs/core-concepts/issues.md, docs/reference/events-journal.md, docs/reference/worktrees.md, docs/getting-started/ide-setup.md, docs/core-concepts/metadata.md, docs/CLI_REFERENCE.md, beads.go), read via `gh api` 2026-10-10. Not installed locally; nothing below was run. Tags: ✓ read in docs · ~ inferred · ✗ unchecked.

## What it is

- ✓ `bd` — "distributed graph issue tracker for AI agents, powered by Dolt". Go, MIT, ~27.8k stars, pushed 2026-10-11, brew `beads` 1.3.1. Docs: https://beads.gascity.com
- ✓ Replaces markdown plans/TODOs with a dependency graph; agents loop `bd ready` → `bd update <id> --claim` → `bd close <id>`.

## Data model

- ✓ Issue (a "bead"): `id`, `title`, `description`, `type` (bug/feature/task/epic/chore), `status` (open/in_progress/blocked/deferred/closed), `priority` 0–4, `labels[]`, `created_at`, `updated_at`; plus `--notes`, `--design`, `--acceptance`, `--due`, `--defer`, `--external-ref`, `--ephemeral`, `--assignee`, comments, audit history.
- ✓ `metadata`: arbitrary JSON per issue; the documented extension point for integrations (e.g. `execution_agent_type`, `execution_suggested_model`).
- ✓ IDs: hash-based (`bd-a1b2`), no merge collisions across agents/branches. Hierarchical: epic `bd-a3f8` → task `bd-a3f8.1` → sub-task `bd-a3f8.1.1` (`--parent`).
- ✓ Dependencies: `blocks` (affects `bd ready`), `parent-child`, `discovered-from`, `related` (don't). Graph links: `relates-to`, `duplicates`, `supersedes`, `replies-to`.
- ✓ `set-state`: `<dimension>:<value>` labels backed by an event bead (e.g. `review:2`).

## Workflow features relevant to ernie

- ✓ Gates: async waits that block a step. `human` (closed by hand), `timer`, `gh:run`, `gh:pr`.
- ✓ `bd human list|respond|dismiss` — beads labelled `human` that need the user.
- ✓ Molecules / formulas: reusable work templates (TOML/JSON formulas → protos → spawned issue DAGs, `{{var}}` substitution). Search paths include `~/.beads/formulas/`.
- ✓ `bd swarm`: parallel work over an epic's DAG.
- ✓ Messaging: message issue type with `--thread`, ephemeral lifecycle, mail delegation (`bd mail`).
- ✓ Memory: `bd remember "insight"` → injected by `bd prime` every session; `bd recall`, `bd memories`, `bd forget`.
- ✓ Compaction: summarizes old closed issues to save context.

## Storage

- ✓ Dolt (version-controlled SQL). Embedded mode (default): in-process, `.beads/embeddeddolt/`, **single writer**. Server mode (`bd init --server`): external `dolt sql-server`, many concurrent writers.
- ✓ `.beads/issues.jsonl` is an export for viewers, NOT the source of truth.
- ✓ Sync across machines: `bd dolt push/pull` to `refs/dolt/data` on the git remote.
- ✓ Worktrees: all worktrees of a repo share ONE `.beads` workspace; issue data isn't tied to git branches.
- ✓ `BEADS_DIR` + `bd init --stealth` → database anywhere, zero git ops, no hooks installed.
- ✓ Schema version guard: an old binary refuses a DB migrated by a newer one.

## Integration surfaces for ernie

- ✓ Events journal (off by default; `bd config set events-journal true`, every writer must enable it): `bd events tail --since <seq> [--follow]` → JSONL `{seq, ts, op: create|update|delete, issue_id, actor, issue: <full snapshot>}`; `--follow` polls 1/s. Over `bd serve`: `GET /v0/beads/events?since=N`. Retention default 7 days / 100k rows; checkpoint below the window → truncated error.
- ✓ Go library: `package beads` — `Open(ctx, dbPath)`, `OpenFromConfig`, `OpenGated(ctx, dir, wait)`, `FindBeadsDir()`, `Storage`, `Transaction`, `EventQuerier`, `IssueClaimer`. HTTP backend surface marked EXPERIMENTAL ("pin an exact beads version").
- ✓ `--json` output on commands; `bd batch`.
- ✓ `bd setup claude` writes `.claude/settings.json` SessionStart hook (`bd prime --hook-json`, ~1–2k tokens; fires on start/resume/clear/compact) + a managed `CLAUDE.md` section. `--global` targets `~/.claude/settings.json`.
- ✓ `bd init` by default creates/updates `AGENTS.md` and installs Claude/Codex/Cursor integrations unless `--skip-agents` or `--stealth`.
- ✓ `bd update --session` / `CLAUDE_SESSION_ID` records the closing session.

## Risks / unknowns

- ✓ Parallel `bd` writers on embedded Dolt queue rather than fail (20/20 in spike), at ~0.55 s per write under contention.
- ~ API churn: roadmap 1.4 = versioned beads + "Graph Preview 2" (generic Bead-and-Link model) → schema and CLI still moving.
- ~ 70+ commands; `bd prime` costs ~1–2k tokens per session start.
- ~ Scope mismatch: Beads = one workspace per repo (all worktrees); ernie log = per repo + branch (D4). Ties to P3 tab scopes.
- ~ Overlap with ernie: `bd prime` vs ernie dump; `bd remember` vs facts/.mem; SessionStart hook vs ernie's hooks.

## Hands-on spike (2026-10-10, bd 1.3.1, scratchpad, `BEADS_DIR` + `bd init --quiet --stealth --skip-agents`, no git repo)

- ✓ Stealth init in a non-git dir touched nothing global: no `core.excludesFile`, no beads lines in `~/.config/git/ignore` or `~/.claude/settings.json`. Wrote only `.beads/` (embeddeddolt/, config.yaml, metadata.json, README.md, .gitignore) + `.beads.gate.lock` next to it. Store 4.3 MB with ~45 issues.
- ✓ Epic → children: ids `proj-d7k`, `proj-d7k.1`, `proj-d7k.2` (prefix = dir name). `bd dep add B A` → B leaves `bd ready`; closing A puts B back in `bd ready`. Epics show in `bd ready` too.
- ✓ `set-state` syntax is `dim=value` (not `dim:value`): `bd set-state <id> review=2 --reason …` → label `review:2` + an event bead `<id>.1`.
- ✓ Every command in a non-git dir prints a `beads.role not configured` warning to stderr (3 lines) → noise in Claude's context unless `beads.role` is set or stderr is filtered.
- ✓ Speed: one `bd` command ≈ 0.33 s. 20 parallel `bd create` → 20/20 succeeded, 11.5 s total (writes serialize, ~0.55 s each). 10 parallel → 10/10.
- ✓ Events journal: ops seen `create`, `dep_add`, `update`, `close` (more than the docs list); `actor` = git user name (`wormhole cowboy`), `null` on derived updates (blocked recompute). `bd events tail --since <head> --follow`: write → line seen in 0.66 s (includes the 0.33 s create). `--since` past the head prints nothing, no error.
- ✓ Go library: module `github.com/steveyegge/beads`, requires go 1.26.5 (auto toolchain), 269 deps; `go get` 61 s.
  - `CGO_ENABLED=0` build: 15 s, 48 MB binary, but no embedded Dolt — `OpenBestAvailable`/`OpenFromConfig` only reach a Dolt server ("dolt is not installed").
  - `CGO_ENABLED=1` build (needed for embedded Dolt): fails without ICU headers (`unicode/regex.h`, dolthub/go-icu-regex). Not pursued.
  - `bd` binary itself: 144 MB.
- ~ Conclusion: ernie should shell out to `bd … --json` and follow `bd events tail --follow`, not link the library.

## Mapping to ernie types

| ernie today | Beads equivalent | Fit |
|---|---|---|
| `plan` (flat todo/active/done/dropped) | epic → tasks (`--parent`), `blocks` deps, statuses | strong; adds deps + hierarchy the template already wants (phase → bead) |
| template phases → beads | epic → child beads | same concept, same name |
| plan review count (2–5) | `set-state review:<n>` or `metadata`; gate `human` per review | workable (~) |
| `issue` (explained → approved → fixed, cause/fix/impact/owner/confidence) | bug + `human` gate + metadata | partial; ernie's approval gate + required fields don't exist natively |
| `question` (choices, recommend, Qx/N) | `bd human` beads | weak; no choices/recommend |
| `decision`, `fact` (confidence/method), terms | `bd remember` memories | weak; no confidence/method |
| `diagram`, `example`, `note` | none | — |
| inter-agent messaging (backlog v2) | message type, `--thread`, `bd mail` | possible later |
