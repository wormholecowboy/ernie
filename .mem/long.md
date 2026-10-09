## learnings
- [claude-hooks] UserPromptSubmit + SessionStart: plain stdout (exit 0) → added to Claude context. SessionStart matchers: startup|resume|clear|compact|fork (docs, 2026-10-02)
- [claude-hooks] Stop hook block = top-level `{"decision":"block","reason":"…"}`; `stop_hook_active` not listed in hooks reference
- [claude-hooks] PostToolUse Bash `tool_response` shape undocumented — capture real payload before parsing (hook spike, task 1.1s)
- [claude-hooks] `claude -p --resume <id>` on a session open elsewhere interleaves into one transcript; open TUI never sees it → can't push into a live session. Channels can (research preview: `notifications/claude/channel`, `--dangerously-load-development-channels server:<name>`; Team/Enterprise orgs need `channelsEnabled`)
## gotchas
- [claude-hooks] hook exit code 2 = blocking error, and Go panics exit 2 → Go hook handlers must recover and exit 0
- [claude-hooks] dotfiles hooks calling ernie must guard on the binary (`[ -x … ] && … || true`); ~/things/myc isn't synced by dotfiles, missing binary = hook error every tool call
## arch
- [ernie] source here (~/things/myc/ernie), built to ~/.local/bin. Dotfiles holds only Claude-side pieces: hooks in claude/.claude/settings.json, ernie skill, mem/gtg/handoff edits, install.txt entry
- [docs] spec + build plan live in .mem/artifacts/ (D10), not docs/
- [ernie] attribution: by=claude iff Claude Bash env var set (A53); no cmd run events in v1 (A62)
## reference
- [ernie] spec → .mem/artifacts/spec_ernie.md
- [ernie] build plan (phases, tasks, amendments A1–A87) → .mem/artifacts/plan_ernie_build.md
- [ernie] page mock, phase 3 visual target → .mem/artifacts/spec_ernie_mock.html
- [ernie] design walkthrough → .mem/artifacts/ref_ernie_proposal.html
- [ernie] response formats for explaining issues (transcript study, accepted vs pending, A88–A94) → .mem/artifacts/ref_ernie_formats.md
