# agent-flywheel complete guide — research (2026-10-11)

Source: https://agent-flywheel.com/complete-guide (WebFetch, summarized). Full text read from the site's source: github.com/Dicklesworthstone/agentic_coding_flywheel_setup @ `1964648` (2026-10-11) → `apps/web/app/complete-guide/page.tsx` (3915 lines, all 42 `<PromptBlock>`s pulled out) + `apps/web/lib/complete-guide.ts` + `components/complete-guide/convergence-detector.tsx`. Tags: ✓ read in source · ~ inferred · ✗ unchecked.

## License / why the prompts are paraphrased

- ✓ Repo LICENSE is "MIT License (with OpenAI/Anthropic Rider)". The rider grants no rights to Anthropic or anyone acting for it. Its definition of "use" includes copying, analyzing, indexing, and putting the text into automated pipelines.
- ~ So prompts below are paraphrased, not copied, and each one points to its line in `page.tsx`. Pull the exact wording yourself:
  ```
  gh api "repos/Dicklesworthstone/agentic_coding_flywheel_setup/contents/apps/web/app/complete-guide/page.tsx?ref=1964648021e21cb9babbb1fe89206b9f096f2322" \
    -H "Accept: application/vnd.github.raw" | sed -n '<line>,<line+12>p'
  ```
  Each prompt is the `prompt={`...`}` prop of the `<PromptBlock>` at that line. `where=` is the model/context it's meant for, `whyItWorks=` is the author's rationale.
- ~ Same rider issue as `br` (see ref_ernie_beads_rust.md, "LICENSE — blocker"). Writing your own prompts based on these ideas is the clean route.

## What it is

- ✓ Author: Jeffrey Emanuel (Dicklesworthstone). Site = ACFS (Agentic Coding Flywheel Setup), which turns a fresh Ubuntu VPS into a swarm host. The guide covers the method; ACFS installs the tools.
- ✓ Core idea: do the hardest thinking in artifacts that still fit in a context window. Plan ≈ 85% of the effort.
- ✓ Three "reasoning spaces": **plan space** (big markdown plan) → **bead space** (`br` issues + dep graph = "executable memory") → **code space**.
- ✓ Stack: `br` (beads_rust, his SQLite+JSONL beads port; he credits Yegge's beads) · `bv` (beads_viewer, graph-metric triage, `--robot-*` flags only) · MCP Agent Mail (messaging + advisory file reservations with TTL) · `ntm` (tmux session manager) · CASS (session-history search/memory) · UBS (bug scanner) · DCG (destructive command guard) · `caam` (account switcher) · `rch` (remote build offload).
- ✓ Models (dated 2026-07-17): GPT-5.6 Sol Pro for planning/synthesis. Claude Fable 5, Gemini 3.1 Pro Deep Think, and Grok 4.5 for competing plans. Claude Sonnet 5 for execution (Opus 4.8 fallback). Codex for final verification.
- ✓ Proof point he cites: CASS Memory System = 5,500-line plan → 347 beads → 25 agents → 11k LOC, 204 commits, ~5 h.

## Workflow end to end

1. ✓ Foundation bundle: stack, architecture direction, AGENTS.md copied from a good past project, best-practices guides in the repo.
2. ✓ Initial plan: human writes a messy stream-of-thought concept → GPT-5.6 Sol Pro (ChatGPT Pro) drafts the markdown plan.
3. ✓ Competing plans: Fable 5 / Gemini Deep Think / Grok 4.5 each plan the same project on their own.
4. ✓ Synthesis: GPT gets all the plans → "best of all worlds" git-diff revisions (P1) → Claude Code/Codex applies them in-place and rates each one (P2).
5. ✓ Refinement: fresh GPT conversation each round, 4–5 rounds (P3), plus the overshoot "lie" re-check (P4).
6. ✓ Plan → beads: Claude Code turns the plan into a granular `br` graph (P5).
7. ✓ Polish beads: 4–6+ rounds same session (P6) → fresh session (P7+P8) → Codex last round → dedup (P9). Cross-check plan ↔ beads both ways.
8. ✓ Launch swarm: `ntm spawn` → staggered marching orders (P20) → agents join Agent Mail, `bv --robot-triage` / `br ready --json`, reserve files, claim bead.
9. ✓ Per bead: implement → fresh-eyes self-review until clean (P21) → advance via bv (P22).
10. ✓ Human tends every 10–30 min: progress checks, "Reread AGENTS.md" after compaction (P19), reviews, commits every 1–2 h (P28), new beads for surprises.
11. ✓ Hardening: test-coverage beads (P23), alternate random exploration (P26) and cross-agent review (P27) until two clean rounds in a row, UI/UX (P24/P25), README (P30), de-slop (P32), reality check (P29).
12. ✓ Land the plane: file beads for leftover work → quality gates → close/update beads → `br sync --flush-only` + `git add .beads/` → commit + push → `git status` clean.
13. ✓ Flywheel: mine CASS for repeated prompts/failures → skills, AGENTS.md, tools (P33, P34, P42).

## Plan / PRD creation

- ✓ The human supplies intent, workflows, and the user-visible behavior. The model drafts. The goal is to make "the whole product legible before any code exists" (no "build a notes app" plans).
- ✓ Multi-model: 4 independent plans → one synthesis by GPT-5.6 Sol Pro → Claude Code/Codex applies the diffs in-place and rates each revision as wholeheartedly / somewhat / disagree. The gradient lets the human step in only on contested changes.
- ✓ Refinement rounds: paste the whole plan into a **fresh** GPT conversation each round so it can't anchor on its own past output. Every change needs a rationale and a git-diff. Rounds = 4–5 until suggestions get "very incremental". Other models can be blended in, with GPT doing the final synthesis.
- ✓ "Lie to them": models stop after about 20–25 issues. Claiming at least 80 were missed forces a full pass. Used for plan review, bead↔plan cross-reference, and audits.
- ✓ Size: plans reach 3,000–6,000+ lines. A complex feature takes 3+ h of planning.
- ✓ **Stop criteria** (plan → beads): stay in plan space while whole-workflow questions are still moving, architecture debates are open, or fresh models keep finding major missing features or tradeoffs. Move to bead space once what's left is execution structure, test obligations, sequencing, and embedded context. Rule of thumb: still redesigning the product → plan; packaging work → beads.
- ✓ Validation gate "Plan": the plan covers workflows, architecture, sequencing, constraints, testing expectations, and major failure paths.

## PRD → beads

- ✓ **Who/when:** right after the plan stabilizes, the human sends one conversion prompt (P5) to Claude Code. The prompt's `where=` says Opus. The model table says Sonnet 5. ~ The guide is internally inconsistent here.
- ✓ For an existing project the same prompt is prefixed with an instruction to read the named plan file in full first.
- ✓ Framing: plan→beads is "a separate, distinct problem," a translation job, not task extraction. Kernel invariant #3: a good plan does not automatically yield a good bead graph.
- ✓ **One-way door:** once in bead space you never go back to the plan. Beads must be detailed enough that the plan never has to be reopened. Agents don't load the plan at all. The plan stays useful for humans.
- ✓ **No pseudo-beads:** never write beads as markdown in a doc. Go straight to `br create`. If the model starts writing beads as prose, stop it and redirect.
- ✓ Bead content: long descriptions with embedded markdown (not checklist one-liners). Each covers the outcome, acceptance criteria, test obligations (unit + e2e with detailed logging), rationale/"why", failure modes, and the verification plan. Shape: epics → tasks → subtasks, with deps overlaid.
- ✓ Criteria: self-contained · complete coverage (nothing lost from the plan) · explicit, correct deps (so `bv` can route) · testing included.
- ✓ Granularity: 200–500 initial beads for complex projects (347 from a 5,500-line plan). Bulk creation can fan out to parallel subagents, each taking a slice of the plan.
- ✓ Linking to the plan: no structural link (no plan-ID field). Coverage is checked by a **transfer audit**: walk every plan section → map it to beads, and flag any bead with no plan backing (operator P38). Validation gate "Translation": every material plan element maps to ≥1 bead, checked in both directions.
- ✓ Warning: the "plan-bead gap." Sessions sometimes finished plan revision and never created beads. The synthesis step must end with an explicit move to bead creation.
- ✓ Effort: the conversion is "significant." Claude needed "coaxing and cajoling" to produce 347 beads.

## Polishing beads

- ✓ Slogan: **"Check your beads N times, implement once"** (N = "as many as you can stomach"). He calls it "the step most people underinvest in."
- ✓ Meaning: an LLM re-reviews the whole bead graph in plan space. Is each bead sensible and optimal, and could it serve users better? Revise via `br` only. The prompt forbids oversimplifying or dropping features (models "improve" by deleting complexity they don't understand) and makes sure every bead has unit/e2e test obligations.
- ✓ What real rounds did: merge duplicates, score quality on WHAT/WHY/HOW, fill empty descriptions, fix dep links, cross-check beads against the plan both ways (beads→plan and plan→beads, including closed beads). One example: 9 exact duplicate pairs closed, keeping whichever had richer test specs, better dep chains, and higher priority.
- ✓ Sequence:
  1. P6 in the same Claude Code session, 4–6+ rounds. One session manages 2–3 passes before context runs out, so it spans several sessions.
  2. When gains flatten: a **fresh session** runs P7 (load AGENTS.md, README, code) then P8 (review beads with `br` + `bv`).
  3. Final round: Codex/GPT (high reasoning effort) runs P6. Different models catch different things.
  4. After big batches: dedup pass P9.
- ✓ Round phases: 1–3 major structural fixes · 4–7 architecture/interfaces · 8–12 edge cases · 13+ steady state.
- ✓ **Stop criteria:** responses get shorter, changes slow down, and successive rounds look more alike. Weighted score = 0.35·size-shrink + 0.35·velocity-slow + 0.30·similarity (convergence-detector.tsx). ≥0.75 → finalize. ≥0.90 → diminishing returns. Operator P39 says to stop when revisions are "small, mostly corrective" and coverage checks keep passing.
- ✓ Red flags: **oscillation** between two versions → reframe the problem. **Expansion** (output growing) → step back. **Plateau at low quality** → kill it and restart fresh.
- ✓ Anti-pattern: "single-pass beads." First drafts are never optimal; minimum 4–5 polish passes. Skipping plan↔bead validation means missing features turn up mid-implementation.
- ✓ Validation gate "Bead": self-contained, dependency-correct, rich in context, explicit test obligations.
- ✓ **Human check of the breakdown:** no explicit human approval step in the greenfield flow. The human runs the polish prompts and judges convergence. The Idea-Wizard flow (existing projects) does have one: the human picks from 15 ideas *before* they become beads.

## Implementation + review of beads

- ✓ Pickup: no assignment. Agents are fungible generalists. Each runs `bv --robot-triage`/`--robot-next` (PageRank/betweenness → the bead that unblocks the most) or `br ready --json`. It then marks the bead `in_progress`, reserves files via Agent Mail (TTL, exclusive, reason=`br-NNN`), and announces in the bead's thread.
- ✓ The bead ID is the thread anchor everywhere: Agent Mail thread_id, `[br-123]` subject prefix, reservation reason, commit message.
- ✓ Parallelism: single `main` branch, no feature branches. Advisory reservations + pre-commit guard + DCG. Swarm size by open beads: 400+ → 4 cc / 4 codex / 2 agy · 100–399 → 3/3/2 · <100 → 1/1/1. Staggered starts to avoid a thundering herd.
- ✓ Per-bead review = self-review "fresh eyes" (P21) until clean: 1–2 rounds for simple beads, 2–3 for complex. More than 3 rounds still finding bugs → the approach is off, hand it to another agent. Best done by dispatching a fresh subagent with no memory to review each changed file. Can be written into AGENTS.md so it happens automatically.
- ✓ Review checklist (4 questions): correct per bead description? edge cases? same bug elsewhere? better approach?
- ✓ Deep review (after all/most beads, or every 30–60 min, or when an epic finishes): alternate random exploration (P26) and cross-agent review (P27). Send to 1–3 agents while the others keep building. Stop after **two consecutive clean rounds**. Still finding bugs after 4+ rounds → go back to bead space and create fix beads. Run `ubs .` first.
- ✓ **How review findings are tracked:** mostly fixed in place, with no record. They become beads only when (a) test gaps show up (P23 creates a test bead graph), (b) UI/UX suggestions are chosen by the human (scrutiny → human picks → beads → swarm), (c) bugs keep surviving 4+ rounds (fix beads), or (d) end of session (file beads for leftover work). ~ There's no review-round label or count on beads.
- ✓ No PR, no human reviewer, no approval gate in code space. The human starts review rounds at checkpoints.

## Other notable mechanisms

- ✓ AGENTS.md = operating manual. Rule 0: human instructions override. No deleting files without permission, no destructive git, no script-based code edits, no `fooV2` file variants, never touch other agents' work. "Reread AGENTS.md…" after every compaction is the most-used prompt, automated by a `post_compact_reminder` tool.
- ✓ Prompts are deliberately generic. The specifics live in the beads, AGENTS.md, and the code, so one prompt library works on every project.
- ✓ 6 validation gates (Foundation → Plan → Translation → Bead → Launch → Ship). If a gate fails, drop back a phase.
- ✓ 9 kernel invariants, including: global reasoning belongs in plan space; plan→beads is a distinct translation; beads are the execution substrate; convergence > first drafts; coordination lives in artifacts, not special agents; session history is part of the system.
- ✓ Strategic drift / "Come to Jesus" check: busy swarm, goal still far → P29 → revise and re-polish the bead graph.
- ✓ "Foregone conclusion": if the human is doing heavy thinking during implementation, planning or polishing was too thin → pause and go back to bead space.
- ✓ Ad-hoc mode (P11): for bounded changes, skip beads and use the agent's built-in TODO list. Convert to beads if the work grows or needs sequencing. Retro-create beads for ad-hoc work that turns out to matter.
- ✓ Idea-Wizard (existing projects): read AGENTS.md + `br list` → brainstorm 30 and pick 5 (P10) → "next best 10" → **human picks** → beads → refine 4–5×.
- ✓ Major feature via external project: 7-step proposal chain (P12–P18). Clone and study the other project, deepen, invert, run the same blunder hunt 5× in a row, close gaps, make the proposal self-contained, then get 4-model git-diff feedback.
- ✓ Flywheel/CASS: rate tools via agent feedback forms (P33). Rewrite skills from mined session logs (P34). Repeated behavior → ritual → skill → infrastructure.
- ✗ Not read in detail: toolchain/VPS/cost sections, CASS 3-layer memory internals, the interactive viz components, docs/methodology/COMPLETE_X_POSTS_ABOUT_PLANNING_AND_BEADS.md (the author's X posts on planning/beads; probably worth a look).

## Prompt catalog

42 prompts (matches `COMPLETE_GUIDE_PROMPT_COUNT = 42`). All are **paraphrase ~** for license reasons (see top). `L` = line of the `<PromptBlock>` in page.tsx @1964648. Exact text is ✓ readable there.

### P1 — Best-of-All-Worlds Synthesis (L639)
- stage: plan-review
- purpose: merge competing plans into one stronger hybrid
- inputs / when used: GPT-5.6 Sol Pro, after 3 other models each wrote a plan, with all plans pasted
- text (paraphrase ~): Three other LLMs planned the same thing differently. Read their plans with an open mind and admit honestly where they beat yours. Then revise your own plan in place into the best hybrid of all of them, keeping every good idea, without saying which came from where. Output the full set of git-diff style changes, aiming for a longer, more detailed plan.

### P2 — Integrate Synthesis Revisions (L652)
- stage: plan-review
- purpose: apply the synthesis diffs to the plan file and grade each one
- inputs / when used: Claude Code or Codex, P1 output pasted
- text (paraphrase ~): Apply these revisions to the markdown plan in place, carefully and with deep thinking. Afterward, sort the changes into ones you fully agree with, partly agree with, and disagree with.

### P3 — Plan Refinement (L673)
- stage: plan-review
- purpose: one refinement round, run 4–5 times
- inputs / when used: fresh ChatGPT conversation each round, whole plan pasted
- text (paraphrase ~): Review the whole plan and propose your best revisions: architecture, new or changed features, robustness, performance, usefulness. For each one, give detailed reasoning for why it improves the project, plus git-diff style changes against the plan below.

### P4 — Overshoot Mismatch Hunt (L708)
- stage: plan-review (also bead↔plan audits)
- purpose: force an exhaustive re-check after a review pass that was too short
- inputs / when used: any review that seems too self-satisfied
- text (paraphrase ~): Do it again, very carefully. Re-check the plan against all the feedback I gave, because I'm sure you missed or botched at least 80 items.

### P5 — Plan to Beads Conversion (L797)
- stage: plan→beads
- purpose: turn the full plan into a granular, self-documenting `br` graph
- inputs / when used: Claude Code (Opus per `where`, Sonnet 5 per the model table) right after the plan stabilizes. Prefix with "read ALL of <PLAN>.md" for an existing plan file.
- text (paraphrase ~): Take everything, expand on it, and create a complete, granular set of beads: tasks, subtasks, and the dependency structure on top. Write detailed comments so the set is fully self-contained and self-explaining, including background, reasoning, considerations, and anything your future self needs about goals, intent, and how each piece serves the project. Create and modify beads and dependencies only with `br`. Think deeply.

### P6 — Bead Polishing (L956)
- stage: bead-polish
- purpose: one full critical pass over every bead. The main polish loop.
- inputs / when used: Claude Code, 4–6+ times in a row after conversion (re-read AGENTS.md after any compaction). Codex/GPT runs it once more at the end.
- text (paraphrase ~): Re-read AGENTS.md. Check every bead carefully: does it make sense, is it optimal, could a change make the system better for users? If so, revise it, since changing things in plan space is far cheaper than after implementation. Don't oversimplify and don't drop any features. Make sure the beads include thorough unit tests and e2e test scripts with detailed logging. Use only `br` for edits and deps. Think deeply.

### P7 — Fresh Eyes on Beads (L1019)
- stage: bead-polish
- purpose: load context into a brand-new session before re-reviewing beads
- inputs / when used: new Claude Code session once P6 gains flatten
- text (paraphrase ~): Read all of AGENTS.md and README.md carefully until you fully understand both. Then investigate the code until you understand its architecture and purpose. Think deeply.

### P8 — Fresh Review of Beads (L1028)
- stage: bead-polish
- purpose: fresh-context review of the bead graph
- inputs / when used: same fresh session, after P7
- text (paraphrase ~): We just converted a markdown plan into many new beads. Review and analyze them carefully with `br` and `bv`. For each bead, does it make sense, is it optimal, could anything serve users better? Revise where so. It's cheaper in plan space. Think deeply.

### P9 — Bead Deduplication (L1043)
- stage: bead-polish
- purpose: merge duplicate or overlapping beads into canonical ones
- inputs / when used: Claude Code, after large bead-creation batches
- text (paraphrase ~): Re-read AGENTS.md. Go through all open beads and find any that duplicate or heavily overlap. Merge them cleverly into single canonical beads that keep the best of each.

### P10 — Idea-Wizard: Generate Ideas (L1092)
- stage: other (existing-project feature intake)
- purpose: brainstorm wide, then narrow
- inputs / when used: Claude Code, after reading AGENTS.md and `br list --json`. Follow-up: "ok and your next best 10 and why."
- text (paraphrase ~): Generate 30 ideas for improvements, features, or fixes to this project, then cut to your 5 best and explain why each matters.

### P11 — Ad-Hoc Execution (L1110)
- stage: implement
- purpose: do a bounded change without formal beads
- inputs / when used: when making beads would cost more than it saves
- text (paraphrase ~): Go ahead and do all of it now. Keep a very detailed, granular TODO list of every item and sub-item, including ones you discover along the way, so nothing gets dropped.

### P12 — Step 1: Investigate and Propose (L1164)
- stage: plan
- purpose: mine an external project for ideas to reimagine on your own primitives
- inputs / when used: Codex/Claude Code in a session that already knows your project
- text (paraphrase ~): Clone <external repo> to tmp and study it for ideas we could reimagine on top of <our project>'s primitives in ways that add a lot of value and combine the best of both. Write it up as PROPOSAL_TO_INTEGRATE_IDEAS_FROM_<X>_INTO_<Y>.md.

### P13 — Step 2: Iterative Deepening (L1173)
- stage: plan
- purpose: push past a conservative first proposal
- inputs / when used: same session, right after P12
- text (paraphrase ~): Good start, but it's shallow. Go much deeper and be bolder. Find ideas that are truly innovative and disruptive because they're so compelling and useful.

### P14 — Step 3: Inversion Analysis (L1185)
- stage: plan
- purpose: find what only your project can do
- inputs / when used: same session, after P13
- text (paraphrase ~): Now flip it. What can we do because of <our primitives/guarantees> that <external project> could never do, given its weaker foundations?

### P15 — Step 4: Repeated Blunder Hunt, run 5× (L1199)
- stage: plan-review
- purpose: critique pass. Repeating the identical prompt pushes past issues already found.
- inputs / when used: 5 times in a row after each major proposal expansion
- text (paraphrase ~): Go through the whole proposal looking for blunders, mistakes, misconceptions, logic errors, omissions, oversights, and sloppy thinking.

### P16 — Step 5: Close Design Gaps (L1220)
- stage: plan
- purpose: turn open questions from the blunder hunts into decisions
- inputs / when used: same session, with a list of specific gaps
- text (paraphrase ~): Add these to the proposal, using your best ideas and the latest research to decide each: <gap list>.

### P17 — Step 6: Self-Contained for Cross-Model Review (L1235)
- stage: plan
- purpose: make the proposal readable by a model with no project context
- inputs / when used: once the proposal is stable
- text (paraphrase ~): Make the proposal self-contained so another frontier model can fully understand it and suggest revisions or find flaws. Add thorough background sections on what <our project> is, how it works, and why it's special, and do the same for <external project>.

### P18 — Step 7: Multi-Model Feedback (L1254)
- stage: plan-review
- purpose: get independent git-diff improvements from 4 models
- inputs / when used: GPT-5.6 Sol Pro, Fable 5, Gemini Deep Think, and Grok 4.5 separately, full proposal pasted
- text (paraphrase ~): How can this proposal be made smarter and better, with the most innovative, useful additions and revisions you can think of? Give changes as git-diff style edits against the file below (named <PROPOSAL>.md).

### P19 — Post-Compaction Reset (L1655)
- stage: other (swarm upkeep)
- purpose: restore operating rules after context loss. The most-used prompt.
- inputs / when used: right after any compaction (automated via post_compact_reminder)
- text (paraphrase ~): One line telling the agent to re-read AGENTS.md so it's fresh again.

### P20 — Swarm Marching Orders (L1980)
- stage: implement
- purpose: canonical kickoff for every swarm agent
- inputs / when used: initial prompt for each agent, sent staggered via `ntm send`
- text (paraphrase ~): Read AGENTS.md and README.md fully, then investigate the code to understand its architecture and purpose. Register with Agent Mail and introduce yourself. Check and answer mail promptly, then work through your next beads methodically, tracking progress in beads and mail. Avoid "communication purgatory": start needed work proactively, but tell the others and mark beads. If unsure what's next, use bv to pick the best bead you can usefully do. Acknowledge all requests and know which agents are active. Offload Rust builds/tests with `rch exec -- …`. Think deeply.

### P21 — Fresh Eyes Review (L2290)
- stage: code-review
- purpose: switch from writing code to adversarial self-review after each bead
- inputs / when used: after each bead, repeated until clean (best done by a no-memory subagent per changed file)
- text (paraphrase ~): Now re-read all the code you just wrote or changed with "fresh eyes," looking hard for bugs, errors, issues, and anything confusing. Fix what you find. Think deeply.

### P22 — Advance to Next Bead (L2336)
- stage: implement
- purpose: hand-off between beads
- inputs / when used: after self-review comes back clean
- text (paraphrase ~): Re-read AGENTS.md and think deeply. Use bv's robot flags to find the most impactful bead(s) you can do now, start coding right away, mark beads and tell the other agents what you're on, and reply to any mail.

### P23 — Test Coverage (L2346)
- stage: code-review
- purpose: audit for test gaps and turn them into beads
- inputs / when used: after the first implementation pass is done
- text (paraphrase ~): Do we have full unit test coverage with no mocks or fakes, and complete e2e integration scripts with detailed logging? If not, create a granular bead graph (tasks, subtasks, deps, detailed comments) to get there. Think deeply.

### P24 — UI/UX Scrutiny (L2412)
- stage: code-review
- purpose: list UX friction and polish ideas as suggestions, not code
- inputs / when used: once core features work. The human then picks which become beads.
- text (paraphrase ~): Scrutinize every part of the app's workflow and implementation for anything sub-optimal or wrong, clear usability wins, and places the UI could look and feel more premium, Stripe-level. Think deeply.

### P25 — Platform-Specific Polish (L2418)
- stage: code-review
- purpose: second UX pass, tuning desktop and mobile separately
- inputs / when used: after P24. Repeat 2–3 rounds.
- text (paraphrase ~): There's still room to make the UI more intuitive, polished, and world-class by Stripe-style standards, don't you agree? Handle desktop and mobile separately and optimize each for its own modality. Aim for stunning. Think deeply.

### P26 — Random Code Exploration (L2482)
- stage: code-review
- purpose: curiosity-driven bug hunt in code nobody is looking at
- inputs / when used: alternate with P27, sent to 2–3 agents at once
- text (paraphrase ~): Pick code files more or less at random, study them, and trace their flows through what they import and what imports them. Once you understand their role in the wider workflows, check them critically with fresh eyes for bugs and silly mistakes, then fix them carefully. Follow all AGENTS.md rules and the best-practice guides it references. Think deeply.

### P27 — Cross-Agent Review (L2493)
- stage: code-review
- purpose: adversarial review of other agents' code, aimed at root causes
- inputs / when used: alternate with P26. Stop after 2 clean rounds in a row.
- text (paraphrase ~): Now review code written by the other agents for bugs, inefficiencies, security problems, and reliability issues. Find root causes from first principles and fix them as needed. Don't stop at recent commits; look widely and deeply. Think deeply.

### P28 — Organized Commits (L2524)
- stage: other (git)
- purpose: one designated agent commits in logical groups
- inputs / when used: every 1–2 h
- text (paraphrase ~): Commit all changed files in logically grouped commits with very detailed messages, then push. Take your time. Don't change any code, and skip ephemeral files. Think deeply.

### P29 — High-Level Reality Check (L2538)
- stage: other (strategic drift)
- purpose: test whether the open bead graph actually reaches the goal
- inputs / when used: when the swarm is busy but seems off course
- text (paraphrase ~): Where does the project stand? Do we actually have what we set out to build? If not, what's in the way? Would finishing every open and in-progress bead close the gap fully? Why or why not?

### P30 — README Reviser (L2547)
- stage: other (docs)
- purpose: bring the README up to date and add to it
- inputs / when used: after significant implementation work
- text (paraphrase ~): Re-read AGENTS.md, then update the README for recent work, written as if it had always been that way rather than as "changes." Also add new, more detailed content on what it is, why it's useful, how it works, and its design principles. Add, don't replace.

### P31 — Quick Final Sanity Check (L2555)
- stage: other (catch-all review)
- purpose: quick final pass after any significant change
- inputs / when used: any time
- text (paraphrase ~): Look over everything once more for obvious oversights, omissions, conceptual errors, and blunders.

### P32 — De-Slopify Documentation (L2563)
- stage: other (docs)
- purpose: strip AI-writing tells from docs
- inputs / when used: after agents write user-facing text
- text (paraphrase ~): Read the full text line by line for signs of AI-style writing. Replace em dashes with semicolons or commas, or recast the sentence. Remove stock LLM tropes like "it's not X, it's Y" and "here's why it matters." Do it by hand, not with regex or a script.

### P33 — Agent Tool Feedback (L3084)
- stage: other (flywheel)
- purpose: get structured ratings of a tool from an agent that just used it
- inputs / when used: after an agent has used [TOOL] on real work
- text (paraphrase ~): Rate [TOOL] 0–100 on as many dimensions as you can based on today's use. Was it helpful, did it catch things you'd have missed, how was the signal-to-noise, what was good or bad, did it break? What changes would make it better for you, would you recommend it to other agents, and how strongly?

### P34 — Skill Refinement Meta-Skill (L3132)
- stage: other (flywheel)
- purpose: rewrite a skill using session-log evidence
- inputs / when used: Claude Code, any skill with 10+ CASS sessions of use
- text (paraphrase ~): Search CASS for sessions that used [SKILL]. Find confusion, repeated mistakes, skipped steps, invented workarounds, and missing steps. Rewrite the skill to fix all of them: make the happy path obvious, guard against the common mistakes, and promote good workarounds to official steps. Then test it against the logged failures.

### P35 — Operator 1: Plan-First Expansion (L3613)
- stage: plan
- purpose: no coding until the plan makes architecture and flows explicit
- inputs / when used: the project still fits in a plan, or paths and workflows are still fuzzy
- text (paraphrase ~): A 3-step operator card. Restate goals/workflows/constraints concretely. Expand the plan until the main decisions are explicit. Don't code until testing, failure paths, and sequencing are covered. Output: revised plan.

### P36 — Operator 2: Competing-Plan Triangulation (L3625)
- stage: plan-review
- purpose: merge independent plans, keeping only the strongest parts
- inputs / when used: important projects where one model's bias is risky
- text (paraphrase ~): Operator card. Collect independent plans from several frontier models. Compare them for better ideas, gaps, and clashing assumptions. Merge only the best. Output: one plan plus notes on what changed and why.

### P37 — Operator 3: Overshoot Mismatch Hunt (L3637)
- stage: plan-review / bead-polish
- purpose: generic form of P4
- inputs / when used: review output too short, or a plan/bead graph that hasn't been audited enough
- text (paraphrase ~): Operator card. Tell the model it probably missed many issues. Make it re-compare against the source or feedback. Require a full new pass, not a short patch list. Output: expanded list of misses and corrections.

### P38 — Operator 4: Plan-to-Beads Transfer Audit (L3649)
- stage: plan→beads / bead-polish
- purpose: check plan↔bead coverage in both directions
- inputs / when used: before or after converting a large plan, or when beads are being made fast
- text (paraphrase ~): Operator card. Walk every important plan section and map it to real beads. Make sure rationale, constraints, and tests are in the bead text. List plan items with no bead and beads with no plan backing. Output: coverage report + bead edits that close the gaps.

### P39 — Operator 5: Convergence Polish Loop (L3661)
- stage: bead-polish (also plan)
- purpose: repeat fresh-session reviews until changes are small
- inputs / when used: the first polish pass found real issues
- text (paraphrase ~): Operator card. Re-run a full critical review in a fresh session. Apply the fixes and compare how big the changes were against last round. Stop only when revisions are small, mostly corrective, and coverage checks still pass. Output: revised artifact + a verdict of still major-change or near convergence.

### P40 — Operator 6: Fresh-Eyes Reset (L3673)
- stage: bead-polish / plan-review
- purpose: escape a tired context's local minimum
- inputs / when used: long review runs where suggestions are getting repetitive
- text (paraphrase ~): Operator card. Start a new session, reload AGENTS.md and project context, and review the plan or beads as if seeing them for the first time.

### P41 — Operator 7: Fungible Swarm Launch (L3685)
- stage: implement
- purpose: launch readiness plus staggered start
- inputs / when used: beads are polished and multiple agents are about to start
- text (paraphrase ~): Operator card. Confirm AGENTS.md, bead state, Agent Mail, and bv are ready. Start agents staggered and have them claim work immediately. Keep coordination in beads, reservations, and threads, not in an overseer agent.

### P42 — Operator 8: Feedback-to-Infrastructure Closure (L3697)
- stage: other (flywheel)
- purpose: turn lessons that keep recurring into reusable artifacts
- inputs / when used: the same confusion keeps showing in CASS, tool complaints, or a finished project
- text (paraphrase ~): Operator card. Mine session history for repeated prompts, breakdowns, and fixes. Distill them into skills, AGENTS.md guidance, or tool changes. Update the reusable artifact. Output: updated artifact + a note on the lesson it captures.

### From the X posts doc (P43+)

`L` here = line in `docs/methodology/COMPLETE_X_POSTS_ABOUT_PLANNING_AND_BEADS.md` @1964648 (see next section), not page.tsx. Every other X-posts prompt is an earlier wording of P1, P2, P3, P5, P6, P7, P8, P20–P23, P24/P25, P26–P28, or P33.

### P43 — Plan-Anchored Bead Polish (L595)
- stage: bead-polish
- purpose: P6, but each round also re-reads the plan file and makes plan→bead transfer part of the pass
- inputs / when used: Claude Code (Opus), round after round after conversion (the post doesn't say same or fresh session). 8–9 rounds to steady state on a ~3,500-line plan, then one Codex round (L597).
- text (paraphrase ~): Re-read AGENTS.md, then read the whole plan file. Check every bead: does it make sense, is it optimal, could it serve users better? Revise if so, since plan space is cheaper. Don't oversimplify and don't drop features. Make sure beads carry thorough unit tests and e2e scripts with detailed logging. Everything in the plan must be embedded in the beads so nobody has to go back to the plan, and no context, idea, or rationale gets lost.

### P44 — Study Analog Code, Then Draft Plan (L563–L565, described, not quoted)
- stage: plan
- purpose: Claude-only first draft of a feature plan in an existing codebase, anchored on code that already does something similar
- inputs / when used: Claude Code (Opus), before any outside-model review. He followed it with 3 GPT Pro review rounds integrated by Claude Code using P2 (L567–L577).
- text (paraphrase ~): Study the code that implements the analogous feature elsewhere, then explain how the new feature must differ and draft a plan. Next, re-read that reference code for more insight and expand the plan in place.

## X posts (methodology doc)

- ✓ Source: `docs/methodology/COMPLETE_X_POSTS_ABOUT_PLANNING_AND_BEADS.md` @ `1964648021e21cb9babbb1fe89206b9f096f2322` (pinned ref resolved), 925 lines. It collects Jeffrey Emanuel's X posts (Nov 2025 – Feb 2026) in 12 threads. Same license rider, so everything here is paraphrased. `L` = line in that file. Pull the original yourself:
  ```
  gh api "repos/Dicklesworthstone/agentic_coding_flywheel_setup/contents/docs/methodology/COMPLETE_X_POSTS_ABOUT_PLANNING_AND_BEADS.md?ref=1964648021e21cb9babbb1fe89206b9f096f2322" \
    -H "Accept: application/vnd.github.raw" | sed -n '<line>,<line+20>p'
  ```
- ✓ Useful threads: 1 (CASS live build, L23–L213), 3 (whole-workflow post + Q&A, L235–L471), 4 ("Check your beads N times", L475–L519), 5 (good-plan worked example, L523–L611). Threads 8–12 are mostly Agent Mail / bv / tool-feedback / Rust boasting.

### New vs guide

- ✓ **The posts' prompts say `bd`, not `br`.** Conversion and polish prompts tell the agent to use only the `bd` tool (L262, L489, L591). The method was built on Yegge's beads, ernie's own tool, before he switched to his `br` port. ~ The prompts carry over to `bd` unchanged.
- ✓ **The polish loop re-reads the plan every round** (P43, L595). The guide's P6 doesn't load the plan. The posts' working version folds the transfer requirement (all plan content must end up inside beads) into every polish round, rather than leaving it to a separate audit.
- ✓ **Round counts run higher than the guide's numbers.** The worked example hit steady state after about 8–9 polish rounds, then one Codex round (L597). He used to run polish once or twice, tried 6+, and kept getting useful edits (L491). Plan review in the same example was only 3 rounds, not 4–5 (L577), though he says the gains continued to the last version (L583). Total ~3 h, and the last review alone took 27 min (L577, L585).
- ✓ **Small plans converge fast, and that tells you to stop.** For a small or simple plan the repeat-polish technique is overkill, and you'll see so little change per round that the stopping point is obvious (L501). ~ This backs ernie's 2–3 rounds plus a stop rule.
- ✓ **Fresh session is the escape hatch, not the default.** Polish runs in the same Claude Code session. A new session (P7 + P8 preface) only starts once improvements "flatline" (L493–L499). The guide says the same, but the posts make the order explicit.
- ✓ **Claude did the plan synthesis in the CASS build.** Opus 4.5 in Claude Code merged the 4 competing plans into the hybrid (L45, L173). **Contradicts** the guide, where GPT is the final arbiter. Later posts move synthesis to GPT Pro (L511), so ~ the guide reflects his later view.
- ✓ **Design decisions go inside the beads.** He rejects keeping design notes in separate markdown. Bead descriptions can be long markdown (L435–L437). He sees beads as holding more than the plan, since they also carry explicit deps (L423–L425). The conversion prompt adds that beads should be detailed enough to never consult the plan (L591).
- ✓ **New features on an existing v1 go through the same plan→beads process.** One-shot applies only to v1 (L535–L537). The Thread 5 example is a feature added to an existing Rust tool.
- ✓ **No skeleton-first.** He prefers one big plan, because that's the only time the model can hold the whole system in mind. Once it's code it's too big to understand (L415).
- ✓ **No separate security pass.** Planning covers security. After code exists, add "security" to the review prompt when you want it, though reviews usually catch it anyway (L443).
- ✓ **Pre-planning** = tech stack + existing OSS. If unsure, run a deep-research round with a web model first (L429–L431).
- ✓ **Bead↔commit traceability is inferred.** bv links beads to commits by analyzing the git stream, with no explicit field (L459–L461).
- ✓ **Closed-bead rate is a misleading progress metric.** In the CASS status check, the open beads were mostly test beads, so the closed rate understated how usable the product was ("~85–90% done", L111–L127). ~ Treat test beads separately when showing progress.
- ✓ **Tool-design lessons** (relevant to ernie as a tool): adding features can make an agent tool worse, so end with a "rationalizing" pass that merges small commands into fewer, richer ones (L741). Don't trust agents' guesses about features they haven't used. Test after real use, then iterate (L745–L747). Every dev tool should have an agent-facing robot mode, ideally designed by agents (L819). Ship a tuned skill with every tool installer (L899).
- ✓ Minor: he discards outside reviewers' timeline estimates as noise (L609). Telling an agent it's a "frontend agent" doesn't make it better at frontend (L455). He hates worktrees for swarms because a shared tree surfaces conflicts early (L181, L657). ~ That argument is about many agents on one tree, not ernie's one-branch-per-worktree.

### PRD → beads

- ✓ The conversion prompt for an existing plan file says to read the whole plan, expand on it, and make beads detailed enough that the plan is never consulted again, using only `bd` (L591). The guide's P5 has only the "read the plan" prefix. The no-lookback clause appears only here.
- ✓ The conversion produced only part of the final graph. Testing beads were added during the build (347 → 350+, L103).
- ~ For ernie: the `metadata.prd` pointer is fine as an audit aid. He'd object if it replaced embedding rationale and design in the bead text (L437, L591).

### Polishing beads

- ✓ Default loop = same Claude Code session with P43 (plan re-read + embed-everything check) for 6–9 rounds. Fresh session only when it flatlines. Then one Codex round (L483–L499, L593–L597).
- ✓ Polish also means cross-checking each bead against the plan, and the plan against all beads, closed ones included (L143). That's already in the guide; the posts show it was one of his live reply instructions.
- ✓ He describes Claude Opus doing "many rounds" of bead checking for completeness and correctness as what makes beads trustworthy, with no human review of the beads (L135).
- ~ No round counter, no record per round, and no stop metric beyond "it flatlines" or "little change" (L493, L501). The 0.75 convergence score in the guide doesn't appear in the posts.

### Reviewing implemented beads

- ✓ Nothing structurally new. Per-bead fresh-eyes self-review runs until no bugs are found (L285–L291). Deep review alternates random exploration and cross-agent review until rounds keep coming back clean with no edits (L321). Review loops continue until no problems surface, then tests get written (L177). He doesn't split roles, but every agent reviews its own work and others' (L213).
- ✓ Add "security" to review prompts when you want it emphasized (L443).
- ~ Still no tracking: no review count, label, or bead per finding in any post. Findings get fixed in place. Test gaps become beads (L306). ernie's open question about review tracking gets no answer here.

### Single-model / Claude-only notes

- ✓ The bead pipeline was Claude-only in practice: Claude Code (Opus 4.5) did the conversion and all the repeated polish rounds (L259–L268, L483, L593). Other models came in only for the final Codex round (L597) and for plan-space review.
- ✓ His claim that Opus keeps finding small improvements is about running the same polish prompt repeatedly (L483). The fresh-session reset is also Claude-only (L493–L499).
- ✓ Where he'd say a Claude-only setup loses most: initial plan drafting and plan review. Opus in the web app is "pretty good" for the initial plan, but he rates GPT Pro best for planning (L169, L393, L509). Mixing models in a swarm is advised (L455).
- ✓ Claude-only plan path from the worked example: Claude Code studies analogous existing code → drafts → re-studies and expands in place (P44, L563–L565). Outside review only came after that.
- ✓ Original prompts end with "Use ultrathink" (Claude Code's extended-thinking keyword), where the guide says "Think deeply" (L262, L268, L288, L489). ✗ Not checked whether that keyword still changes behavior in current Claude Code.

### Other

- ✓ Planning tokens cost far less than implementation tokens. Even a huge plan is shorter than a few code files, and models reason best over something that fits in context (L503–L505). He spends 80–85%+ of his time on planning (L505, L531).
- ✓ After planning, the backlog keeps filling from idea-wizard, optimization passes, and GitHub issues (L911).
- ✓ The agent feedback form loop (P33) closes by piping the ratings to an agent that fixes the common complaints generically (L781, L801).

## Ideas for ernie

All are recommendations, not decisions.

- **Answers the open question (who breaks the PRD down, and when):** run the breakdown as its own step right after the human gate approves the PRD, done by one agent in a fresh session (P5-style prompt written for `bd`: `--parent <epic>`, `--description/--design/--acceptance`, `blocks` deps). Treat it as translation: each child bead should carry enough of the PRD (rationale, acceptance, test obligations) that the implementer never opens the PRD. ~ This matches ernie's epic-first model.
- **User check of the breakdown:** he has none in greenfield because polishing to convergence replaces it. For a single user, add a second human gate on the epic after polishing (e.g. `set-state plan=breakdown-review` → `approved-build`). The thing worth showing the user is the **transfer-audit report** (P38: plan sections with no bead, beads with no plan backing), not every bead.
- **Keep the PRD as the source of truth longer than he does.** His "never look back at the plan" works because he's at 300+ beads. At ernie's scale, keep it lighter: put a `metadata.prd=<path>#<section>` pointer on each child bead so the audit can be mechanical. That's cheaper than full self-containment, and ernie's browser page can show coverage.
- **Bead-review tracking (open):** reuse the PRD review pattern on the epic. `set-state beads=polish`, `beads_review=N`. Each polish round runs in a fresh-context agent (his P7/P8 fresh-eyes reset is the strongest single idea here). Findings either edit beads directly or become `discovered-from` bugs labeled `bead-review:rN`.
- **Stop rule instead of a fixed N:** 2–3 polish rounds max for a single user (he does 4–6+ at 300+ beads). Stop when a round produces only small corrective edits, or two rounds in a row are clean, matching his code-review rule. Oscillation → reframe; output growing → step back. ~ His 0.75 weighted score is overkill. ernie could track "edits per round" on the epic and show it.
- **Steal cheaply:** overshoot "lie" (P4/P37) for review rounds. The 3-bucket agree/somewhat/disagree triage (P2) when applying review findings to the PRD. A dedup pass (P9) after breakdown. The reality-check prompt (P29) as a manual ernie action on an epic.
- **Overkill for ernie:** 4-model plan gauntlet, swarm/Agent Mail/file reservations, bv graph routing (`bd ready` is enough), single-branch multi-agent model (ernie is worktree-per-branch), convergence-score math, CASS mining.
- **Code-review tracking:** his per-bead self-review leaves no record. ernie could log `review=N` on each implementation bead (fresh subagent per bead, as he suggests) and only create beads for findings that survive. That matches his "4+ rounds still finding bugs → fix beads" escape hatch.
- **Ad-hoc lane:** worth copying his explicit "small change → TODO list, no beads; promote to beads if it grows" rule so ernie doesn't force a PRD for everything.
- **(X posts) Polish agent gets the PRD every round.** Give each polish round the PRD path and the epic id, and make "is every PRD point embedded in some bead" part of the round (P43, L595). The transfer audit then gets checked continuously, and the final two-way report at the breakdown gate mostly confirms it.
- **(X posts) Fresh-per-round vs same-session:** he defaults to repeated rounds in one session and goes fresh only when it flatlines (L493). ~ Keep ernie's fresh agent per round anyway. With Claude only, fresh context is the one source of reviewer diversity left. But pass the previous round's change summary along so the new agent doesn't redo settled work.
- **(X posts) Expect small PRDs to flatline in 1–2 rounds** (L501). Show "beads edited / created / closed per round" on the epic so the stop rule is visible, not judged by feel.
- **(X posts) Bead text carries the design, `metadata.prd` is audit-only.** The implementer should never need to open the PRD (L437, L591). Add a polish-round check that fails a bead whose design/acceptance only says "see PRD §X".
- **(X posts) Progress display:** count test beads separately from feature beads, since a test-heavy open set makes the closed rate understate progress (L115–L119).
- **(X posts) Per-bead code review prompt:** mention security explicitly instead of adding a separate security pass (L443).
- **(X posts) PRD drafting in an existing repo:** have the drafting agent study analogous existing code first, then re-study it and expand the draft (P44, L563–L565). It's a Claude-only quality step before the 2–5 review rounds.
- **(X posts) ernie as a tool:** give every command a `--json` robot mode, ship a skill with the installer, and after agents have used ernie for real, run a rationalization pass that merges small commands (L741, L819, L899).
- **(X posts) Thinking effort:** his breakdown and polish prompts always asked for max extended thinking ("ultrathink"). Run the breakdown and polish agents at high effort. ✗ Check the current Claude Code mechanism.
