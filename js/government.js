(() => {
  const byId = (id) => States.find((s) => s.id === id);
  const sorted = [...States].sort((a, b) => a.name.localeCompare(b.name));

  let layer = "senate";
  let selected = null;

  const PARTY_CLASS = {
    Democratic: "party-d",
    "Democratic–Farmer–Labor": "party-d",
    Republican: "party-r",
    Independent: "party-i",
    Vacant: "party-none",
    Split: "party-split",
  };
  const BLOCK_ORDER = ["Democratic", "Independent", "Split", "Republican", "Vacant"];

  function legislatureParty(s) {
    const leg = s.politics.legislature;
    if (!leg) return "Split";
    if (leg === "Split control") return "Split";
    if (leg.startsWith("Democratic")) return "Democratic";
    if (leg.startsWith("Republican")) return "Republican";
    return "Split";
  }

  /* ---------- Build the seat list for each layer ---------- */
  function buildSenateSeats() {
    const seats = [];
    States.forEach((s) => (s.politics.senators || []).forEach((sen) => {
      seats.push({ party: sen.party, stateId: s.id, label: `${sen.name} — ${s.name} (${sen.party})`, url: sen.url });
    }));
    return seats;
  }
  function buildHouseSeats() {
    const seats = [];
    States.forEach((s) => {
      const h = s.politics.houseSeats;
      if (!h) return;
      for (let i = 0; i < h.R; i++) seats.push({ party: "Republican", stateId: s.id, label: `${s.name} — Republican-held seat` });
      for (let i = 0; i < h.D; i++) seats.push({ party: "Democratic", stateId: s.id, label: `${s.name} — Democratic-held seat` });
      for (let i = 0; i < h.vacant; i++) seats.push({ party: "Vacant", stateId: s.id, label: `${s.name} — vacant seat` });
    });
    return seats;
  }
  function buildGovernorSeats() {
    return sorted.map((s) => ({
      party: PARTY_CLASS[s.politics.governorParty] === "party-none" ? "Independent" : s.politics.governorParty.startsWith("Democratic") ? "Democratic" : "Republican",
      stateId: s.id,
      label: `${s.name} — ${s.politics.governor} (${s.politics.governorParty})`,
    }));
  }
  function buildLegislatureSeats() {
    return sorted.map((s) => ({
      party: legislatureParty(s),
      stateId: s.id,
      label: `${s.name} — ${s.politics.legislature}`,
    }));
  }
  const BUILD_FN = { senate: buildSenateSeats, house: buildHouseSeats, governor: buildGovernorSeats, legislature: buildLegislatureSeats };

  const LAYER_META = {
    senate: {
      hint: "All 100 US Senate seats, arranged as the chamber's actual seat count. Blue = Democratic, gold = Independent, red = Republican, left to right.",
      legend: [["Democratic", "party-d"], ["Independent", "party-i"], ["Republican", "party-r"]],
    },
    house: {
      hint: "All 435 US House seats (plus 2 currently vacant). Same left-to-right party grouping as the Senate chart.",
      legend: [["Democratic", "party-d"], ["Republican", "party-r"], ["Vacant", "party-none"]],
    },
    governor: {
      hint: "One seat per governor (50 states + the DC mayor) — not a real chamber, but the same seat-chart language for consistency.",
      legend: [["Democratic", "party-d"], ["Republican", "party-r"]],
    },
    legislature: {
      hint: "One seat per state legislature's overall control — not a real chamber. Purple = the two chambers are held by different parties.",
      legend: [["Democratic-controlled", "party-d"], ["Republican-controlled", "party-r"], ["Split between chambers", "party-split"]],
    },
  };

  /* ---------- Hemicycle geometry ---------- */
  function hemicycleLayout(n, cx, cy, innerR, outerR, rows) {
    const radii = [];
    for (let i = 0; i < rows; i++) {
      radii.push(rows === 1 ? outerR : innerR + (i * (outerR - innerR)) / (rows - 1));
    }
    const totalR = radii.reduce((a, b) => a + b, 0);
    const perRow = radii.map((r) => Math.max(1, Math.round((n * r) / totalR)));
    let diff = n - perRow.reduce((a, b) => a + b, 0);
    let guard = 0;
    while (diff !== 0 && guard < 10000) {
      const j = perRow.length - 1 - (guard % rows);
      if (diff > 0) { perRow[j]++; diff--; }
      else if (perRow[j] > 1) { perRow[j]--; diff++; }
      guard++;
    }
    const points = [];
    for (let i = 0; i < rows; i++) {
      const r = radii[i];
      const count = perRow[i];
      for (let j = 0; j < count; j++) {
        const t = count > 1 ? j / (count - 1) : 0.5;
        const theta = Math.PI - t * Math.PI;
        points.push({ x: cx + r * Math.cos(theta), y: cy - r * Math.sin(theta), angle: theta });
      }
    }
    points.sort((a, b) => b.angle - a.angle);
    return points;
  }

  /* ---------- Render ---------- */
  function renderLegend() {
    const meta = LAYER_META[layer];
    document.getElementById("layerHint").textContent = meta.hint;
    document.getElementById("partyLegend").innerHTML = meta.legend
      .map(([label, cls]) => `<span class="swatch"><span class="dot" style="background:var(--${cls})"></span>${label}</span>`)
      .join("");
  }

  function statCards(items) {
    return items.map(([label, n, tone]) => `<div class="gov-stat"><div class="n ${tone}">${n}</div><div class="lbl">${label}</div></div>`).join("");
  }
  function renderSummary(seats) {
    const el = document.getElementById("govSummary");
    const counts = {};
    seats.forEach((s) => (counts[s.party] = (counts[s.party] || 0) + 1));
    if (layer === "senate") {
      el.innerHTML = statCards([["R", counts.Republican || 0, "r"], ["D", counts.Democratic || 0, "d"], ["I", counts.Independent || 0, "i"], ["Total seats", seats.length, ""]]);
    } else if (layer === "house") {
      el.innerHTML = statCards([["R", counts.Republican || 0, "r"], ["D", counts.Democratic || 0, "d"], ["Vacant", counts.Vacant || 0, ""], ["Total seats", seats.length, ""]]);
    } else if (layer === "governor") {
      el.innerHTML = statCards([["R governors", counts.Republican || 0, "r"], ["D governors", counts.Democratic || 0, "d"]]);
    } else {
      el.innerHTML = statCards([["R-controlled", counts.Republican || 0, "r"], ["D-controlled", counts.Democratic || 0, "d"], ["Split", counts.Split || 0, ""]]);
    }
  }

  function renderHemicycle() {
    const seats = BUILD_FN[layer]();
    renderSummary(seats);
    renderLegend();

    seats.sort((a, b) => BLOCK_ORDER.indexOf(a.party) - BLOCK_ORDER.indexOf(b.party));

    const svg = document.getElementById("hemicycle");
    const cx = 500, cy = 500;
    const outerR = 460;
    const innerR = 90;
    const dotR = seats.length > 300 ? 5.5 : seats.length > 120 ? 7.5 : 11;
    const rows = Math.max(4, Math.min(26, Math.round(Math.sqrt(seats.length * 1.4))));
    const points = hemicycleLayout(seats.length, cx, cy, innerR, outerR, rows);

    const svgNS = "http://www.w3.org/2000/svg";
    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 1000 ${cy + 60}`);
    points.forEach((pt, i) => {
      const seat = seats[i];
      if (!seat) return;
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", pt.x.toFixed(1));
      c.setAttribute("cy", pt.y.toFixed(1));
      c.setAttribute("r", dotR);
      c.setAttribute("class", `seat ${PARTY_CLASS[seat.party] || "party-none"}`);
      c.setAttribute("data-id", seat.stateId);
      if (seat.stateId === selected) c.classList.add("selected");
      const title = document.createElementNS(svgNS, "title");
      title.textContent = seat.label;
      c.appendChild(title);
      c.addEventListener("click", () => onStateClick(seat.stateId));
      svg.appendChild(c);
    });
  }

  function onStateClick(id) {
    selected = id;
    renderDetail();
    renderHemicycle();
  }

  function renderDetail() {
    const el = document.getElementById("stateDetail");
    const s = byId(selected);
    if (!s) {
      el.innerHTML = `<p class="state-detail-hint">Click a seat above for that state's full delegation.</p>`;
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

  function setLayer(l) {
    layer = l;
    document.querySelectorAll(".layer-btn").forEach((b) => b.classList.toggle("active", b.dataset.layer === l));
    renderHemicycle();
  }

  function setupTheme() {
    const btn = document.getElementById("themeToggle");
    const saved = (() => { try { return localStorage.getItem("usatlas-theme"); } catch { return null; } })();
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

  renderHemicycle();
  renderDetail();
  setupTheme();
})();
