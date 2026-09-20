(() => {
  const byId = (id) => States.find((s) => s.id === id);
  const sorted = [...States].sort((a, b) => a.name.localeCompare(b.name));

  const state = { a: "california", b: "texas", armed: "a" };

  const fmtInt = (n) => (n == null ? "—" : n.toLocaleString("en-US"));
  const fmtKm2 = (n) => (n == null ? "—" : `${n.toLocaleString("en-US")} km²`);
  const fmtMoney = (n) => {
    if (n == null) return "—";
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
    return `$${n.toLocaleString("en-US")}`;
  };
  const fmtPerCapita = (n) => (n == null ? "—" : `$${n.toLocaleString("en-US")}`);

  function populateSelects() {
    for (const [selId, side] of [["selectA", "a"], ["selectB", "b"]]) {
      const sel = document.getElementById(selId);
      sel.innerHTML = sorted
        .map((s) => `<option value="${s.id}">${s.name}</option>`)
        .join("");
      sel.value = state[side];
      sel.addEventListener("change", () => {
        state[side] = sel.value;
        renderAll();
      });
    }
  }

  function renderCard(side) {
    const el = document.getElementById(`card${side.toUpperCase()}`);
    const s = byId(state[side]);
    if (!s) {
      el.innerHTML = "";
      return;
    }
    el.innerHTML = `
      <div class="abbr-badge">${s.abbr}</div>
      <div>
        <h2>${s.name}</h2>
        <div class="basics">
          <div>Capital: <b>${s.capital}</b></div>
          <div>Largest city: <b>${s.largestCity}</b></div>
          <div>Statehood: <b>${s.statehood}</b></div>
        </div>
      </div>`;
  }

  function renderTileGrid() {
    const grid = document.getElementById("tileGrid");
    const maxX = Math.max(...States.map((s) => s.gridX));
    const maxY = Math.max(...States.map((s) => s.gridY));
    grid.style.gridTemplateColumns = `repeat(${maxX + 1}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${maxY + 1}, 1fr)`;
    grid.innerHTML = sorted
      .map((s) => `<div class="tile" data-id="${s.id}" title="${s.name}" style="grid-column:${s.gridX + 1};grid-row:${s.gridY + 1}">${s.abbr}</div>`)
      .join("");
    grid.querySelectorAll(".tile").forEach((tile) => {
      tile.addEventListener("click", () => onTileOrPathClick(tile.dataset.id));
    });
  }

  function updateTileHighlights() {
    document.querySelectorAll(".tile").forEach((tile) => {
      tile.classList.toggle("is-a", tile.dataset.id === state.a);
      tile.classList.toggle("is-b", tile.dataset.id === state.b);
    });
    document.getElementById("armedLabel").textContent = state.armed === "a" ? "State A" : "State B";
  }

  /* ---------- Geographic map (real Census Bureau state borders) ---------- */
  let mapMode = "grid";
  let geoLoaded = false;
  const nameToId = new Map(States.map((s) => [s.name, s.id]));

  function onTileOrPathClick(id) {
    state[state.armed] = id;
    state.armed = state.armed === "a" ? "b" : "a";
    renderAll();
  }

  async function loadGeoMap() {
    if (geoLoaded) return;
    geoLoaded = true;
    const container = document.getElementById("geoMap");
    try {
      const topo = await fetch("js/data/us-topo.json").then((r) => r.json());
      const collection = topojson.feature(topo, topo.objects.states);
      const path = d3.geoPath();
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 975 610");
      svg.setAttribute("class", "geo-svg");
      for (const feature of collection.features) {
        const sid = nameToId.get(feature.properties.name);
        if (!sid) continue;
        const p = document.createElementNS(svgNS, "path");
        p.setAttribute("d", path(feature));
        p.setAttribute("class", "geo-state");
        p.setAttribute("data-id", sid);
        const title = document.createElementNS(svgNS, "title");
        title.textContent = feature.properties.name;
        p.appendChild(title);
        p.addEventListener("click", () => onTileOrPathClick(sid));
        svg.appendChild(p);
      }
      container.innerHTML = "";
      container.appendChild(svg);
      updateGeoHighlights();
    } catch (e) {
      container.innerHTML = `<p class="geo-error">Couldn't load the geographic map (${e.message}). The tile-grid view still works.</p>`;
    }
  }

  function updateGeoHighlights() {
    document.querySelectorAll(".geo-state").forEach((p) => {
      p.classList.toggle("is-a", p.dataset.id === state.a);
      p.classList.toggle("is-b", p.dataset.id === state.b);
    });
  }

  function setMapMode(mode) {
    mapMode = mode;
    const isGeo = mode === "geo";
    document.getElementById("tileGrid").hidden = isGeo;
    document.getElementById("geoMap").hidden = !isGeo;
    document.getElementById("hintGrid").hidden = isGeo;
    document.getElementById("hintGeo").hidden = !isGeo;
    document.getElementById("gridCaption").hidden = isGeo;
    document.getElementById("geoCaption").hidden = !isGeo;
    document.getElementById("modeGridBtn").classList.toggle("active", !isGeo);
    document.getElementById("modeGeoBtn").classList.toggle("active", isGeo);
    if (isGeo) loadGeoMap();
  }

  function setupMapModeToggle() {
    document.getElementById("modeGridBtn").addEventListener("click", () => setMapMode("grid"));
    document.getElementById("modeGeoBtn").addEventListener("click", () => setMapMode("geo"));
  }

  function safeRatio(x, y) {
    if (typeof x !== "number" || typeof y !== "number" || !x || !y) return null;
    return x / y;
  }

  function ratioCard(label, x, y, nameA, nameB) {
    const r = safeRatio(x, y);
    const rInv = safeRatio(y, x);
    let value, barA, barB;
    if (r == null) {
      value = "Data not available";
      barA = barB = 50;
    } else if (r >= 1) {
      value = `${nameA} is ${r.toFixed(1)}× ${nameB}`;
      barA = (r / (r + 1)) * 100;
      barB = 100 - barA;
    } else {
      value = `${nameB} is ${rInv.toFixed(1)}× ${nameA}`;
      barB = (rInv / (rInv + 1)) * 100;
      barA = 100 - barB;
    }
    return `
      <div class="scale-card">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
        <div class="scale-bar"><div class="a" style="width:${barA}%"></div><div class="b" style="width:${barB}%"></div></div>
      </div>`;
  }

  function renderScaleStrip() {
    const a = byId(state.a), b = byId(state.b);
    const strip = document.getElementById("scaleStrip");
    if (!a || !b) {
      strip.innerHTML = "";
      return;
    }
    strip.innerHTML = [
      ratioCard("Population", a.population, b.population, a.name, b.name),
      ratioCard("Land area", a.totalAreaKm2, b.totalAreaKm2, a.name, b.name),
      ratioCard("GDP (nominal)", a.gdpNominalUSD, b.gdpNominalUSD, a.name, b.name),
      ratioCard("GDP per capita", a.gdpPerCapitaUSD, b.gdpPerCapitaUSD, a.name, b.name),
    ].join("");
  }

  const fmtSenators = (s) => {
    if (!s || !s.politics) return "—";
    if (!s.politics.senators || s.politics.senators.length === 0) {
      return s.politics.senatorsNote || "—";
    }
    return s.politics.senators.map((sen) => `${sen.name} (${sen.party[0]})`).join("<br>");
  };
  const fmtGovTitle = (s) => (s && s.id === "district-of-columbia" ? "Mayor" : "Governor");
  const fmtList = (v) => (v && v.length ? v.join(", ") : "—");

  const ROWS = [
    { section: "Basics", label: "Population", get: (s) => s.population, fmt: fmtInt },
    { section: "Basics", label: "Land area", get: (s) => s.totalAreaKm2, fmt: fmtKm2 },
    { section: "Basics", label: "GDP (nominal, 2024)", get: (s) => s.gdpNominalUSD, fmt: fmtMoney },
    { section: "Basics", label: "GDP per capita (2024)", get: (s) => s.gdpPerCapitaUSD, fmt: fmtPerCapita },
    { section: "Basics", label: "Capital", get: (s) => s.capital, fmt: (v) => v },
    { section: "Basics", label: "Largest city", get: (s) => s.largestCity, fmt: (v) => v },
    { section: "Basics", label: "Statehood", get: (s) => s.statehood, fmt: (v) => v },
    { section: "Politics", label: "Governor / Mayor",
      get: (s) => s.politics && `${s.politics.governor} (${s.politics.governorParty})`,
      fmt: (v) => v || "—" },
    { section: "Politics", label: "U.S. Senators", get: (s) => s, fmt: fmtSenators },
    { section: "Politics", label: "State legislature", get: (s) => s.politics && s.politics.legislature, fmt: (v) => v || "—" },
    { section: "Politics", label: "2024 presidential result", get: (s) => s.politics && s.politics.pres2024, fmt: (v) => v || "—" },
    { section: "Education", label: "Notable universities", get: (s) => s.universities, fmt: fmtList },
    { section: "Economy", label: "State specialty", get: (s) => s.specialty, fmt: (v) => v || "—" },
  ];

  function renderCompareTable() {
    const a = byId(state.a), b = byId(state.b);
    const table = document.getElementById("compareTable");
    if (!a || !b) {
      table.innerHTML = "";
      return;
    }
    let lastSection = null;
    const rows = ROWS.map((row) => {
      const va = row.get(a), vb = row.get(b);
      const isNum = typeof va === "number" && typeof vb === "number";
      let bar = "";
      if (isNum && (va || vb)) {
        const total = va + vb || 1;
        const pa = (va / total) * 100;
        bar = `<div class="compare-bar"><div class="a" style="width:${pa}%"></div><div class="b" style="width:${100 - pa}%"></div></div>`;
      }
      let sectionRow = "";
      if (row.section !== lastSection) {
        sectionRow = `<tr class="section-row"><td colspan="3">${row.section}</td></tr>`;
        lastSection = row.section;
      }
      const label = row.label === "Governor / Mayor" ? `${fmtGovTitle(a)} / ${fmtGovTitle(b)}` : row.label;
      return `${sectionRow}
        <tr>
          <td class="val a">${row.fmt(va)}${isNum ? bar : ""}</td>
          <td class="lbl"><span class="name">${label}</span></td>
          <td class="val b">${row.fmt(vb)}${isNum ? bar : ""}</td>
        </tr>`;
    }).join("");
    table.innerHTML = rows;
  }

  function renderAll() {
    document.getElementById("selectA").value = state.a;
    document.getElementById("selectB").value = state.b;
    renderCard("a");
    renderCard("b");
    updateTileHighlights();
    updateGeoHighlights();
    renderScaleStrip();
    renderCompareTable();
  }

  function setupTheme() {
    const btn = document.getElementById("themeToggle");
    const saved = (() => {
      try {
        return localStorage.getItem("usatlas-theme");
      } catch {
        return null;
      }
    })();
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("usatlas-theme", next);
      } catch {}
    });
  }

  populateSelects();
  renderTileGrid();
  renderAll();
  setupTheme();
  setupMapModeToggle();
})();
