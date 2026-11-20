const RADIO_ASSET_BASE = "https://raw.githack.com/FurnalityNetwork/Asset/main/";
const RADIO_API_DEFAULT = "https://furnality-api.darkeoftime.workers.dev";

const RADIO_POLES = [
  { id: "ALL", label: "Tous les pôles" },
  { id: "EUROPE", label: "🇪🇺 Pôle Europe" },
  { id: "PACIFIQUE", label: "🏝️ Pôle Pacifique" },
  { id: "OCEAN_INDIEN", label: "🌋 Pôle Océan Indien" },
  { id: "AMERIQUE_NORD", label: "🍁 Pôle Amérique du Nord" },
  { id: "CARAIBES_SUD", label: "🌴 Pôle Caraïbes & Amérique du Sud" },
  { id: "AFRIQUE_MO", label: "🐪 Pôle Afrique & Moyen-Orient" }
];

const MAIN_RADIO_STATION = {
  id: "furnality-radio",
  code: "FURNALITY RADIO",
  name: "Furnality Radio",
  displayText: "FURNALITY / RADIO",
  pole: "GROUPE",
  zone: "Nationale & Internationale (Généraliste, News, SoundofSkully)",
  description: "Radio généraliste et propriétaire de la RFF, diffusant à l'échelle nationale et internationale.",
  stream_url: "",
  logo: `${RADIO_ASSET_BASE}Assets/STD/RADIO/RRF/Furnality%20Radio%20-%20Radio.svg`
};

const RFF_REGIONAL_STATIONS = [
  // 🇪🇺 Le Pôle Europe
  { id: "rhf", code: "RHF", name: "Radio France Hexagone", displayText: "RADIO / FRANCE / HEXAGONE", pole: "EUROPE", zone: "France Métropolitaine", stream_url: "" },
  { id: "rbf", code: "RBF", name: "Radio Belgique Francophone", displayText: "RADIO / BELGIQUE / FRANCOPHONE", pole: "EUROPE", zone: "Belgique", stream_url: "" },
  { id: "rsf", code: "RSF", name: "Radio Suisse Francophone", displayText: "RADIO / SUISSE / FRANCOPHONE", pole: "EUROPE", zone: "Suisse", stream_url: "" },
  { id: "rlf", code: "RLF", name: "Radio Luxembourg Francophone", displayText: "RADIO / LUXEMBOURG / FRANCOPHONE", pole: "EUROPE", zone: "Luxembourg", stream_url: "" },
  { id: "rmo", code: "RMO", name: "Radio Monaco Principauté", displayText: "RADIO / MONACO / PRINCIPAUTÉ", pole: "EUROPE", zone: "Monaco", stream_url: "" },

  // 🏝️ Le Pôle Pacifique
  { id: "rnc", code: "RNC", name: "Radio Nouvelle-Calédonie", displayText: "RADIO / NOUVELLE- / CALÉDONIE", pole: "PACIFIQUE", zone: "Nouvelle-Calédonie", stream_url: "" },
  { id: "rpf", code: "RPF", name: "Radio Polynésie Française", displayText: "RADIO / POLYNÉSIE / FRANÇAISE", pole: "PACIFIQUE", zone: "Polynésie Française", stream_url: "" },
  { id: "rwf", code: "RWF", name: "Radio Wallis et Futuna", displayText: "RADIO / WALLIS / ET FUTUNA", pole: "PACIFIQUE", zone: "Wallis-et-Futuna", stream_url: "" },
  { id: "rvf", code: "RVF", name: "Radio Vanuatu Francophone", displayText: "RADIO / VANUATU / FRANCOPHONE", pole: "PACIFIQUE", zone: "Vanuatu", stream_url: "" },

  // 🌋 Le Pôle Océan Indien
  { id: "rlr", code: "RLR", name: "Radio La Réunion Océan Indien", displayText: "RADIO / LA RÉUNION / OCÉAN INDIEN", pole: "OCEAN_INDIEN", zone: "La Réunion", stream_url: "" },
  { id: "rma", code: "RMA", name: "Radio Mayotte Archipel", displayText: "RADIO / MAYOTTE / ARCHIPEL", pole: "OCEAN_INDIEN", zone: "Mayotte", stream_url: "" },
  { id: "rmd", code: "RMD", name: "Radio Madagascar Francophone", displayText: "RADIO / MADAGASCAR / FRANCOPHONE", pole: "OCEAN_INDIEN", zone: "Madagascar", stream_url: "" },
  { id: "rmr", code: "RMR", name: "Radio Maurice Océan Indien", displayText: "RADIO / MAURICE / OCÉAN INDIEN", pole: "OCEAN_INDIEN", zone: "Île Maurice", stream_url: "" },

  // 🍁 Le Pôle Amérique du Nord
  { id: "rqc", code: "RQC", name: "Radio Québec Canada", displayText: "RADIO / QUÉBEC / CANADA", pole: "AMERIQUE_NORD", zone: "Québec et l'intégralité du Canada francophone (incluant l'Acadie)", stream_url: "" },
  { id: "rsp", code: "RSP", name: "Radio Saint-Pierre et Miquelon", displayText: "RADIO / SAINT-PIERRE / ET MIQUELON", pole: "AMERIQUE_NORD", zone: "Saint-Pierre-et-Miquelon", stream_url: "" },

  // 🌴 Le Pôle Caraïbes & Amérique du Sud
  { id: "ran", code: "RAN", name: "Radio Antilles Caraïbes", displayText: "RADIO / ANTILLES / CARAÏBES", pole: "CARAIBES_SUD", zone: "Antilles (Guadeloupe, Martinique, Saint-Martin, Saint-Barthélemy)", stream_url: "" },
  { id: "rgy", code: "RGY", name: "Radio Guyane Amazonie", displayText: "RADIO / GUYANE / AMAZONIE", pole: "CARAIBES_SUD", zone: "Guyane", stream_url: "" },

  // 🐪 Le Pôle Afrique & Moyen-Orient
  { id: "rmn", code: "RMN", name: "Radio Maghreb Francophone", displayText: "RADIO / MAGHREB / FRANCOPHONE", pole: "AFRIQUE_MO", zone: "Maghreb (Algérie, Maroc, Tunisie)", stream_url: "" },
  { id: "rfa", code: "RFA", name: "Radio Afrique Francophone", displayText: "RADIO / AFRIQUE / FRANCOPHONE", pole: "AFRIQUE_MO", zone: "Afrique Subsaharienne", stream_url: "" },
  { id: "rlb", code: "RLB", name: "Radio Liban Francophone", displayText: "RADIO / LIBAN / FRANCOPHONE", pole: "AFRIQUE_MO", zone: "Liban & Moyen-Orient", stream_url: "" }
];

function stationLogoUrl(code, variant = "Full") {
  const clean = String(code || "RFF").trim().toUpperCase();
  if (clean === "FURNALITY RADIO") {
    return `${RADIO_ASSET_BASE}Assets/STD/RADIO/RRF/Furnality%20Radio%20-%20Radio.svg`;
  }
  if (clean === "RFF") {
    return `${RADIO_ASSET_BASE}Assets/STD/RADIO/RFF/RFF---${variant}.svg`;
  }
  return `${RADIO_ASSET_BASE}Assets/STD/RADIO/RBF/${encodeURIComponent(clean)}---${variant}.svg`;
}

function escRadio(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function isFilledRadio(v) {
  return v !== null && v !== undefined && String(v).trim() !== "" && String(v).trim().toUpperCase() !== "NULL";
}

function playStation(station) {
  const audio = document.getElementById("radio-audio-element");
  const nameEl = document.getElementById("dock-station-name");
  const statusEl = document.getElementById("dock-status");
  const logoEl = document.getElementById("dock-logo");

  if (nameEl) {
    nameEl.textContent = station.code && station.code !== "FURNALITY RADIO"
      ? `${station.code} — ${station.name}`
      : station.name;
  }

  if (logoEl) {
    logoEl.src = stationLogoUrl(station.code || "RFF", "ICN");
    logoEl.onerror = () => {
      logoEl.src = `${RADIO_ASSET_BASE}Assets/STD/RADIO/RFF/Furnality%20Radio%20-%20Radio%20Alt.svg`;
    };
  }

  if (!audio) return;

  if (isFilledRadio(station.stream_url)) {
    if (audio.src !== station.stream_url) {
      audio.src = station.stream_url;
    }
    audio.play().then(() => {
      if (statusEl) statusEl.textContent = `En lecture · ${station.zone || "Direct"}`;
    }).catch(() => {
      if (statusEl) statusEl.textContent = "Flux externe / lecture manuelle requise";
    });
  } else {
    if (statusEl) {
      statusEl.textContent = `${station.zone || "Antenne RFF"} — Flux en attente de configuration`;
    }
  }
}

function initDockToggle() {
  const audio = document.getElementById("radio-audio-element");
  const btn = document.getElementById("dock-toggle-btn");
  const statusEl = document.getElementById("dock-status");
  if (!audio || !btn) return;

  btn.addEventListener("click", () => {
    if (!audio.src) {
      playStation(MAIN_RADIO_STATION);
      return;
    }
    if (audio.paused) {
      audio.play().then(() => {
        if (statusEl) statusEl.textContent = "En lecture directe";
      }).catch(() => {});
    } else {
      audio.pause();
      if (statusEl) statusEl.textContent = "En pause";
    }
  });
}

async function fetchRadioData() {
  const api = typeof CLOUDFLARE_WORKER_URL !== "undefined" ? CLOUDFLARE_WORKER_URL : RADIO_API_DEFAULT;
  let stations = [...RFF_REGIONAL_STATIONS];
  let mainStation = { ...MAIN_RADIO_STATION };
  let shows = [];

  try {
    const [resDiff, resShows] = await Promise.all([
      fetch(`${api}/api/diffusions`),
      fetch(`${api}/api/shows`)
    ]);

    if (resDiff.ok) {
      const diff = await resDiff.json();
      const radioDiffs = (Array.isArray(diff) ? diff : []).filter(d => String(d.role || "").toUpperCase() === "RDO");

      radioDiffs.forEach(d => {
        const nomLower = String(d.nom || "").trim().toLowerCase();
        const codeUpper = String(d.code || "").trim().toUpperCase();

        if (nomLower.includes("furnality radio") && !nomLower.includes("rff")) {
          if (isFilledRadio(d.stream_url)) mainStation.stream_url = d.stream_url;
          if (isFilledRadio(d.logo)) mainStation.logo = d.logo;
        }

        const matched = stations.find(s =>
          (codeUpper && s.code === codeUpper) ||
          nomLower.includes(s.code.toLowerCase()) ||
          nomLower.includes(s.name.toLowerCase())
        );
        if (matched && isFilledRadio(d.stream_url)) {
          matched.stream_url = d.stream_url;
        }
      });
    }

    if (resShows.ok) {
      const all = await resShows.json();
      shows = (Array.isArray(all) ? all : []).filter(s => isFilledRadio(s.podcast_url));
    }
  } catch (e) {
    console.warn("Radio API fallback:", e);
  }

  return { mainStation, stations, shows };
}

function renderHomePreview(mainStation, stations) {
  const wrap = document.getElementById("home-stations-preview");
  if (!wrap) return;

  const featuredCodes = ["RNC", "RHF", "RQC", "RLR"];
  const previewStations = stations.filter(s => featuredCodes.includes(s.code));

  wrap.innerHTML = previewStations.map(st => `
    <div class="radio-card p-5 flex flex-col justify-between gap-4">
      <div class="flex items-center justify-between gap-2">
        <img src="${escRadio(stationLogoUrl(st.code, "ICN"))}" alt="${escRadio(st.code)}" class="h-8 w-auto object-contain" onerror="this.style.display='none'">
        <img src="${escRadio(stationLogoUrl(st.code, "Tag"))}" alt="" class="h-5 w-auto object-contain" onerror="this.style.display='none'">
      </div>
      <div>
        <span class="text-[10px] font-mono font-bold uppercase" style="color:#004dff;">${escRadio(st.code)}</span>
        <h3 class="text-sm font-bold text-black mt-0.5">${escRadio(st.name)}</h3>
        <p class="text-xs text-gray-500 mt-1 line-clamp-2">${escRadio(st.zone)}</p>
      </div>
      <a href="https://furnalitynetwork.github.io/Radio/antennes.html?station=${encodeURIComponent(st.code)}" class="text-[11px] font-bold uppercase tracking-wider" style="color:#5a189a;">
        Voir sur la carte →
      </a>
    </div>
  `).join("");
}

function renderAntennesPage(stations) {
  const listEl = document.getElementById("stations-list");
  const searchEl = document.getElementById("station-search");
  const countEl = document.getElementById("stations-total-label");
  if (!listEl) return;

  let currentPole = "ALL";
  let currentQuery = "";

  const params = new URLSearchParams(window.location.search);
  const requestedCode = (params.get("station") || "").trim().toUpperCase();
  let selectedStation = stations.find(s => s.code === requestedCode) || stations.find(s => s.code === "RNC") || stations[0];

  function updateSelectedBox(st) {
    selectedStation = st;
    const titleEl = document.getElementById("selected-station-title");
    const descEl = document.getElementById("selected-station-desc");
    const fullLogo = document.getElementById("selected-station-full-logo");
    const tagLogo = document.getElementById("selected-station-tag-logo");
    const listenBtn = document.getElementById("selected-station-listen");

    if (titleEl) titleEl.textContent = `${st.code} — ${st.name}`;
    if (descEl) descEl.textContent = `Zone de diffusion : ${st.zone} (${st.displayText})`;

    if (fullLogo) {
      fullLogo.src = stationLogoUrl(st.code, "Full");
      fullLogo.onerror = () => { fullLogo.src = stationLogoUrl("RFF", "Full"); };
    }
    if (tagLogo) {
      tagLogo.src = stationLogoUrl(st.code, "Tag");
      tagLogo.onerror = () => { tagLogo.src = stationLogoUrl("RFF", "Tag"); };
    }
    if (listenBtn) {
      listenBtn.onclick = () => playStation(st);
    }
  }

  function drawList() {
    const filtered = stations.filter(st => {
      const matchPole = currentPole === "ALL" || st.pole === currentPole;
      const matchQ = !currentQuery || `${st.code} ${st.name} ${st.zone} ${st.displayText}`.toLowerCase().includes(currentQuery);
      return matchPole && matchQ;
    });

    if (countEl) countEl.textContent = `${filtered.length} / ${stations.length} antennes RFF`;
    listEl.innerHTML = "";

    filtered.forEach(st => {
      const isSelected = selectedStation && selectedStation.code === st.code;
      const row = document.createElement("div");
      row.className = `radio-station-pill p-4 border bg-white flex items-center justify-between gap-4 hover:border-black transition-colors ${isSelected ? "is-active" : "border-gray-200"}`;
      row.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <img src="${escRadio(stationLogoUrl(st.code, "ICN"))}" alt="${escRadio(st.code)}" class="h-8 w-8 object-contain flex-shrink-0" onerror="this.style.display='none'">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-1.5 py-0.5 text-white" style="background-color:#004dff;">${escRadio(st.code)}</span>
              <p class="text-sm font-bold text-black truncate">${escRadio(st.name)}</p>
            </div>
            <p class="text-xs text-gray-500 mt-1 truncate">${escRadio(st.zone)}</p>
          </div>
        </div>
        <button type="button" class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white flex-shrink-0" style="background-color:#5a189a;">
          Écouter
        </button>
      `;
      row.addEventListener("click", () => {
        updateSelectedBox(st);
        drawList();
      });
      row.querySelector("button").addEventListener("click", e => {
        e.stopPropagation();
        updateSelectedBox(st);
        playStation(st);
        drawList();
      });
      listEl.appendChild(row);
    });
  }

  document.querySelectorAll(".radio-map-node").forEach(node => {
    node.addEventListener("click", () => {
      const pole = node.dataset.pole || node.dataset.zone;
      currentPole = currentPole === pole ? "ALL" : pole;
      document.querySelectorAll(".radio-map-node").forEach(n => n.classList.toggle("is-selected", (n.dataset.pole || n.dataset.zone) === currentPole));
      drawList();
    });
  });

  if (searchEl) {
    searchEl.addEventListener("input", e => {
      currentQuery = String(e.target.value || "").trim().toLowerCase();
      drawList();
    });
  }

  updateSelectedBox(selectedStation);
  drawList();
}

function renderRadioShows(shows) {
  const grid = document.getElementById("radio-shows-grid");
  if (!grid) return;

  if (!shows.length) {
    grid.innerHTML = `<div class="col-span-full p-8 border border-gray-200 bg-gray-50 text-xs font-mono text-gray-500">Aucun contenu audio répertorié pour le moment.</div>`;
    return;
  }

  grid.innerHTML = shows.map(s => `
    <article class="radio-card p-6 flex flex-col justify-between gap-4">
      <div class="space-y-2">
        <span class="text-[11px] font-mono uppercase font-bold" style="color:#5a189a;">${escRadio(s.production || "Podcast / Replay")}</span>
        <h2 class="text-lg font-bold text-black">${escRadio(s.nom)}</h2>
        <p class="text-xs text-gray-600 line-clamp-3">${escRadio(s.description || "")}</p>
      </div>
      <a href="https://furnalitynetwork.github.io/Zapping/watch.html?id=${encodeURIComponent(s.id)}" class="show-action-btn inline-block text-center">
        Écouter sur Zapping
      </a>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", async () => {
  initDockToggle();
  const { mainStation, stations, shows } = await fetchRadioData();

  const playBtn = document.getElementById("hero-play-live");
  const cardPlayBtn = document.getElementById("card-play-main");
  if (playBtn) playBtn.addEventListener("click", () => playStation(mainStation));
  if (cardPlayBtn) cardPlayBtn.addEventListener("click", () => playStation(mainStation));

  renderHomePreview(mainStation, stations);
  renderAntennesPage(stations);
  renderRadioShows(shows);

  if (typeof lucide !== "undefined") lucide.createIcons();
});