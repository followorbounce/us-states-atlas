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
      tile.addEventListener("click", () => {
        state[state.armed] = tile.dataset.id;
        state.armed = state.armed === "a" ? "b" : "a";
        renderAll();
      });
    });
  }

  function updateTileHighlights() {
    document.querySelectorAll(".tile").forEach((tile) => {
      tile.classList.toggle("is-a", tile.dataset.id === state.a);
      tile.classList.toggle("is-b", tile.dataset.id === state.b);
    });
    document.getElementById("armedLabel").textContent = state.armed === "a" ? "State A" : "State B";
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

  const ROWS = [
    { label: "Population", get: (s) => s.population, fmt: fmtInt },
    { label: "Land area", get: (s) => s.totalAreaKm2, fmt: fmtKm2 },
    { label: "GDP (nominal, 2024)", get: (s) => s.gdpNominalUSD, fmt: fmtMoney },
    { label: "GDP per capita (2024)", get: (s) => s.gdpPerCapitaUSD, fmt: fmtPerCapita },
    { label: "Capital", get: (s) => s.capital, fmt: (v) => v },
    { label: "Largest city", get: (s) => s.largestCity, fmt: (v) => v },
    { label: "Statehood", get: (s) => s.statehood, fmt: (v) => v },
  ];

  function renderCompareTable() {
    const a = byId(state.a), b = byId(state.b);
    const table = document.getElementById("compareTable");
    if (!a || !b) {
      table.innerHTML = "";
      return;
    }
    table.innerHTML = ROWS.map((row) => {
      const va = row.get(a), vb = row.get(b);
      const isNum = typeof va === "number" && typeof vb === "number";
      let bar = "";
      if (isNum && (va || vb)) {
        const total = va + vb || 1;
        const pa = (va / total) * 100;
        bar = `<div class="compare-bar"><div class="a" style="width:${pa}%"></div><div class="b" style="width:${100 - pa}%"></div></div>`;
      }
      return `
        <tr>
          <td class="val a">${row.fmt(va)}${isNum ? bar : ""}</td>
          <td class="lbl"><span class="name">${row.label}</span></td>
          <td class="val b">${row.fmt(vb)}${isNum ? bar : ""}</td>
        </tr>`;
    }).join("");
  }

  function renderAll() {
    document.getElementById("selectA").value = state.a;
    document.getElementById("selectB").value = state.b;
    renderCard("a");
    renderCard("b");
    updateTileHighlights();
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
})();
