---
updated: 2026-10-10
---
## next
- [ernie] next session: resume conflict walk one at a time — git-tracking q → C1 → C2 (+ update cmd) → C3 → C4; notes → ref_ernie_backlog.md "Conflict discussion"
- [ernie] priorities in order, one at a time (full list + notes → .mem/artifacts/ref_ernie_backlog.md):
- [ernie] P1 Beads: research + spike done → .mem/artifacts/ref_ernie_beads.md; only C3 decision left
- [ernie] P2 planning flow: generate → review (2–5 fresh-context) → advance → build; plans have many steps
- [ernie] P3 tab scopes: session vs issue vs project vs worktree; dropdown placement + filtering (may reopen D4)
- [ernie] P4 data model for state
- [ernie] P5 UI tabs
- [ernie] P6 review visualization (code + plan review issues; new tabs or Planning)
- [ernie] P7 v1 / phase 1 scope; gate: C1–C4 qs resolved first
- [ernie] continue 00-template.html: Home tab left (Planning bead 0.4); then pick it as the phase 3 target
- [ernie] spec amendments the template now needs: phases/beads model (plan is flat), page op `fact research` in PostOps, CLI to update a fact's confidence/method/text (only add/dismiss today)
- [ernie] phase 1 build per .mem/artifacts/plan_ernie_build.md — not started; blocked until P7 + C1–C4 resolved. Order: 1.1 bootstrap (git init done; go mod, install.sh, README, .gitignore left) → 1.1s hook spike (must finish before 1.6, A28) → rest
- [ernie] 1.1s spike remaining: A58 (CLAUDECODE leak into own panes/! mode), A67 interactive (! / queued / interactive slash), cwd follows cd, fork source, SessionStart on clear, A114 item 9 (`*` covers MCP/Agent, tool_input fields, failing Bash → PostToolUseFailure?); fixtures → testdata/hooks (A76). Settled ones: ref_ernie_flow_test.md
## qs
- [ernie] P2 plan-as-document lifecycle (draft → reviewed ×N → approved → building): ernie or Beads labels/metadata? Beads has no plan/phase object (asked 2026-10-10)
- [ernie] git-track the JSONL log (now ~/.local/state, spec l.77)? what for: backup / history / agents read it? gates C1 (asked 2026-10-10)
- [ernie] C1 ernie replaces .mem or feeds it (D9)? rec C: ernie writes .mem markdown directly; waits on git-tracking q (asked 2026-10-10)
- [ernie] C2 what init installs (D12)? rec C: global `ernie setup` from binary + light init; user idea: `ernie update` pulls from main repo (asked 2026-10-10)
- [ernie] C3 Beads vs ernie issue/plan types? two recs to reconcile: Beads owns plans+issues vs Beads owns plans+approved fixes, explained issues stay ernie; spike done, integrate via `bd` CLI not Go lib (asked 2026-10-10)
- [ernie] C4 page `*um` button: queue till next prompt (v1) or channels / headless `claude -p`? before phase 1 (asked 2026-10-10)
- [ernie] fact research trigger: wait for next prompt (mock) vs ernie server runs headless `claude -p` vs channels push into live session? (asked 2026-10-10)
- [ernie] Planning: bead status buttons on the page (queued like issue approve) or read-only? (asked 2026-10-10)
- [ernie] Planning tab placement: 2nd after Home OK? (asked 2026-10-10)
