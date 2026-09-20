# US States Atlas

An interactive side-by-side comparison tool for the 50 US states plus
the District of Columbia: pick any two, or click two tiles on a
schematic map, and compare population, land area, GDP (nominal and
per capita), capital, largest city, statehood date, state politics
(governor, US Senators, legislature control, 2024 presidential
result), notable universities, and each state's economic specialty.
No build step, no framework — plain HTML/CSS/JS, same pattern as this
account's other comparison sites this session.

## Why a tile-grid map, not a geographic one
A true geographic map needs accurate state-border SVG path data.
Reconstructing that from memory risks real distortion (see this
project's standing practice, also applied in `country-atlas`, of
never fabricating geographic shapes). Instead this uses a **tile-grid
map** ("waffle map" / NPR-style grid cartogram): one square per state,
positioned at real published `(x, y)` coordinates from
[`kristw/gridmap-layout-usa`](https://github.com/kristw/gridmap-layout-usa)
(MIT licensed), fetched via the GitHub API and stored directly in
`js/data/states.js`. Every state gets equal visual weight, an
approximately correct relative position, and zero invented geometry.

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
  `{ governor, governorParty, senators: [{name,party}, {name,party}],
  legislature, pres2024 }` (DC has `senators: []` +
  `senatorsNote` instead, since it has no voting Senate seats).
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

## Deliberately not built this pass
- A true geographic map (see above — no fabricated border data).
- Historical time series (no per-state growth-over-time chart, unlike
  country-atlas's Growth Over Time feature).
- Deeper per-state profiles beyond the current ~13 compared fields
  (no attempt to match country-atlas's 16-category depth — this
  remains a narrower, single-purpose comparison tool).

## Deploy
Public repo, GitHub Pages from `main` root. Cloudflare Web Analytics
beacon included on `index.html` from the first commit, sharing the
`followorbounce.github.io` site (see `[[cloudflare-analytics-setup]]`
in the assistant's memory).
