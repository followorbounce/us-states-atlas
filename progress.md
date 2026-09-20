# Progress

## 2026-09-19 — initial build
- Built the full site in one pass: `js/data/states.js` (51 entities,
  real WebFetch-verified population/area/GDP/capital/statehood data,
  real tile-grid coordinates from `kristw/gridmap-layout-usa`),
  `index.html`, `style.css`, `js/app.js`.
- Verified in a real headless Firefox (Selenium): 51 tiles render,
  default comparison (California vs. Texas) renders correctly, map
  clicks correctly set State A then auto-arm State B, dropdown
  selects stay in sync with map highlighting, scale-strip ratios
  compute correctly in both directions, theme toggle works, zero
  console errors.
- Committed and deployed: public repo, GitHub Pages, Cloudflare Web
  Analytics beacon included from the first commit.

## 2026-09-20 — added politics, universities, specialty
User asked for per-state research on universities, politics, and
specifics. Added `politics` (governor/party, both US Senators/party,
state legislature control, 2024 presidential result), `universities`
(1-3 notable institutions), and `specialty` (one-line economic/
cultural note) to all 51 entities.

Sourcing: governors from Wikipedia's current-governors list; senators
from senate.gov directly after Wikipedia's own senators article
returned stale names for multiple states (caught by cross-referencing
against individual senator bio pages — see the data file's header
comment for the full story, including two surprising-but-real 2026
Senate succession events); legislature control from Wikipedia's state
legislatures list; 2024 presidential result from general knowledge
(pre-cutoff stable history) cross-checked against fetched summary
totals; universities/specialty from general reference knowledge,
flagged as such rather than claimed as independently verified.

UI: `js/app.js`'s `ROWS` array gained a `section` key (Basics /
Politics / Education / Economy) and the compare table now renders a
section-header divider row between groups; a `fmtGovTitle()` helper
shows "Mayor" instead of "Governor" for DC specifically.

Verified in a real headless Firefox (California vs. Texas, and DC vs.
Wyoming to exercise the Mayor-label and no-Senate-seat edge cases) —
renders correctly, no console errors. One real bug caught and fixed
during verification: an earlier Selenium check hit a stale
`python3 -m http.server` process left running from an unrelated
earlier `country-atlas` test session, still bound to the port being
reused — confirmed via `readlink /proc/<pid>/cwd`, killed, restarted
on a fresh port. Not a code bug, but worth remembering: always verify
which directory a running dev server is actually serving from if a
page looks unexpectedly wrong, before assuming the code broke.

## 2026-09-20 — added a real geographic map mode
User flagged that the tile-grid map looked inaccurate for New York
specifically (no eastern-edge adjacency, unlike its real Atlantic
coastline) and asked to see both map styles with a toggle, rather than
picking one. Verified the tile-grid coordinates were correct against
the canonical `kristw/gridmap-layout-usa` source first (they were —
it's an inherent tradeoff of that grid layout, not a transcription
bug), then built a second map mode using real US Census Bureau state
borders (`states-albers-10m.json` from `topojson/us-atlas`, ISC
licensed, vendored locally as `js/data/us-topo.json`), rendered
client-side with `d3-geo` + `topojson-client` from a CDN.

Two real bugs caught during verification, both visual, both requiring
a screenshot (not just a DOM-property check) to catch:
1. Toggling the `hidden` property via JS didn't actually hide the
   tile grid when switching to Geographic mode — `.tile-grid { display:
   grid }`'s class-selector specificity beat the browser's default
   `[hidden]` rule. Fixed with an explicit `.tile-grid[hidden],
   .geo-map[hidden] { display: none; }`.
2. State border strokes were invisible in dark mode (`stroke:
   var(--paper)`, too close to the dark fill color). Fixed to
   `var(--line)`.

Verified in a real headless Firefox: 51 state paths render, click
selects the right state and arms the other side, mode toggle hides/
shows correctly, both light and dark themes, and 390px mobile width
(no horizontal overflow).

## Known gaps (see CLAUDE.md "Deliberately not built this pass")
- No historical time series / growth-over-time chart.
- No deeper per-state profile beyond the current ~13 compared fields.
- No county-level detail on the geographic map.
