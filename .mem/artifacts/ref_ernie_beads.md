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

## Review findings as Beads issues (spike 2026-10-10)

Ran in the same scratch workspace. One finding from reviewing bead `proj-d7k.2`:

```
bd create "Retry drops 429s" -t bug -p 1 -l review,review:r1 --deps discovered-from:proj-d7k.2 \
  --description … --design … --acceptance … \
  --metadata '{"cause":…,"impact":…,"owner":"us","confidence":"inferred","method":…}'   # → proj-7aq
bd gate create --type=human --blocks proj-7aq --reason "approve fix"                   # → proj-30e
```

- ✓ Finding stored with type bug, priority, labels, the 3 text fields, and `metadata` JSON round-tripped intact.
- ✓ Gate open → finding NOT in `bd ready`. `bd gate resolve proj-30e --reason "approved, fix it"` → finding enters `bd ready`.
- ✓ Findings for a reviewed bead: `bd dep tree <bead> --direction=up` lists the `discovered-from` children. (`bd show --json` `dependents` came back empty; `dep tree` default direction shows only what the bead depends on.)
- ✓ Findings across all work: `bd list --label review`.
- ✓ Dismiss trivial: `bd q "…" -t bug -l review` then `bd close <id> --reason "dismissed: trivial"` → `status: closed`, `close_reason` kept. No separate "dropped" status; dismissed vs fixed differ only by close reason (or a label).
- ✓ Comments: `bd comment <id> "…"`, `bd comments <id>` → place for reviewer 2..N to agree/disagree.
- ✓ Other relevant: `bd defer <id> [--until …]` (postpone, leaves `bd ready`); `bd q` quick capture prints only the id; `--external-ref gh-42` for PR-level findings with no bead; `bd find-duplicates` (same title/description/design/acceptance) for merging overlapping findings from several reviewers; `bd lint` warns when a bug lacks Steps to Reproduce / Acceptance Criteria.

### No auto-fix; what drives agents (spike 2026-10-10)

- ✓ Beads runs no agents. The only "auto" is `bd prime` (installed by `bd setup claude` as a SessionStart hook) telling the agent: use beads for ALL tracking, create an issue before coding, `bd ready` → `--claim` → `bd close`. Skip `bd setup`/`bd prime` → nothing picks up work on its own.
- ✓ `bd prime` (4.9 KB) also says "Do NOT use MEMORY.md files", "Prohibited: TodoWrite, TaskCreate, markdown files for task tracking", "use `bd remember`" → clashes with `.mem`. ernie should write its own guidance, not install `bd prime`.
- ✓ `bd gate` is native (bd 1.3.1 CLI reference + ran it). An open gate keeps the finding out of `bd ready`, so even an agent following `bd prime` won't grab an unapproved finding.
- ✓ Metadata: `bd update --metadata '{…}'` MERGES keys (not replace); also `--set-metadata k=v`, `--unset-metadata k`. Filter: `bd list --all --metadata-field resolution=dismissed` (plain `bd list` hides closed).
- ✓ Documented metadata convention `execution_agent_type` / `execution_suggested_model` (docs/core-concepts/metadata.md) → can carry the page's "send to main agent vs subagent" choice.

### ernie issue → Beads mapping

| ernie issue | Beads |
|---|---|
| `explained` | open bug + open `human` gate |
| `approved` | gate resolved |
| `fixed` | bug closed (reason = fix / commit) |
| `dropped` | bug closed + `metadata.resolution = dismissed` (fixed → `resolution = fixed`); close reason stays free text |
| cause, impact, owner, confidence, method, example | `metadata` keys (no schema, nothing required) |
| fix | `--design` |
| Nth review round | label `review:rN` |
| "Claude can't approve without your words" (A105), "can't mark fixed before approved" (A89), required fields (A88–A91) | **nothing** — anyone, Claude included, can `bd gate resolve` or `bd close`. ✗ Enforcement would need ernie: page/ernie CLI as the only approve path, or a PreToolUse hook denying Claude's `bd gate resolve` |

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

## Backup and sync (spike 2026-10-10, scratch repo `bdsync/` with a local bare remote)

- ✓ `bd init` (non-stealth, `--skip-agents`) in a git repo with `origin`: wired Dolt remote `origin` = `git+file://…/remote.git`; made its own git commit "bd init: initialize beads issue tracking" (10 files: `.beads/.gitignore`, README, config.yaml, metadata.json, 5 hooks in `.beads/hooks/`, root `.gitignore`); set `core.hooksPath=.beads/hooks`. Dolt data (`.beads/embeddeddolt/`) is git-ignored.
- ✓ After `bd create` nothing left the machine. `bd dolt push` → remote gained `refs/dolt/data` and branch `refs/heads/__dolt_remote_info__`.
- ✓ Created a 2nd bead, then plain `git push` → `refs/dolt/data` unchanged. git push does not sync beads.
- ✓ Fresh `git clone` + `bd bootstrap` → restored the 1st bead only (the unpushed 2nd was lost).
- ✓ Docs (docs/reference/configuration.md): `dolt.auto-push` default `false`, `auto-push-interval` 5m, `auto-push-timeout` 30s; "opt-in because concurrent pushes to git-protocol Dolt remotes can corrupt or strand remote history when multiple writers race". `backup.enabled` (default false, 15m, to `.beads/backup/`), `backup.git-repo` (separate local repo), `backup.git-push`, `export.auto` (JSONL export, not sync). Post-write order: auto-commit → auto-backup → auto-push.

## Intended git workflow — web research + spike (2026-10-10)

### History (why it's weird)
- ✓ ≤ v0.49 (early 2026): SQLite local DB + `.beads/issues.jsonl` **committed to git with the code** (needed a sync branch + daemon for worktrees). (github.com/steveyegge/beads/discussions/2332, /1836)
- ✓ v0.50+ switched to Dolt; v0.56.1 (2026-02-22) server-only; v0.63.0 (2026-03-29) embedded back as default; v1.0.0 (2026-04-02) stable. JSONL demoted to an export.
- ✓ Why Dolt (maintainer-side answer, disc. 1836): concurrent multi-agent writes (SQLite WAL contention), per-mutation version history (`dolt_log`/`dolt_diff`), SQL queries, cell-level merge across clones. Same answer admits: "If you're running one agent on one project, v0.49.6 SQLite is genuinely simpler and sufficient."
- ✓ Users in disc. 2332 were just as confused ("I have absolutely no idea how I'm supposed to use beads now"); docs called LLM-generated and stale.

### Intended model now
- `.beads/` config tracked in git; Dolt data (`.beads/embeddeddolt/`) git-ignored, local only.
- Sync/backup = Dolt remote, separate from code: `bd dolt push/pull`. Remote can be DoltHub, a filesystem path, or the **same git origin** (data under `refs/dolt/data`, a non-branch ref plain clone skips). `bd init` auto-wires origin as the Dolt remote; fresh clone → `bd bootstrap`.
- Git-backed Dolt remote trade-offs (disc. 2332): no tablefile compaction, no GC of `refs/dolt/data`, slower than native Dolt remotes; fine for a few hundred issues (single-digit MB). Prune: `git reflog expire` + `git gc` on that ref.

### Spike: JSONL committed with the code (`export.auto` + `export.git-add`)
- ✓ `bd config set export.auto true`, `export.git-add true`, `export.interval 0s` → `.beads/issues.jsonl` written, but left **untracked / unstaged** (git-add didn't stage it).
- ✓ Committed it by hand. bd's pre-commit hook re-exported during the commit ("Exported 3 issues") but the commit kept the **stale 2-issue file**; working copy then lagged the DB too (3 in JSONL, 4 in DB). → export lags writes; needs an explicit `bd export` + `git add` right before each commit.
- ✓ Fresh clone, Dolt ref present → `bd bootstrap` restored from `refs/dolt/data` and ignored the committed JSONL.
- ✓ Fresh clone, Dolt ref deleted → `bd bootstrap` imported from committed `issues.jsonl` ("Imported 2 issues"). So committed JSONL works as a fallback backup. Import is upsert-only (can't see deletions).
- Fresh clone without bootstrap: `bd list` → "no beads database found".

### Other
- beads_rust (github.com/Dicklesworthstone/beads_rust): Rust port keeping the old model (SQLite + JSONL export for git). Not evaluated.
