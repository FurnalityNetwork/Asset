const CHANNEL_COLOR_VARS = {
  "CenterofStream": "--cos-primary",
  "SoundofSkully": "--sos-primary",
  "Music Video Channel": "--sos-primary",
  "Direct 9": "--sos-primary",
  "Furnality News": "--sos-primary",
  "Furnality Radio": "--cos-primary",
  "Streaming Game FR": "--sgfr-primary",
  "Stream Animation Zone": "--saz-primary",
  "Asta of Mitologi": "--aom-primary",
  "Toku Dungeon": "--td-primary",
  "CANAL 7": "--c7-primary",
  "CANAL 8": "--c8-primary",
  "One by Furnality": "--obf-primary"
};

async function loadZappingData() {
  try {
    const [resDiff, resShows] = await Promise.all([
      fetch(`${CLOUDFLARE_WORKER_URL}/api/diffusions`),
      fetch(`${CLOUDFLARE_WORKER_URL}/api/shows`)
    ]);

    let diffusions = [];
    if (resDiff.ok) {
      diffusions = await resDiff.json();
      renderChannels(diffusions);
    }

    if (resShows.ok) {
      const shows = await resShows.json();
      renderShows(shows, diffusions);
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

    card.className = `channel-card relative flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ${
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
      <span class="text-xs font-bold tracking-widest text-gray-400 uppercase">${broadcaster ? broadcaster.nom : 'Furnality'}</span>
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

  shows.forEach(show => {
    const broadcaster = diffusions.find(d => d.id === show.diffusion_id);

    const card = document.createElement("div");
    card.className = "show-card";

    card.innerHTML = `
      ${show.image ? `<img src="${show.image}" alt="${show.nom}" class="show-image" />` : ''}
      <div class="show-body">
        <div class="flex items-center gap-2 mb-3">
          ${broadcaster && broadcaster.logo ? `<img src="${broadcaster.logo}" alt="${broadcaster.nom}" class="h-5 w-auto object-contain" />` : ''}
        </div>
        <h4 class="text-lg font-bold text-gray-900 mb-1">${show.nom}</h4>
        <p class="text-xs text-gray-400 mb-3">${show.production || ''}</p>
        <p class="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">${show.description || ''}</p>
        <div class="flex gap-2 show-actions">
          ${show.video_url ? `<a href="${show.video_url}" target="_blank">Lire</a>` : ''}
          ${show.podcast_url ? `<a href="${show.podcast_url}" target="_blank">Écouter</a>` : ''}
        </div>
      </div>
    `;
    showsGrid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadZappingData);
