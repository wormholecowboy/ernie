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

// view-only: epics → beads for the Planning tab (00-template). Epics and beads live in Beads (P2/P4), not the ernie log;
// the spec's `plan` (flat list, kept for the older views) is being dropped (A123).
// A bead is one atomic task inside an epic. status: todo / active / done / blocked.
// `links` ids that match a decision, issue or fact in the same state resolve to its text on the page.
ERNIE_SAMPLE.states['glue/CDIT-2631-ga4-dedupe'].epics = [
  {
    id: 'E1', title: 'Investigate', status: 'done',
    goal: 'Know why sessions double-count on Dealer Spike hosts.',
    doneWhen: [{ text: 'Cause named and shown on one host', done: true }],
    beads: [
      { id: '1.1', title: 'Reproduce double count on one Dealer Spike host', status: 'done',
        what: 'Pick one host, count sessions in ga4_hits vs GA4 UI for one day.', commit: 'a41c0de',
        doneWhen: [{ text: 'Counts differ on ds-4471 for 2026-09-14', done: true }], files: ['scripts/probe_dupes.sql'] },
      { id: '1.2', title: 'Find the dedupe gap', status: 'done', deps: ['1.1'],
        what: 'Diff the two rows that should hash to one key.', links: ['i1', 'd1'], commit: 'b7f2e19',
        doneWhen: [{ text: 'Example table shows both page_location values', done: true }] },
    ],
  },
  {
    id: 'E2', title: 'Fix', status: 'active',
    goal: 'New and old rows dedupe to one key per listing view.',
    doneWhen: [{ text: 'Probe query returns 0 duplicate keys for 90 days', done: false }],
    beads: [
      { id: '2.1', title: 'Normalize page_location before hashing', status: 'active', deps: ['1.2'],
        what: 'Strip the trailing "i" from the listing id segment in the sessions view.',
        notes: 'View, not loader: fixes old rows without a backfill (q2, recommended).',
        links: ['i1', 'd1'], files: ['sql/views/sessions.sql', 'loader/hash.py'],
        doneWhen: [
          { text: 'sessions.sql normalizes the listing id', done: true },
          { text: 'Probe on ds-4471 returns one key per listing', done: false },
          { text: 'Unit test for hash with and without the "i"', done: false },
        ] },
      { id: '2.2', title: 'Fix backfill late-arriving hits', status: 'todo', deps: ['2.1'],
        what: 'Filter on event_date with a 2-day lookback.', links: ['i2'], files: ['loader/backfill.py'],
        doneWhen: [{ text: 'Backfilled day matches a fresh load row for row', done: false }] },
      { id: '2.3', title: 'Backfill 90 days', status: 'blocked', deps: ['2.1', '2.2'],
        what: 'Run the backfill on stage, one property at a time.', notes: 'Waits on 2.2; ~40 min on stage.',
        doneWhen: [{ text: '90 days loaded, no failed partitions', done: false }] },
    ],
  },
  {
    id: 'E3', title: 'Ship', status: 'todo',
    goal: 'Stage numbers checked and a PR open.',
    doneWhen: [{ text: 'PR open with before/after session counts', done: false }],
    beads: [
      { id: '3.1', title: 'Verify session counts on stage', status: 'todo', deps: ['2.3'],
        what: 'Compare September session counts before and after on 5 hosts.',
        doneWhen: [{ text: 'Counts within 0.5% of GA4 UI on all 5', done: false }] },
      { id: '3.2', title: 'Open PR', status: 'todo', deps: ['3.1'], what: 'PR against main with the probe query in the description.' },
    ],
  },
];

ERNIE_SAMPLE.states['ernie/main'].epics = [
  {
    id: 'E0', title: 'Design', status: 'active',
    goal: 'Spec, build plan and page views agreed before any Go is written.',
    doneWhen: [
      { text: 'spec_ernie.md + plan_ernie_build.md reviewed', done: true },
      { text: 'One page view picked as the phase 3 target', done: false },
    ],
    beads: [
      { id: '0.1', title: 'Spec + build plan', status: 'done', links: ['A1–A114'], commit: '157d9b3',
        what: 'spec_ernie.md and plan_ernie_build.md, amendments folded in.' },
      { id: '0.2', title: 'Scratch flow test', status: 'done', deps: ['0.1'], links: ['A95–A111'],
        what: 'Throwaway Go impl + 11 e2e tests + live nested claude -p run.', files: ['.mem/artifacts/ref_ernie_flow_test.md'] },
      { id: '0.3', title: '10 page view variations', status: 'done', deps: ['0.1'], commit: 'd58310f',
        what: 'Ten layouts over one shared sample state.', files: ['.mem/artifacts/ref_ernie_views/index.html'] },
      { id: '0.4', title: 'Template: pull pieces into one shell', status: 'active', deps: ['0.3'],
        what: 'Build the chosen page one tab at a time from the variations.',
        files: ['.mem/artifacts/ref_ernie_views/00-template.html'],
        doneWhen: [
          { text: 'Issues tab', done: true },
          { text: 'Facts & decisions tab', done: true },
          { text: 'Tool log tab', done: true },
          { text: 'Planning tab', done: false },
          { text: 'Home tab', done: false },
          { text: 'Worktree tab', done: false },
        ] },
    ],
  },
  {
    id: 'E1', title: 'Core', status: 'todo',
    goal: 'A working CLI that writes and folds logs. No hooks, no server.',
    doneWhen: [
      { text: 'go vet, go test -race ./..., gofmt -l . all clean', done: false },
      { text: 'ernie init && plan add && plan set && dump works in a scratch repo', done: false },
      { text: 'install.sh installs the binary', done: false },
      { text: '50 runs of ernie version average under 10ms', done: false },
    ],
    beads: [
      { id: '1.1', title: 'Bootstrap the repo', status: 'active', commit: null,
        what: 'go mod init ernie, install.sh, README stub, .gitignore (binary).',
        notes: 'git init done; plan docs and .mem/ moved here 2026-10-05 (D10).', links: ['D10'],
        doneWhen: [
          { text: 'git init', done: true },
          { text: 'go mod init ernie', done: false },
          { text: 'install.sh', done: false },
          { text: 'README stub + .gitignore', done: false },
        ] },
      { id: '1.1s', title: 'Hook spike', status: 'todo', deps: ['1.1'],
        what: 'Capture real hook payloads; settle the "spike decides" items. Throwaway, never committed.',
        notes: 'Must finish before 1.6. 1.2–1.5 can run alongside it.', links: ['A28', 'A58', 'A67', 'A76', 'A114'],
        files: ['testdata/hooks/'],
        doneWhen: [
          { text: 'A57 cap, A65 stdin, A68 env, A83 subagent env', done: true },
          { text: 'A58 CLAUDECODE leak into own panes / ! mode', done: false },
          { text: 'A67 interactive: !, queued, interactive slash', done: false },
          { text: 'cwd follows cd · fork source · SessionStart on clear', done: false },
          { text: 'A114 item 9: * covers MCP/Agent, failing Bash → PostToolUseFailure?', done: false },
          { text: 'Fixtures in testdata/hooks/', done: false },
        ] },
      { id: '1.2', title: 'logfile.Resolve(cwd)', status: 'todo', deps: ['1.1'], links: ['A5', 'A32', 'A56', 'A68', 'A95'],
        what: 'One git rev-parse call; branch read from <git-dir>/HEAD; detached → rebase/bisect → short SHA.',
        doneWhen: [{ text: 'Resolve under 12 ms with a 300 ms hook deadline', done: false }] },
      { id: '1.3', title: 'Slug + .root collision check', status: 'todo', deps: ['1.2'], links: ['A4', 'A26', 'A74', 'A82'],
        what: 'Slug base per A26; escape % and / in the file name; init writes .root with O_EXCL.' },
      { id: '1.4', title: 'logfile.Create / Update / AppendExisting', status: 'todo', deps: ['1.1'], links: ['A19', 'A43', 'A51', 'A54', 'A55'],
        what: 'flock(LOCK_EX|LOCK_NB) with deadline, one Write per batch, torn-tail heal, 1 MiB line cap.' },
      { id: '1.5', title: 'state.Event', status: 'todo', deps: ['1.1'], links: ['A62', 'A88', 'A89', 'A114'],
        what: 'One flat struct, typed omitempty fields; json.Encoder with SetEscapeHTML(false).' },
      { id: '1.6', title: 'State, Apply, Fold', status: 'blocked', deps: ['1.1s', '1.5'], links: ['A12', 'A13', 'A14', 'A81', 'A109'],
        what: 'Apply events in place, no I/O. Turn-scoped fields reset on each turn mark.',
        notes: 'Blocked until the hook spike settles payload shapes (A28).' },
      { id: '1.7', title: 'NextID(state, prefix)', status: 'todo', deps: ['1.6'], links: ['A25'],
        what: 'Max suffix across add events + 1; ids never reused.' },
      { id: '1.8', title: 'Dump(state)', status: 'todo', deps: ['1.6'], links: ['A59', 'A106'],
        what: 'Header + caps; target ≤ 1.5 KB, hard cap 4 KB.' },
      { id: '1.9', title: 'Inbox / InboxText', status: 'todo', deps: ['1.6'], links: ['A44', 'A57', 'A69', 'A107'],
        what: 'by:user events since the last turn mark, rendered with context; 8 KB cap.' },
      { id: '1.10', title: 'Cobra root', status: 'todo', deps: ['1.1'], what: 'SilenceUsage/SilenceErrors; StringArray for --choice.' },
      { id: '1.11', title: 'Commands', status: 'todo', deps: ['1.4', '1.6', '1.7', '1.10'], links: ['A27', 'A53', 'A102', 'A112', 'A113'],
        what: 'init, off, where, version, plan, decide, ask, answer, fact, diagram, example, issue, dump.' },
    ],
  },
  {
    id: 'E2', title: 'Hooks', status: 'todo',
    goal: 'Hooks log tool calls, deliver the inbox and remind on the narrow Stop cases.',
    beads: [
      { id: '2.1', title: 'hook.Run', status: 'todo', deps: ['1.11'], what: 'recover → exit 0; never builds the cobra tree.' },
      { id: '2.2', title: 'post-tool-use', status: 'todo', deps: ['2.1'], links: ['A114'], what: 'file touch / tool run rows; Bash → description only.' },
      { id: '2.3', title: 'user-prompt-submit', status: 'todo', deps: ['2.1'], links: ['A22', 'A96', 'A110'], what: 'Fold, print inbox, then turn mark.' },
      { id: '2.4', title: 'session-start', status: 'todo', deps: ['2.1'], links: ['A95'], what: 'Print Dump; export ERNIE_PROJECT_DIR.' },
      { id: '2.5', title: 'stop', status: 'todo', deps: ['2.1'], links: ['A111'], what: 'Prose-question check, then approved-issue check.' },
      { id: '2.6', title: 'Wire into dotfiles settings.json', status: 'todo', deps: ['2.7'], what: 'Guarded hook commands + allow/ask/deny rules.' },
      { id: '2.7', title: 'Minimal ernie skill', status: 'todo', deps: ['2.1'], what: 'When ernie is on, write commands, what to log.' },
    ],
  },
  {
    id: 'E3', title: 'Server + page', status: 'todo',
    goal: 'ernie serve streams folded state to the page; page ops post back.',
    beads: [
      { id: '3.1', title: 'ernie serve', status: 'todo', deps: ['1.11'], what: 'Bind 127.0.0.1:${ERNIE_PORT:-7477}.' },
      { id: '3.5', title: 'Hub + watcher', status: 'todo', deps: ['3.1'], what: 'One goroutine per watched log; latest frame wins.' },
      { id: '3.6', title: 'GET /stream', status: 'todo', deps: ['3.5'], what: 'hello, then state on each change, ping every 15s.' },
      { id: '3.8', title: 'POST /events', status: 'todo', deps: ['3.1'], links: ['A71', 'A89'], what: 'Host, Origin, token, op allowlist, then one Update.' },
      { id: '3.10', title: 'Page from the chosen view', status: 'blocked', deps: ['0.4', '3.6'], what: 'Copy the template, swap mock state for EventSource.' },
      { id: '3.13', title: 'Panels for explaining issues', status: 'todo', deps: ['3.10'], links: ['A88–A92', 'A113'], what: 'Questions, issues, examples, badges, glossary.' },
    ],
  },
  {
    id: 'E4', title: '.mem integration', status: 'todo',
    goal: '*um and /mem read ernie state; dotfiles bookkeeping done.',
    beads: [
      { id: '4.1', title: 'ernie mem delta', status: 'todo', deps: ['1.11'], links: ['A24', 'A30'], what: 'Diff two folds since the last mem sync.' },
      { id: '4.2', title: 'ernie mem synced <cursor>', status: 'todo', deps: ['4.1'], what: 'Validate cursor, append mem sync.' },
      { id: '4.4', title: 'mem skill edits', status: 'todo', deps: ['4.2'], what: '*um runs delta; /mem resume appends ernie dump.' },
    ],
  },
];

// ---------- view-only: P3 + P4 data for 00-template (additive; the older views ignore these fields) ----------

// P3 Q4: worktrees that are archived (`<branch>.archived` marker, hidden from the picker) or whose folder is gone.
// Kept out of `logs` so the older views don't list them; 00-template merges them into its picker.
ERNIE_SAMPLE.lifecycleLogs = [
  {
    key: 'glue/CDIT-2610-consent-probe', repo: 'glue', branch: 'CDIT-2610-consent-probe', on: true, folderGone: true,
    worktree: '~/things/myc/glue/CDIT-2610-consent-probe', // meta init `path` (A123); folder no longer exists
    session: { id: null, state: 'idle', lastEventAgo: '3d' },
  },
  {
    key: 'glue/CDIT-2598-utm-casing', repo: 'glue', branch: 'CDIT-2598-utm-casing', on: false, archived: true,
    worktree: '~/things/myc/glue/CDIT-2598-utm-casing', session: { id: null, state: 'off', lastEventAgo: '12d' },
  },
  {
    key: 'ernie/spike-hooks', repo: 'ernie', branch: 'spike-hooks', on: false, archived: true,
    worktree: '~/things/myc/ernie/spike-hooks', session: { id: null, state: 'off', lastEventAgo: '6d' },
  },
];
{ // block scope: keeps the helper out of the globals the older views share
  const emptyState = () => ({ turn: 0, plan: [], decisions: [], questions: [], issues: [], examples: [], facts: [], notes: [], diagrams: [], activity: [], pending: [], inboxText: '', warnings: 0 });
  ERNIE_SAMPLE.states['glue/CDIT-2610-consent-probe'] = {
    ...emptyState(), turn: 4,
    facts: [{ id: 'f1', text: 'Consent mode v2 is on for all Dealer Spike containers', confidence: 'inferred', method: 'GTM changelog' }],
    activity: [{ ts: '3d 16:40', by: 'hook', t: 'tool', op: 'run', tool: 'Bash', text: 'Probe consent flags on 5 hosts', sid: '0be41f2c' }],
  };
  ERNIE_SAMPLE.states['glue/CDIT-2598-utm-casing'] = {
    ...emptyState(), turn: 11,
    decisions: [{ id: 'd1', text: 'Lower-case utm_source in the view, not the loader', why: 'fixes old rows without a backfill' }],
  };
  ERNIE_SAMPLE.states['ernie/spike-hooks'] = { ...emptyState(), turn: 6 };
}

// P3 Q2 / P4: findings are Beads bugs. Source = parent: an epic id (PRD review), a bead id (code review) or none (ad hoc).
// `dropped` in the older views reads as `dismissed` here (closed with metadata.resolution = dismissed).
Object.assign(ERNIE_SAMPLE.states['glue/CDIT-2631-ga4-dedupe'].issues.find(i => i.id === 'i1'), { parent: '1.2' });
Object.assign(ERNIE_SAMPLE.states['glue/CDIT-2631-ga4-dedupe'].issues.find(i => i.id === 'i2'), { parent: 'E2' });
Object.assign(ERNIE_SAMPLE.states['glue/CDIT-2631-ga4-dedupe'].issues.find(i => i.id === 'i4'), { parent: '2.1' });

// P4 Q2: ad hoc beads (no epic, label wt:<branch>) replace queue.md "next".
ERNIE_SAMPLE.states['glue/CDIT-2631-ga4-dedupe'].adhoc = [
  { id: 'k3m', title: 'Ask platform for GTM read access', status: 'todo', what: 'Needed to check i3 and f3 ourselves.', links: ['n1', 'i3'] },
  { id: 'p8q', title: 'Check Dealer Inspire hosts after the fix', status: 'todo', deps: ['2.1'], what: 'q4 is still open; rerun the probe on 3 DI hosts once 2.1 lands.' },
];
ERNIE_SAMPLE.states['ernie/main'].adhoc = [
  { id: 'w2c', title: 'Verify bd 1.3.1: spec_id flag, close refuses when blocked', status: 'todo', what: 'Three checks from the P2 planning flow.' },
  { id: 'r7d', title: 'Rename phases → Epics in the template', status: 'done', what: 'Align the page with Beads (P2).', files: ['.mem/artifacts/ref_ernie_views/00-template.html'] },
];

// P4 Q3: cross-store links live on the ernie side (`ref`); the page builds the reverse index (bead ← decision).
ERNIE_SAMPLE.states['glue/CDIT-2631-ga4-dedupe'].decisions.find(d => d.id === 'd1').ref = '2.1';
ERNIE_SAMPLE.states['ernie/main'].decisions.find(d => d.id === 'd1').ref = '2.2';

// P4 F1: id collision after a forgot-to-pull merge. The second `add d1` with other text is kept as d1′ + a warning.
ERNIE_SAMPLE.states['ernie/main'].decisions.push(
  { id: 'd1′', text: 'Tool log filters by session, other tabs stay worktree-wide', why: 'sessions are a filter, not a container (P3)', collidedWith: 'd1' });
ERNIE_SAMPLE.states['ernie/main'].collisions = ['d1'];

// P3 Q5 / P4 Q6: `sid` on activity events only (tool, file, turn, meta). Claude's and your item events carry none.
// The dedupe worktree had an earlier session before 14:10.
['glue/CDIT-2631-ga4-dedupe', 'glue/CDIT-2627-gsc-backfill', 'ernie/main'].forEach(key => {
  const log = ERNIE_SAMPLE.logs.find(l => l.key === key);
  ERNIE_SAMPLE.states[key].activity.forEach(a => {
    if (!['tool', 'file', 'turn', 'meta'].includes(a.t)) return;
    a.sid = key === 'glue/CDIT-2631-ga4-dedupe' && a.ts < '14:10' ? '1c80a3b9' : log.session.id;
  });
});

// ---------- view-only: Home tab extras for 00-template ----------

// Repo kind is chosen once by `ernie init` and kept in git config (C1/C2). Work repos keep `.ernie/` and Beads off git.
ERNIE_SAMPLE.repoKinds = { glue: 'work', ernie: 'personal', dotfiles: 'personal' };

// Memory `## ops` per worktree (.ernie/mem/<branch>/long.md); ops stay per branch (P4 Q5)
ERNIE_SAMPLE.states['ernie/main'].ops = [
  'Run `bd dolt push` before /gtg (auto-push waits ≥5 min)',
  'Spec changes go in as plan §0 amendment rows first, folded later',
];
ERNIE_SAMPLE.states['glue/CDIT-2631-ga4-dedupe'].ops = ['Read-only queries on stagePublic unless asked'];

// Sync risk (personal repos only): what a dead disk would lose right now. P4 drive-loss analysis
ERNIE_SAMPLE.states['ernie/main'].sync = { itemsUncommitted: 3, itemsUnpushed: 1, beadsUnpushedMin: 4 };

// ---------- view-only: PRDs for the Planning tab (00-template) ----------
// P2 Q1/Q2: one PRD per epic, written in the worktree that builds it (.ernie/mem/<branch>/artifacts/prd_<topic>.md);
// the epic points at it (`spec_id`, fallback `metadata.prd`) and carries the plan state and review count as labels.
const DEDUPE_PRDS = {
  E1: { path: '.ernie/mem/CDIT-2631-ga4-dedupe/artifacts/prd_dedupe-investigate.md', plan: 'done', review: 2, md: `# Find why sessions double-count on Dealer Spike hosts

## Problem
Session counts for Dealer Spike client sites run about 3% above the GA4 UI. Other platforms match within 0.5%.

## Goal
Name the cause and show it on one host with real rows.

## Scope
- In: ga4_hits rows for one Dealer Spike host, one day.
- Out: any fix. That is E2.

## Done when
- Counts differ on one named host for one named day.
- Two rows that should share a key are shown side by side.` },
  E2: { path: '.ernie/mem/CDIT-2631-ga4-dedupe/artifacts/prd_dedupe-fix.md', plan: 'building', review: 3, md: `# Dedupe sessions to one key per listing view

## Problem
Dealer Spike sends the same listing page with two \`page_location\` values: one ends in \`…-14615315i\`, the other in \`…-14615315\`. \`dedupe_key\` hashes \`page_location\`, so one view becomes two keys and the session is counted twice.

Example from ds-4471 on 2026-09-14:

\`\`\`
page_location                           dedupe_key
…/2019-ford-f150-14615315i              a91f…
…/2019-ford-f150-14615315               c03e…
\`\`\`

## Goal
New and old rows dedupe to one key per listing view, on every Dealer Spike host, without changing keys on other platforms.

## Scope
- In: the sessions view, the hash helper in the loader, a 90-day backfill on stage.
- In: late-arriving hits in the backfill job (found while reproducing, i2).
- Out: fixing Dealer Spike's tag. Platform-side bugs go to the platform team (d2).
- Out: Dealer Inspire hosts. Asked as q3; not in this PRD unless the answer is yes.

## Approach
1. Normalize \`page_location\` in the sessions view: strip a trailing \`i\` from the listing id segment before hashing. Doing it in the view fixes old rows without reloading them.
2. Make the loader's hash helper apply the same rule, so new rows and the view agree.
3. Fix the backfill job to filter on \`event_date\` with a 2-day lookback, so late hits land in the right day.
4. Backfill 90 days on stage, one property at a time.

## Data checks
- Probe query on ds-4471 returns one key per listing for 2026-09-14.
- Probe query returns 0 duplicate keys across all Dealer Spike hosts for 90 days.
- Session counts for 5 non-Dealer-Spike hosts are unchanged, row for row.

## Risks
- The trailing \`i\` might mean something on another platform. Mitigation: the rule only applies when the host is in the Dealer Spike host list.
- Backfill takes about 40 minutes per property on stage. Run it outside the nightly load window.

## Open questions
- q3: should the dedupe also cover Dealer Inspire hosts?` },
  E3: { path: '.ernie/mem/CDIT-2631-ga4-dedupe/artifacts/prd_dedupe-ship.md', plan: 'approved', review: 2, md: `# Ship the dedupe fix

## Goal
Stage numbers checked against the GA4 UI and a PR open with the evidence.

## Steps
1. Compare September session counts before and after on 5 Dealer Spike hosts.
2. Open a PR against main with the probe query and the before/after table in the description.

## Done when
- Counts are within 0.5% of the GA4 UI on all 5 hosts.
- PR is open and links this PRD.` },
};
ERNIE_SAMPLE.states['glue/CDIT-2631-ga4-dedupe'].epics.forEach(ep => { ep.prd = DEDUPE_PRDS[ep.id]; });
