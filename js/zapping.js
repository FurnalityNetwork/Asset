// Mapping des couleurs par chaîne
const CHANNEL_COLORS = {
  "CenterofStream": "#FF0000",
  "SoundofSkully": "#9B59B6",
  "Streaming Game FR": "#1ABC9C",
  "Stream Animation Zone": "#F39C12",
  "Asta of Mytolog": "#E74C3C",
  "Toku Dungeon": "#3498DB",
  "CANAL 7": "#34495E",
  "CANAL 8": "#2ECC71",
  "Direct 9": "#E67E22",
  "One by Furnality": "#0055FF",
  "Furnality Radio": "#8E44AD"
};

async function loadZappingData() {
  try {
    // 1. Charger les diffusions (TV & Radio)
    const resDiff = await fetch(`${WORKER_URL}/api/diffusions`);
    if (resDiff.ok) {
      const diffusions = await resDiff.json();
      renderChannels(diffusions);
    }

    // 2. Charger les émissions (Shows)
    const resShows = await fetch(`${WORKER_URL}/api/shows`);
    if (resShows.ok) {
      const shows = await resShows.json();
      renderShows(shows);
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
    const isOnline = String(item.status).toUpperCase() === "TRUE";
    const brandColor = CHANNEL_COLORS[item.nom] || "#000000";
    const hasLink = item.stream_url && item.stream_url !== "NULL";

    const card = document.createElement(hasLink ? "a" : "div");
    if (hasLink) {
      card.href = item.stream_url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";
    }

    card.className = `relative flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ${
      hasLink ? "hover:shadow-md cursor-pointer hover:-translate-y-0.5" : "opacity-60 cursor-not-allowed"
    }`;
    
    // Bordure colorée spécifique à la chaîne
    card.style.borderTop = `4px solid ${brandColor}`;

    card.innerHTML = `
      <!-- Pastille de Statut (En direct / Hors ligne) -->
      <span class="absolute top-2 right-2 flex h-2.5 w-2.5">
        <span class="${isOnline ? 'animate-ping opacity-75 bg-green-400' : 'bg-gray-300'} absolute inline-flex h-full w-full rounded-full"></span>
        <span class="${isOnline ? 'bg-green-500' : 'bg-gray-400'} relative inline-flex rounded-full h-2.5 w-2.5"></span>
      </span>

      <!-- Logo de la chaîne -->
      <div class="h-12 w-full flex items-center justify-center mb-3">
        <img 
          src="${item.logo}" 
          alt="${item.nom}" 
          class="max-h-full max-w-full object-contain"
          onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\'text-xs font-bold text-gray-400\'>${item.nom}</span>';"
        />
      </div>

      <span class="text-xs font-semibold text-gray-700 text-center">${item.nom}</span>
    `;

    if (item.role === "TV") {
      tvGrid.appendChild(card);
    } else if (item.role === "RDO") {
      radioGrid.appendChild(card);
    }
  });
}

function renderShows(shows) {
  const showsGrid = document.getElementById("shows-grid");
  if (!showsGrid) return;
  showsGrid.innerHTML = "";

  shows.forEach(show => {
    const card = document.createElement("div");
    card.className = "bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow";
    
    card.innerHTML = `
      ${show.image ? `<img src="${show.image}" alt="${show.nom}" class="w-full h-40 object-cover" />` : ''}
      <div class="p-5">
        <p class="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">${show.production || 'Émission'}</p>
        <h4 class="text-lg font-bold text-gray-900 mb-2">${show.nom}</h4>
        <p class="text-sm text-gray-600 line-clamp-2 mb-4">${show.description || ''}</p>
        <div class="flex gap-2">
          ${show.video_url ? `<a href="${show.video_url}" target="_blank" class="text-xs font-bold uppercase tracking-wider bg-black text-white px-3 py-2 rounded hover:bg-gray-800">Voir</a>` : ''}
          ${show.podcast_url ? `<a href="${show.podcast_url}" target="_blank" class="text-xs font-bold uppercase tracking-wider border border-gray-300 px-3 py-2 rounded hover:border-black">Écouter</a>` : ''}
        </div>
      </div>
    `;
    showsGrid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadZappingData);
