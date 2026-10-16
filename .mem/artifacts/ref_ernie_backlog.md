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
7. **v1 / phase 1 scope** — decide what is in v1 and phase 1. Must finish before phase 1 build starts. Includes (added 2026-10-15):
   - **Template → spec audit** — walk 00-template; every small convenience feature (keys, Undo, chips, jump links, badges, etc.) must be written into the spec.
   - **Spec → template audit** — walk the spec; every v1 element must show in 00-template.
   - **Security model review** — go over the security model before bootstrap (1.1).
8. **Debug logging for ernie** (added 2026-10-15) — how ernie logs its own behaviour for debugging (hooks, CLI, server, page POSTs, fold warnings): what gets logged, where, levels, rotation, how to read it. Goal since day one: "robust debug logging from the start". Must finish before phase 1 build starts.

User's original order: data model, UI tabs, tab scopes, review visualization, v1 scope, Beads (planning flow added later).

## Conflicts — resolve before phase 1 starts

| # | Note | Conflicts with | Question |
|---|------|----------------|----------|
| C1 | "We will build a memory system similar to .mem/. We will use ernie going forward for mem." | D9: `.mem` is the git-tracked home; ernie mirrors open items into `queue.md`; `.mem` never depends on ernie | Does ernie replace `.mem`, or keep feeding it? |
| C2 | "Init installs skills and hooks and claude.local.md" | D12: hooks are global in dotfiles `claude/.claude/settings.json`; `init` only creates the log. A112 already has `init` write `CLAUDE.local.md` | DECIDED 2026-10-11: C + `ernie update` (see below) |
| C3 | "Ernie must use beads to track issues" | ernie's own `issue` and `plan` event types; template's own "bead" (atomic task in a phase) naming | Beads replaces, backs, or sits beside ernie's issues/plans? Rename template beads if they differ? (answered by priority 1) |
| C4 | "There should be a button in UI to trigger `*um`" | v1 page can't start a turn; page actions wait for the next prompt. Channels (v2) can push into a live session | DEFERRED to v2 2026-10-11 (no button in v1; see below) |

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

### Git-track the JSONL log — DECIDED 2026-10-10: no
- Tool rows only matter live; durable items reach git via .mem (decisions/facts) and Beads (plans/issues).

### C1 — ernie replaces .mem or feeds it — deferred (waits on git-tracking question)
- A. Feed (D9 as spec'd): ernie log → `*um` → `ernie mem delta` → main thread judges → mem-ops writes `.mem` → `ernie mem synced`.
- B. Replace: memory lives only in ernie JSONL under ~/.local/state; `.mem` retired. Leaves git, other machines, other agents; `/mem`, `*mr`, mem-ops rebuilt.
- C. ernie owns the writing, `.mem` stays the store: `ernie mem add gotcha …` writes straight into `.mem/long.md` (tag + dedupe) and logs an event. Drops mem-ops subagent and delta/synced cursor (A30). Cost: ernie must learn `.mem` format rules now in the mem skill.
- Recommendation: C. Note Beads has its own memory (`bd remember` / `bd prime`) → third memory path unless one is picked (ties to C3).

### C1 — DECIDED 2026-10-10: C, extended
- Repo memory = ernie primitive. ernie writes it directly; no separate mem skill, no mem-ops subagent.
- `.mem/` moves inside `.ernie/` (repo root). Current mem skill retired as its own skill; triggers (`*um`, `*mr`, `/mem`, `*op`, `*ar`) rework into ernie skill/CLI.
- Drops: D9 queue mirroring, `mem delta` / `mem synced` + cursor (A9, A24, A30, A48), mem-ops handoff.
- Beads memory (`bd remember` / `bd prime`) not used.
- Scope (2026-10-11): memory per worktree/branch everywhere (matches D4 log scope, user's work habit). New worktree starts empty; nothing copied from main.
- Init once per repo: `ernie init` stores repo kind in `git config` (shared across worktrees; `extensions.worktreeConfig` unset ✓). Per-worktree mem dir + log created lazily on first session.
- Personal repos: committed at `.ernie/mem/<branch>/` → feature merge adds a folder, no conflicts; old feature memory stays readable.
- Work repos: `.ernie/` excluded via `.git/info/exclude`, set manually by user; memory dies with worktree.
- Migration of old `.mem/` dirs: manual, user triggers when ernie memory lands; mem skill runs until then.
- Open: can a feature worktree read main's memory (gotchas/arch), or fully isolated? Default isolated, revisit later.

### C2 — what `ernie init` installs — deferred to next session
- Today (D12 + A112): hooks global in dotfiles `claude/.claude/settings.json`, skill in dotfiles; `init` = log + `CLAUDE.local.md` rules block. Hooks fire in every repo, exit early with no log.
- A. Keep D12.
- B. Per repo: `init` writes hooks to `<repo>/.claude/settings.local.json` + skill to `<repo>/.claude/skills/ernie/`. Pro: works without dotfiles, hooks only in ernie repos. Con: per-repo copies go stale on ernie updates; maybe per worktree (~).
- C. Split: new `ernie setup` installs hooks + skill globally from files embedded in the binary (like `bd setup claude --global` ✓ docs); `init` stays log + `CLAUDE.local.md`. Catch: dotfiles settings.json is git-controlled, likely symlinked (~) → setup shows as a dotfiles diff.
- Recommendation: C.
- User reply: hadn't considered hooks/skills going stale. Idea to discuss: an `ernie update` command that pulls from the main ernie repo.

### C2 — DECIDED 2026-10-11: C + `ernie update`
- `ernie setup` (once per machine): writes guarded hook entries (`[ -x … ] && ernie hook || true`, every event → `ernie hook`, binary routes on `hook_event_name`) + stub skill to `~/.claude` (symlinked into dotfiles ✓ → shows as dotfiles diff, commit it). Idempotent, prints diff.
- Stub skill: frontmatter description + `allowed-tools: Bash(ernie skill:*)`; body = `` !`ernie skill` `` → rules text comes from binary at load. No settings allow rule needed.
- `ernie update`: pull source → `go build` → install `~/.local/bin` → `ernie setup`.
- `ernie init` (once per repo): repo kind in `git config` + `CLAUDE.local.md` rules block.
- Still stale-able: skill description (read before load), hook entries on new event types → both rewritten by `setup`.
- Probe (2.1.287, Haiku -p, 2026-10-11) ✓: `` !`cmd` `` in SKILL.md runs at load, output replaces the line; works on `/skill` and model-invoked Skill; frontmatter `allowed-tools` alone suffices, even in untrusted dir; no permission → not run (model sees "requires approval"; slash → empty reply). Claude itself makes no Bash call.
- CLAUDE.local.md block (decided 2026-10-11, option b): block carries a version stamp; SessionStart hook compares stamp vs binary version, rewrites block when older → each repo self-heals on next session; stays visible/editable. Rejected: a (SessionStart inject, no file → invisible), c (registry walked by `update` → extra state, breaks on moved repos).
- `ernie update` source (decided 2026-10-11, option a): pull `origin/main` into `~/things/myc/ernie/main` → build. Refuses (with message) if that worktree is dirty or not on `main`. Installed binary = pushed code. Rejected: b (build checked-out, drifts from origin), c (a + `--here` for feature worktrees; revisit if needed).

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

### C3 — DECIDED 2026-10-10
- Beads holds plans (epics → beads, PRD markdown stays ernie/.mem side) AND issues (review findings, `human` gate for approval, `metadata.resolution` for fixed/dismissed). ernie keeps question, decision, fact, diagram, example, note. No `bd prime`. Details → ref_ernie_beads.md.

### C4 — DEFERRED to v2 (2026-10-11)
- No `*um` button in v1 page. Revisit with v2 channels ("Send now", spec v2 section).
- Options as presented: A queue till next prompt (UPS hook), B channels push (research preview, dev-flag warning each launch, org `channelsEnabled`), C headless `claude -p --resume` (✗ interleaves transcript, TUI blind), D split: ernie writes mechanical items now (C1 makes it possible), judgment part queued. Rec was A now, B in v2.

### Fact research trigger — DEFERRED to v2 (2026-10-11)
- v1: no research trigger from the page.
- v2 design (headless, fresh session, NOT `--resume`): page "research" click → ernie server spawns `claude -p --model sonnet --allowedTools "WebSearch WebFetch Read Bash(ernie fact set:*)" "<prompt template embedded in binary + fact text + id>"` in the worktree → child writes `ernie fact set <id> --confidence … --method …` → page updates from log. Fresh session fits: fact research needs no convo context; own transcript, live session untouched.
- Guard — inbox theft (~ inferred): global hooks fire in child; its UPS would deliver pending page notes to the headless run. Server sets `ERNIE_HEADLESS=1`; hooks skip Inbox delivery (+ turn marks) when set.
- Guard — permissions: `-p` denies non-allowed ✓; allowlist = read-only research + `ernie fact set` only, no edits.
- **Security (must address before shipping):** POST that spawns a process >> POST that appends a log line. Any website can POST to localhost (CSRF / DNS rebinding) → research endpoint must sit behind the spec's existing POST checks (Host allowlist, same Origin, per-start token via `hello` frame; spec_ernie.md ~L226) — already planned for v1 PostOps, so reuse, don't add; cap concurrent runs; per-run timeout + kill; fact text goes into a prompt → treat as untrusted (prompt injection from fact content/web pages; allowlist limits blast radius to `ernie fact set`); log spawned runs (who/when/fact id). Spend: each click = full session on user's subscription.
- Needs: CLI to update fact confidence/method/text (queued spec amendment).

### Open qs walk (2026-10-11)
- **Q1 page bead/issue buttons — DECIDED: direct.** ernie server runs `bd` itself on click (no Claude, no queue), behind existing POST checks (Host/Origin/token). Must-have: **dismiss issue** button (nits, low-priority findings) → `bd update <id> --set-metadata resolution=dismissed` then `bd close <id> --reason "dismissed: <optional note>"` (both ✓ spike). Spawns a process per click (unlike log-append PostOps) → allowlist fixed `bd` subcommands + id validation, no free text into argv beyond the note.
- **Progressive reviews must not restate dismissed findings** (user req). Round N reviewer gets dismissed findings for the reviewed bead (`bd dep tree <bead> --direction=up` → closed + `resolution=dismissed`; or `bd list --all --metadata-field resolution=dismissed`) in its prompt; told not to re-report them.
  - Dedup mechanism — DECIDED: prompt only (v1). Reviewer prompt lists dismissed findings (summary, file, close reason) + "don't re-report". No fingerprint fields / ernie-side matching (rejected for v1; revisit if reworded repeats get through).
  - Dismissal scope — DECIDED: this bead only. Round N prompt gets dismissed findings `discovered-from` the reviewed bead only. Rejected: whole epic; repo-level "never report this kind" preference list (revisit if same-kind nits recur across beads).
- **Q2 Planning tab placement — DECIDED (for now):** 2nd after Home, as in 00-template.html (Home · Planning · Issues · Facts & decisions · Tool log). User will adjust UI later.
- **Q3 feature worktree reads main's memory? — DECIDED: fully isolated.** New worktree starts empty; no live read of main's durable sections, no copy at creation. Note (~): personal repos commit `.ernie/mem/main/`, so a feature checkout carries main's memory as of branch point → ernie loads only `.ernie/mem/<own branch>/`, ignores other branch dirs.
- **Q4 `/` in branch names for mem dirs — DECIDED: escape like logs.** `.ernie/mem/feat%2Flogin/` (`%`→`%25`, `/`→`%2F`, spec_ernie.md:82, plan 1.3); one shared escape func for log file + mem dir. Rejected: nested dirs (branch vs namespace ambiguity, second rule), `--` replace (collision, lossy).

### P2 planning flow — DECIDED 2026-10-11
Research input: ref_agent_flywheel.md (agent-flywheel guide + X posts; Claude-only, no multi-model).
- **Q1 PRD location — DECIDED:** worktree-scoped ernie memory `.ernie/mem/<branch>/artifacts/prd_<topic>.md`. Write the PRD in the worktree that builds it (Q3 isolation → main's PRD not in feat/x memory).
- **Q2 lifecycle/review state — DECIDED: epic at draft time, Beads tracks all.** `bd create -t epic` when PRD drafted; PRD path in `spec_id` (✗ flag unchecked in bd 1.3.1; fallback `metadata.prd`). State labels `set-state plan=draft|review|approved|polish|breakdown-review|building|done`; `review=N`. Open `human` gate on draft epic keeps it out of `bd ready` (epics show in bd ready ✓ spike). PRD review 2–5 rounds, fresh-context agents; findings = bug beads `discovered-from:<epic>`, label `review:rN`; dismiss/dedup as Open qs walk. Approve = user only (page button / own terminal) → gate resolved, `plan=approved`. Rejected: status in PRD frontmatter (findings have no parent bead); ernie `plan` events (reopens C3).
- **Q3 PRD → beads — DECIDED:** after PRD approval, a FRESH agent (not main agent; tests PRD is self-contained) breaks it into child beads (`--parent`, `--description`/`--design`/`--acceptance`, `blocks` deps, `metadata.prd=<path>#<section>`) → polish rounds, each a fresh agent (cap 5 with early stop: only small corrective edits / two clean rounds / edit totals stop shrinking; supersedes the earlier 2–3 rounds → "Beads workflow — DECIDED 2026-10-15" Q6) → `plan=breakdown-review`, second `human` gate; user approves shown a two-way transfer-audit report (PRD sections w/o beads; beads w/o PRD backing), not every bead → `plan=building`, beads enter `bd ready`. All children closed → `plan=done` (~ bd epic close-eligible helper ✗ unchecked; else ernie checks).
  - Tweaks accepted (from X posts): (a) every polish round rereads the PRD + checks coverage (audit runs each round, not only at end); (b) each round fresh agent, handed prior rounds' summary comments; (c) polish fails any bead whose design/acceptance just says "see PRD §X" — bead must be buildable without the PRD; `metadata.prd` kept as audit aid only.
  - Adopted from flywheel: plan→beads stop rule (still redesigning product → PRD; packaging work → beads), two-way audit, polish stop rule (oscillation/growth = red flags), overshoot "you missed many" review prompt, agree/somewhat/disagree triage when applying findings, dedup pass after breakdown. Out of scope: multi-model, swarms, 200–500-bead scale.
- **Q4 polish-round tracking — DECIDED:** polishers edit beads directly; one summary comment per round on the epic (`rN: X edits (Y major) · merges`); `polish=N` label; stop rule reads counts from comments; Beads audit history keeps edits traceable. Rejected: polish findings as beads (10–30 extra beads/plan).
- **Q5 implementation-bead code review — DECIDED: per bead as finished.** Bead stays `in_progress`, `review=N` on bead. Fresh reviewer per round (bead + its diff); findings per C3 (bug, `discovered-from:<bead>`, `review:rN`, human gate, resolution fixed/dismissed; dismissed listed in later rounds). Stop: min 2 rounds, stop at first clean round, cap 5 → still finding at 5 = flag user, don't loop. Close when last round clean + no open findings; no user approval of bead close. Rejected: per-epic PR-style review (bugs propagate; breaks per-bead dismissal scope); user approves every close.
  - Spec details left: block close on open findings via `blocks` deps finding→bead (✗ whether `bd close` enforces, else ernie wrapper).
- Planning tab: count test beads separately (closed-count misleads when open beads are tests; X posts).

### P3 tab scopes — DECIDED 2026-10-11
D4 (one log per repo + branch) stands. Stores after P2: ernie log = repo+branch; ernie memory = worktree; Beads = one store per repo (all worktrees) → scoped by label (Q3).
- **Q1 picker — DECIDED: one picker at top, worktree level, applies to every tab.** No per-tab worktree pickers (drop the template's per-tab scopeSelect). Worktrees grouped by project (repo) inside the picker; no separate project picker. Tabs may get sub-pickers later for non-worktree reasons.
- **Q2 mental model — DECIDED: everything belongs to one worktree; inside it, work is planned (epic) or ad hoc.** Tree: worktree → epic (PRD, PRD-review findings `discovered-from` epic, beads → code-review findings `discovered-from` bead) | ad hoc (findings with no parent, label `adhoc`). Finding source = its parent (epic → PRD review, bead → code review, none → ad hoc); no separate source field. Issues tab groups by epic title + "Ad hoc". Questions/decisions/facts/notes (ernie log) belong to the worktree, optional link to epic/bead id. Sessions are a filter (when), not a container. Bead polish creates no issues (polishers edit directly, P2 Q4 unchanged). Rejected: per-worktree "Ad hoc" container epic (fake epic, in bd ready, never finishes).
- **Q3 Beads worktree scoping — DECIDED: one shared Beads store per repo + label `wt:<branch>` on every bead (epics, children, findings).** Page: `bd list --label wt:<branch>`; Claude told to `bd ready --label wt:<branch>`. Keeps decided personal-repo backup (Dolt remote on origin, auto-push); repo-wide view still possible. Enforcement of label on every bead TBD in spec: ernie wrapper for `bd create`, or hook adding it (✗ whether PreToolUse can rewrite the command), or at least a page "unlabelled beads" bucket. Rejected: per-worktree BEADS_DIR (all stores push same hidden ref `refs/dolt/data` → overwrite ~; per-worktree ref scheme ✗ unchecked).
- **Q4 register/deregister — DECIDED: explicit archive + "folder gone" flag.** `ernie init` registers (log exists → in picker under its repo). `ernie archive` (CLI) or page Archive button writes `<branch>.archived` marker next to log, implies off; hidden from picker; log, memory, beads kept; picker "Archived (N)" entry to view/restore (restore = remove marker). Page flags `<branch> · folder gone` when the worktree folder no longer exists, with Archive button; never auto-hides. Project leaves picker when all its worktrees archived. `off` (pause logging, still visible, greyed) stays distinct from archive (finished, hidden). Spec addition: `meta init` records the worktree folder path. Rejected: auto-archive (hides by mistake on rename/move; server polling git), archive without flag.
- **Q5 sessions — DECIDED: record `sid` on every event; session sub-filter only on the Tool log.** Source: hook payload `session_id` ✓, Claude Bash `CLAUDE_CODE_SESSION_ID` ✓. Page/user events carry no sid. Tool log sub-filter: All sessions / <sid> (state). Issues, Planning, Facts stay worktree-wide. Rejected: no filter in v1; session filter on every tab (cuts across Q2 model).

### P4 data model for state — DECIDED 2026-10-13 (started 2026-10-11)
**What P4 is:** one map of where every piece of state lives, and how the page + `ernie dump` join them. Why now: C1, C3, P2, P3 split state over 3 stores; spec still describes one log with `plan`/`issue`/`mem` types (spec_ernie.md:105).

**Example traced — decision "use bd, not br" touches all 3 stores:**
1. Claude runs `ernie decide "use bd" --why license` → `d3` in JSONL (untracked).
2. Durable → also belongs in `.ernie/mem/main/long.md` arch (committed).
3. It shaped epic `ernie-7k2` in Beads → link?

**Store map (proposed, from decisions already made; ✗ = overlap still open)** — user asked to keep this table:

| Store | Where | Git | Holds |
|---|---|---|---|
| Log | `~/.local/state/ernie/<slug>/<branch>.jsonl` | no | question, decision, fact, diagram, example, note, file, tool, turn, meta (+ `sid`) |
| Memory | `.ernie/mem/<branch>/` | personal only | ops, learnings, gotchas, arch, ref, tags, daily, artifacts (PRDs); queue.md retired (Q2) |
| Beads | one store/repo, `wt:<branch>` label | via Dolt ref | epics, beads, findings |

Dropped from log: `plan`, `issue`, `mem sync`.

**Questions (one at a time):**
- Q1 how does a log decision/fact become durable / reach git? (OPEN — see below)
- Q2 `queue.md` fate: "next" overlaps ad hoc beads; "qs" overlaps ernie questions
- Q3 cross-store links: `ref` field (decision → bead id; memory line → log id)
- Q4 server assembly: log fold + Beads snapshot (`wt:` filtered, kept fresh by `bd events tail`) → one SSE state
- Q5 `ernie dump`: what Claude gets from each store
- Q6 envelope/op changes: `sid`, `fact set` (confidence/method/text), drop dead types

**Q1 options as presented:**
1. `*um` = Claude judges, runs `ernie mem add <section> "…" --from d3`; log stays transient; memory line carries source id. (was recommended)
2. Auto: every decision / verified fact auto-copies to memory → noise (many decisions branch-local)
3. Memory arch/learnings rendered from log → lost, log untracked
4. (added) **Split log:** activity file stays local (`tool`, `file`, `turn` — the noisy rows); durable file git-tracked, e.g. `.ernie/mem/<branch>/items.jsonl` (questions, decisions, facts, notes — rare writes). Makes Q1 mostly moot (decisions already in git; memory could be rendered from them). Cost: tracked file changes whenever Claude logs a decision → commits carry those lines; reopens D1 (one log = source of truth) + fold.

**Drive-loss analysis (if the machine's disk dies):**
- JSONL log gone; nothing rebuilds it; long.md doesn't recreate it (it's a separate durable record).
- Survives (personal, only if pushed): memory via `git push`; Beads via `bd dolt push` (auto-push ≥5 min apart → last minutes at risk ✓ spike).
- Lost: open questions (real loss — today they live in git-tracked queue.md), decisions/facts never promoted, diagrams/examples/notes, tool log (fine).
- Work repos: lose all (`.ernie/` excluded, Beads stealth, no remote) → work-repo backup TBD.
- Risk = gap between "logged" and "promoted"; option 1 only closes it if `*um` runs often.

**User direction (2026-10-11):** "we need a way to put some of it in git. Maybe the split log idea." User works between 2 machines on personal repos → ernie state must transfer via git. Leaning option 4 (split log). Not yet decided. Resume here next session.

**Q1 — DECIDED 2026-10-13: option 4, split log.** Activity (`tool`, `file`, `turn`, `meta`) → `~/.local/state/ernie/<slug>/<branch>.jsonl` (local). Durable items (question, decision, fact, diagram, example, note + their set/answer/dismiss) → `.ernie/mem/<branch>/items.jsonl` (git-tracked, personal repos). `*um` stays as curation into long.md, not transport. D1 rewords: two append-only files, each event type in exactly one. User confirmed: one machine at a time per branch, pull before work.
- **F1 id collisions — DECIDED:** keep short sequential ids (`d4`). Fold rule (spec:287) changes: `add` on existing id with same text → no-op (retry); other text → kept as `d4′` + `State.Warnings "d4 collided"` → page banner + dump line; user renames by hand. Rejected: random ids (tokens, typing), machine-suffixed ids.
- **F2 inbox ordering — DECIDED:** `turn mark` carries a cursor = `items.jsonl` line count (`turn mark {n:7, items:40}`), written to the activity file. Inbox = `by:user` InboxOps in items lines past the cursor. Pulled lines from the other machine past the cursor → delivered next prompt (intended). Cursor > file length (rebase/checkout) → nothing pending, next mark resets. One lock file in `~/.local/state` covers both files (keeps spec:87 single-lock rule). Rejected: ts merge-sort (pulled answers land before the mark, never delivered), turn mark in items.jsonl (git noise every prompt).
  - F2 seed mark (2026-10-13): activity file created (disk loss, new machine, fresh clone) → first write = `turn mark {items: <current line count>}` before any delivery; else no mark → inbox replays every past answer (spec:296). Loss = only unpushed answers on the dead machine.
  - F2 known limit (accepted 2026-10-13): forgot pull + unpushed items + `pull --rebase` → rebase puts remote lines first → cursor redelivers own answers once, misses the other machine's. Rejected fix: cursor = delivered event keys (more state).
- **F3 git merges — DECIDED:** `ernie init` (personal) writes `.ernie/mem/**/items.jsonl merge=union` to `.gitattributes` (`**`, since `*` doesn't cross `/`). Scratch test git 2.47.1 ✓: no attr → conflict (merge + pull --rebase); union → no conflict, all lines kept; merge order = ours then theirs, rebase/`pull --rebase` = upstream then local → line order ≠ time order; byte-identical lines collapse to one (ms `ts` keeps events unique); missing final `\n` never glues records (writer's A51 newline fix covers the rest).

**Q2 — DECIDED 2026-10-13: retire `queue.md`.** "qs" → ernie questions (`ernie ask` → `items.jsonl`, age from `ts`); "next" → ad hoc beads (`bd create … -l wt:<branch>`, no epic); ordering → `blocks` deps; `[tag]` → Beads labels; vague backlog lines → `deferred` beads. Resume reads `ernie dump` (open questions + `bd ready`). Work repos: beads stealth, no remote → machine-local (same as `.mem/` today). Store map: memory row drops "queue ✗".

**Q3 — DECIDED 2026-10-13: links stored on the ernie side only.** `--ref <id>` on ernie items (`ernie decide set d3 --ref ernie-7k2`) → `set` event in items.jsonl; server builds the reverse index (bead ← d3) → chips both ways on page + in dump. Memory lines carry a source suffix `(d3)`. Plus: when Claude adds a ref to a bead, it also writes a one-line `--design` pointer on that bead ("why: see d3") so `bd show` / non-ernie agents see it. Validation: unknown ernie id → exit 1; bead id → format check only (no `bd show`, ~0.3 s). Refs are branch-scoped (ernie ids per branch; bead ids repo-unique). Why not the Beads side: Beads has no decision object — `--external-ref` is meant for gh-style refs (maybe single-valued ✗), costs an extra bd call per link, can't be validated by ernie.

**Q4 — DECIDED 2026-10-13: server assembly.**
- A. two watchers per branch (activity + items.jsonl), same 250 ms stat poll (spec:241). Plus content check: watcher keeps the last line read; if bytes before `offset` no longer match → full refold (covers git rewriting items.jsonl in place, e.g. `pull --rebase` puts remote lines first). Whether git rewrites in place or replaces the file ✗ unchecked; check makes it moot.
- B. Beads: start = `bd list --json --all -l wt:<branch>` snapshot; then one `bd events tail --since <seq> --follow` per repo (events carry full bead snapshot, no `bd show`); "truncated" error (7-day journal) → re-snapshot. `ernie init` sets `events-journal true` (off by default).
- C. one SSE state `{items, activity, beads[], refs}`; `refs` = Q3 reverse index.

**Q5 `ernie dump`:**
- (1/2) DECIDED: dump calls `bd list --json` itself, 1 s timeout, only in SessionStart + `ernie dump` (per-prompt hooks never call bd); timeout/error → `BEADS unavailable — run bd ready`. Rejected: server-cached snapshot file (server often not running), skip Beads.
- Proposed sections: OPS · EPIC (was PLAN) · READY (ad hoc beads, was queue next) · FINDINGS (was ISSUES) · OPEN · DECIDED (+ `→ bead` refs) · FACTS/TERMS/NOTES/EXAMPLES. Cap-cut priority: OPS, OPEN, FINDINGS awaiting user, active epic bead, READY, then spec:196 order.
- (2/2) DECIDED: ops stay per branch (C1 isolation holds; re-add ops in each worktree; rejected repo-level `_repo/ops.md` and moving ops to CLAUDE.md). OPS = first dump section, full text (replaces `/mem` applying ops once mem skill retires). `*op`/`*um`/`*mr` triggers move into the one `ernie` skill (no separate skill); `*op` → `ernie mem op "…"`.

**Q5 — DECIDED 2026-10-13.**

**Q6 — DECIDED 2026-10-13: event schema changes (spec:107–123).**
- File per type: `items.jsonl` (git) = decision, question, fact, note, diagram, example. Activity (local) = tool, file, turn, meta.
- Drop: `plan` (→ Beads epics/beads), `issue` (→ Beads findings), `mem sync` + `upto`.
- Add `fact set` (`text?`, `confidence?`, `method?`). Add `ref?` to decision, question, fact (note has it).
- `turn mark` + `items` cursor (F2); seed mark on activity-file creation.
- `meta init` + `path` (worktree, P3); lives in activity file, rewritten with seed mark; items.jsonl has no header line.
- `sid` on activity events only (Tool log is the only session filter, P3; keeps session ids out of git).
- Fold: F1 collision rule replaces spec:287. `tag` vocabulary → `.ernie/mem/<branch>/tags.md`.

**P4 store map (final):** Log split = activity (local) + items.jsonl (git, personal) · Memory `.ernie/mem/<branch>/` (no queue.md) · Beads (epics, beads, findings, ad hoc next). Next: spec amendment for P4 (D1 reword, split log, F1–F3, Q2–Q6).

### Beads workflow — DECIDED 2026-10-15
Context: walked the user through the Beads flow first (epic+PRD → breakdown → polish → queue → claim → per-bead review → findings → next bead → epic done). Beads runs no agents; ernie supplies the loop. Q labels: new number (was old number).
- **Q1 (was Q6) who starts work — DECIDED: per-bead queue checkbox.** User ticks a checkbox on any bead (any epic or ad hoc, this worktree) → bead added to ernie queue; Claude works the queue serially without further prompting. Rejected: stop-and-propose after each bead; auto-continue inside approved epic; auto-run anything in `bd ready`. Supersedes the earlier "▶ Work on" button idea.
- **Q2 (was Q3) who implements — DECIDED: fresh subagent per bead, one at a time.** Main agent pops queue, `bd update <id> --claim`, spawns fresh implementation subagent, then fresh reviewer agents. Serial because parallel beads in one worktree conflict on files. ~ caveat: subagent likely can't ask user mid-run (unverified). v2: each subagent creates its own worktree → parallel beads, merge after.
- **Q3 (was Q9) queue order — DECIDED: tick order, deps respected.** Claude takes first ticked bead that's ready; blocked ticked bead waits, row shows "waiting on <id> (not ticked)"; drag rows to reorder. Claude never auto-adds blockers to the queue. Rejected: bd priority order.
- **Q4 (was Q7) "Now" indicator — DECIDED: derive from Beads.** Now = `in_progress` bead with `wt:<branch>` label (claim sets in_progress ✓); stage from bead state: coding / review rN (review label) / waiting on you (open finding gate). Page follows `bd events`. Crash leaves bead in_progress → show "since <time>" + "stalled" flag when no Claude session active in that worktree. Rejected: ernie log "now working on" events (second source of truth).
- **Q5 (was Q8) closed bead is wrong — DECIDED: "Send back" with note.** Page creates bug bead `discovered-from:<bead>`, description = user note, label `review:user`, no gate (pre-approved), ticked to END of queue; original bead stays closed. Rejected: reopen (`bd reopen` ✗ unchecked in 1.3.1; review-cap accounting unclear). Also add **"Review again"** button: runs one more review round on any bead (open or closed), findings land on Issues as usual (manual review re-trigger).
- **Q6 (was Q2) polish rounds — DECIDED:** auto after breakdown (as P2); cap 5 rounds, stop early if edit totals stop shrinking (oscillation) → audit report flagged "didn't settle" (usually PRD unclear). Add **"Polish again"** button on the epic (before breakdown approval).
- **Q6b polish token limit — DECIDED: batches + selection.** Each polish agent gets ≤N beads (setting, default 10) + only PRD sections those beads cite (`metadata.prd`); 30 beads → 3 agents per round, serial. "Polish again" can be limited to ticked beads. Two-way coverage audit done mechanically by ernie (match `metadata.prd` paths, no tokens). Cheap titles-only dedup pass catches cross-batch duplicates. Rejected for v1: per-epic token budget (✗ whether ernie can read agent token usage) → v2 candidate; batches without selection.
- **Q7 (was Q4) code review while user away — DECIDED: move on.** Review rounds per P2 (min 2, stop first clean, cap 5; each reviewer sees one bead's diff). Bead with finding awaiting approval → marked "waiting on you", queue moves to next ticked bead. When user approves the finding, the fix jumps to FRONT of queue (runs after current bead), then that bead's next review round. Bead at cap 5 still finding → flagged + skipped. Dependents stay blocked by deps. Rejected: pause queue until answered.
- **Q8 (was Q5) epics — DECIDED:** one epic per PRD, beads only from breakdown; "Investigate/Fix/Ship" were sample titles; no-epic beads = ad hoc (grouped "Ad hoc"). Ad hoc creation: both Claude ("make a bead for X") and page **"+ Bead"** form (title, description, optional priority, optional "tick into queue") → server runs `bd create -l wt:<branch>` directly (page-button pattern; guarantees wt label). v1: ad hoc beads can't be moved into an epic (epic tied to PRD + audit). Rejected: Claude-only creation.
- **Q9 (was Q10) where PRD review / polish / code review show — DEFERRED to P6.** Inputs fixed: PRD review findings `discovered-from` epic; code review findings `discovered-from` bead; polish = only per-round comments on epic (`rN: X edits (Y major)`); Issues tab already groups by epic + Ad hoc.
- Old Q1 ("Work on" button) and old "reorder/priority" q resolved by Q1/Q3 above.

### Settings panel — DECIDED 2026-10-15
Context: swept the whole plan for tunables (~80 values); only ~6 agent-loop knobs deserve a page control; the rest are integrity rules, context caps or machine setup. No settings UI/config file existed before; none was rejected.
- **Q1 scope — DECIDED: global, every repo.** One file `~/.config/ernie/settings.json`, written by the ernie server. Rejected: per repo; global + per-repo overrides (two places to check).
- **Q2 placement — DECIDED: ⚙ button in top bar → panel** (key `,`, esc closes, ✕ button). Rejected: 6th "Settings" tab (rarely used; tab strip already clips <~1000px).
- **Contents (agent loop):** Queue Running/Paused (applies at once, no Save; Claude finishes current step; "queue paused" pill in top bar) · Polish batch 3–20 default 10 · Polish rounds cap 2–8 default 5 · PRD review min/max 1–10 default 2/5 · Code review min/max 1–10 default 2/5.
- **Save behaviour:** number rows wait for Save; Save disabled until changed and valid (integer, in range, min ≤ max); Reset to defaults refills the boxes but doesn't save; clicking outside the panel closes it and drops unsaved number edits.
- **Read-only block "This machine":** port (ERNIE_PORT 7477), state folder (ERNIE_HOME), picked worktree's repo kind (git config, set by `ernie init`), Beads auto-push (bd config dolt.auto-push). Changed where they live, not on the panel.
- **Integrity:** only the page or the user's own terminal changes settings, never Claude (the caps are the agent-loop runaway guard) → same idea as the `ernie init` CLAUDECODE guard. Review min can't be 0 (would skip review).
- **Kept off the panel:** context caps (dump 4 KB, inbox 8 KB — tied to Claude Code's ~10,000-char hook output limit), server timings (250 ms poll, lock deadlines, timeouts), approval gates, security checks, colour scheme (stays in top bar, per browser localStorage).
- **Mock:** added to .mem/artifacts/ref_ernie_views/00-template.html (header comment documents it).
