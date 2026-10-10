## learnings
- [claude-hooks] UserPromptSubmit + SessionStart: plain stdout (exit 0) → added to Claude context. SessionStart matchers: startup|resume|clear|compact|fork (docs, 2026-10-02)
- [claude-hooks] Stop payload (2.1.287) has last_assistant_message + stop_hook_active (false; true on the stop after a block); block = top-level {"decision":"block","reason":"…"}, continues same turn (same prompt_id), ~2 s (probe 2026-10-09)
- [claude-hooks] PostToolUse Bash `tool_response` = {stdout, stderr, interrupted, isImage, noOutputExpected}; Write/Edit = {type, filePath, content, structuredPatch, originalFile, userModified} (2.1.286, 2026-10-09)
- [claude-hooks] `claude -p --resume <id>` on a session open elsewhere interleaves into one transcript; open TUI never sees it → can't push into a live session. Channels can (research preview: `notifications/claude/channel`, `--dangerously-load-development-channels server:<name>`; Team/Enterprise orgs need `channelsEnabled`)
- [claude-hooks] hook stdout ≤ ~10,000 chars injected inline; ≥10,010 B → saved to file, model sees <persisted-output> + 2 KB preview only
- [claude-hooks] CLAUDE_PROJECT_DIR in every hook env, NOT in Bash tool env; CLAUDECODE=1 + CLAUDE_CODE_SESSION_ID in Bash, hook and subagent Bash envs
- [claude-hooks] CLAUDE_ENV_FILE only in SessionStart hook env; `export` lines written there reach Claude's Bash, subagents included
- [claude-hooks] Bash tool stdin = /dev/null (char device, immediate EOF)
- [claude-hooks] -p mode: /compact, /model, /cost don't fire UserPromptSubmit; /compact fires SessionStart source=compact; slash text that reaches the model fires UPS with raw prompt
- [claude-hooks] failed Edit (old_string not found) fires neither PostToolUse nor PostToolUseFailure
- [claude-hooks] Bash(x:*) allow covers newline-batched x calls; NOT heredoc `x <<'EOF'`, NOT batches mixed with other cmds; `printf … | x` allowed
- [claude-hooks] untrusted workspace: project permissions.allow ignored (stderr warning) but project hooks still run in -p
- [claude-hooks] payloads carry session_id, prompt_id, transcript_path, permission_mode, effort; subagent calls add agent_id + agent_type
- [claude-hooks] CLAUDE.local.md at repo root is still loaded (probe 2.1.287, Haiku -p, 2026-10-09)
- [claude-hooks] live hook probes: nested `claude -p` under `env -i` (min env) + `--setting-sources project --strict-mcp-config`; allow rules via `--settings` (untrusted dir)
- [ernie] -p denies anything not pre-allowed; interactive mode prompts instead → flow-test F2/F5 (dropped calls, heredoc) are prompts, not losses, in real use
- [ernie] live flow verdict: plumbing (lock, delivery, ids, guards) holds; risk is what Claude logs (prose-only Qs, retries drop calls, issues not closed)
## gotchas
- [claude-hooks] hook exit code 2 = blocking error, and Go panics exit 2 → Go hook handlers must recover and exit 0
- [claude-hooks] dotfiles hooks calling ernie must guard on the binary (`[ -x … ] && … || true`); ~/things/myc isn't synced by dotfiles, missing binary = hook error every tool call
- [ernie] `git rev-parse` ≈12 ms → hooks miss 10 ms budget unless they skip git (A96); fold 50k = 67 ms, 75% allocs = activity buffer (A109)
- [ernie] dump has no notes → page notes vanish after /clear/compaction unless promoted (A106)
## arch
- [ernie] source here (~/things/myc/ernie), built to ~/.local/bin. Dotfiles holds only Claude-side pieces: hooks in claude/.claude/settings.json, ernie skill, mem/gtg/handoff edits, install.txt entry
- [docs] spec + build plan live in .mem/artifacts/ (D10), not docs/
- [ernie] writing rules live in CLAUDE.local.md block written by `ernie init` (A112), not the skill; skill holds only ernie-specific rules
- [ernie] attribution: by=claude iff Claude Bash env var set (A53); no cmd text in v1 (A62); every tool call → `tool run` activity row, Bash shows description only (A114)
## reference
- [ernie] spec → .mem/artifacts/spec_ernie.md
- [ernie] build plan (phases, tasks, amendments A1–A114) → .mem/artifacts/plan_ernie_build.md
- [ernie] page mock, phase 3 visual target → .mem/artifacts/spec_ernie_mock.html
- [ernie] design walkthrough → .mem/artifacts/ref_ernie_proposal.html
- [ernie] response formats for explaining issues (transcript study, all decided: A88–A92 accepted, A93 v2, A94 → A112/A113) → .mem/artifacts/ref_ernie_formats.md
- [ernie] scratch flow test report (works/fails, spike results, A95–A111 folded) → .mem/artifacts/ref_ernie_flow_test.md
