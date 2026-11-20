const CHANNEL_COLOR_VARS = {
  "CenterofStream": "--cos-primary",
  "SoundofSkully": "--sos-primary",
  "Music Video Channel": "--sos-primary",
  "Direct 9": "--sos-primary",
  "Furnality News": "--sos-primary",
  "NEWS": "--sos-primary",
  "Furnality Radio": "--rdo-primary",
  "Streaming Game FR": "--sgfr-primary",
  "Stream Animation Zone": "--saz-primary",
  "Asta of Mitologi": "--aom-primary",
  "Toku Dungeon": "--td-primary",
  "CANAL 7": "--c7-primary",
  "CANAL 8": "--c8-primary",
  "One by Furnality": "--obf-primary"
};

const CHANNEL_COLOR_FALLBACKS = {
  "--cos-primary": "#0055FF",
  "--sos-primary": "#FF1D25",
  "--rdo-primary": "#5A189A",
  "--sgfr-primary": "#10D050",
  "--saz-primary": "#7F00FF",
  "--aom-primary": "#FBC531",
  "--td-primary": "#FF6600",
  "--c7-primary": "#FF007F",
  "--c8-primary": "#5856D6",
  "--obf-primary": "#944613"
};

const DEFAULT_WORKER_URL = "https://furnality-api.darkeoftime.workers.dev";
const HISTORY_STORAGE_KEY = "furnality_zapping_history_v1";

let allShowsData = [];
let allDiffusionsData = [];
let activeFormatFilter = "ALL";
let activeChannelFilter = "ALL";
let activeSearchQuery = "";

function getChannelColor(name) {
  if (!name) return "#000000";
  const lower = String(name).trim().toLowerCase();
  const key = Object.keys(CHANNEL_COLOR_VARS).find(k => lower.startsWith(k.toLowerCase()));
  if (!key) return "#000000";
  const varName = CHANNEL_COLOR_VARS[key];
  const fromCss = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return fromCss || CHANNEL_COLOR_FALLBACKS[varName] || "#000000";
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isFilled(value) {
  return value !== null && value !== undefined &&
    String(value).trim() !== "" && String(value).trim().toUpperCase() !== "NULL";
}

function findBroadcaster(diffusions, show) {
  const wanted = String(show.diffusion_id).trim();
  return diffusions.find(d => String(d.id).trim() === wanted);
}

function seriesKey(show) {
  return `${String(show.diffusion_id).trim()}|${String(show.nom || "").trim().toLowerCase()}`;
}

function isPodcastShow(show, broadcaster) {
  const hasAudio = isFilled(show.podcast_url);
  const hasVideo = isFilled(show.video_url);
  if (hasAudio && !hasVideo) return true;
  if (hasVideo && !hasAudio) return false;
  return !!(broadcaster && broadcaster.role === "RDO");
}

function numOr(value, fallback) {
  return isFilled(value) && !isNaN(Number(value)) ? Number(value) : fallback;
}

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {}
  renderContinueWatching(allShowsData, allDiffusionsData);
}

async function loadZappingData() {
  try {
    const workerUrl = typeof CLOUDFLARE_WORKER_URL !== "undefined" ? CLOUDFLARE_WORKER_URL : DEFAULT_WORKER_URL;

    const [resDiff, resShows] = await Promise.all([
      fetch(`${workerUrl}/api/diffusions`),
      fetch(`${workerUrl}/api/shows`)
    ]);

    if (resDiff.ok) {
      allDiffusionsData = await resDiff.json();
      renderChannels(allDiffusionsData);
      populateChannelFilter(allDiffusionsData);
    }

    if (resShows.ok) {
      allShowsData = await resShows.json();
      initFilterControls();
      renderContinueWatching(allShowsData, allDiffusionsData);
      renderShows(allShowsData, allDiffusionsData);
      renderFeaturedShows(allShowsData, allDiffusionsData);
      if (typeof lucide !== "undefined") lucide.createIcons();
    }
  } catch (err) {
    console.error("Erreur de chargement Zapping:", err);
  }
}

// Section EN DIRECT conservée à l'identique
function renderChannels(items) {
  const tvGrid = document.getElementById("tv-channels-grid");
  const radioGrid = document.getElementById("radio-channels-grid");
  if (!tvGrid || !radioGrid) return;

  tvGrid.innerHTML = "";
  radioGrid.innerHTML = "";

  items.forEach(item => {
    const status = String(item.status || "").trim().toUpperCase();

    if (status === "ARCHIVE" || status === "ARCHIVED" || status === "BONUS") return;

    const isActive = status === "TRUE";
    const colorVar = CHANNEL_COLOR_VARS[item.nom];
    const hasLink = isActive && isFilled(item.stream_url);

    const card = document.createElement(hasLink ? "a" : "div");
    if (hasLink) {
      card.href = item.stream_url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }

    card.className = `channel-card relative flex flex-col items-center justify-center p-6 bg-white border border-gray-200 transition-all duration-200 ${
      hasLink ? "hover:shadow-md cursor-pointer hover:-translate-y-0.5" : "opacity-50 grayscale cursor-not-allowed"
    }`;

    if (colorVar) {
      card.style.setProperty("--channel-color", `var(${colorVar})`);
    }

    card.innerHTML = `
      <div class="h-12 w-full flex items-center justify-center mb-3">
        <img
          src="${esc(item.logo)}"
          alt="${esc(item.nom)}"
          class="max-h-full max-w-full object-contain"
          onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'text-xs font-bold text-gray-400\\'>${esc(item.nom)}</span>';"
        />
      </div>
    `;

    if (item.role === "TV") {
      tvGrid.appendChild(card);
    } else if (item.role === "RDO") {
      radioGrid.appendChild(card);
    }
  });
}

function populateChannelFilter(diffusions) {
  const select = document.getElementById("shows-channel-filter");
  if (!select) return;

  const seen = new Set();
  diffusions.forEach(d => {
    const id = String(d.id).trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = d.nom;
    select.appendChild(opt);
  });
}

function initFilterControls() {
  const searchInput = document.getElementById("shows-search");
  const channelSelect = document.getElementById("shows-channel-filter");
  const formatBtns = document.querySelectorAll(".format-filter-btn");
  const clearBtn = document.getElementById("clear-history-btn");

  if (searchInput) {
    searchInput.addEventListener("input", e => {
      activeSearchQuery = String(e.target.value || "").trim().toLowerCase();
      renderShows(allShowsData, allDiffusionsData);
    });
  }

  if (channelSelect) {
    channelSelect.addEventListener("change", e => {
      activeChannelFilter = e.target.value;
      renderShows(allShowsData, allDiffusionsData);
    });
  }

  formatBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      activeFormatFilter = btn.dataset.format || "ALL";
      formatBtns.forEach(b => {
        const isSelected = b.dataset.format === activeFormatFilter;
        b.className = `format-filter-btn flex-1 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
          isSelected ? "bg-black text-white" : "text-gray-600 hover:text-black"
        }`;
      });
      renderShows(allShowsData, allDiffusionsData);
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", clearHistory);
  }
}

function renderContinueWatching(shows, diffusions) {
  const section = document.getElementById("continue-watching");
  const grid = document.getElementById("continue-grid");
  if (!section || !grid) return;

  const historyIds = readHistory();
  if (!historyIds.length) {
    section.classList.add("hidden");
    return;
  }

  const items = historyIds
    .map(id => shows.find(s => String(s.id) === String(id)))
    .filter(Boolean)
    .slice(0, 3);

  if (!items.length) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");
  grid.innerHTML = "";

  items.forEach(show => {
    const broadcaster = findBroadcaster(diffusions, show);
    const colorValue = getChannelColor(broadcaster ? broadcaster.nom : "");
    const podcast = isPodcastShow(show, broadcaster);

    const card = document.createElement("article");
    card.className = "show-card";
    card.style.setProperty("--channel-color", colorValue);

    const epTag = isFilled(show.episode_name)
      ? show.episode_name
      : (isFilled(show.episode) ? `Épisode ${show.episode}` : show.nom);

    card.innerHTML = `
      ${isFilled(show.image) ? `
        <div class="show-image-container">
          <img src="${esc(show.image)}" alt="${esc(show.nom)}" class="show-image" loading="lazy" />
        </div>
      ` : ""}
      <div class="show-body">
        <div class="show-header">
          <span class="show-category">${esc(epTag)}</span>
          ${broadcaster ? `<span class="show-channel-badge">${esc(broadcaster.nom)}</span>` : ""}
        </div>
        <h4 class="show-title">${esc(show.nom)}</h4>
        <div class="show-actions">
          <a href="watch.html?id=${encodeURIComponent(show.id)}" class="show-action-btn">
            Reprendre (${podcast ? "Écouter" : "Regarder"})
          </a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderShows(shows, diffusions) {
  const showsGrid = document.getElementById("shows-grid");
  const countEl = document.getElementById("shows-count");
  if (!showsGrid) return;
  showsGrid.innerHTML = "";

  // Comptage des épisodes et saisons par série
  const seriesStatsMap = new Map();
  shows.forEach(show => {
    const key = seriesKey(show);
    const stat = seriesStatsMap.get(key) || { count: 0, seasons: new Set() };
    stat.count += 1;
    if (isFilled(show.saison)) stat.seasons.add(String(show.saison).trim());
    seriesStatsMap.set(key, stat);
  });

  // Regroupement : une carte par série (épisode le plus bas en représentant)
  const uniqueShowsMap = new Map();
  shows.forEach(show => {
    const key = seriesKey(show);
    const existing = uniqueShowsMap.get(key);
    if (!existing) {
      uniqueShowsMap.set(key, show);
      return;
    }
    const existingEp = numOr(existing.episode, Infinity);
    const currentEp = numOr(show.episode, Infinity);
    if (currentEp < existingEp) {
      uniqueShowsMap.set(key, show);
    }
  });

  let list = Array.from(uniqueShowsMap.values());

  if (activeChannelFilter !== "ALL") {
    list = list.filter(s => String(s.diffusion_id).trim() === String(activeChannelFilter).trim());
  }

  if (activeFormatFilter !== "ALL") {
    list = list.filter(s => {
      const broadcaster = findBroadcaster(diffusions, s);
      const pod = isPodcastShow(s, broadcaster);
      return activeFormatFilter === "PODCAST" ? pod : !pod;
    });
  }

  if (activeSearchQuery) {
    list = list.filter(s => {
      const haystack = `${s.nom || ""} ${s.description || ""} ${s.production || ""}`.toLowerCase();
      return haystack.includes(activeSearchQuery);
    });
  }

  if (countEl) {
    countEl.textContent = `${list.length} programme${list.length > 1 ? "s" : ""}`;
  }

  if (!list.length) {
    showsGrid.innerHTML = `
      <div class="col-span-full p-8 bg-white border border-gray-200 text-center text-xs font-mono text-gray-500">
        Aucun programme ne correspond aux filtres sélectionnés.
      </div>
    `;
    return;
  }

  list.forEach(show => {
    const broadcaster = findBroadcaster(diffusions, show);
    const colorValue = getChannelColor(broadcaster ? broadcaster.nom : "");
    const podcast = isPodcastShow(show, broadcaster);
    const stat = seriesStatsMap.get(seriesKey(show));
    const epCountLabel = stat && stat.count > 1 ? `${stat.count} épisodes` : "";

    const card = document.createElement("article");
    card.className = "show-card";
    card.style.setProperty("--channel-color", colorValue);

    card.innerHTML = `
      ${isFilled(show.image) ? `
        <div class="show-image-container">
          <img src="${esc(show.image)}" alt="${esc(show.nom)}" class="show-image" loading="lazy" />
        </div>
      ` : ""}

      <div class="show-body">
        <div class="show-header">
          <span class="show-category">${esc(isFilled(show.production) ? show.production : "Programme")}${epCountLabel ? ` · ${esc(epCountLabel)}` : ""}</span>
          ${broadcaster ? `<span class="show-channel-badge">${esc(broadcaster.nom)}</span>` : ""}
        </div>

        <h4 class="show-title">${esc(show.nom)}</h4>

        <p class="show-desc line-clamp-3">${esc(show.description || "Aucune description disponible.")}</p>

        <div class="show-actions">
          <a href="watch.html?id=${encodeURIComponent(show.id)}" class="show-action-btn">
            ${podcast ? "Écouter" : "Regarder"}
          </a>
        </div>
      </div>
    `;

    showsGrid.appendChild(card);
  });
}

function renderFeaturedShows(shows, diffusions) {
  const slider = document.getElementById("featured-slider");
  const controls = document.getElementById("featured-controls");
  const dotsWrap = document.getElementById("featured-dots");
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");
  if (!slider) return;

  const featured = shows.filter(s => String(s.is_featured).toUpperCase() === "TRUE");
  slider.innerHTML = "";
  if (dotsWrap) dotsWrap.innerHTML = "";

  if (featured.length === 0) {
    slider.style.display = "none";
    if (controls) controls.classList.add("hidden");
    return;
  }
  slider.style.display = "flex";

  featured.forEach((show, idx) => {
    const broadcaster = findBroadcaster(diffusions, show);
    const podcast = isPodcastShow(show, broadcaster);

    const slide = document.createElement("div");
    slide.className = "featured-slide";
    slide.innerHTML = `
      ${isFilled(show.image) ? `<img src="${esc(show.image)}" alt="${esc(show.nom)}" class="featured-slide-bg" />` : ""}
      <div class="featured-slide-content">
        ${broadcaster && isFilled(broadcaster.logo) ? `
          <div class="mb-3">
            <span class="inline-flex items-center bg-white px-3 py-2">
              <img src="${esc(broadcaster.logo)}" alt="${esc(broadcaster.nom)}" class="h-6 w-auto object-contain" />
            </span>
          </div>
        ` : ""}
        <h2 class="text-2xl md:text-4xl font-bold text-white mb-2">${esc(show.nom)}</h2>
        <p class="text-gray-200 max-w-lg mb-4 text-sm md:text-base">${esc(show.description || "")}</p>
        <a href="watch.html?id=${encodeURIComponent(show.id)}" class="inline-block px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-[#c8102e] hover:text-white transition-colors">${podcast ? "Écouter" : "Regarder"}</a>
      </div>
    `;
    slider.appendChild(slide);

    if (dotsWrap && featured.length > 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.ariaLabel = `Slide ${idx + 1}`;
      dot.className = `h-2 transition-all ${idx === 0 ? "w-6 bg-black" : "w-2 bg-gray-300"}`;
      dot.addEventListener("click", () => {
        const gap = parseFloat(getComputedStyle(slider).columnGap) || 24;
        const stepW = slider.children[0].getBoundingClientRect().width + gap;
        slider.scrollTo({ left: idx * stepW, behavior: "smooth" });
      });
      dotsWrap.appendChild(dot);
    }
  });

  if (controls) {
    controls.classList.toggle("hidden", featured.length < 2);
  }

  const goStep = dir => {
    if (slider.children.length < 2) return;
    const gap = parseFloat(getComputedStyle(slider).columnGap) || 24;
    const amount = slider.children[0].getBoundingClientRect().width + gap;
    const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4;
    const atStart = slider.scrollLeft <= 4;
    if (dir > 0) {
      slider.scrollTo({ left: atEnd ? 0 : slider.scrollLeft + amount, behavior: "smooth" });
    } else {
      slider.scrollTo({ left: atStart ? slider.scrollWidth : slider.scrollLeft - amount, behavior: "smooth" });
    }
  };

  if (prevBtn) prevBtn.onclick = () => goStep(-1);
  if (nextBtn) nextBtn.onclick = () => goStep(1);

  if (dotsWrap && featured.length > 1) {
    slider.addEventListener("scroll", () => {
      const gap = parseFloat(getComputedStyle(slider).columnGap) || 24;
      const stepW = slider.children[0].getBoundingClientRect().width + gap;
      const activeIdx = Math.min(featured.length - 1, Math.max(0, Math.round(slider.scrollLeft / stepW)));
      Array.from(dotsWrap.children).forEach((d, i) => {
        d.className = `h-2 transition-all ${i === activeIdx ? "w-6 bg-black" : "w-2 bg-gray-300"}`;
      });
    }, { passive: true });
  }

  startSliderAutoplay(slider);
}

function startSliderAutoplay(slider, delay = 5000) {
  clearInterval(slider._autoplay);
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (slider.children.length < 2) return;

  const step = () => {
    if (slider.scrollWidth <= slider.clientWidth + 4) return;
    const gap = parseFloat(getComputedStyle(slider).columnGap) || 24;
    const amount = slider.children[0].getBoundingClientRect().width + gap;
    const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 4;
    slider.scrollTo({ left: atEnd ? 0 : slider.scrollLeft + amount, behavior: "smooth" });
  };

  const start = () => { clearInterval(slider._autoplay); slider._autoplay = setInterval(step, delay); };
  const stop = () => clearInterval(slider._autoplay);

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  slider.addEventListener("touchstart", stop, { passive: true });
  slider.addEventListener("touchend", () => setTimeout(start, delay), { passive: true });
  start();
}

document.addEventListener("DOMContentLoaded", () => {
  loadZappingData();
});
