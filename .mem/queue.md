---
updated: 2026-10-09
---
## next
- [ernie] phase 1 build per .mem/artifacts/plan_ernie_build.md — not started. Order: 1.1 bootstrap (git init done; go mod, install.sh, README, .gitignore left) → 1.1s hook spike (must finish before 1.6, A28) → rest
- [ernie] 1.1s spike settles: hook-output cap (A57), env-var leak into panes/! (A58), UPS firing on slash cmds/!/queued msgs (A67, before 1.9), CLAUDE_PROJECT_DIR in hook+Bash env (A68), env var in subagent Bash (A83)
