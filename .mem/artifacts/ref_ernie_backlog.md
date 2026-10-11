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
