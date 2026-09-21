# US States Atlas

Two pages, no build step, no framework — plain HTML/CSS/JS:
- **`index.html`** — an interactive side-by-side comparison tool for
  the 50 US states plus the District of Columbia: pick any two, or
  click two tiles/states on a map, and compare population, land area,
  GDP (nominal and per capita), capital, largest city, statehood date,
  state politics (governor, US Senators, legislature control, 2024
  presidential result), notable universities, and each state's
  economic specialty.
- **`government.html`** — a single interactive map of all 51 entities
  at once, colored by party control across 4 selectable layers: US
  Senate, US House, governorships, state legislatures. See "Congress
  & Government page" below.

Both pages share `style.css`, `js/data/states.js`, and the tile-grid /
geographic map rendering approach (each page has its own small JS
file — `js/app.js` for the 2-state comparison, `js/government.js` for
the all-51-at-once party map — since the interaction models are
different enough not to force into one shared component).

## Two map modes (tile-grid + real geographic)
Originally shipped with only the tile-grid map, reasoning that a true
geographic map needs accurate state-border path data and
reconstructing that from memory risks real distortion (this project's
standing practice, also applied in `country-atlas`, of never
fabricating geographic shapes). That reasoning was sound but the
conclusion was incomplete — real, non-fabricated border data is
publicly available (US Census Bureau cartographic boundary files), so
**2026-09-20 a second, true geographic map mode was added**, toggled
via buttons above the map (`#modeGridBtn` / `#modeGeoBtn`), after the
user pointed out a real, honest limitation of the tile-grid: New York
doesn't touch the map's eastern edge in that layout (it's one column
inset from CT/RI), which looks wrong for a state with real Atlantic
coastline, even though the grid coordinates themselves are correct
per their source.

- **Tile-grid map** ("waffle map" / NPR-style grid cartogram): one
  square per state, positioned at real published `(x, y)` coordinates
  from [`kristw/gridmap-layout-usa`](https://github.com/kristw/gridmap-layout-usa)
  (MIT licensed), fetched via the GitHub API and stored in
  `js/data/states.js`. Every state gets equal visual weight and an
  approximately correct relative position, at the cost of some real
  adjacencies — an explicit, documented tradeoff, not a bug.
- **Geographic map**: real state borders from `js/data/us-topo.json`,
  a local copy of `states-albers-10m.json` from
  [`topojson/us-atlas`](https://github.com/topojson/us-atlas) (ISC
  licensed), itself a redistribution of the US Census Bureau's 2017
  cartographic boundary shapefiles (public domain) pre-projected with
  `d3.geoAlbersUsa` (Alaska/Hawaii correctly inset, 975×610 viewport).
  Rendered client-side: `topojson.feature()` converts the topology to
  GeoJSON, `d3.geoPath()` (no projection set, since the coordinates
  are already projected) generates each state's SVG `d` path.
  `d3-array`, `d3-geo`, and `topojson-client` are loaded from
  cdn.jsdelivr.net (well-known libraries, consistent with this
  project's existing Google Fonts CDN usage — only the actual
  geometry *data* is vendored locally, not fetched cross-origin at
  runtime).
- Both maps share the same click-to-arm-side interaction
  (`onTileOrPathClick`) and the same `is-a`/`is-b` highlight classes,
  so switching modes mid-comparison doesn't lose selection state.
- Real bug caught during verification: `.tile-grid[hidden]` /
  `.geo-map[hidden]` needed an explicit `display: none` rule — the
  class selector `.tile-grid { display: grid }` otherwise had higher
  specificity than the browser's default `[hidden]` UA-stylesheet
  rule, so toggling the `hidden` *property* in JS silently failed to
  actually hide the element. Caught by screenshot (both maps visible
  at once), not by the property check alone, which reported the
  attribute as set correctly — a reminder that confirming a hidden
  attribute is set isn't the same as confirming the element is
  actually invisible.
- Second real bug: the geo map's state borders used `stroke:
  var(--paper)`, which is a near-black color in dark mode — nearly
  invisible against the equally-dark fill. Changed to `var(--line)`,
  which has enough contrast in both themes. Caught by a dark-mode
  screenshot, not by the light-mode check alone.

## Data sourcing
All numeric/date fields in `js/data/states.js` are WebFetch-verified,
not recalled from memory:
- **Population**: US Census Bureau estimate, July 1 2025 (via
  Wikipedia's "List of states and territories of the United States by
  population").
- **Land area, capital, statehood date**: via Wikipedia's "List of
  states and territories of the United States".
- **GDP nominal, GDP per capita**: US Bureau of Economic Analysis,
  2024 (via Wikipedia's "List of U.S. states and territories by
  GDP").
- **Largest city** is the one field that is general reference
  knowledge rather than independently re-verified this pass — it's
  flagged as such in the data file's header comment.
- **Grid coordinates**: real data from `kristw/gridmap-layout-usa`,
  not invented (see above).

## Architecture
- `js/data/states.js` — all 51 entities (50 states + DC), flat
  objects: `id, abbr, name, gridX, gridY, capital, largestCity,
  statehood, population, totalAreaKm2, gdpNominalUSD,
  gdpPerCapitaUSD, politics, universities, specialty`. `politics` is
  `{ governor, governorParty, senators: [{name,party,url}, {name,party,url}],
  legislature, pres2024 }` (DC has `senators: []` +
  `senatorsNote` instead, since it has no voting Senate seats).
  `universities` is `[{name,url}, ...]`. Senator `url`s are each
  senator's official senate.gov page (from senate.gov's own senators
  index, which links out to each member's site); university `url`s
  are each institution's official homepage — both added 2026-09-20
  on request ("добавь ссылки на официальные страницы"), general
  reference knowledge for the university URLs (extremely stable,
  unambiguous domains), independently WebFetch-verified for the
  senator URLs against the same senate.gov source already used for
  senator names/parties.
- `js/app.js` — renders the tile grid (CSS grid, one cell per state
  positioned via inline `grid-column`/`grid-row` from `gridX`/`gridY`),
  the two side panels (dropdown selects, kept in sync with map
  clicks), a relative-scale strip (population/area/GDP/GDP-per-capita
  ratio cards, "A is Nx B"), and the core-metrics comparison table
  (proportional bar under each numeric row, same visual language as
  `country-atlas`), now split into 4 labeled sections (Basics,
  Politics, Education, Economy) via a `section` key on each row
  definition and a `.section-row` divider. The Governor/Mayor row
  label is computed per-side (`fmtGovTitle`) since DC's chief
  executive is a Mayor, not a Governor, even though the data uses the
  same `governor`/`governorParty` keys as every state for schema
  consistency.
- Map interaction: clicking a tile assigns it to whichever side is
  currently "armed" (starts on State A), then automatically flips the
  armed side — so the first two clicks naturally fill both slots.
  Dropdown selects update a side directly without touching the armed
  side.
- `style.css` — "civic blueprint / census report" design: navy (Side
  A) / brick red (Side B) on cream paper, `Fraunces` (display),
  `Inter` (body), `IBM Plex Mono` (data/figures). Deliberately
  distinct from this account's other sites this session (tarot's
  Bauhaus look, world-calendar-explorer's antique-observatory look,
  country-atlas's National-Geographic/GIS look). Light/dark theme via
  `prefers-color-scheme` + a manual toggle persisted to
  `localStorage`.

## Politics/universities/specialty (added 2026-09-20)
User asked to add "university, politics, specifics" research per
state, following the same pattern established on `country-atlas`.
- **Governor, US Senators, state legislature control**: WebFetch-
  verified against Wikipedia's "List of current United States
  governors" and, critically, **senate.gov's official member list**
  rather than Wikipedia's senators article — that article's first
  fetch returned stale data for several states (a name that left
  office years ago for Ohio, another for Pennsylvania), an example of
  a long table being summarized from the model's training-era
  knowledge instead of the live page. Two names that initially looked
  like extraction errors (South Carolina's "Darline Graham",
  Oklahoma's "Alan Armstrong") were independently cross-checked
  against each senator's own Wikipedia bio before being trusted, and
  turned out to be real, very recent 2026 events (a death in office
  and a resignation, both with a specific successor) — not artifacts.
  See the header comment in `js/data/states.js` for the full story;
  it's a useful cautionary example for future sessions about not
  assuming an unfamiliar name from a live fetch is automatically wrong.
- **2024 presidential result per state**: pre-training-cutoff stable
  history, used from general knowledge and cross-checked against the
  fetched page's summary totals (312 EV/all 7 swing states for Trump)
  rather than re-fetched per state, since the full results table kept
  truncating on fetch.
- **Universities, specialty**: general reference knowledge, flagged
  as such (same honesty treatment as `largestCity`) — not indepen-
  dently web-verified. 1-3 well-known institutions per state;
  specialty is a genuine one-line distinguishing note, not generic
  filler.
- **Official links (added 2026-09-20)**: `politics.senators[].url` is
  each senator's own senate.gov page, and `universities[].url` is each
  institution's official homepage. Senator URLs came from senate.gov's
  own senators index page (a different fetch from the one that sourced
  names/parties — that page format doesn't expose the links). Both
  sets of URLs were cross-verified 1:1 against the names already in
  the file (100/100 senators, 88/88 unique universities) before
  splicing, catching zero mismatches.

## Congress & Government page (`government.html`, added 2026-09-20)
User asked for a separate page: "интерактивную карту распределения в
верхней и нижней палате и других институтах управления" (an
interactive map of the distribution in the upper and lower chamber and
other institutions of governance) — i.e. a single view of all 51
entities colored by party control, not a 2-state comparison.

**First version used the tile-grid/geographic US map** (colored all 51
states by category instead of comparing 2 sides). The user then asked
specifically for **"карту мест в кабинете а не карту страны"** — a
seat chart for the chamber, not a map of the country — the standard
"parliamentary hemicycle" visualization (semicircular rows of dots,
one per seat, grouped left-to-right by party), not a geography-based
view at all. Replaced the map entirely; `government.html` no longer
loads d3-geo/topojson-client or references `us-topo.json`.

- **4 layers**, switchable via buttons above the chart: **US Senate**
  (100 real individual seats, one per senator, each with that
  senator's name/party/link), **US House** (435 seats + 2 vacant,
  built from each state's `houseSeats` R/D/vacant counts — no
  individual representative names, since that data isn't tracked),
  **Governors** (51 seats, one per governor/DC mayor — not a real
  chamber, but rendered the same way for visual consistency),
  **State Legislatures** (51 seats, one per state's overall control
  status, including a "Split" color for states where the two chambers
  are held by different parties).
- **Hemicycle geometry** (`hemicycleLayout()` in `js/government.js`):
  a general-purpose "N points on M concentric semicircular arcs"
  layout — row count scales with `√(n × 1.4)` (clamped 4-26) so a
  51-seat chart and a 435-seat chart both read as a cohesive fan
  shape rather than the 51-seat version looking sparse; each row's
  seat count is proportional to its radius (outer rows are longer
  arcs, so they hold more seats); all points across all rows are
  finally sorted by angle so seats can be assigned to party blocks
  strictly left-to-right (Democratic → Independent → Split →
  Republican → Vacant), which is what makes the familiar "blue block
  on the left, red block on the right" shape emerge.
- **New data**: `politics.houseSeats: {total, R, D, vacant}` per
  state, added to `js/data/states.js`. Sourced from Wikipedia's "List
  of current members of the United States House of Representatives"
  (fetched in 2 alphabetical halves, since 435 rows risked the same
  truncation problem the Senate list had) — **independently verified
  by summing all 50 states' R/D/vacant counts and confirming they
  matched the official chamber totals exactly** (219 R / 214 D / 2
  vacant, from the "119th United States Congress" article) before
  trusting the per-state breakdown. This is the same discipline as the
  senator-name verification: don't just accept a fetched table,
  cross-check it against an independent total.
- **Summary stat cards** (`renderSummary()`) show live-computed
  national totals per layer — e.g. Senate shows 53 R / 45 D / 2 I /
  100 total, computed by actually counting the built seat list, not
  hardcoded, so it can't drift from the per-state data.
- Clicking any seat opens the same detail panel as before (governor,
  both senators with links, House delegation with a proportional R/D
  bar, legislature text, 2024 result) — a materially different
  interaction model from `index.html`'s "pick 2, compare," which is
  why it's a separate JS file (`js/government.js`) rather than a mode
  of `js/app.js`.
- Party colors are CSS custom properties (`--party-r`, `--party-d`,
  `--party-i`, `--party-split`), set equal to the existing
  `--side-b`/`--side-a` navy/red in light mode (a happy coincidence —
  the site's existing 2-side comparison colors already matched the
  standard US political red/blue convention) and to their dark-mode
  equivalents; `--party-i` and `--party-split` are gold-ish and purple
  tones respectively, defined in both themes. `.seat` is the new SVG
  circle class (distinct from `.tile`/`.geo-state`, which remain
  `index.html`-only).

## Deliberately not built this pass
- Historical time series (no per-state growth-over-time chart, unlike
  country-atlas's Growth Over Time feature).
- Deeper per-state profiles beyond the current ~13 compared fields
  (no attempt to match country-atlas's 16-category depth — this
  remains a narrower, single-purpose comparison tool).
- County-level detail on the geographic map (state-level borders only;
  `us-atlas` also publishes `counties-albers-10m.json` if that's ever
  wanted, at a meaningfully larger file size).

## Deploy
Public repo, GitHub Pages from `main` root. Cloudflare Web Analytics
beacon included on `index.html` from the first commit, sharing the
`followorbounce.github.io` site (see `[[cloudflare-analytics-setup]]`
in the assistant's memory).
