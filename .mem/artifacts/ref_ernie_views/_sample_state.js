// Shared sample data for the ernie view variations (ref_ernie_views/*.html).
// Every mock inlines a copy of ERNIE_SAMPLE so all ten show the same data and differ only in layout.
// Shapes follow spec_ernie.md (event types, fold output) plus A114 `tool run` activity rows.
// Fields marked "view-only" are not in the spec yet; mocks that use them should say so.

const ERNIE_SAMPLE = {
  server: { port: 7477, version: 'v0.1.0-12-g3c9e1a7', connected: true },

  // One entry per log file (~/.local/state/ernie/<repo>/<branch>.jsonl). Worktrees of one repo share the repo slug.
  logs: [
    {
      key: 'glue/CDIT-2631-ga4-dedupe', repo: 'glue', branch: 'CDIT-2631-ga4-dedupe', on: true,
      worktree: '~/things/myc/glue/CDIT-2631-ga4-dedupe', // view-only: spec stores the repo root, not the worktree path
      session: { id: '4995d496', state: 'working', lastEventAgo: '3s' }, // view-only: derived from hook timestamps
    },
    {
      key: 'glue/CDIT-2627-gsc-backfill', repo: 'glue', branch: 'CDIT-2627-gsc-backfill', on: true,
      worktree: '~/things/myc/glue/CDIT-2627-gsc-backfill',
      session: { id: '3fb7e802', state: 'waiting on you', lastEventAgo: '6m' },
    },
    {
      key: 'glue/main', repo: 'glue', branch: 'main', on: true,
      worktree: '~/things/myc/glue/main',
      session: { id: null, state: 'idle', lastEventAgo: '1d' },
    },
    {
      key: 'ernie/main', repo: 'ernie', branch: 'main', on: true,
      worktree: '~/things/myc/ernie/main',
      session: { id: '715abde2', state: 'idle', lastEventAgo: '2h' },
    },
    {
      key: 'dotfiles/main', repo: 'dotfiles', branch: 'main', on: false, // has a main.off marker
      worktree: '~/.dotfiles',
      session: { id: null, state: 'off', lastEventAgo: '5d' },
    },
  ],

  // Folded state per log key, as `GET /stream` would push it.
  states: {
    'glue/CDIT-2631-ga4-dedupe': {
      turn: 14,
      plan: [
        { id: 'p1', text: 'Reproduce double count on one Dealer Spike host', status: 'done' },
        { id: 'p2', text: 'Find the dedupe gap', status: 'done' },
        { id: 'p3', text: 'Normalize page_location before hashing', status: 'active' },
        { id: 'p4', text: 'Backfill 90 days', status: 'todo' },
        { id: 'p5', text: 'Verify session counts on stage', status: 'todo' },
        { id: 'p6', text: 'Open PR', status: 'todo' },
      ],
      decisions: [
        { id: 'd1', text: 'dedupe_key = sha1(session_id, normalized page_location, event_ts)', why: 'event_ts alone collides across tabs; session_id alone merges real repeat views' },
        { id: 'd2', text: 'Platform-side bugs go to the platform team, not fixed in glue', why: 'we only own the loader and views' },
      ],
      questions: [
        {
          id: 'q1', kind: 'assume', text: 'publicDigmsDB.clients = Glue\'s client list', choices: ['yes', 'no'],
          context: 'The 212-site count below comes from joining ga4_hits to publicDigmsDB.clients.',
          impact: 'If clients is missing sites, the double-count rate is understated.',
        },
        {
          id: 'q2', text: 'Normalize page_location in the SQL view or in the loader?', choices: ['view', 'loader'], recommended: 'view',
          context: 'Both fix new rows. Only the view also fixes old rows without a backfill.',
          impact: 'Loader means a 90-day backfill (~40 min on stage) before counts are right.',
          example: 'e2',
        },
        { id: 'q3', text: 'Backfill window?', choices: ['30 days', '90 days'], answer: '90 days' },
        {
          id: 'q4', text: 'Should the dedupe also cover Dealer Inspire hosts?', choices: ['yes', 'no'],
          more: true, followUp: 'need more context', // answered "need more context" → stays open (A88)
        },
      ],
      issues: [
        {
          id: 'i1', title: 'Dedupe key ignores the trailing "i" on listing ids', status: 'explained', owner: 'us',
          cause: 'page_location for the same listing arrives as …-14615315i and …-14615315, so one session hashes to two keys.',
          fix: 'Strip a trailing "i" from the listing id segment before hashing.',
          impact: '~3.1% of sessions double-counted on 212 Dealer Spike sites.',
          confidence: 'verified', method: 'SELECT page_location, dedupe_key FROM ga4_hits WHERE host = \'ds-4471.dealerspike.com\' LIMIT 5',
          example: 'e1',
        },
        {
          id: 'i2', title: 'Backfill job skips days with late-arriving hits', status: 'approved', owner: 'us',
          cause: 'The job filters on load_date, but late hits land under the next day\'s partition.',
          fix: 'Filter on event_date with a 2-day lookback.',
          impact: 'Up to 0.8% of hits missing from any backfilled day.',
          confidence: 'inferred', method: 'read backfill.py:88; not run',
          quote: 'approved, fix it',
        },
        {
          id: 'i3', title: 'SPA route changes send page_view twice', status: 'explained', owner: 'other',
          cause: 'The platform GTM container fires page_view on history change and on load.',
          fix: 'Platform team removes the history-change trigger.',
          impact: 'Inflates page_views ~1.4%; sessions are unaffected after i1.',
          confidence: 'unchecked', method: 'needs GTM access (SSO wall)',
        },
        {
          id: 'i4', title: 'Stage run reports success with 0 rows', status: 'fixed', owner: 'us',
          cause: 'Empty result set was treated as success.', fix: 'Fail the run when rows_written = 0.',
          impact: 'Silent empty loads on stage.', confidence: 'verified', method: 'go test ./loader/... and a stage run',
        },
        {
          id: 'i5', title: 'GTM container v41 missing consent tag', status: 'dropped', owner: 'other',
          cause: 'Consent tag removed in v41.', fix: 'Platform re-adds it.', impact: 'Not related to this ticket.',
          confidence: 'inferred', method: 'GTM changelog',
        },
      ],
      examples: [
        {
          name: 'e1', title: 'Same listing, two page_location values',
          columns: ['ga4_hits field', 'Row A', 'Row B'],
          rows: [
            ['site_platform', 'Dealer Spike', 'Dealer Spike'],
            ['session_id', '1728…441', '1728…441'],
            ['page_location', '…/2019-ford-f150-14615315i', '…/2019-ford-f150-14615315'],
            ['dedupe_key', 'a91f…', 'c03e…'],
          ],
          caption: 'Same session, same listing, two keys → counted twice.',
          run: 'sql/probe_dedupe.sql',
        },
        {
          name: 'e2', title: 'Where to normalize: options run on e1',
          columns: ['option', 'Row A key', 'Row B key', 'result'],
          rows: [
            ['view', 'a91f…', 'a91f…', '✓ one row, old data fixed too'],
            ['loader', 'a91f…', 'a91f…', '✓ one row, needs backfill'],
            ['none (today)', 'a91f…', 'c03e…', '✗ counted twice'],
          ],
          caption: 'Both options fix e1; only the view fixes rows already loaded.',
        },
      ],
      facts: [
        { id: 'f1', text: 'ga4_hits holds 41.2M rows for September', confidence: 'verified', method: 'SELECT count(*) FROM ga4_hits WHERE event_date BETWEEN …' },
        { id: 'f2', text: 'Duplicates appear only on Dealer Spike hosts', confidence: 'inferred', method: 'grouped by site_platform on a 1-day sample' },
        { id: 'f3', text: 'Consent mode drops ~2% of hits', confidence: 'unchecked' },
        { id: 'f4', kind: 'term', term: 'DS', text: 'Dealer Spike, the site platform behind 212 client sites' },
        { id: 'f5', kind: 'term', term: 'H1', text: 'hypothesis that trailing-"i" listing ids split one session into two keys (now i1)' },
      ],
      notes: [
        { id: 'n1', text: 'platform contact is #glue-platform, ask for GTM read access', ref: 'i3' },
      ],
      diagrams: [
        {
          name: 'flow', mermaid: `flowchart LR
  GTM["GTM / gtag"] -->|hits| L["loader"]
  L -->|"dedupe_key"| H[("ga4_hits")]
  H --> V["sessions view"]
  V --> D["dashboard"]
  L -. "i1: key split here" .-> H`,
        },
        {
          name: 'late-hits', mermaid: `sequenceDiagram
  participant GTM
  participant Loader
  participant Backfill
  GTM->>Loader: hit (event_date 10-07, arrives 10-08 02:10)
  Loader->>Loader: partition load_date = 10-08
  Backfill->>Loader: reload load_date = 10-07
  Note over Backfill: late hit missed (i2)`,
        },
      ],
      // Newest first. by: claude (CLI writes), hook (file touch, tool run, turn mark), user (page or your terminal).
      // `tool run` text is the tool's one-line summary; Bash shows its description, never the command (A114).
      activity: [
        { ts: '14:21:08', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Run dedupe probe on stage' },
        { ts: '14:21:02', by: 'hook', t: 'file', op: 'touch', tool: 'Edit', text: 'sql/views/sessions.sql' },
        { ts: '14:20:51', by: 'hook', t: 'tool', op: 'run', tool: 'Read', text: 'sql/views/sessions.sql' },
        { ts: '14:20:44', by: 'hook', t: 'tool', op: 'run', tool: 'Grep', text: 'dedupe_key' },
        { ts: '14:20:30', by: 'claude', t: 'plan', op: 'set', text: 'p3 → active' },
        { ts: '14:20:12', by: 'hook', t: 'turn', op: 'mark', text: 'turn 14 · delivered 1 event' },
        { ts: '14:19:58', by: 'user', t: 'question', op: 'answer', text: 'q3 → 90 days' },
        { ts: '14:12:40', by: 'claude', t: 'question', op: 'add', text: 'q2 Normalize in the view or the loader?' },
        { ts: '14:12:31', by: 'claude', t: 'example', op: 'put', text: 'e2 Where to normalize: options run on e1' },
        { ts: '14:12:05', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Compare keys for both options on e1 rows' },
        { ts: '14:11:20', by: 'hook', t: 'tool', op: 'run', tool: 'Agent', text: 'Find every reader of dedupe_key', agent: null },
        { ts: '14:11:18', by: 'hook', t: 'tool', op: 'run', tool: 'Grep', text: 'dedupe_key', agent: 'Explore' },
        { ts: '14:11:16', by: 'hook', t: 'tool', op: 'run', tool: 'Glob', text: '**/*.sql', agent: 'Explore' },
        { ts: '14:11:14', by: 'hook', t: 'tool', op: 'run', tool: 'Read', text: 'loader/hash.py', agent: 'Explore' },
        { ts: '14:10:02', by: 'claude', t: 'issue', op: 'add', text: 'i3 [other] SPA route changes send page_view twice' },
        { ts: '14:09:47', by: 'claude', t: 'issue', op: 'add', text: 'i1 [us] Dedupe key ignores the trailing "i"' },
        { ts: '14:09:30', by: 'claude', t: 'example', op: 'put', text: 'e1 Same listing, two page_location values' },
        { ts: '14:09:02', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Pull 5 hits for one Dealer Spike host' },
        { ts: '14:08:40', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Count rows per dedupe_key for Sept' },
        { ts: '14:07:15', by: 'hook', t: 'tool', op: 'run', tool: 'WebFetch', text: 'https://support.google.com/analytics/answer/9234069' },
        { ts: '14:06:58', by: 'user', t: 'issue', op: 'set', text: 'i2 → approved' },
        { ts: '14:06:02', by: 'hook', t: 'tool', op: 'run', tool: 'mcp__claude_ai_Google_Drive__search_files', text: '' },
        { ts: '14:05:30', by: 'claude', t: 'fact', op: 'add', text: 'f1 ✓ ga4_hits holds 41.2M rows for September' },
        { ts: '14:05:12', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: '' }, // a Bash call without a description
        { ts: '14:04:50', by: 'hook', t: 'tool', op: 'run', tool: 'Skill', text: 'mem' },
      ],
      // Your page/terminal events since the last turn mark (what the next prompt delivers).
      pending: [
        { t: 'note', op: 'add', text: 'check Dealer Inspire after this', label: 'note: check Dealer Inspire after this' },
      ],
      inboxText: 'ernie inbox · turn 15\n- note: check Dealer Inspire after this',
      warnings: 0,
    },

    'glue/CDIT-2627-gsc-backfill': {
      turn: 9,
      plan: [
        { id: 'p1', text: 'Probe GSC lambda on stage (G0)', status: 'done' },
        { id: 'p2', text: 'Pick backfill strategy', status: 'active' },
        { id: 'p3', text: 'Backfill 16 months', status: 'todo' },
        { id: 'p4', text: 'Add row-count alarm', status: 'todo' },
      ],
      decisions: [
        { id: 'd1', text: 'Backfill one property at a time', why: 'GSC quota is per property; parallel runs hit 429s' },
      ],
      questions: [
        {
          id: 'q1', text: 'Backfill by day or by month?', choices: ['by day', 'by month'], recommended: 'by day',
          context: 'GSC caps 50k rows per request; busy properties exceed it in a month.',
          impact: 'By month silently truncates the 6 busiest properties.',
          example: 'e1',
        },
        { id: 'q2', text: 'OK to run the backfill on prod tonight?', choices: ['yes', 'no, stage first'] },
      ],
      issues: [
        {
          id: 'i1', title: 'Retry drops 429s after 3 attempts', status: 'explained', owner: 'us',
          cause: 'Retry gives up after 3 attempts with no backoff jitter.', fix: 'Exponential backoff with jitter, 8 attempts.',
          impact: '~4% of days missing for busy properties.', confidence: 'verified', method: 'CloudWatch: 312 "429 giving up" lines on 10-06',
        },
      ],
      examples: [
        {
          name: 'e1', title: 'One busy property, by day vs by month',
          columns: ['request', 'rows returned', 'rows that exist'],
          rows: [['2026-09 (by month)', '50,000', '61,204'], ['2026-09-14 (by day)', '2,031', '2,031']],
          caption: 'By month hits the 50k cap and drops 11,204 rows.',
        },
      ],
      facts: [
        { id: 'f1', kind: 'term', term: 'G0', text: 'throwaway probe script against the stage GSC lambda' },
        { id: 'f2', text: 'GSC keeps 16 months of data', confidence: 'verified', method: 'GSC API docs' },
      ],
      notes: [],
      diagrams: [],
      activity: [
        { ts: '14:15:40', by: 'claude', t: 'question', op: 'add', text: 'q2 OK to run the backfill on prod tonight?' },
        { ts: '14:15:22', by: 'claude', t: 'question', op: 'add', text: 'q1 Backfill by day or by month?' },
        { ts: '14:15:01', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Invoke G0 for one property, by month' },
        { ts: '14:14:30', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Tail GSC lambda logs for 429s' },
        { ts: '14:13:55', by: 'hook', t: 'file', op: 'touch', tool: 'Write', text: 'scripts/g0_probe.py' },
        { ts: '14:13:10', by: 'hook', t: 'turn', op: 'mark', text: 'turn 9' },
      ],
      pending: [],
      inboxText: '',
      warnings: 0,
    },

    'glue/main': {
      turn: 3,
      plan: [], decisions: [], questions: [], issues: [], examples: [], facts: [], notes: [], diagrams: [],
      activity: [
        { ts: 'yesterday 17:02', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Pull latest main' },
      ],
      pending: [], inboxText: '', warnings: 0,
    },

    'ernie/main': {
      turn: 31,
      plan: [
        { id: 'p1', text: 'Spec + build plan', status: 'done' },
        { id: 'p2', text: 'Scratch flow test', status: 'done' },
        { id: 'p3', text: 'UI view variations', status: 'active' },
        { id: 'p4', text: 'Phase 1: core (append, fold, dump)', status: 'todo' },
      ],
      decisions: [
        { id: 'd1', text: 'Tool activity shows Bash descriptions only', why: 'no command text → no redactor in v1 (A114)' },
      ],
      questions: [],
      issues: [],
      examples: [],
      facts: [
        { id: 'f1', text: 'Hooks must exit 0 on any error', confidence: 'verified', method: 'flow test F4' },
      ],
      notes: [],
      diagrams: [],
      activity: [
        { ts: '12:40:10', by: 'hook', t: 'file', op: 'touch', tool: 'Edit', text: '.mem/artifacts/spec_ernie.md' },
        { ts: '12:39:55', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Fold A114 into the spec and memory pointer' },
      ],
      pending: [], inboxText: '', warnings: 0,
    },
  },
};
