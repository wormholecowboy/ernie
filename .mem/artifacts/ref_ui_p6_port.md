# P6 port into 00-template: assumptions to review (2026-10-17)

The subagent made these calls where ref_ernie_backlog.md "P6 review visualization — DECIDED" was silent.
Code: ref_ernie_views/00-template.html (header comment lists pieces); sample data _sample_state.js:718.

1. Now strip priority: running bead > running planning stage > waiting on you → strip warns "waiting on you" only when nothing runs (dedupe: shows 2.1 teal while E3 gate + 2.4 cap card wait).
2. Stalled = something in progress while worktree session isn't `working` (idle counts as stalled).
3. Gate Approve applies at once (like finding approve); Review again / Polish again / Request changes queue for next prompt; all undoable.
4. Gate ask = new page op `gate ask` (D14 defines only `question ask`, `issue ask`).
5. Polish again limited to ticked beads when any bead in the epic is ticked; button label shows count.
6. Audit skips framing PRD sections (Problem, Goal, Scope, Risks, Open questions), listed "not checked".
7. Review cap read from Settings "Code review max" (default 5), not fixed 5.
8. Cap card vanishes on action; Undo line stays under the questions until next prompt (like Facts dismissed line).
9. Tick applies at once, no Undo (untick = undo); + Bead and Send back apply at once, no Undo (page-button pattern).
10. Sent-back bug shows on Issues as pre-approved finding, source "sent back · <bead>".
11. Ad hoc always listed in epic row, even empty (so + Bead reachable); glue/main Planning now shows empty Ad hoc instead of "no epics".
12. Now strip uses short names ("E1 approve PRD"), full text in tooltip (long text squeezed tabs at 1400px).
13. Home "Where work is" gains a Queue row (up to 3 chips, tick order).

Not built: drag rows to reorder queue (Beads workflow Q3).
Keys: Planning e / n / `/` / esc; gate a r c; bead t r b; capped bead a d r c; Home 1–4 on cap card, `/` ask.
