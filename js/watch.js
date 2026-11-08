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

/* ---------- Utilitaires ---------- */

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

// Une série = même chaîne (diffusion_id) + même titre de série (nom).
// Ça empêche de mélanger une émission TV et une émission radio.
function seriesKey(show) {
  return `${String(show.diffusion_id).trim()}|${String(show.nom || "").trim().toLowerCase()}`;
}

function isPodcastShow(show, broadcaster) {
  return (broadcaster && broadcaster.role === "RDO") ||
    (isFilled(show.podcast_url) && !isFilled(show.video_url));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Titre de l'épisode : episode_name si renseigné, sinon "Épisode N", sinon le titre de la série
function episodeTitle(show) {
  if (isFilled(show.episode_name)) return String(show.episode_name).trim();
  if (isFilled(show.episode)) return `Épisode ${show.episode}`;
  return show.nom;
}

function episodeLabel(show) {
  const season = isFilled(show.saison) ? `S${pad2(show.saison)}` : null;
  const ep = isFilled(show.episode) ? `Épisode ${pad2(show.episode)}` : null;
  return [season, ep].filter(Boolean).join(" · ") || "Épisode";
}

/* ---------- Initialisation ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initWatchPage();
});

async function initWatchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const showId = urlParams.get("id");

  if (!showId) {
    renderError("Aucun identifiant de programme n'a été spécifié.");
    return;
  }

  try {
    const workerUrl = typeof CLOUDFLARE_WORKER_URL !== 'undefined' ? CLOUDFLARE_WORKER_URL : DEFAULT_WORKER_URL;

    const [resDiff, resShows] = await Promise.all([
      fetch(`${workerUrl}/api/diffusions`),
      fetch(`${workerUrl}/api/shows`)
    ]);

    if (!resDiff.ok || !resShows.ok) {
      throw new Error("Erreur de communication avec le serveur.");
    }

    const diffusions = await resDiff.json();
    const shows = await resShows.json();

    const currentShow = shows.find(s => String(s.id) === String(showId));

    if (!currentShow) {
      renderError("Le programme demandé est introuvable ou n'est plus disponible.");
      return;
    }

    const broadcaster = findBroadcaster(diffusions, currentShow);
    if (!broadcaster) {
      console.warn("Chaîne introuvable pour diffusion_id =", currentShow.diffusion_id);
    }
    const podcast = isPodcastShow(currentShow, broadcaster);

    // Couleur de la chaîne : utilisée par la barre des cartes et les badges
    const channelColor = getChannelColor(broadcaster ? broadcaster.nom : "");
    const main = document.getElementById("watch-main");
    if (main) main.style.setProperty("--channel-color", channelColor);

    renderMetadata(currentShow, broadcaster, channelColor);

    if (podcast) {
      renderAudioPlayer(currentShow);
    } else {
      renderVideoPlayer(currentShow);
    }

    renderEpisodes(currentShow, shows, podcast);
    renderChannelShows(currentShow, shows, broadcaster);

    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (err) {
    console.error("Erreur d'initialisation de la page watch:", err);
    renderError("Une erreur est survenue lors du chargement de la ressource.");
  }
}

/* ---------- En-tête + panneau de l'épisode ---------- */

function renderMetadata(show, broadcaster, channelColor) {
  const pill = document.getElementById("hero-pill");
  const mediaTitle = document.getElementById("media-title");
  const mediaDesc = document.getElementById("media-description");
  const episodeTitleEl = document.getElementById("episode-title");
  const badgeSeasonEpisode = document.getElementById("badge-season-episode");
  const badgeProduction = document.getElementById("badge-production");
  const logoImg = document.getElementById("broadcaster-logo");
  const badgeBroadcaster = document.getElementById("badge-broadcaster");

  // En-tête simple : pastille de la chaîne, titre de la série, description
  if (pill) {
    pill.textContent = broadcaster ? broadcaster.nom : "Zapping";
    pill.style.backgroundColor = channelColor;
    pill.style.color = "#fff";
  }

  if (mediaTitle) {
    mediaTitle.textContent = show.nom;
    document.title = `${show.nom} — Zapping by Furnality`;
  }

  if (mediaDesc) {
    mediaDesc.textContent = isFilled(show.description) ? show.description : "";
  }

  // Panneau "En cours de lecture"
  if (episodeTitleEl) {
    episodeTitleEl.textContent = episodeTitle(show);
  }

  if (badgeSeasonEpisode) {
    if (isFilled(show.saison) || isFilled(show.episode)) {
      badgeSeasonEpisode.textContent = episodeLabel(show);
      badgeSeasonEpisode.classList.remove("hidden");
    }
  }

  if (badgeProduction && isFilled(show.production)) {
    badgeProduction.textContent = show.production;
    badgeProduction.classList.remove("hidden");
  }

  // Logo de la chaîne, avec badge texte de secours
  if (broadcaster && isFilled(broadcaster.logo)) {
    if (logoImg) {
      logoImg.src = broadcaster.logo;
      logoImg.alt = broadcaster.nom;
      logoImg.classList.remove("hidden");
    }
  } else if (broadcaster && badgeBroadcaster) {
    badgeBroadcaster.textContent = broadcaster.nom;
    badgeBroadcaster.classList.remove("hidden");
  }
}

/* ---------- Lecteurs ---------- */

function renderVideoPlayer(show) {
  const wrapper = document.getElementById("player-wrapper");
  if (!wrapper) return;

  let embedUrl = show.video_url;

  if (isFilled(embedUrl)) {
    if (embedUrl.toLowerCase().endsWith(".mp4")) {
      wrapper.innerHTML = `
        <div class="relative w-full bg-black border border-gray-200">
          <video controls controlsList="nodownload" class="w-full aspect-video bg-black" poster="${isFilled(show.image) ? esc(show.image) : ''}">
            <source src="${esc(embedUrl)}" type="video/mp4">
            Votre navigateur ne supporte pas la lecture de cette vidéo.
          </video>
        </div>
      `;
    } else {
      if (embedUrl.includes("youtube.com/watch?v=")) {
        const videoId = embedUrl.split("v=")[1].split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      } else if (embedUrl.includes("youtu.be/")) {
        const videoId = embedUrl.split("youtu.be/")[1].split("?")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      }

      wrapper.innerHTML = `
        <div class="relative w-full aspect-video overflow-hidden bg-black border border-gray-200">
          <iframe src="${esc(embedUrl)}" title="${esc(show.nom)}" class="absolute inset-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    }
  } else {
    wrapper.innerHTML = `
      <div class="aspect-video w-full bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-3 text-center p-8">
        <i data-lucide="video-off" class="w-10 h-10 text-gray-400"></i>
        <p class="text-sm text-gray-500 font-mono">Le flux vidéo pour cette émission n'est pas accessible directement.</p>
      </div>
    `;
  }
}

function renderAudioPlayer(show) {
  const wrapper = document.getElementById("player-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="show-card bg-white p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
      <div class="w-40 h-40 md:w-48 md:h-48 flex-shrink-0 bg-gray-50 border border-gray-200 overflow-hidden">
        ${isFilled(show.image)
          ? `<img src="${esc(show.image)}" alt="${esc(show.nom)}" class="w-full h-full object-cover" />`
          : `<div class="w-full h-full flex items-center justify-center text-gray-400"><i data-lucide="radio" class="w-12 h-12"></i></div>`
        }
      </div>

      <div class="flex-grow w-full space-y-3 text-center md:text-left">
        <span class="show-category">Podcast / Flux radio</span>
        <h2 class="text-xl md:text-2xl font-bold text-black leading-snug">${esc(episodeTitle(show))}</h2>

        ${isFilled(show.podcast_url) ? `
          <audio controls class="w-full">
            <source src="${esc(show.podcast_url)}" type="audio/mpeg">
            Votre navigateur ne prend pas en charge le lecteur audio.
          </audio>
        ` : `
          <p class="text-xs font-mono text-gray-500">Le fichier audio pour ce podcast n'est pas disponible en lecture directe.</p>
        `}
      </div>
    </div>
  `;
}

/* ---------- Épisodes de la série (avec onglets de saison) ---------- */

function renderEpisodes(currentShow, allShows, isPodcast) {
  const grid = document.getElementById("episodes-grid");
  const title = document.getElementById("episodes-title");
  const eyebrow = document.getElementById("episodes-eyebrow");
  const tabs = document.getElementById("season-tabs");
  if (!grid) return;

  const key = seriesKey(currentShow);
  const episodes = allShows
    .filter(s => seriesKey(s) === key)
    .sort((a, b) => {
      const sa = Number(a.saison) || 1, sb = Number(b.saison) || 1;
      if (sa !== sb) return sa - sb;
      return (Number(a.episode) || 0) - (Number(b.episode) || 0);
    });

  const seasons = [...new Set(episodes.map(e => Number(e.saison) || 1))].sort((a, b) => a - b);
  const currentSeason = Number(currentShow.saison) || 1;

  if (title) title.textContent = isPodcast ? "Épisodes du podcast" : "Épisodes";
  if (eyebrow) eyebrow.textContent = `Guide des émissions · ${episodes.length} épisode(s)`;

  function drawSeason(season) {
    grid.innerHTML = "";
    episodes
      .filter(e => (Number(e.saison) || 1) === season)
      .forEach(e => grid.appendChild(createEpisodeCard(e, String(e.id) === String(currentShow.id), isPodcast)));

    if (tabs) {
      tabs.querySelectorAll("button").forEach(btn => {
        const active = Number(btn.dataset.season) === season;
        btn.setAttribute("aria-selected", String(active));
        btn.className = `pb-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
          active ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"
        }`;
      });
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  if (tabs) {
    tabs.innerHTML = "";
    if (seasons.length > 1) {
      seasons.forEach(season => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "tab");
        btn.dataset.season = season;
        btn.textContent = `Saison ${season}`;
        btn.addEventListener("click", () => drawSeason(season));
        tabs.appendChild(btn);
      });
    } else {
      const label = document.createElement("span");
      label.className = "pb-4 text-xs font-bold uppercase tracking-wider text-black";
      label.textContent = `Saison ${seasons[0] || currentSeason}`;
      tabs.appendChild(label);
    }
  }

  drawSeason(currentSeason);
}

function createEpisodeCard(show, isActive, isPodcast) {
  const card = document.createElement("a");
  card.href = `watch.html?id=${encodeURIComponent(show.id)}`;
  card.className = "show-card";
  if (isActive) {
    card.style.borderColor = "#111";
    card.style.boxShadow = "inset 0 0 0 1px #111";
  }

  card.innerHTML = `
    <div class="show-body">
      <div class="show-header">
        <span class="show-category">${esc(episodeLabel(show))}</span>
        ${isActive ? `<span class="show-channel-badge">En cours</span>` : ''}
      </div>
      <h4 class="show-title flex items-start gap-2">
        <i data-lucide="${isPodcast ? 'mic' : 'play'}" class="w-4 h-4 mt-1 flex-shrink-0"></i>
        <span>${esc(episodeTitle(show))}</span>
      </h4>
    </div>
  `;

  return card;
}

/* ---------- Autres programmes de la même chaîne ---------- */

function renderChannelShows(currentShow, allShows, broadcaster) {
  const grid = document.getElementById("channel-shows-grid");
  const title = document.getElementById("channel-shows-title");
  if (!grid) return;

  grid.innerHTML = "";

  if (title && broadcaster) {
    title.textContent = `Autres programmes sur ${broadcaster.nom}`;
  }

  const currentKey = seriesKey(currentShow);
  const currentDiffusion = String(currentShow.diffusion_id).trim();

  // Une seule carte par série, uniquement sur la même chaîne, hors série en cours
  const uniqueMap = new Map();
  allShows
    .filter(s => String(s.diffusion_id).trim() === currentDiffusion)
    .forEach(show => {
      const key = seriesKey(show);
      if (key === currentKey) return;

      const existing = uniqueMap.get(key);
      if (!existing) {
        uniqueMap.set(key, show);
        return;
      }
      const existingEp = Number(existing.episode) || Infinity;
      const currentEp = Number(show.episode) || Infinity;
      if (currentEp < existingEp) uniqueMap.set(key, show);
    });

  const channelShows = Array.from(uniqueMap.values());

  if (channelShows.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-8 bg-gray-50 border border-gray-200 text-center text-xs font-mono text-gray-500">
        Aucun autre programme n'est répertorié pour cette chaîne actuellement.
      </div>
    `;
    return;
  }

  channelShows.forEach(show => {
    const podcast = isPodcastShow(show, broadcaster);
    const card = document.createElement("article");
    card.className = "show-card";

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

        <p class="show-desc line-clamp-3">${esc(show.description || '')}</p>

        <div class="show-actions">
          <a href="watch.html?id=${encodeURIComponent(show.id)}" class="show-action-btn">
            ${podcast ? 'Écouter' : 'Regarder'}
          </a>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

/* ---------- Erreur ---------- */

function renderError(message) {
  const wrapper = document.getElementById("player-wrapper");

  if (wrapper) {
    wrapper.innerHTML = `
      <div class="aspect-video w-full bg-gray-50 border border-gray-200 flex flex-col items-center justify-center gap-3 text-center p-8">
        <i data-lucide="alert-circle" class="w-10 h-10 text-[#c8102e]"></i>
        <p class="text-sm text-gray-600 font-mono">${esc(message)}</p>
        <a href="https://furnalitynetwork.github.io/Zapping" class="inline-block mt-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#c8102e] transition-colors">
          Retourner au catalogue Zapping
        </a>
      </div>
    `;
  }

  ["episode-panel", "episodes-section", "channel-shows-section"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  const title = document.getElementById("media-title");
  if (title) title.textContent = "Contenu indisponible";

  if (typeof lucide !== 'undefined') lucide.createIcons();
}
