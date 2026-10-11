# ernie — backlog from notes dump (2026-10-10)

The user's feature and concern notes, sorted against the spec (`spec_ernie.md`), build plan (`plan_ernie_build.md`) and formats study (`ref_ernie_formats.md`). Status per item: **new** · **covered** (existing decision named) · **conflict** (changes a locked decision). Phase: v1 · v2 · open.

## Priorities (work order agreed 2026-10-10)

Worked one at a time with the user, in this order. Recommended order puts items that reshape the others first.

1. **Beads research** — https://github.com/gastownhall/beads. "Ernie must use beads to track issues." Decides whether ernie's own `issue`/`plan` types and the template's phase → bead model survive.
2. **Planning flow** — how a plan is generated, reviewed, advanced and built; plans have many steps. Covers plan state + review count (2–5 reviews).
3. **Tab scopes** — session vs issue vs project vs worktree. VERY IMPORTANT for state: decide where the dropdowns go and how they filter everything. May reopen D4 (one log per repo + branch).
4. **Data model for state.**
5. **UI tabs.**
6. **Review visualization** — how code and plan review issues show on the page (new tabs, or inside Planning).
7. **v1 / phase 1 scope** — decide what is in v1 and phase 1. Must finish before phase 1 build starts.

User's original order: data model, UI tabs, tab scopes, review visualization, v1 scope, Beads (planning flow added later).

## Conflicts — resolve before phase 1 starts

| # | Note | Conflicts with | Question |
|---|------|----------------|----------|
| C1 | "We will build a memory system similar to .mem/. We will use ernie going forward for mem." | D9: `.mem` is the git-tracked home; ernie mirrors open items into `queue.md`; `.mem` never depends on ernie | Does ernie replace `.mem`, or keep feeding it? |
| C2 | "Init installs skills and hooks and claude.local.md" | D12: hooks are global in dotfiles `claude/.claude/settings.json`; `init` only creates the log. A112 already has `init` write `CLAUDE.local.md` | Should `init` install skills + hooks per repo (new), or stay log + `CLAUDE.local.md` only? |
| C3 | "Ernie must use beads to track issues" | ernie's own `issue` and `plan` event types; template's own "bead" (atomic task in a phase) naming | Beads replaces, backs, or sits beside ernie's issues/plans? Rename template beads if they differ? (answered by priority 1) |
| C4 | "There should be a button in UI to trigger `*um`" | v1 page can't start a turn; page actions wait for the next prompt. Channels (v2) can push into a live session | Button queues until next prompt (v1), or needs channels / headless `claude -p`? Same problem as the fact-research trigger question |

## Planning

- **Beads for issue tracking** — conflict C3 · priority 1 · research link above.
- **Plans: generate, track, advance, build** — new · v1? · need plan state and a count of reviews done; target 2–5 reviews per plan. Priority 2.

## Memory and state

- **ernie as the memory system** — conflict C1.
- **`*um` button on the page** — conflict C4.
- **"How will state be stored? jsonl?"** — covered: D1 append-only JSONL event log; D4 one log per repo + branch at `~/.local/state/ernie/<repo-slug>/<branch>.jsonl`. Tab scopes (priority 3) may reopen D4.

## UI

- **List of formats, approved and pending** — covered: `ref_ernie_formats.md` (A88–A94 decided).
- **Dismissal checkboxes on trivial issues** — covered: page already posts `issue set dropped` (A89). Checkbox is a UI change only.
- **Track knowns / unknowns / assumptions** — covered: facts with ✓ verified · ~ inferred · ✗ unknown (A91), `ernie ask --assume` (A113), Facts tab in `ref_ernie_views/00-template.html`.
- **Scratch tabs** — new · open · agent spins up ephemeral tabs and fills them with prefab elements: tables, diagrams, bullets, etc. Note spec defers `table` to v2; `example` (scoped table, A90) and `diagram` (Mermaid) exist.
- **Flow format** — new · open · user asks for the flow of an app (or one section of it). No visual diagram: single lines that follow each other, each line explains one step, in order. (Spec writing rule already says long flows → numbered steps; a page element for it is new.)

## Inter-agent communication — v2 or later

- What's the best channel for agents to talk: SQLite? JSONL?
- Research: openrig https://github.com/mvschwarz/openrig · agent-flywheel https://agent-flywheel.com/complete-guide
- How and when do agents check messages — hooks?

## Review and checks

- **Review swarms for PRs and plans** — new · open · code and plans each need 2–5 reviews from an agent with fresh context. User babysits at first, automates later. Visualization undecided (new tabs, or in Planning) → priority 6.
- **Offload low-priority decisions/fixes** — new · v2 maybe.

## Misc

- **`init` installs skills, hooks, `CLAUDE.local.md`** — conflict C2.
- **Workspaces: track / add / kill** — new · open · workspace = worktree or project (needs decision); likely a project dropdown with a worktree dropdown next to it. Ties to priority 3.
- **Claude Code pushes info to the ernie CLI; TUI output stays minimal** — covered: A108 (don't restate the page; name ids).
- **Robust logging for debugging ernie itself** — new · v1 · "we are going to use Ernie to build Ernie."
- **Tool Log shows which agent ran each tool (subagents)** — covered: A114 tags subagent rows. Still open in the 1.1s spike: does the `*` matcher catch Agent/MCP calls.

## Conflict discussion (2026-10-10 session)

Walked one at a time. None decided yet. ✓ = read in spec/docs, ~ = inferred.

### New open question (gates C1): git-track the JSONL log?
- Today: `~/.local/state/ernie/<repo-slug>/<branch>.jsonl`, spec line 77: "kept out of every repo so work repos don't need gitignore changes, and never put in git." User unsure they like that; asked "shouldn't it be git tracked?"
- Cost of tracking: every tool call appends a `tool run` row (A114) → working tree always dirty; commits carry log noise; per-branch log (D4) merges into main with the branch; ernie files land in employer repos.
- Gain: state travels with repo, history, other machines, other agents can read it.
- Middle path offered: activity stream (tool rows, turn marks) stays local; durable items (plans, decisions, facts, issues) tracked — as `.mem` markdown (C1 option C) or in Beads (syncs via hidden `refs/dolt/data`, doesn't dirty the tree ✓ docs, not run).
- Asked user what they want from tracking: (1) backup / other machines, (2) task history, (3) other agents / teammates read it, (4) other. User deferred.

### C1 — ernie replaces .mem or feeds it — deferred (waits on git-tracking question)
- A. Feed (D9 as spec'd): ernie log → `*um` → `ernie mem delta` → main thread judges → mem-ops writes `.mem` → `ernie mem synced`.
- B. Replace: memory lives only in ernie JSONL under ~/.local/state; `.mem` retired. Leaves git, other machines, other agents; `/mem`, `*mr`, mem-ops rebuilt.
- C. ernie owns the writing, `.mem` stays the store: `ernie mem add gotcha …` writes straight into `.mem/long.md` (tag + dedupe) and logs an event. Drops mem-ops subagent and delta/synced cursor (A30). Cost: ernie must learn `.mem` format rules now in the mem skill.
- Recommendation: C. Note Beads has its own memory (`bd remember` / `bd prime`) → third memory path unless one is picked (ties to C3).

### C2 — what `ernie init` installs — deferred to next session
- Today (D12 + A112): hooks global in dotfiles `claude/.claude/settings.json`, skill in dotfiles; `init` = log + `CLAUDE.local.md` rules block. Hooks fire in every repo, exit early with no log.
- A. Keep D12.
- B. Per repo: `init` writes hooks to `<repo>/.claude/settings.local.json` + skill to `<repo>/.claude/skills/ernie/`. Pro: works without dotfiles, hooks only in ernie repos. Con: per-repo copies go stale on ernie updates; maybe per worktree (~).
- C. Split: new `ernie setup` installs hooks + skill globally from files embedded in the binary (like `bd setup claude --global` ✓ docs); `init` stays log + `CLAUDE.local.md`. Catch: dotfiles settings.json is git-controlled, likely symlinked (~) → setup shows as a dotfiles diff.
- Recommendation: C.
- User reply: hadn't considered hooks/skills going stale. Idea to discuss: an `ernie update` command that pulls from the main ernie repo.

### C3 — Beads vs ernie issue/plan types — options presented, not answered
- Research: ref_ernie_beads.md.
- A. Beads owns plans + issues (issue = bug bead + `human` gate + cause/fix/impact in `metadata`); ernie keeps question, decision, fact, diagram, example, note; page reads Beads via events journal or Go lib. Template "bead" naming stays.
- B. Beads owns plans only; ernie keeps its issue type + approval gate.
- C. Beside, no v1 integration.
- Recommendation: A, lock direction now, then spike before phase 1: install `bd`, concurrent writes from parallel subagents (embedded mode = single writer ✗ unchecked), turn on events journal.
- Costs of A: scope mismatch (Beads = one workspace for all worktrees vs D4 per repo+branch → pulls in P3); API churn (1.4 schema change → pin version).

### C3 update — spike done (parallel session, 2026-10-10)
- Spike ran (bd 1.3.1, stealth, scratchpad) → results in ref_ernie_beads.md "Hands-on spike". Settles: parallel writers queue, don't fail (20/20, ~0.55 s/write); events follow ~0.66 s; Go lib not viable (embedded Dolt needs cgo + ICU; 48–144 MB) → shell out to `bd --json` + `bd events tail --follow`.
- That session's split (presented as its "A"): Beads = plans, phases, beads, review counts, approved fixes; ernie JSONL = questions, decisions, facts, **explained issues**, examples, diagrams, notes. ≈ option B above + approved fixes become beads. Needs reconciling with A above (where do explained issues + approval gate live?).
- Beads has no plan/phase object: phase = `epic` bead, children via `--parent` (≤3 levels), plan = the graph. Plan-as-document lifecycle (draft → reviewed ×N → approved → building) is ours to model (ernie, or Beads labels/`metadata`) → settle in P2.

### C4 — `*um` button trigger — not discussed yet
