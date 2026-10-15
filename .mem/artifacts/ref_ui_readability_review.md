# UI readability review of 00-template.html (2026-10-14)

Scope: layout/type/whitespace/density only (colour excluded). Source: subagent review + screenshots at 1400/1000px.
Line numbers are from before the edits; re-find by selector.

## Applied (committed)
- 8767dc0 — #1 type scale: 12px floor, body 15/1.6, list titles 15/1.35 (600 when selected), labels 600 13/1.3 sans sentence case dim (no caps/tracking), secondary 13/1.45 dim, mono only ids (12) / paths+code+tables (13/1.5); `.ws h2` 20/1.3 700; Google Fonts loads wght 400..800; `.gut` align-items baseline
- 8767dc0 — #2 Home: questions left `minmax(0,1fr)`, 340px rail = Where work is → Next prompt delivers → Add a note → Answered → Ops (Ops NOT collapsed, user choice); rail below questions <1000px; `.home-strip` deleted
- 8767dc0 — #3 (partial, user picked): Planning responsive grid; `.chip { text-align:left }`; `.wt-pick-wrap` max-width 240px
- 39ce1fe — #4 whitespace over inner rules: removed rules on `.panel-head`, `.facts li`, `.dec` bar, `.ph-checks`, `.filters`, `.feed li` + head; spacing scale 4/8/12/16/24/32/48; `.ws-foot` margin-top 32px; `.pills` 16px below; `.legend` 24px above
- 39ce1fe — Planning: epics = one left-to-right row above beads | detail at every width (beads 320px ≥1200, 280px 800–1199, 1 col <800); epic row not sticky, beads sticky
- 39ce1fe — tab "Facts & decisions" → "Facts" (tab, h1, header comment); Tool log tab now fits at 1000px

## Not applied — remaining
### #5 one line per list item (Issues, Planning)
- Issues rows 2–3 lines: title wraps at 340px + `.src` line ("code review · 1.2") redundant w/ epic grouping
- fix: `.is-grid` col 1 340 → 380px; titles nowrap + ellipsis + full title in `title=`; drop `.src` from rows (keep short "platform" tag only when owner ≠ us); drop `.cf` confidence glyph from list (detail has How sure); legend items `white-space:nowrap`
- bead rows wrap too (same ellipsis treatment)

### Top bar
- tab strip still clips <~1000px (780px: "Planni…", Tool log); hidden scrollbar = no cue
- rejected for now: move scheme select out, glyph+short labels <1100px
- long worktree names hard-clip under select arrow (no ellipsis; native select)
- `.tab-head h1` repeats tab name at 22/800, costs ~50px every tab → drop h1, keep meta line (sans 13) or counts in tab badge

### Home
- "Where work is": `.bar` full-width own line, "0/3" far from epic chip → `.kv .bar { display:inline-flex; width:96px; vertical-align:middle }`
- `.qf-line .s` status slot shows raw choices "yes / no" when no recommendation → show nothing (or "open")
- `.qf-hint` floats above list detached from buttons → move into selected item's answer row ("j/k next · u undo", 13px) or a sticky shared key bar
- `.kv .k` labels inline → 56px gutter column so chips align
- Next prompt delivers `pre` breaks mid-phrase → wrap at word boundary

### Planning
- empty Depends on / Unblocks rows render "Nothing; can start any time." → omit empty rows or merge into one "Deps" row
- Linked row mixes 3 type styles → one sans 15 line, id mono 13, reason dim 13 suffix
- `p` key not shown on ▤ PRD chip or bead footer → add `<kbd>p</kbd>`
- PRD reader: back button only at bottom → "‹ bead 2.1 · esc" in `.ws-meta` at top; "plan=building" raw → "Plan: building"; `.prd-toc` sticky
- legend → glyph `title=` or key bar

### Issues
- Decide row not in a fixed spot (moves w/ example table; footer follows) → `position:sticky; bottom:0` on Decide; footer keeps only ‹ prev / next ›; drop duplicate "a approve · d dismiss · u undo"
- `.kbtns .msg` wraps beside buttons at 1000px → own line ABOVE buttons (13px dim)
- example table header/values wrap at 1000px (13px mono)

### Facts
- badges vary in width → ids/text start at different x → `.facts li` grid `88px 28px 1fr 24px`
- hint "tap a badge for its method · × to dismiss" in panel head → badge `title` + hover underline
- dismiss × has no Undo → use qf-sent-style "dismissed f2 · Undo"
- order: Decisions | Facts side by side, Glossary below Decisions
- wrapped fact's 2nd line returns under badge at 1000px (fixed by the grid above)
- open q: `.method` 2px left bar (colour = research found / no answer) keep vs indent (rec: keep)

### Tool log
- session id repeated every row → divider row on session change ("session 4995d496 · current", sans 13 600), drop column (~86px)
- Bash descriptions are prose in mono → sans 14 when description; mono for paths/globs/URLs
- "(no description)" italic mono → dim "—"
- rows ~20% taller after #4 (6px padding, 1.5 leading)

### Keyboard (principle: keyboard-first)
- Home j/k vs Issues/Planning `[ ]` → j/k everywhere, `[ ]` alias
- no tab-switch keys → `g h / g p / g i / g f / g l`
- Facts + Tool log have no keys

### Hierarchy inside boxes (colour-adjacent, deferred)
- `--text-dim` #f2e3d2 vs `--text` #f9f3e4 inside orange boxes → muted vs body hierarchy lost; restore dim ink or lean on size/weight

### Font (asked, unanswered)
- `--sans` = Bricolage Grotesque (display face; narrow apertures cost legibility at 13–15px) → proposal: system sans (`-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui`) for body/labels, Bricolage only `.brand` + `.ws h2`; mono stays Fragment Mono

## Keep (works well)
- `dl.gut` gutter + 62ch dd at 15/1.6
- focus list: one question open, ★ status on line, `.qf-body` aligned to question text
- kbd chips in answer/Decide buttons, numbered choices, "need more context" (m), sent/Undo line
- status as text sequence "todo → **active** → done"; blocked "needs 2.1, 2.2" inline
- PRD reader typography (62ch, 15/1.6, h3 17)
- Issues sorted awaiting-approval first; source pill jumps to Planning
- sticky list columns

## Screenshots (scratch, session-local; may be gone)
- scratchpad/uiux (baseline), typescale, layout2, borders/{before,after}, epicrow
