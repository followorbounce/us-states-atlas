# US States Atlas

An interactive side-by-side comparison tool for the 50 US states plus
the District of Columbia: pick any two, or click two tiles on a
schematic map, and compare population, land area, GDP (nominal and
per capita), capital, largest city, and statehood date. No build
step, no framework — plain HTML/CSS/JS, same pattern as this
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
  gdpPerCapitaUSD`.
- `js/app.js` — renders the tile grid (CSS grid, one cell per state
  positioned via inline `grid-column`/`grid-row` from `gridX`/`gridY`),
  the two side panels (dropdown selects, kept in sync with map
  clicks), a relative-scale strip (population/area/GDP/GDP-per-capita
  ratio cards, "A is Nx B"), and the core-metrics comparison table
  (proportional bar under each numeric row, same visual language as
  `country-atlas`).
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

## Deliberately not built this pass
- A true geographic map (see above — no fabricated border data).
- Per-state sub-metrics beyond the 6 compared here (no attempt to
  match country-atlas's 16-category depth — this is a narrower,
  single-purpose comparison tool per the request).
- Historical time series (no per-state growth-over-time chart, unlike
  country-atlas's Growth Over Time feature).

## Deploy
Public repo, GitHub Pages from `main` root. Cloudflare Web Analytics
beacon included on `index.html` from the first commit, sharing the
`followorbounce.github.io` site (see `[[cloudflare-analytics-setup]]`
in the assistant's memory).
