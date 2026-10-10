# ernie — Response formats for explaining issues

**Captured:** 2026-10-09 · **Source:** subagent scan of `~/.claude/projects` transcripts (102 sessions, 746 user messages, ~45 exchanges read closely) · **Amendments:** A88–A94 in `plan_ernie_build.md` §0

Goal: Claude stops sending big blocks of text when explaining issues. Claude picks the ernie primitive that fits and updates the page through the CLI. The local worktree settings tell Claude to use ernie.

Citation key: `g31`=glue-CDIT-2631, `g27`=glue-CDIT-2627, `a31`=aws-CDIT-2631, `rdl`=reporting-dashboard-superblocks-live, `rds`=reporting-dashboard-sync-apps-old-prod, `dot`=-dotfiles, `cp`=-claude-projects. Format: `<project>/<session-uuid-first-8>:<jsonl-line>`. All dates are 2026.

---

## Status: accepted vs pending

Every format found is kept. **Accepted** means it maps to a primitive change you approved on 2026-10-09 (A88–A92). **Pending** means it isn't decided yet.

### Accepted

| Format | Primitive | Amendment |
|---|---|---|
| Question with context, example, recommendation, impact | `question` + new fields | A88 |
| "Need more context" answer on any question | `question` (reserved answer) | A88 |
| One-at-a-time counter (Qn/m, H1 of 7) | `question` / `issue` order shown as N/M | A88, A89 |
| Options tried on the same example, with a recommendation | `question` `recommended` + `example` ref | A88 |
| Issue card (atomic example → cause → fix → impact → confidence) | NEW `issue` | A89 |
| Explained → approved → fixed gate (don't fix before you understand) | `issue` status | A89 |
| Ours vs. theirs triage | `issue` `owner` | A89 |
| Impact / necessity line | `issue` `impact`, `question` `impact` | A88, A89 |
| Atomic worked example (2 real rows, fields as row labels) | NEW `example` | A90 |
| Mapping table (A-field → B-field) | `example` | A90 |
| "See for yourself" runnable file | `example` `run` path | A90 |
| Checked / inferred / not checked | `confidence` + `method` fields on `issue` and `fact` (not a separate `check` type) | A91 |
| Evidence = the command or query used, not only `file:line` | `method` field | A91 |
| Glossary entry for labels Claude coins (G0, H1, D10) | `fact` with `kind: term` (not a separate `term` type) | A92 |
| Arrow flow / timeline | `diagram` (Mermaid), no change | — |

### Decided later (2026-10-09)

| Format | Proposed home | Amendment |
|---|---|---|
| Handoff text for another audience (scrum master, platform team, another chat) | deferred to v2; v1 uses a terminal blockquote | A93 |
| Assumption check ("I assumed X. True?") | `ernie ask --assume` → `question` `kind: assume`, yes/no | A94 → A113 |
| Annotated mini-lesson (an annotated code block you save to pnotes) | terminal only, saved via `/pnotes`; no primitive | A94 |
| Terminal writing rules for the `ernie` skill: TL;DR states your action · bold labels tied to an example · arrows ≤4 hops, longer flows as numbered steps · glyphs only on example outcomes · 3–5 line before/after instead of a diff · blockquote only for copy-ready text · one issue per message · purpose before options | `CLAUDE.local.md` block written by `ernie init`, not the skill | A94 → A112 |

---

## A. Verdict on the 10 original suggestions

| # | Suggestion | Verdict | Evidence | Note |
|---|---|---|---|---|
| 1 | TL;DR first | modify | g27/3d5dcfef:95 (10-06) "Short version…"; g31/41f6e68d:343 (10-02) "so nothing to change right now?" | The bottom line must say what the user has to do, not only the finding |
| 2 | Bold lead labels | keep | g31/5078a5f6:138 (10-02) Problem/How/Effect/Why-slipped/Fix → "fix. next" | Labels work only when tied to a concrete example |
| 3 | Arrow chains | keep | g31/fe2297c1:331,337 (10-08) arrow code block → user moved on | Up to about 4 hops. Longer flows become numbered steps (rdl/1fda0c6e:276) |
| 4 | Status glyphs | keep (minor) | g31/748b93f4:54,105 (10-08) ✅/❌ on example rows | Use on example outcomes, not as decoration |
| 5 | `diff` blocks | modify | Used once in 641 replies. A before/after snippet → "approved" (g27/514001f7:48-51, 10-09) | The user reads real diffs in git. Chat needs a 3–5 line before/after |
| 6 | Timelines | keep | cp/a7363db7:665→668 (10-07) Time/Runs/Result table → "yes, apply"; g31/39d4602b:100→103 (10-05) | Strong for state over time and for races |
| 7 | Blockquotes for errors | modify | The user pastes errors themselves (rds/383e28ba:308). Blockquoted draft reply → "agree, next" (g31/3d2be1f5:127-133, 10-07) | Use blockquotes for copy-ready text |
| 8 | `file:line` | modify | a31/95c246ac:692 (09-30) "keeping track of which dbs, tables, fields"; g31/41f6e68d:332 "how are you verifying… specify" | Evidence = object path plus the query or command used to check it |
| 9 | Headers past ~15 lines | modify | g31/41f6e68d:292 had a headed section ("New concern") and still got "i don't understand" (:312) | Headers don't fix bundling. Split topics: one issue per message |
| 10 | Fixed issue card | modify | Shape that worked: Problem → What happens (numbered) → Fix (code) → Choice → Ask, g31/2b398204:107→110 (10-02) | Lead with an atomic example. Add impact and how sure. Make fields optional |

## B. Formats the original suggestions missed

1. **Atomic worked example.** Two real rows side by side, with field names as row labels.
   - Moment: a31/95c246ac:692 (09-30), right after an aggregate-rate table: "I don't understand the problem at all… pick a small atomic example." The two-row walkthrough at :713 worked.
   - Example:
     ```
     | ga4_hits field | Row A        | Row B        |
     | site_platform  | Dealer Spike | Dealer Spike |
     | page_location  | …-14615315i  | …-16189193   |
     ```
2. **"See for yourself" runnable file.** A small numbered query file with the context it needs.
   - Moments: a31/95c246ac:738 "The sql file explanation was way more helpful and i wish i just had that from the beginning"; g31/3d2be1f5:63 "want to see myself"; g31/748b93f4:73 "create views to test your theory".
   - Example: `-- 1. what you'll see: raw hits for one host` / `SELECT … LIMIT 5`
3. **Checked / inferred / not checked.** A confidence tag on every claim.
   - Moment: g31/fe2297c1:339 (10-08): "did you confirm '…Memory says…'? if not, use sub agent."
   - In rds/383e28ba Claude claimed a proven root cause three times (:163, :300, :862 "I verified… the code you're running cannot be the code in the repo"). It was wrong (:991). The user had already said "Nothing has been fixed." (:664).
   - Example: `✓ verified: SELECT DISTINCT (get-dev-clients.ts:62)` · `~ inferred: ghost DOM` · `✗ not checked: live DOM (SSO wall)`
4. **Assumption check.**
   - Moment: g31/4995d496:152 (10-09): "are you going off the clients list for this? there are clients currently missing from that". Claude's stand-in source was buried under "Other findings" (:139).
   - Example: `I assumed: publicDigmsDB.clients = Glue's client list. True?`
5. **Impact / necessity line.** What breaks if we skip it.
   - Moments: g31/da787a64:638 (10-02) "i feel we are overoptimizing here. how necesary is h1"; g27/41ae43d1:137→140 (10-08) "How much this matters: not much" → "non-issue".
   - Example: `Impact if skipped: stage run reports success with 0 rows. Effort: 20 lines.`
6. **Glossary entry, and purpose before options.**
   - Moments: g27/3fb7e802:251 (10-09) "run GO? what do you mean?" (Claude's own label G0); g27/b1b56eca:174 (10-07) "what is the point of the key" (options came before purpose); `/define` used at g31/65051ba6:131,142.
   - Example: `**G0** — throwaway probe script against stage GSC lambda.`
7. **Ours vs. theirs triage.** Group issues by who owns the fix.
   - Moment: g31/748b93f4:137 (10-08), after an 11-item list: "Many of the issues seem to be with platform config… what is left for us to do?"
   - Example: `Ours (2): backfill, owner column · Platform team (5): …`
8. **Audience rewrite / handoff text.**
   - Moments: g31/f8503962:45 (10-07) "scrum master… didn't undertand it"; g31/41f6e68d:338 "for a non-tech person"; rds/383e28ba:865 "so i can copy paste in another chat".
   - Example: a block with an audience tag and a copy button.
9. **Options tried on the same example, with a recommendation.**
   - Moments: rdl/1fda0c6e:164→167 (09-14) attack-blocked / legit-user examples per option → "implement option A"; g27/3d5dcfef:53 (10-06).
   - Example: `| rule | who gets the view |` with one row per option.
10. **One-at-a-time queue with a counter.**
    - Moments: `*one` used 11 times. "H1 of 7" (g31/2b398204:107) and "6/7" (g31/3d2be1f5:127) → "agree, next".
11. **Annotated mini-lesson** that the user saves as a cheatsheet.
    - Moment: g27/3d5dcfef:98-104 "quick lesson on how to read these… *sa", then an annotated code block, then `/pnotes`.
    - Example: `(cost=…) (actual time=…)` with a `└─ estimate │ └─ measured` line under it.
12. **Mapping table** (A-field → B-field) plus an analogy.
    - Moment: rdl/1fda0c6e:272 "I don't understand, isn't the jwt passed…" → :276 claim → `ctx.user` table plus an "Express `req.user`" analogy → the user moved on.

## C. Mapping to ernie (as proposed by the scan)

| Format | Surface | Primitive | Why |
|---|---|---|---|
| TL;DR + your action | both | fact | One line belongs in the terminal too |
| Issue card | ernie | NEW `issue` | Review findings are walked one by one ("fix", "next") |
| Atomic example / mapping table | ernie | NEW `example` (scoped table) | Strongest recovery after confusion |
| Runnable file | ernie | `example.runnable` | Link to the path; the user runs it |
| Checked / inferred | ernie | NEW `check` → accepted as fields instead (A91) | Trust failures cost the most round-trips |
| Assumption check | ernie | question (`kind: assume`) | Fits question with yes/no choices |
| Glossary | ernie | NEW `term` → accepted as `fact kind: term` (A92) | Labels Claude coins confuse the user |
| Handoff text | ernie | NEW `share` | Frequent copy-paste to other people |
| Options + recommendation | both | question + `recommended` flag | — |
| Arrow flow / timeline | ernie | diagram (Mermaid) | Already supported |
| One-at-a-time counter | ernie | question / issue order | Show the N/M position |

Most important finding: change the existing `question` primitive. Add `context`, `example`, `recommended` and `impact` fields, plus a built-in "need more context" answer.
- The user answers numbered questions inline and marks single items as confusing: g31/4995d496:141 "2. i dont understand"; g27/41ae43d1:134 "Q3… what is this?"; g27/3d5dcfef:49 "need more context on q1"; g31/4995d496:213 "q2: answer my questions first".
- Turns containing `Qn/m` were followed by confusion 16% of the time, against about 7% across all turns (heuristic).

Scan's proposed new primitives (priority order), before the trim:
1. `issue` {id, title, status, impact, example_ref, cause, fix, owner: us|other, checks[]}: the review walk-through (H1/M1/L1 → "fix. next") repeats across about 10 sessions.
2. `example` {title, columns[], rows[], caption, runnable_path, run_context}: a31/95c246ac:738.
3. `check` {claim, status: verified|inferred|unchecked, method, ref}: rds/383e28ba:991, g31/fe2297c1:339, g31/1f11dabd:342 "how do i verify that you actually ran commands".
4. `term` {term, definition, ref}: `/define` exists and is used; g27/3fb7e802:251.
5. `share` {audience, text, ref}: g31/f8503962:61, rds/383e28ba:865, rdl/1fda0c6e:784.

## D. Where Claude and the user clash on issues (ranked by impact)

1. **Abstract or aggregate first; the user needs a concrete example first.** Claude leads with rates, percentages and mechanisms; the user needs one real row traced through every table. a31/95c246ac:689→692; g31/41f6e68d:292→312 "i don't understand… why is there no data"; g31/4995d496:168 "tell me exactly which ids are not matching up… give example". Frequent. Fix: `example` before any aggregate.
2. **Questions buried at the end of long, multi-topic replies.** g31/da787a64:626→628 "what are you asking me about h1"; dot/20b015d3:608 "i don't understand your open question". Frequent. Fix: questions go to the page with context, not into prose.
3. **Overconfident root cause or verification claims.** "Root cause found", "verified", "type-check passes". rds/383e28ba:654 "my earlier 'type-check passes' claims were vacuous"; :664 "Nothing has been fixed."; the user's console warning was the real proof (:900). Sometimes, but costly. Fix: confidence status on claims.
4. **Acting before the user understands.** g31/5078a5f6:121 "tell me the problem first before fixing these"; g31/4995d496:213 "answer my questions first"; cp/a7363db7:641 "I did not tell you to to impl #10, revert that." Sometimes. Fix: explained → approved → fixed, gated on the user.
5. **Labels and jargon Claude invents without defining.** g27/3fb7e802:251 (G0); g31/fe2297c1:327 "how did we get hits without a tag?"; g31/65051ba6:131 `/define`. Frequent. Fix: a term entry the first time a label is used.
6. **Exhaustive edge cases with no sense of how much they matter.** g31/da787a64:638 "overoptimizing"; g27/41ae43d1:140 "non-issue"; g31/748b93f4:137. Sometimes. Fix: required `impact`, sort by owner.
7. **Options before purpose.** g27/b1b56eca:167→174; rdl/1fda0c6e:250 "why do both exist?". Sometimes. Fix: "what it is / why it exists" line first.
8. **Stand-in assumptions stated as fact.** g31/4995d496:152; g31/fe2297c1:339. Sometimes. Fix: an assumption question on the page.
9. **Explanations aimed only at the user, even when they'll be shared.** g31/f8503962:45; g31/41f6e68d:338. Sometimes. Fix: `share`.

## E. Overall impression

- Learns by tracing: one concrete case, every object named, then the rule. Aggregates feel like hand-waving (a31/95c246ac:738).
- Wants to verify for themselves: asks for the queries, the method and the location (g31/1f11dabd:342, g31/3d2be1f5:63), and pushes back when evidence is weak.
- `*sa` is the main control: 64 uses in about 746 messages. `caveman` and `brakes` were never invoked; `/explain` is defined but unused (inference: wants short answers, not a mode).
- Answers multi-question messages item by item and flags single items as unclear. The unit of work is the item, not the message.
- Often owns the decision and corrects Claude's domain premises ("I don't think the dealers really care", g31/748b93f4:57). Claude over-engineers; the user trims.
- Claude's main misread: it treats length and completeness as diligence. The user reads them as noise that hides the one question they're supposed to answer.
- Explanations are often for someone else (scrum master, platform team, another chat), so they need to be portable.
- Inference: an earlier session wrote a long explain-with-data guide (`~/.claude/explain-with-data.md`) and imported it into CLAUDE.md; it was reverted as unrequested (cp/a7363db7:641). What remains is the user's own one-line rule ("small atomic example. Keep it short."). Short self-written rules win.

## F. Method and limits

- All 102 non-subagent sessions with user turns, across 22 project dirs; 746 real user messages indexed. About 45 exchanges read closely in about 25 sessions (g31, g27, a31, rdl, rds, dot, cp, nvim).
- Heuristic: the Claude reply before a confused user turn had a median of 267 words (41% over 300); before an accepting turn, 196 words (25% over 300). Only the last assistant text block per turn was measured.
- Skewed toward data/ETL work (g31 is about 40% of sessions). Tooling sessions (dot, nvim) have little issue-explanation material.
- October replies are terser and more structured than September ones. Subagent transcripts and the 24 interruptions weren't analyzed in depth.
