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

## Known gaps (see CLAUDE.md "Deliberately not built this pass")
- No true geographic map (tile-grid only, by design).
- No historical time series / growth-over-time chart.
- No deeper per-state profile beyond the current ~13 compared fields.
