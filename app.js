// ═══════════════════════════════════════════════════════════════
//  BlueLight — Campus Safety Navigation
//  Fully interactive prototype
// ═══════════════════════════════════════════════════════════════

// ─── Campus Data ─────────────────────────────────────────────────────────────

// Starting point: near 55th St & Woodlawn Ave (south of main campus, clearly distinct)
const START = { lat: 41.7840, lng: -87.5958, name: "Current Location" };

const DESTINATIONS = {
  regenstein: { name: "Regenstein Library",     lat: 41.7924, lng: -87.5998, hours: "Open until 10:00 PM", hoursOpen: true, access: "id-card",     accessLabel: "🪪 ID Card Entry",  photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Regenstein_Library.jpg"            },
  crerar:     { name: "Crerar Library",          lat: 41.7920, lng: -87.6010, hours: "Open until 11:00 PM", hoursOpen: true, access: "open-access", accessLabel: "✓ Open Access",     photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/John_Crerar_Library.jpg"           },
  ida:        { name: "Ida Noyes Hall",          lat: 41.7887, lng: -87.5988, hours: "Open until 9:00 PM",  hoursOpen: true, access: "limited",     accessLabel: "⏱ Limited Hours",  photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Ida_Noyes_Hall.jpg"                },
  cobb:       { name: "Cobb Hall",               lat: 41.7906, lng: -87.5994, hours: "Open until 8:00 PM",  hoursOpen: true, access: "open-access", accessLabel: "✓ Open Access",     photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Cobb_Hall_Chicago.jpg"             },
  mansueto:   { name: "Mansueto Library",        lat: 41.7923, lng: -87.5988, hours: "Open until 10:00 PM", hoursOpen: true, access: "id-card",     accessLabel: "🪪 ID Card Entry",  photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Joe_and_Rika_Mansueto_Library.jpg" },
  ratner:     { name: "Ratner Athletics Center", lat: 41.7894, lng: -87.6015, hours: "Open until 11:00 PM", hoursOpen: true, access: "id-card",     accessLabel: "🪪 ID Card Entry",  photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Ratner_Athletics_Center.jpg"       },
  harper:     { name: "Harper Memorial Library", lat: 41.7910, lng: -87.5990, hours: "Open until 6:00 PM",  hoursOpen: true, access: "open-access", accessLabel: "✓ Open Access",     photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Harper_Memorial_Library.jpg"      },
  smart:      { name: "Smart Museum of Art",     lat: 41.7905, lng: -87.6005, hours: "Closed",              hoursOpen: false,access: "limited",     accessLabel: "⏱ Limited Hours",  photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Smart_Museum_of_Art.jpg"           },
  bond:       { name: "Bond Chapel",             lat: 41.7915, lng: -87.5986, hours: "Open until 5:00 PM",  hoursOpen: true, access: "open-access", accessLabel: "✓ Open Access",     photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Bond_Chapel_Chicago.jpg"           },
  ryerson:    { name: "Ryerson Physical Lab",    lat: 41.7914, lng: -87.5994, hours: "Open until 9:00 PM",  hoursOpen: true, access: "id-card",     accessLabel: "🪪 ID Card Entry",  photo: "https://en.m.wikipedia.org/wiki/Special:FilePath/Ryerson_Laboratory.jpg"            },
};

// Speed multipliers per transport mode
const SPEED = { walk: 1, bike: 0.45, transit: 0.55 };

const BLUELIGHT_STATIONS = [
  { lat: 41.7875, lng: -87.5989, name: "Ellis Ave Station",    id: "BL-001" },
  { lat: 41.7893, lng: -87.5994, name: "Midway Plaisance",     id: "BL-002" },
  { lat: 41.7908, lng: -87.6001, name: "University Ave North", id: "BL-003" },
  { lat: 41.7919, lng: -87.5996, name: "58th St Station",      id: "BL-004" },
  { lat: 41.7862, lng: -87.5978, name: "Cottage Grove South",  id: "BL-005" },
  { lat: 41.7901, lng: -87.5983, name: "Harper Court",         id: "BL-006" },
  { lat: 41.7925, lng: -87.6006, name: "Regenstein North",     id: "BL-007" },
  { lat: 41.7882, lng: -87.6010, name: "Ratner Center",        id: "BL-008" },
  { lat: 41.7912, lng: -87.5975, name: "Bond Chapel Walk",     id: "BL-009" },
  { lat: 41.7930, lng: -87.5990, name: "Crerar East",          id: "BL-010" },
  { lat: 41.7870, lng: -87.6002, name: "Woodlawn Ave",         id: "BL-011" },
  { lat: 41.7940, lng: -87.6012, name: "Kersten Physics",      id: "BL-012" },
  { lat: 41.7848, lng: -87.5992, name: "59th St & Ellis",      id: "BL-013" },
];

const HAZARD_MARKERS = [
  { lat: 41.7855, lng: -87.5975, desc: "Uneven pavement reported" },
  { lat: 41.7897, lng: -87.6018, desc: "Poor lighting — use caution" },
];

// ─── Route Generator ─────────────────────────────────────────────────────────

function genRoutes(destKey) {
  const dest = DESTINATIONS[destKey];
  const dLat = dest.lat - START.lat;
  const dLng = dest.lng - START.lng;
  const distM = Math.sqrt(dLat * dLat + dLng * dLng) * 111320;
  const distMi = (distM / 1609.34).toFixed(1);

  // ── Hyde Park approximate street grid ─────────────────────────────────────
  // E–W streets (latitude)
  const S60 = 41.7862;  // 60th St  (Midway Plaisance north edge)
  const S59 = 41.7876;  // 59th St
  const S58 = 41.7890;  // 58th St
  const S57 = 41.7906;  // 57th St
  // N–S avenues (longitude)
  const UNIV  = -87.5975;  // University Ave
  const ELLIS = -87.5988;  // Ellis Ave

  // Return the E–W street at or just below a given latitude
  function floorStreet(lat) {
    if (lat > S57) return S57;
    if (lat > S58) return S58;
    if (lat > S59) return S59;
    return S60;
  }

  // ── Route 1 – SAFEST ──────────────────────────────────────────────────────
  // North on Woodlawn → 59th St → west to Ellis Ave → north on Ellis → dest
  // (Ellis Ave has the most Blue Light coverage and street lighting)
  const safestCoords = [
    [START.lat, START.lng],
    [S59,       START.lng],   // north to 59th St
    [S59,       ELLIS    ],   // west on 59th to Ellis Ave
    [dest.lat,  ELLIS    ],   // north on Ellis to destination latitude
    [dest.lat,  dest.lng ],   // east/west final approach
  ];

  // ── Route 2 – BALANCED ────────────────────────────────────────────────────
  // North → 60th → west to University Ave → north → cross street → dest
  const midStreet = floorStreet(dest.lat - 0.0006);
  const balancedCoords = [
    [START.lat, START.lng],
    [S60,       START.lng],   // north to 60th St
    [S60,       UNIV     ],   // west on 60th to University Ave
    [midStreet, UNIV     ],   // north on University to cross street
    [midStreet, dest.lng ],   // east/west on cross street to dest longitude
    [dest.lat,  dest.lng ],   // final approach
  ];

  // ── Route 3 – FASTEST ─────────────────────────────────────────────────────
  // Straight north on Woodlawn to destination latitude → cut west to dest
  const fastestCoords = [
    [START.lat, START.lng],
    [dest.lat,  START.lng],   // north to destination latitude (Woodlawn corridor)
    [dest.lat,  dest.lng ],   // west/east to destination
  ];

  const walkMin = Math.max(3, Math.round(distM / 80));
  const safeScore = Math.min(99, 82 + Math.floor(distM / 200));

  return {
    safest: {
      coords: safestCoords,
      baseMins: Math.round(walkMin * 1.18),
      distMi: (+distMi + 0.1).toFixed(1),
      score: safeScore,
    },
    balanced: {
      coords: balancedCoords,
      baseMins: Math.round(walkMin * 1.05),
      distMi: distMi,
      score: Math.max(60, safeScore - 10),
    },
    fastest: {
      coords: fastestCoords,
      baseMins: walkMin,
      distMi: (+distMi - 0.05).toFixed(1),
      score: Math.max(50, safeScore - 22),
    },
  };
}

function routeTime(baseMins, mode) {
  return Math.max(1, Math.round(baseMins * SPEED[mode])) + " min";
}

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  view: "v-start",
  destKey: null,
  routeMode: "safest",
  transportMode: "walk",
  routes: null,           // generated route data
  polylines: {},
  startMarker: null,
  destMarker: null,
  navStepIdx: 0,
  navTimer: null,
  navProgress: 15,
};

// ─── Map ─────────────────────────────────────────────────────────────────────

const map = L.map("map", {
  center: [41.7893, -87.5975],
  zoom: 15,
  zoomControl: false,
  attributionControl: false,
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  subdomains: "abcd",
  maxZoom: 19,
}).addTo(map);

// "You are here" marker at START location
L.marker([START.lat, START.lng], {
  icon: L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;background:#007aff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(0,122,255,0.3),0 2px 10px rgba(0,0,0,0.6)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
}).addTo(map).bindTooltip("Your Location", { permanent: false, direction: "top", className: "dest-tooltip" });

// Blue Light markers
BLUELIGHT_STATIONS.forEach((s) => {
  const icon = L.divIcon({
    className: "",
    html: `<div class="bl-marker-wrap"><div class="bl-marker"><div class="bl-pulse"></div></div></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  L.marker([s.lat, s.lng], { icon })
    .addTo(map)
    .bindPopup(
      `<div class="bl-popup">
        <div class="bl-popup-id">${s.id}</div>
        <div class="bl-popup-name">${s.name}</div>
        <div class="bl-popup-status">● Active &amp; Operational</div>
        <div class="bl-popup-tip">Press button to connect to UChicago Police</div>
      </div>`,
      { className: "bl-popup-wrap", maxWidth: 200 }
    );
});

// Hazard markers
HAZARD_MARKERS.forEach((h) => {
  const icon = L.divIcon({
    className: "",
    html: `<div class="hazard-marker">⚠</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  L.marker([h.lat, h.lng], { icon })
    .addTo(map)
    .bindPopup(
      `<div class="bl-popup">
        <div class="bl-popup-id" style="color:#ffd60a">⚠ HAZARD</div>
        <div class="bl-popup-name">${h.desc}</div>
        <div class="bl-popup-tip">Reported by campus safety. Avoid if possible.</div>
      </div>`,
      { className: "bl-popup-wrap", maxWidth: 200 }
    );
});

// Zoom controls
document.getElementById("zoom-in").addEventListener("click",  () => map.zoomIn());
document.getElementById("zoom-out").addEventListener("click", () => map.zoomOut());

// ─── Toast ───────────────────────────────────────────────────────────────────

let toastTimer = null;
function toast(msg, duration = 3000) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), duration);
}

// ─── View Transitions ─────────────────────────────────────────────────────────

function showView(id) {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  state.view = id;

  function showFloat(elId, show) {
    const el = document.getElementById(elId);
    el.style.cssText = show
      ? "display:flex !important; pointer-events:auto !important;"
      : "display:none !important; pointer-events:none !important;";
  }

  showFloat("float-via-btn",       id === "v-start");
  showFloat("float-emergency-btn", true);   // always visible
  showFloat("float-hazard-btn",    id === "v-start" || id === "v-nav");
}

function openEmergencyModal() {
  document.getElementById("emergency-modal").hidden = false;
}

// ─── Search ──────────────────────────────────────────────────────────────────

const searchInput  = document.getElementById("search-input");
const searchClear  = document.getElementById("search-clear");
const searchResults = document.getElementById("search-results");

searchInput.addEventListener("focus", () => {
  renderResults(searchInput.value);
  searchResults.hidden = false;
});

searchInput.addEventListener("input", () => {
  renderResults(searchInput.value);
  searchClear.hidden = searchInput.value.length === 0;
  searchResults.hidden = false;
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchClear.hidden = true;
  renderResults("");
  searchInput.focus();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#search-bar") && !e.target.closest("#search-results")) {
    searchResults.hidden = true;
  }
});

function renderResults(query) {
  const q = query.toLowerCase().trim();
  searchResults.innerHTML = "";
  const matches = Object.entries(DESTINATIONS).filter(([, d]) =>
    !q || d.name.toLowerCase().includes(q)
  );
  if (!matches.length) {
    searchResults.innerHTML = `<div class="result-empty">No results for "${query}"</div>`;
    return;
  }
  matches.forEach(([key, dest]) => {
    const item = document.createElement("button");
    item.className = "result-item";
    item.innerHTML = `
      <span class="result-icon">${dest.hoursOpen ? "📍" : "🔒"}</span>
      <span class="result-name">${dest.name}</span>
      <span class="result-status ${dest.hoursOpen ? "open-text" : "closed-text"}">${dest.hoursOpen ? "Open" : "Closed"}</span>
    `;
    item.addEventListener("click", () => {
      searchInput.value = dest.name;
      searchResults.hidden = true;
      goToRouteSelect(key);
    });
    searchResults.appendChild(item);
  });
}

// ─── Quick destination chips ──────────────────────────────────────────────────

document.querySelectorAll(".dest-chip").forEach((chip) => {
  chip.addEventListener("click", () => goToRouteSelect(chip.dataset.dest));
});

// ─── Route Drawing ────────────────────────────────────────────────────────────

const STYLES = {
  safest:   { color: "#34c759", weight: 6, opacity: 1,    dashArray: null },
  balanced: { color: "#ffd60a", weight: 5, opacity: 0.85, dashArray: null },
  fastest:  { color: "#8e8e93", weight: 4, opacity: 0.75, dashArray: "6 4" },
};

function drawRoutes() {
  clearRoutes();
  ["fastest", "balanced", "safest"].forEach((key) => {
    const r = state.routes[key];
    const s = STYLES[key];
    const selected = key === state.routeMode;
    const line = L.polyline(r.coords, {
      color: s.color,
      weight: selected ? s.weight : s.weight - 1,
      opacity: selected ? s.opacity : s.opacity * 0.3,
      dashArray: s.dashArray,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);
    line.on("click", () => selectRoute(key));
    state.polylines[key] = line;
  });

  // Markers
  const dest = DESTINATIONS[state.destKey];
  state.startMarker = L.marker([START.lat, START.lng], {
    icon: L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;background:#8e8e93;border:2.5px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.6)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7],
    }),
  }).addTo(map);

  state.destMarker = L.marker([dest.lat, dest.lng], {
    icon: L.divIcon({
      className: "",
      html: `<div class="dest-pin"></div>`,
      iconSize: [20, 26], iconAnchor: [10, 24],
    }),
  }).addTo(map)
    .bindTooltip(dest.name, { permanent: false, direction: "top", className: "dest-tooltip" });

  state.destMarker.on("click", () => {
    toast(`Navigating to ${dest.name}`);
    goToNav();
  });

  fitRoutes();
}

function fitRoutes() {
  const coords = Object.values(state.routes).flatMap((r) => r.coords);
  // paddingTopLeft: [left, top] — leave room for the 420px left panel
  // paddingBottomRight: [right, bottom]
  // maxZoom: never zoom in past 15 so both endpoints stay visible
  map.fitBounds(L.latLngBounds(coords), {
    paddingTopLeft:     [450, 60],
    paddingBottomRight: [60,  80],
    maxZoom: 15,
    animate: true,
    duration: 0.6,
  });
}

function clearRoutes() {
  Object.values(state.polylines).forEach((p) => p && map.removeLayer(p));
  state.polylines = {};
  if (state.startMarker) { map.removeLayer(state.startMarker); state.startMarker = null; }
  if (state.destMarker)  { map.removeLayer(state.destMarker);  state.destMarker = null; }
}

function updatePolylineOpacity() {
  Object.entries(state.polylines).forEach(([key, line]) => {
    const s = STYLES[key];
    const selected = key === state.routeMode;
    line.setStyle({
      opacity: selected ? s.opacity : s.opacity * 0.3,
      weight:  selected ? s.weight  : s.weight - 1,
    });
  });
}

// ─── Route Cards ─────────────────────────────────────────────────────────────

const ROUTE_META = {
  safest:   { label: "Safest Route",   badge: "RECOMMENDED", scoreClass: "score-green",  cardSel: "selected"        },
  balanced: { label: "Balanced Route", badge: null,           scoreClass: "score-yellow", cardSel: "selected-yellow" },
  fastest:  { label: "Fastest Route",  badge: null,           scoreClass: "score-gray",   cardSel: "selected-gray"   },
};

function buildRouteCards() {
  const container = document.getElementById("route-cards");
  container.innerHTML = "";
  ["safest", "balanced", "fastest"].forEach((key) => {
    const r    = state.routes[key];
    const m    = ROUTE_META[key];
    const sel  = key === state.routeMode;
    const time = routeTime(r.baseMins, state.transportMode);

    const card = document.createElement("div");
    card.className = "route-card" + (sel ? ` ${m.cardSel}` : "");
    card.dataset.route = key;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    card.innerHTML = `
      ${sel && m.badge ? `<div class="selected-badge">${m.badge}</div>` : ""}
      <div class="route-top">
        <span class="route-name">${m.label}</span>
        <span class="route-score ${m.scoreClass}">${r.score}</span>
      </div>
      <div class="route-info">
        <span>${time}</span><span>·</span><span>${r.distMi} mi</span>
      </div>
    `;

    card.addEventListener("click", () => selectRoute(key));
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") selectRoute(key); });
    container.appendChild(card);
  });
}

function selectRoute(key) {
  state.routeMode = key;
  updatePolylineOpacity();
  buildRouteCards();
  syncNavPanel();
}

// ─── Go to Route Selection ────────────────────────────────────────────────────

function goToRouteSelect(destKey) {
  state.destKey = destKey;
  state.routeMode = "safest";
  state.routes = genRoutes(destKey);

  const dest = DESTINATIONS[destKey];
  document.getElementById("dest-label").textContent = dest.name;

  // Building chip
  syncBuildingChip("routes", dest);

  // Draw map
  drawRoutes();
  buildRouteCards();
  syncNavPanel();

  showView("v-routes");
  searchResults.hidden = true;
}

// ─── Transport Mode ───────────────────────────────────────────────────────────

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    state.transportMode = tab.dataset.mode;
    buildRouteCards();
    syncNavPanel();
  });
});

// ─── Building Chips ───────────────────────────────────────────────────────────

function syncBuildingChip(which, dest) {
  const nameEl   = document.getElementById(`bchip-${which}-name`);
  const hoursEl  = document.getElementById(`bchip-${which}-hours`);
  const accessEl = document.getElementById(`bchip-${which}-access`);
  const statusEl = document.querySelector(`#bchip-${which} .bchip-status`);
  const photoEl  = document.getElementById(`bchip-${which}-photo`);

  if (nameEl)   nameEl.textContent   = dest.name;
  if (hoursEl)  hoursEl.textContent  = dest.hours;
  if (hoursEl)  hoursEl.className    = `bchip-hours ${dest.hoursOpen ? "open-text" : "closed-text"}`;
  if (accessEl) { accessEl.textContent = dest.accessLabel; accessEl.className = `bchip-access ${dest.access}`; }
  if (statusEl) statusEl.className   = `bchip-status ${dest.hoursOpen ? "open-dot" : "closed-dot"}`;
  if (photoEl && dest.photo) {
    photoEl.style.display = "block";
    photoEl.src = dest.photo;
  } else if (photoEl) {
    photoEl.style.display = "none";
    photoEl.src = "";
  }
}

// Click to expand/collapse chip
["bchip-routes", "bchip-nav"].forEach((id) => {
  document.getElementById(id)?.addEventListener("click", () => {
    const suffix = id === "bchip-routes" ? "routes" : "nav";
    const expanded = document.getElementById(`bchip-${suffix}-expanded`);
    if (!expanded) return;
    expanded.hidden = !expanded.hidden;
    document.getElementById(id).classList.toggle("chip-expanded", !expanded.hidden);
  });
});


// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_STEPS = [
  { arrow: "↑", street: "Head north on Ellis Ave",         detail: "Continue for 0.15 mi" },
  { arrow: "↰", street: "Turn left on 57th Street",        detail: "Continue for 0.2 mi"  },
  { arrow: "↑", street: "Head north on University Ave",    detail: "Continue for 0.1 mi"  },
  { arrow: "↱", street: "Turn right toward destination",   detail: "Destination on left"   },
  { arrow: "⊙", street: "You have arrived",                detail: "Regenstein Library"    },
];

function syncNavPanel() {
  if (!state.routes || !state.destKey) return;
  const r    = state.routes[state.routeMode];
  const time = routeTime(r.baseMins, state.transportMode);
  document.getElementById("eta-time").textContent  = time;
  document.getElementById("eta-dist").textContent  = `${r.distMi} mi remaining`;
  document.getElementById("nav-score-num").textContent = r.score;
  document.getElementById("modal-score-num").textContent = r.score;

  // Update last nav step with actual destination name
  const dest = DESTINATIONS[state.destKey];
  NAV_STEPS[NAV_STEPS.length - 1].detail = dest.name;
}

function showNavStep(idx) {
  const step = NAV_STEPS[idx];
  document.getElementById("nav-arrow").textContent  = step.arrow;
  document.getElementById("nav-street").textContent = step.street;
  document.getElementById("nav-detail").textContent = step.detail;
  document.getElementById("step-counter").textContent = `${idx + 1} / ${NAV_STEPS.length}`;
  document.getElementById("prev-step").disabled = idx === 0;
  document.getElementById("next-step").disabled = idx === NAV_STEPS.length - 1;

  // Advance progress
  state.navProgress = Math.round((idx / (NAV_STEPS.length - 1)) * 100);
  document.getElementById("progress-fill").style.width = state.navProgress + "%";
}

document.getElementById("prev-step").addEventListener("click", () => {
  if (state.navStepIdx > 0) { state.navStepIdx--; showNavStep(state.navStepIdx); clearNavTimer(); }
});
document.getElementById("next-step").addEventListener("click", () => {
  if (state.navStepIdx < NAV_STEPS.length - 1) { state.navStepIdx++; showNavStep(state.navStepIdx); }
  else { toast("You have arrived at your destination! 🎉"); endNav(); }
});

function startNavTimer() {
  clearNavTimer();
  state.navTimer = setInterval(() => {
    if (state.navStepIdx < NAV_STEPS.length - 1) {
      state.navStepIdx++;
      showNavStep(state.navStepIdx);
    } else {
      clearNavTimer();
    }
  }, 5000);
}
function clearNavTimer() { clearInterval(state.navTimer); }

function goToNav() {
  try {
    if (!state.destKey || !state.routes) { toast("Please select a destination first."); return; }
    const dest = DESTINATIONS[state.destKey];
    syncBuildingChip("nav", dest);
    syncNavPanel();

    // Show only selected route
    ["safest", "balanced", "fastest"].forEach((key) => {
      if (key !== state.routeMode && state.polylines[key]) {
        map.removeLayer(state.polylines[key]);
      }
    });

    // Zoom to selected route (no left panel in nav view)
    const coords = state.routes[state.routeMode].coords;
    map.fitBounds(L.latLngBounds(coords), {
      padding: [80, 80],
      maxZoom: 15,
      animate: true,
      duration: 0.7,
    });

    state.navStepIdx = 0;
    showNavStep(0);
    document.getElementById("progress-fill").style.width = "0%";
    toast(`Navigating to ${dest.name}…`, 3000);
    startNavTimer();
    showView("v-nav");
  } catch (err) {
    toast("Error: " + err.message, 5000);
  }
}

function endNav() {
  clearNavTimer();
  clearRoutes();
  map.setView([41.7893, -87.5993], 15, { animate: true, duration: 0.7 });
  document.getElementById("search-input").value = "";
  searchClear.hidden = true;
  state.destKey = null;
  state.routes  = null;
  showView("v-start");
}

// ─── Event Bindings ───────────────────────────────────────────────────────────

document.getElementById("start-nav-btn").addEventListener("click", goToNav);
document.getElementById("end-nav-btn").addEventListener("click", () => {
  endNav();
  toast("Navigation ended");
});

document.getElementById("back-routes").addEventListener("click", () => {
  clearRoutes();
  map.setView([41.7893, -87.5993], 15, { animate: true, duration: 0.7 });
  showView("v-start");
});

// Via Request button
document.getElementById("via-request-btn").addEventListener("click", function () {
  this.textContent = "Requesting…";
  this.disabled = true;
  setTimeout(() => {
    toast("🚐 Via driver notified! Pickup in ~5 min at your location.");
    this.textContent = "Requested ✓";
    this.style.background = "#34c759";
  }, 1400);
});

// Safety modal
document.getElementById("nav-score-pill").addEventListener("click", () => {
  document.getElementById("safety-modal").hidden = false;
});
document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("safety-modal").hidden = true;
});
document.getElementById("safety-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("safety-modal")) {
    document.getElementById("safety-modal").hidden = true;
  }
});

// Report hazard
document.getElementById("report-btn").addEventListener("click", () => {
  toast("⚠ Hazard reported. Campus security notified.", 4000);
});

// Emergency call (nav panel button)
document.getElementById("call-btn").addEventListener("click", () => {
  openEmergencyModal();
});

// ─── Floating buttons (View 1) ────────────────────────────────────────────

document.getElementById("float-via-btn").addEventListener("click", function () {
  this.textContent = "";
  this.innerHTML = "<span class='float-btn-icon'>🚐</span><span>Requesting…</span>";
  this.disabled = true;
  setTimeout(() => {
    toast("🚐 Via driver notified! Pickup in ~5 min at your location.");
    this.innerHTML = "<span class='float-btn-icon'>🚐</span><span>Requested ✓</span>";
    this.style.background = "rgba(10,40,20,0.95)";
    this.style.borderColor = "rgba(52,199,89,0.55)";
    this.style.color = "#34c759";
    setTimeout(() => {
      this.innerHTML = "<span class='float-btn-icon'>🚐</span><span>Via Transit</span>";
      this.style.background = "";
      this.style.borderColor = "";
      this.style.color = "";
      this.disabled = false;
    }, 8000);
  }, 1400);
});

document.getElementById("float-emergency-btn").addEventListener("click", () => {
  openEmergencyModal();
});

document.getElementById("float-hazard-btn").addEventListener("click", () => {
  toast("⚠ Hazard reported. Campus security notified.", 4000);
});

// ─── Emergency modal ──────────────────────────────────────────────────────

document.getElementById("emergency-modal-close").addEventListener("click", () => {
  document.getElementById("emergency-modal").hidden = true;
});
document.getElementById("emergency-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("emergency-modal")) {
    document.getElementById("emergency-modal").hidden = true;
  }
});
document.getElementById("call-ucpd-btn").addEventListener("click", () => {
  document.getElementById("emergency-modal").hidden = true;
  toast("📞 Calling UCPD: (773) 702-8181 — Stay on the line.", 5000);
});
document.getElementById("nav-bluelight-btn").addEventListener("click", () => {
  document.getElementById("emergency-modal").hidden = true;
  // Pan map to nearest Blue Light station (BL-002)
  map.setView([41.7893, -87.5994], 17, { animate: true });
  toast("🔵 Navigating to BL-002 · Midway Plaisance · ~80 ft away", 4000);
});
document.getElementById("call-911-btn").addEventListener("click", () => {
  document.getElementById("emergency-modal").hidden = true;
  toast("🆘 Calling 911 — Chicago Emergency Services", 5000);
});

// ─── Keyboard Shortcuts ───────────────────────────────────────────────────────

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!document.getElementById("emergency-modal").hidden) {
      document.getElementById("emergency-modal").hidden = true;
    } else if (!document.getElementById("safety-modal").hidden) {
      document.getElementById("safety-modal").hidden = true;
    } else if (state.view === "v-nav") {
      endNav();
    } else if (state.view === "v-routes") {
      clearRoutes();
      map.setView([41.7893, -87.5993], 15, { animate: true });
      showView("v-start");
    }
  }
  if (state.view === "v-nav") {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      document.getElementById("next-step").click();
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      document.getElementById("prev-step").click();
    }
  }
});

// ─── Clock ───────────────────────────────────────────────────────────────────

function updateClock() {
  const now = new Date();
  const h   = now.getHours();
  const m   = String(now.getMinutes()).padStart(2, "0");
  document.getElementById("clock").textContent =
    `${((h % 12) || 12)}:${m} ${h >= 12 ? "PM" : "AM"}`;
}
updateClock();
setInterval(updateClock, 15000);


// ─── Init ─────────────────────────────────────────────────────────────────────

showView("v-start");
