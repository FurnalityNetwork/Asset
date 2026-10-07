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
    // Récupération sécurisée de l'URL du Worker (depuis global.js ou valeur vide par défaut)
    const workerUrl = typeof CLOUDFLARE_WORKER_URL !== 'undefined' ? CLOUDFLARE_WORKER_URL : '';

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

  shows.forEach(show => {
    const broadcaster = diffusions.find(d => d.id === show.diffusion_id);
    
    const channelName = broadcaster ? broadcaster.nom : '';
    const colorVarName = CHANNEL_COLOR_VARS[channelName];
    const colorValue = colorVarName ? getComputedStyle(document.documentElement).getPropertyValue(colorVarName).trim() : '#000000';

    const card = document.createElement("article");
    card.className = "show-card";
    
    card.style.setProperty('--channel-color', colorValue);

    card.innerHTML = `
      ${show.image && show.image !== 'NULL' ? `
        <div class="show-image-container">
          <img src="${show.image}" alt="${show.nom}" class="show-image" loading="lazy" />
        </div>
      ` : ''}
      
      <div class="show-body">
        <div class="show-header">
          <span class="show-category">${show.production || 'Programme'}</span>
          ${broadcaster ? `<span class="show-channel-badge">${broadcaster.nom}</span>` : ''}
        </div>
        
        <h4 class="show-title">${show.nom}</h4>
        
        <p class="show-desc line-clamp-3">${show.description || 'Aucune description disponible.'}</p>
        
        <div class="show-actions">
          ${show.video_url && show.video_url !== 'NULL' ? `
            <a href="${show.video_url}" target="_blank" rel="noopener noreferrer" class="show-action-btn">
              Regarder
            </a>
          ` : ''}
          
          ${show.podcast_url && show.podcast_url !== 'NULL' ? `
            <a href="${show.podcast_url}" target="_blank" rel="noopener noreferrer" class="show-action-btn">
              Écouter
            </a>
          ` : ''}
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
    const broadcaster = diffusions.find(d => d.id === show.diffusion_id);

    const slide = document.createElement("div");
    slide.className = "featured-slide";
    slide.innerHTML = `
      ${show.image ? `<img src="${show.image}" alt="${show.nom}" class="featured-slide-bg" />` : ''}
      <div class="featured-slide-content">
        ${broadcaster && broadcaster.logo ? `<img src="${broadcaster.logo}" alt="${broadcaster.nom}" class="h-6 w-auto object-contain mb-3" />` : ''}
        <h2 class="text-2xl md:text-4xl font-bold text-white mb-2">${show.nom}</h2>
        <p class="text-gray-200 max-w-lg mb-4">${show.description || ''}</p>
        ${show.video_url && show.video_url !== 'NULL' ? `<a href="${show.video_url}" target="_blank" class="primary-button bg-white text-black border-white hover:bg-gray-200">Regarder</a>` : ''}
      </div>
    `;
    slider.appendChild(slide);
  });
}

document.addEventListener("DOMContentLoaded", loadZappingData);
