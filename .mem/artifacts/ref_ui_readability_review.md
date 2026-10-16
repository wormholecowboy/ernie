# UI readability review of 00-template.html (2026-10-14)

Scope: layout/type/whitespace/density only (colour excluded). Source: subagent review + screenshots at 1400/1000px.
Line numbers are from before the edits; re-find by selector.

## Applied (committed)
- 8767dc0 — #1 type scale: 12px floor, body 15/1.6, list titles 15/1.35 (600 when selected), labels 600 13/1.3 sans sentence case dim (no caps/tracking), secondary 13/1.45 dim, mono only ids (12) / paths+code+tables (13/1.5); `.ws h2` 20/1.3 700; Google Fonts loads wght 400..800; `.gut` align-items baseline
- 8767dc0 — #2 Home: questions left `minmax(0,1fr)`, 340px rail = Where work is → Next prompt delivers → Add a note → Answered → Ops (Ops NOT collapsed, user choice); rail below questions <1000px; `.home-strip` deleted (superseded 2026-10-15, see below)
- 8767dc0 — #3 (partial, user picked): Planning responsive grid; `.chip { text-align:left }`; `.wt-pick-wrap` max-width 240px
- 39ce1fe — #4 whitespace over inner rules: removed rules on `.panel-head`, `.facts li`, `.dec` bar, `.ph-checks`, `.filters`, `.feed li` + head; spacing scale 4/8/12/16/24/32/48; `.ws-foot` margin-top 32px; `.pills` 16px below; `.legend` 24px above
- 39ce1fe — Planning: epics = one left-to-right row above beads | detail at every width (beads 320px ≥1200, 280px 800–1199, 1 col <800); epic row not sticky, beads sticky
- 39ce1fe — tab "Facts & decisions" → "Facts" (tab, h1, header comment); Tool log tab now fits at 1000px
- 2026-10-15 — font split: `--sans` = system sans (`system-ui` stack) for body/labels, Bricolage Grotesque via new `--display` for titles (brand, tab-head h1, canvas h1, detail h2, style-guide h1/h2); mono stays Fragment Mono
- 2026-10-15 — reading panels on ground: `.panel--ground` / `.tbl-wrap` (page brown + `--border` edge) for Facts panels, Home side cards, Tool log, example tables; orange box only for pick-from things (lifted brown #513d2f rejected: dim 4.36:1, salmon 4.15:1)
- 2026-10-15 — `--warning` (marks) vs `--warning-text` (words) split; answer kbtn brown fill in retro; input placeholders `--text-dim`; Facts `.method` 2px bar kept
- 2026-10-15 — ref_ernie_views/index.html links Template + Style guide
- 2026-10-15 — Home: question status slot empty when no recommendation (no raw "yes / no"); key hint moved under the selected question's answer row ("j / k next question · u undo"); Where work is = 56px label gutter, bar inline 96px beside the epic chip; inbox lines wrap with a hanging indent
- 2026-10-15 — Planning: empty Depends on / Unblocks rows omitted; Linked = one sans line, id mono 13 accent (findings clickable), reason dim 13 suffix (Issues Linked too); `<kbd>p</kbd>` on the PRD chip, footer "j / k bead · { } epic · p PRD"; PRD reader: "‹ bead 2.1 · esc" at top, "Plan: building", sticky section chips; legend dropped, glyphs carry `title=` status
- 2026-10-15 — Issues: Decide moved out of the gutter list, `position: sticky; bottom: 0` on ground; message on its own line above the buttons; footer = ‹ prev / next › only (title j / k); example table cells `nowrap` (scrolls sideways when narrow)
- 2026-10-15 — Facts: Decisions above Glossary; fact rows grid `88px 28px 1fr 24px`; panel-head hint dropped (badge title "show the method…", hover underline); dismiss × queues with "dismissed f2 · goes with your next prompt · Undo"
- 2026-10-15 — Tool log: session column → divider row per session change ("session 4995d496 · current"); Bash/Agent descriptions + item events in sans 14, paths/globs/URLs mono; "(no description)" → dim "—"; rows 4px padding, 1.4 leading
- 2026-10-15 — Keys: j/k prev/next on Planning + Issues (`[ ]` kept as alias); `g h / g p / g i / g f / g l` switch tabs (1 s window; tab buttons' title shows the key); Facts + Tool log get only the tab keys
- 2026-10-15 — Home relayout (user): right rail dropped; top row 3 cards (Where work is · Next prompt delivers · Add a note), questions full width, Answered | Ops 2 columns below (equal height); `.home-grid` → `.home-top` / `.home-bottom`

## Not applied — remaining
### Top bar
- DROPPED (desktop only, 2026-10-15): tab strip still clips <~1100px (6 tabs since Files tab; measured 523px tabs in 520px at 1100, 2026-10-15; was ~1000px; 780px: "Planni…", Tool log); hidden scrollbar = no cue
- DROPPED (desktop only, 2026-10-15): rejected for now: move scheme select out, glyph+short labels <1100px
- DROPPED (desktop only, 2026-10-15): long worktree names hard-clip under select arrow (no ellipsis; native select)
- `.tab-head h1` repeats tab name at 22/800, costs ~50px every tab → drop h1, keep meta line (sans 13) or counts in tab badge

### Hierarchy inside boxes (colour-adjacent, deferred)
- `--text-dim` #f2e3d2 vs `--text` #f9f3e4 inside orange boxes → muted vs body hierarchy lost; restore dim ink or lean on size/weight
- 2026-10-15: no dim ink can pass 4.5:1 on orange (cream itself is only 4.74:1) → only size/weight left; not done

## Rejected
### #5 one line per list item (Issues, Planning)
- Issues rows 2–3 lines: title wraps at 340px + `.src` line ("code review · 1.2") redundant w/ epic grouping
- fix: `.is-grid` col 1 340 → 380px; titles nowrap + ellipsis + full title in `title=`; drop `.src` from rows (keep short "platform" tag only when owner ≠ us); drop `.cf` confidence glyph from list (detail has How sure); legend items `white-space:nowrap`
- bead rows wrap too (same ellipsis treatment)
- user kept multi-line rows (2026-10-15)

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
