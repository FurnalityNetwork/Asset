const CHANNEL_COLOR_VARS = {
  "CenterofStream": "--cos-primary",
  "SoundofSkully": "--sos-primary",
  "Music Video Channel": "--sos-primary",
  "Direct 9": "--sos-primary",
  "Furnality News": "--sos-primary",
  "Furnality Radio": "--rdo-primary",
  "Streaming Game FR": "--sgfr-primary",
  "Stream Animation Zone": "--saz-primary",
  "Asta of Mitologi": "--aom-primary",
  "Toku Dungeon": "--td-primary",
  "CANAL 7": "--c7-primary",
  "CANAL 8": "--c8-primary",
  "One by Furnality": "--obf-primary"
};

// Valeurs de secours (charte graphique) si la variable CSS n'est pas définie
const CHANNEL_COLOR_FALLBACKS = {
  "--cos-primary": "#0055FF",
  "--sos-primary": "#FF1D25",
  "--rdo-primary": "#0055FF",
  "--sgfr-primary": "#10D050",
  "--saz-primary": "#7F00FF",
  "--aom-primary": "#FBC531",
  "--td-primary": "#FF6600",
  "--c7-primary": "#FF007F",
  "--c8-primary": "#5856D6",
  "--obf-primary": "#944613"
};

const DEFAULT_WORKER_URL = "https://furnality-api.darkeoftime.workers.dev";

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

// Comparaison d'id tolérante (nombre ou texte)
function findBroadcaster(diffusions, show) {
  const wanted = String(show.diffusion_id).trim();
  return diffusions.find(d => String(d.id).trim() === wanted);
}

// Une série = même chaîne (diffusion_id) + même titre de série (nom)
function seriesKey(show) {
  return `${String(show.diffusion_id).trim()}|${String(show.nom || "").trim().toLowerCase()}`;
}

function isPodcastShow(show, broadcaster) {
  return (broadcaster && broadcaster.role === "RDO") ||
    (isFilled(show.podcast_url) && !isFilled(show.video_url));
}

async function loadZappingData() {
  try {
    const workerUrl = typeof CLOUDFLARE_WORKER_URL !== 'undefined' ? CLOUDFLARE_WORKER_URL : DEFAULT_WORKER_URL;

    const [resDiff, resShows] = await Promise.all([
      fetch(`${workerUrl}/api/diffusions`),
      fetch(`${workerUrl}/api/shows`)
    ]);

    let diffusions = [];
    if (resDiff.ok) {
      diffusions = await resDiff.json();
      renderChannels(diffusions);
    }

    if (resShows.ok) {
      const shows = await resShows.json();
      renderShows(shows, diffusions);
      renderFeaturedShows(shows, diffusions);
    }
  } catch (err) {
    console.error("Erreur de chargement Zapping:", err);
  }
}

function renderChannels(items) {
  const tvGrid = document.getElementById("tv-channels-grid");
  const radioGrid = document.getElementById("radio-channels-grid");
  if (!tvGrid || !radioGrid) return;

  tvGrid.innerHTML = "";
  radioGrid.innerHTML = "";

  items.forEach(item => {
    const isActive = String(item.status).toUpperCase() === "TRUE";
    const colorVar = CHANNEL_COLOR_VARS[item.nom];
    const hasLink = isActive && item.stream_url && item.stream_url !== "NULL";

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
      card.style.setProperty('--channel-color', `var(${colorVar})`);
    }

    card.innerHTML = `
      <div class="h-12 w-full flex items-center justify-center mb-3">
        <img
          src="${item.logo}"
          alt="${item.nom}"
          class="max-h-full max-w-full object-contain"
          onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'text-xs font-bold text-gray-400\\'>${item.nom}</span>';"
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

function renderShows(shows, diffusions) {
  const showsGrid = document.getElementById("shows-grid");
  if (!showsGrid) return;
  showsGrid.innerHTML = "";

  // REGROUPEMENT : une seule carte par série / podcast (même chaîne + même titre de série)
  const uniqueShowsMap = new Map();
  shows.forEach(show => {
    const key = seriesKey(show);
    const existing = uniqueShowsMap.get(key);
    if (!existing) {
      uniqueShowsMap.set(key, show);
      return;
    }
    // Le représentant de la série est son épisode le plus bas
    const existingEp = Number(existing.episode) || Infinity;
    const currentEp = Number(show.episode) || Infinity;
    if (currentEp < existingEp) {
      uniqueShowsMap.set(key, show);
    }
  });

  Array.from(uniqueShowsMap.values()).forEach(show => {
    const broadcaster = findBroadcaster(diffusions, show);
    if (!broadcaster) {
      console.warn("Chaîne introuvable pour diffusion_id =", show.diffusion_id, "(show:", show.nom, ")");
    }
    const colorValue = getChannelColor(broadcaster ? broadcaster.nom : "");
    const podcast = isPodcastShow(show, broadcaster);

    const card = document.createElement("article");
    card.className = "show-card";
    card.style.setProperty('--channel-color', colorValue);

    card.innerHTML = `
      ${isFilled(show.image) ? `
        <div class="show-image-container">
          <img src="${esc(show.image)}" alt="${esc(show.nom)}" class="show-image" loading="lazy" />
        </div>
      ` : ''}

      <div class="show-body">
        <div class="show-header">
          <span class="show-category">${esc(isFilled(show.production) ? show.production : 'Programme')}</span>
          ${broadcaster ? `<span class="show-channel-badge">${esc(broadcaster.nom)}</span>` : ''}
        </div>

        <h4 class="show-title">${esc(show.nom)}</h4>

        <p class="show-desc line-clamp-3">${esc(show.description || 'Aucune description disponible.')}</p>

        <div class="show-actions">
          <a href="watch.html?id=${encodeURIComponent(show.id)}" class="show-action-btn">
            ${podcast ? 'Écouter' : 'Regarder'}
          </a>
        </div>
      </div>
    `;

    showsGrid.appendChild(card);
  });
}

function renderFeaturedShows(shows, diffusions) {
  const slider = document.getElementById("featured-slider");
  if (!slider) return;

  const featured = shows.filter(s => String(s.is_featured).toUpperCase() === "TRUE");
  slider.innerHTML = "";

  if (featured.length === 0) {
    slider.style.display = "none";
    return;
  }
  slider.style.display = "flex";

  featured.forEach(show => {
    const broadcaster = findBroadcaster(diffusions, show);
    const podcast = isPodcastShow(show, broadcaster);

    const slide = document.createElement("div");
    slide.className = "featured-slide";
    slide.innerHTML = `
      ${isFilled(show.image) ? `<img src="${esc(show.image)}" alt="${esc(show.nom)}" class="featured-slide-bg" />` : ''}
      <div class="featured-slide-content">
        ${broadcaster && isFilled(broadcaster.logo) ? `<img src="${esc(broadcaster.logo)}" alt="${esc(broadcaster.nom)}" class="h-6 w-auto object-contain mb-3" />` : ''}
        <h2 class="text-2xl md:text-4xl font-bold text-white mb-2">${esc(show.nom)}</h2>
        <p class="text-gray-200 max-w-lg mb-4 text-sm md:text-base">${esc(show.description || '')}</p>
        <a href="watch.html?id=${encodeURIComponent(show.id)}" class="primary-button bg-white text-black border-white hover:bg-gray-200 inline-block">${podcast ? 'Écouter' : 'Regarder'}</a>
      </div>
    `;
    slider.appendChild(slide);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadZappingData();
});
