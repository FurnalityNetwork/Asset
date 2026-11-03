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
    const workerUrl = typeof CLOUDFLARE_WORKER_URL !== 'undefined' ? CLOUDFLARE_WORKER_URL : 'https://furnality-api.darkeoftime.workers.dev';

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

    const broadcaster = diffusions.find(d => d.id === currentShow.diffusion_id);

    const isPodcast = (broadcaster && broadcaster.role === "RDO") || (currentShow.podcast_url && currentShow.podcast_url !== "NULL" && (!currentShow.video_url || currentShow.video_url === "NULL"));

    renderMetadata(currentShow, broadcaster);
    
    if (isPodcast) {
      renderAudioPlayer(currentShow);
    } else {
      renderVideoPlayer(currentShow);
    }

    renderEpisodes(currentShow, shows, isPodcast);
    renderChannelShows(currentShow, shows, broadcaster);

  } catch (err) {
    console.error("Erreur d'initialisation de la page watch:", err);
    renderError("Une erreur est survenue lors du chargement de la ressource.");
  }
}

function renderMetadata(show, broadcaster) {
  const logoImg = document.getElementById("broadcaster-logo");
  const badgeBroadcaster = document.getElementById("badge-broadcaster");
  const badgeCategory = document.getElementById("badge-category");
  const mediaTitle = document.getElementById("media-title");
  const mediaDesc = document.getElementById("media-description");

  // Gestion dynamique du logo de la chaîne / station
  if (broadcaster && broadcaster.logo && broadcaster.logo !== "NULL") {
    if (logoImg) {
      logoImg.src = broadcaster.logo;
      logoImg.alt = broadcaster.nom;
      logoImg.classList.remove("hidden");
    }
    if (badgeBroadcaster) {
      badgeBroadcaster.classList.add("hidden");
    }
  } else {
    if (logoImg) {
      logoImg.classList.add("hidden");
    }
    if (badgeBroadcaster) {
      badgeBroadcaster.textContent = broadcaster ? broadcaster.nom : "Réseau Furnality";
      badgeBroadcaster.classList.remove("hidden");
    }
  }

  if (badgeCategory) {
    badgeCategory.textContent = show.production || "Programme";
  }
  if (mediaTitle) {
    mediaTitle.textContent = show.nom;
    document.title = `${show.nom} — Zapping by Furnality`;
  }
  if (mediaDesc) {
    mediaDesc.textContent = show.description || "Aucune description fournie pour ce contenu.";
  }
}

function renderVideoPlayer(show) {
  const wrapper = document.getElementById("player-wrapper");
  if (!wrapper) return;

  let embedUrl = show.video_url;

  if (embedUrl && embedUrl !== "NULL") {
    // Lecteur natif HTML5 pour les fichiers MP4 directs (Cloudflare R2 ou Archive.org)
    if (embedUrl.toLowerCase().endsWith(".mp4")) {
      wrapper.innerHTML = `
        <div class="relative w-full flex justify-center bg-black">
          <video 
            controls 
            controlsList="nodownload"
            class="w-full max-h-[70vh] border border-gray-800"
            poster="${show.image && show.image !== 'NULL' ? show.image : ''}">
            <source src="${embedUrl}" type="video/mp4">
            Votre navigateur ne supporte pas la lecture de cette vidéo.
          </video>
        </div>
      `;
    } 
    // Lecteur Iframe pour YouTube ou liens externes
    else {
      if (embedUrl.includes("youtube.com/watch?v=")) {
        const videoId = embedUrl.split("v=")[1].split("&")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      } else if (embedUrl.includes("youtu.be/")) {
        const videoId = embedUrl.split("youtu.be/")[1].split("?")[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      }

      wrapper.innerHTML = `
        <div class="relative w-full h-0 pb-[56.25%] overflow-hidden bg-black border border-gray-800">
          <iframe 
            src="${embedUrl}" 
            title="${show.nom}"
            class="absolute top-0 left-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `;
    }
  } else {
    wrapper.innerHTML = `
      <div class="p-12 text-center space-y-3">
        <i data-lucide="video-off" class="w-10 h-10 text-gray-600 mx-auto"></i>
        <p class="text-sm text-gray-400 font-mono">Le flux vidéo pour cette émission n'est pas accessible directement.</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function renderAudioPlayer(show) {
  const wrapper = document.getElementById("player-wrapper");
  if (!wrapper) return;

  wrapper.innerHTML = `
    <div class="w-full max-w-4xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 bg-gray-900 border border-gray-800 my-6">
      <div class="w-40 h-40 md:w-52 md:h-52 flex-shrink-0 bg-black border border-gray-800 overflow-hidden relative">
        ${show.image && show.image !== 'NULL' 
          ? `<img src="${show.image}" alt="${show.nom}" class="w-full h-full object-cover" />`
          : `<div class="w-full h-full flex items-center justify-center text-gray-600"><i data-lucide="radio" class="w-12 h-12"></i></div>`
        }
      </div>
      
      <div class="flex-grow w-full space-y-4 text-center md:text-left">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 bg-[#c8102e] text-white text-[10px] font-extrabold uppercase tracking-widest">
          Podcast / Flux Radio
        </div>
        <h2 class="text-xl md:text-2xl font-bold text-white">${show.nom}</h2>
        
        ${show.podcast_url && show.podcast_url !== "NULL" ? `
          <div class="pt-2">
            <audio controls class="w-full border border-gray-700 bg-black">
              <source src="${show.podcast_url}" type="audio/mpeg">
              Votre navigateur ne prend pas en charge le lecteur audio.
            </audio>
          </div>
        ` : `
          <p class="text-xs font-mono text-gray-400">Le fichier audio pour ce podcast n'est pas disponible en lecture directe.</p>
        `}
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderEpisodes(currentShow, allShows, isPodcast) {
  const grid = document.getElementById("episodes-grid");
  const title = document.getElementById("episodes-title");
  const count = document.getElementById("episodes-count");
  if (!grid) return;

  grid.innerHTML = "";

  // Regroupe les épisodes partageant la même production / saison
  const relatedEpisodes = allShows.filter(s => 
    s.production === currentShow.production && String(s.id) !== String(currentShow.id)
  );

  if (title) {
    title.textContent = isPodcast ? "Épisodes du Podcast" : "Épisodes & Saisons";
  }

  if (count) {
    count.textContent = `${relatedEpisodes.length + 1} épisode(s)`;
  }

  const currentCard = createEpisodeCard(currentShow, true, isPodcast);
  grid.appendChild(currentCard);

  relatedEpisodes.forEach(episode => {
    const card = createEpisodeCard(episode, false, isPodcast);
    grid.appendChild(card);
  });
}

function createEpisodeCard(show, isActive, isPodcast) {
  const card = document.createElement("a");
  card.href = `watch.html?id=${show.id}`;
  card.className = `p-4 border transition-all duration-200 flex items-start gap-4 ${
    isActive 
      ? "bg-black text-white border-black" 
      : "bg-white text-gray-900 border-gray-200 hover:border-black"
  }`;

  card.innerHTML = `
    <div class="w-12 h-12 flex-shrink-0 bg-gray-100 flex items-center justify-center border border-gray-200 ${isActive ? 'bg-gray-900 text-white border-gray-800' : 'text-gray-600'}">
      <i data-lucide="${isPodcast ? 'mic' : 'play'}" class="w-5 h-5"></i>
    </div>
    <div class="flex-grow min-w-0">
      <p class="text-[10px] font-mono uppercase tracking-wider ${isActive ? 'text-gray-400' : 'text-gray-500'}">
        ${isActive ? 'En cours de lecture' : (show.production || 'Épisode')}
      </p>
      <h4 class="text-sm font-bold truncate mt-0.5">${show.nom}</h4>
    </div>
  `;

  return card;
}

function renderChannelShows(currentShow, allShows, broadcaster) {
  const grid = document.getElementById("channel-shows-grid");
  const title = document.getElementById("channel-shows-title");
  if (!grid) return;

  grid.innerHTML = "";

  if (title && broadcaster) {
    title.textContent = `Autres programmes sur ${broadcaster.nom}`;
  }

  const channelShows = allShows.filter(s => 
    s.diffusion_id === currentShow.diffusion_id && String(s.id) !== String(currentShow.id)
  );

  if (channelShows.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full p-8 bg-white border border-gray-200 text-center text-xs font-mono text-gray-500">
        Aucun autre programme n'est répertorié pour cette chaîne actuellement.
      </div>
    `;
    return;
  }

  channelShows.forEach(show => {
    const card = document.createElement("article");
    card.className = "show-card bg-white border border-gray-200 flex flex-col justify-between p-4 hover:border-black transition-colors";

    card.innerHTML = `
      <div>
        <span class="text-[10px] font-mono uppercase text-gray-400">${show.production || 'Programme'}</span>
        <h4 class="text-sm font-bold text-black mt-1 mb-2">${show.nom}</h4>
        <p class="text-xs text-gray-600 line-clamp-2">${show.description || ''}</p>
      </div>
      <a href="watch.html?id=${show.id}" class="mt-4 px-3 py-1.5 bg-black text-white text-[11px] font-mono uppercase tracking-wider text-center block hover:bg-[#c8102e] transition-colors">
        Découvrir
      </a>
    `;

    grid.appendChild(card);
  });

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderError(message) {
  const wrapper = document.getElementById("player-wrapper");
  const meta = document.getElementById("show-metadata");

  if (wrapper) {
    wrapper.innerHTML = `
      <div class="p-12 text-center space-y-3">
        <i data-lucide="alert-circle" class="w-10 h-10 text-red-500 mx-auto"></i>
        <p class="text-sm text-gray-300 font-mono">${message}</p>
        <a href="https://furnalitynetwork.github.io/Zapping" class="inline-block mt-4 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider">
          Retourner au catalogue Zapping
        </a>
      </div>
    `;
  }
  if (meta) meta.style.display = "none";
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
