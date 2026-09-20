(() => {
  const byId = (id) => States.find((s) => s.id === id);
  const sorted = [...States].sort((a, b) => a.name.localeCompare(b.name));

  let layer = "senate";
  let mapMode = "geo";
  let selected = null;

  const PARTY_CLASS = {
    Democratic: "party-d",
    "Democratic–Farmer–Labor": "party-d",
    Republican: "party-r",
    Independent: "party-i",
  };

  function senateClass(s) {
    if (!s.politics.senators || s.politics.senators.length === 0) return "party-none";
    const parties = s.politics.senators.map((x) => x.party);
    if (parties.every((p) => p === parties[0])) return PARTY_CLASS[parties[0]] || "party-none";
    return "party-split";
  }
  function houseClass(s) {
    const h = s.politics.houseSeats;
    if (!h || h.total === 0) return "party-none";
    if (h.R > h.D) return "party-r";
    if (h.D > h.R) return "party-d";
    return "party-split";
  }
  function governorClass(s) {
    return PARTY_CLASS[s.politics.governorParty] || "party-none";
  }
  function legislatureClass(s) {
    const leg = s.politics.legislature;
    if (!leg) return "party-none";
    if (leg === "Split control") return "party-split";
    if (leg.startsWith("Democratic")) return "party-d";
    if (leg.startsWith("Republican")) return "party-r";
    return "party-none";
  }
  const CLASS_FN = { senate: senateClass, house: houseClass, governor: governorClass, legislature: legislatureClass };
  function colorClass(s) {
    return CLASS_FN[layer](s);
  }

  const LAYER_META = {
    senate: {
      hint: "Each state's 2 US Senators. Solid = both senators from that party. Purple = split between parties.",
      legend: [["Republican-held", "party-r"], ["Democratic-held", "party-d"], ["Split", "party-split"]],
    },
    house: {
      hint: "Each state's US House delegation, colored by whichever party holds more seats. Purple = evenly tied.",
      legend: [["Republican majority", "party-r"], ["Democratic majority", "party-d"], ["Tied", "party-split"]],
    },
    governor: {
      hint: "Each state's governor (or the DC mayor), by party.",
      legend: [["Republican", "party-r"], ["Democratic", "party-d"]],
    },
    legislature: {
      hint: "Which party controls the state legislature. Purple = the two chambers are held by different parties.",
      legend: [["Republican-controlled", "party-r"], ["Democratic-controlled", "party-d"], ["Split between chambers", "party-split"]],
    },
  };

  function renderLegend() {
    const meta = LAYER_META[layer];
    document.getElementById("layerHint").textContent = meta.hint;
    document.getElementById("partyLegend").innerHTML = meta.legend
      .map(([label, cls]) => `<span class="swatch"><span class="dot" style="background:var(--${cls})"></span>${label}</span>`)
      .join("");
  }

  function renderSummary() {
    const el = document.getElementById("govSummary");
    if (layer === "senate") {
      let r = 0, d = 0, i = 0;
      States.forEach((s) => (s.politics.senators || []).forEach((sen) => {
        if (sen.party === "Republican") r++;
        else if (sen.party === "Independent") i++;
        else d++;
      }));
      el.innerHTML = statCards([["R", r, "r"], ["D", d, "d"], ["I", i, "i"], ["Total seats", r + d + i, ""]]);
    } else if (layer === "house") {
      let r = 0, d = 0, v = 0;
      States.forEach((s) => { const h = s.politics.houseSeats; if (h) { r += h.R; d += h.D; v += h.vacant; } });
      el.innerHTML = statCards([["R", r, "r"], ["D", d, "d"], ["Vacant", v, ""], ["Total seats", r + d + v, ""]]);
    } else if (layer === "governor") {
      let r = 0, d = 0;
      States.forEach((s) => { if (s.politics.governorParty === "Republican") r++; else d++; });
      el.innerHTML = statCards([["R governors", r, "r"], ["D governors", d, "d"]]);
    } else {
      let r = 0, d = 0, split = 0;
      States.forEach((s) => { const c = legislatureClass(s); if (c === "party-r") r++; else if (c === "party-d") d++; else split++; });
      el.innerHTML = statCards([["R-controlled", r, "r"], ["D-controlled", d, "d"], ["Split", split, ""]]);
    }
  }
  function statCards(items) {
    return items
      .map(([label, n, tone]) => `<div class="gov-stat"><div class="n ${tone}">${n}</div><div class="lbl">${label}</div></div>`)
      .join("");
  }

  function onStateClick(id) {
    selected = id;
    renderDetail();
    updateHighlights();
  }

  function renderDetail() {
    const el = document.getElementById("stateDetail");
    const s = byId(selected);
    if (!s) {
      el.innerHTML = `<p class="state-detail-hint">Click a state above for its full delegation.</p>`;
      return;
    }
    const govTitle = s.id === "district-of-columbia" ? "Mayor" : "Governor";
    const senRows = s.politics.senators && s.politics.senators.length
      ? s.politics.senators.map((x) => `<a href="${x.url}" target="_blank" rel="noopener">${x.name}</a> (${x.party[0]})`).join("<br>")
      : s.politics.senatorsNote || "—";
    const h = s.politics.houseSeats;
    const houseHtml = h && h.total > 0
      ? `${h.total} seats — ${h.R} R, ${h.D} D${h.vacant ? `, ${h.vacant} vacant` : ""}
         <div class="house-bar"><div class="r" style="width:${(h.R / h.total) * 100}%"></div><div class="d" style="width:${(h.D / h.total) * 100}%"></div></div>`
      : "No voting House representation";
    el.innerHTML = `
      <h2>${s.name}</h2>
      <div class="detail-grid">
        <div class="detail-row"><span class="k">${govTitle}</span>${s.politics.governor} (${s.politics.governorParty})</div>
        <div class="detail-row"><span class="k">US Senate</span>${senRows}</div>
        <div class="detail-row"><span class="k">US House delegation</span>${houseHtml}</div>
        <div class="detail-row"><span class="k">State legislature</span>${s.politics.legislature}</div>
        <div class="detail-row"><span class="k">2024 presidential result</span>${s.politics.pres2024}</div>
      </div>`;
  }

  function updateHighlights() {
    document.querySelectorAll(".tile, .geo-state").forEach((el) => {
      el.classList.remove("party-r", "party-d", "party-i", "party-split", "party-none", "selected");
      const s = byId(el.dataset.id);
      if (s) el.classList.add(colorClass(s));
      if (el.dataset.id === selected) el.classList.add("selected");
    });
  }

  /* ---------- Tile grid ---------- */
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
      tile.addEventListener("click", () => onStateClick(tile.dataset.id));
    });
  }

  /* ---------- Geographic map ---------- */
  let geoLoaded = false;
  const nameToId = new Map(States.map((s) => [s.name, s.id]));

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
        p.addEventListener("click", () => onStateClick(sid));
        svg.appendChild(p);
      }
      container.innerHTML = "";
      container.appendChild(svg);
      updateHighlights();
    } catch (e) {
      container.innerHTML = `<p class="geo-error">Couldn't load the geographic map (${e.message}). The tile-grid view still works.</p>`;
    }
  }

  function setMapMode(mode) {
    mapMode = mode;
    const isGeo = mode === "geo";
    document.getElementById("tileGrid").hidden = isGeo;
    document.getElementById("geoMap").hidden = !isGeo;
    document.getElementById("gridCaption").hidden = isGeo;
    document.getElementById("geoCaption").hidden = !isGeo;
    document.getElementById("modeGridBtn").classList.toggle("active", !isGeo);
    document.getElementById("modeGeoBtn").classList.toggle("active", isGeo);
    if (isGeo) loadGeoMap().then(updateHighlights);
    else updateHighlights();
  }

  function setLayer(l) {
    layer = l;
    document.querySelectorAll(".layer-btn").forEach((b) => b.classList.toggle("active", b.dataset.layer === l));
    renderLegend();
    renderSummary();
    updateHighlights();
    if (selected) renderDetail();
  }

  function setupTheme() {
    const btn = document.getElementById("themeToggle");
    const saved = (() => {
      try { return localStorage.getItem("usatlas-theme"); } catch { return null; }
    })();
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("usatlas-theme", next); } catch {}
    });
  }

  document.querySelectorAll(".layer-btn").forEach((b) => b.addEventListener("click", () => setLayer(b.dataset.layer)));
  document.getElementById("modeGridBtn").addEventListener("click", () => setMapMode("grid"));
  document.getElementById("modeGeoBtn").addEventListener("click", () => setMapMode("geo"));

  renderTileGrid();
  renderLegend();
  renderSummary();
  setupTheme();
  loadGeoMap().then(updateHighlights);
})();
