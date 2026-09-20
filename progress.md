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

## Known gaps (see CLAUDE.md "Deliberately not built this pass")
- No true geographic map (tile-grid only, by design).
- No historical time series / growth-over-time chart.
- No sub-metrics beyond the 6 compared fields.
