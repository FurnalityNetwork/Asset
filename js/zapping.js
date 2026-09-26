const channelClassMap = {
  'CenterofStream': 'ch-cos',
  'SoundofSkully': 'ch-sos',
  'Music Video Channel': 'ch-mvc',
  'Streaming Game FR': 'ch-sgfr',
  'Stream Animation Zone': 'ch-saz',
  'Asta of Mitologi': 'ch-aom',
  'Toku Dungeon': 'ch-td',
  'CANAL 7': 'ch-c7',
  'CANAL 8': 'ch-c8',
  'Direct 9': 'ch-d9',
  'One by Furnality': 'ch-obf',
  'Furnality News': 'ch-news',
  'Furnality Radio': 'ch-radio'
};

document.addEventListener('DOMContentLoaded', () => {
  loadDiffusions();
  loadShows();
});

async function loadDiffusions() {
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/diffusions`);
    if (!res.ok) throw new Error('Erreur API diffusions');
    const diffusions = await res.json();

    const tvContainer = document.getElementById('tv-channels-grid');
    const radioContainer = document.getElementById('radio-channels-grid');

    if (tvContainer) tvContainer.innerHTML = '';
    if (radioContainer) radioContainer.innerHTML = '';

    diffusions.forEach(item => {
      const container = item.role === 'TV' ? tvContainer : radioContainer;
      if (!container) return;

      const styleClass = channelClassMap[item.nom] || '';
      
      const isActive = item.status === "true";
      const isUnrented = item.status === null || item.status === "";
      
      const card = document.createElement(isActive && item.stream_url ? 'a' : 'div');
      
      if (isActive && item.stream_url) {
        card.href = item.stream_url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = `channel-card ${styleClass}`;
      } else {
        card.className = 'channel-card opacity-50 grayscale cursor-not-allowed';
        card.title = isUnrented ? 'Canal non loué' : 'Hors ligne';
      }

      card.innerHTML = item.logo 
        ? `<img src="${item.logo}" alt="${item.nom}" class="h-10 mb-2 object-contain" />`
        : `<span class="text-sm font-bold mt-1 text-center leading-tight">${item.nom}</span>`;

      container.appendChild(card);
    });
  } catch (err) {
    console.error('Erreur chargement diffusions:', err);
  }
}

async function loadShows() {
  try {
    const [showsRes, diffRes] = await Promise.all([
      fetch(`${CLOUDFLARE_WORKER_URL}/api/shows`),
      fetch(`${CLOUDFLARE_WORKER_URL}/api/diffusions`)
    ]);

    const shows = await showsRes.json();
    const diffusions = await diffRes.json();

    const showsContainer = document.getElementById('shows-grid');
    if (!showsContainer) return;
    showsContainer.innerHTML = '';

    shows.forEach(show => {
      const matchingBroadcast = diffusions.find(d => d.id === show.diffusion_id) || {
        nom: 'Furnality Network',
        role: 'TV'
      };

      const isRadio = matchingBroadcast.role === 'RDO';
      const badgeType = isRadio ? 'RADIO' : 'TV';
      const badgeColors = isRadio ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200';

      const mainUrl = show.video_url || show.podcast_url || '#';

      const card = document.createElement('div');
      card.className = 'program-card flex flex-col h-full bg-white border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all overflow-hidden';

      card.innerHTML = `
        ${show.image ? `<a href="${mainUrl}" target="_blank" rel="noopener noreferrer"><img src="${show.image}" alt="${show.nom}" class="w-full aspect-video object-cover border-b border-gray-200" /></a>` : ''}
        <div class="p-6 flex flex-col justify-between flex-grow">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">${show.production || 'Indépendant'}</span>
              <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${badgeColors}">
                ${badgeType} • ${matchingBroadcast.nom}
              </span>
            </div>
            <h3 class="text-lg font-bold text-black leading-snug">
              <a href="${mainUrl}" target="_blank" rel="noopener noreferrer" class="hover:underline">${show.nom}</a>
            </h3>
            ${show.description ? `<p class="mt-2 text-xs text-gray-600 line-clamp-3 leading-relaxed">${show.description}</p>` : ''}
          </div>

          <div class="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
            ${show.video_url ? `
              <a href="${show.video_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
                Voir la vidéo
              </a>
            ` : ''}
            ${show.podcast_url ? `
              <a href="${show.podcast_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 border border-gray-200 text-[11px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                Écouter Podcast
              </a>
            ` : ''}
          </div>
        </div>
      `;

      showsContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Erreur chargement shows:', err);
  }
}
