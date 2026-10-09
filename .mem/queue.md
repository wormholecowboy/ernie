---
updated: 2026-10-09
---
## next
- [ernie] review A95–A109 in .mem/artifacts/ref_ernie_flow_test.md; fold accepted ones into spec_ernie.md + plan_ernie_build.md before phase 1
- [ernie] phase 1 build per .mem/artifacts/plan_ernie_build.md — not started. Order: 1.1 bootstrap (git init done; go mod, install.sh, README, .gitignore left) → 1.1s hook spike (must finish before 1.6, A28) → rest
- [ernie] 1.1s spike remaining: A58 (CLAUDECODE leak into own panes/! mode), A67 interactive (! / queued / interactive slash), cwd follows cd, fork source, SessionStart on clear; fixtures → testdata/hooks (A76). Settled ones: ref_ernie_flow_test.md
## qs
- [ernie] A105 chat approvals: allow claude `issue set approved --quote "…"` or keep page/terminal-only? (asked 2026-10-09)
- [ernie] keep scratch impl (session scratchpad, ephemeral) as phase-1 starting point, or rebuild from spec? (asked 2026-10-09)
