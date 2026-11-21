/* ==========================================================================
   FURNALITY RADIO — logique du site Radio (Furnality Radio + RFF)
   - Deux entités : Furnality Radio (nationale & internationale) et RFF (réseau)
   - Logos conservés dans leurs couleurs d'origine (Alt utilisé sur fond sombre)
   - Sigle à 3 lettres conservé sur RFF et les antennes régionales + nom complet
   - Activation progressive pilotée par D1 (publie = 1)
   ========================================================================== */
(function () {
  'use strict';

  var ASSET = 'https://raw.githack.com/FurnalityNetwork/Asset/main/';
  var API = (typeof window.RADIO_API === 'string' && window.RADIO_API) || 'https://furnality-api.darkeoftime.workers.dev';

  // Antennes régionales actives par défaut uniquement si l'API Cloudflare est hors-ligne
  var FALLBACK_ACTIVE = (Array.isArray(window.RADIO_ACTIVE_CODES) && window.RADIO_ACTIVE_CODES) || ['RNC'];

  var DATA = {
    poles: [
      { id: 'EUROPE', nom: 'Pôle Europe', court: 'Europe' },
      { id: 'PACIFIQUE', nom: 'Pôle Pacifique', court: 'Pacifique' },
      { id: 'OCEAN_INDIEN', nom: 'Pôle Océan Indien', court: 'Océan Indien' },
      { id: 'AMERIQUE_NORD', nom: 'Pôle Amérique du Nord', court: 'Amérique du Nord' },
      { id: 'CARAIBES_SUD', nom: 'Pôle Caraïbes & Amérique du Sud', court: 'Caraïbes & Am. du Sud' },
      { id: 'AFRIQUE_MO', nom: 'Pôle Afrique & Moyen-Orient', court: 'Afrique & Moyen-Orient' }
    ],
    stations: [
      { code: 'RHF', nom: 'Radio France Hexagone', texte: 'RADIO / FRANCE / HEXAGONE', pole: 'EUROPE', zone: 'France métropolitaine', lat: 46.6, lon: 2.4, a1: '#112a46', a2: '#e01010', logos: { Full: 'RHF---Full.svg', BUG: 'RHF---BUG.svg', ICN: 'RHF---ICN.svg', Tag: 'RHF---Tag.svg' } },
      { code: 'RBF', nom: 'Radio Belgique Francophone', texte: 'RADIO / BELGIQUE / FRANCOPHONE', pole: 'EUROPE', zone: 'Belgique', lat: 50.6, lon: 4.5, a1: '#e5a93b', a2: '#9c1c1c', logos: { Full: 'RBF---Full.svg', BUG: 'RBF---BUG.svg', ICN: 'RBF---ICN.svg', Tag: 'RBF---Tag.svg' } },
      { code: 'RSF', nom: 'Radio Suisse Francophone', texte: 'RADIO / SUISSE / FRANCOPHONE', pole: 'EUROPE', zone: 'Suisse', lat: 46.8, lon: 7.3, a1: '#ce1126', a2: '#6a000f', logos: { Full: 'RSF---Full.svg', BUG: 'RSF---BUG.svg', ICN: 'RSF---ICN-.svg', Tag: 'RSF---Tag-.svg' } },
      { code: 'RLF', nom: 'Radio Luxembourg Francophone', texte: 'RADIO / LUXEMBOURG / FRANCOPHONE', pole: 'EUROPE', zone: 'Luxembourg', lat: 49.7, lon: 6.1, a1: '#ed2939', a2: '#00a1de', logos: { Full: 'RLF---Full.svg', BUG: 'RLF---BUG.svg', ICN: 'RLF---ICN.svg', Tag: 'RLF---Tag.svg' } },
      { code: 'RMO', nom: 'Radio Monaco Principauté', texte: 'RADIO / MONACO / PRINCIPAUTÉ', pole: 'EUROPE', zone: 'Monaco', lat: 43.7, lon: 7.4, a1: '#e3001b', a2: '#b0b0b0', logos: { Full: 'RMO---Full.svg', BUG: 'RMO---BUG.svg', ICN: 'RMO---ICN.svg', Tag: 'RMO---Tag.svg' } },
      { code: 'RNC', nom: 'Radio Nouvelle-Calédonie', texte: 'RADIO / NOUVELLE- / CALÉDONIE', pole: 'PACIFIQUE', zone: 'Nouvelle-Calédonie', lat: -21.5, lon: 165.5, a1: '#050b14', a2: '#241744', logos: { Full: 'RNC---Full-.svg', BUG: 'RNC---BUG.svg', ICN: 'RNC---ICN-.svg', Tag: 'RNC---Tag-.svg' } },
      { code: 'RPF', nom: 'Radio Polynésie Française', texte: 'RADIO / POLYNÉSIE / FRANÇAISE', pole: 'PACIFIQUE', zone: 'Polynésie française', lat: -17.6, lon: -149.5, a1: '#00b4d8', a2: '#ff5964', logos: { Full: 'RPF---Full-.svg', BUG: 'RPF---BUG-.svg', ICN: 'RPF---ICN-.svg', Tag: 'RPF---Tag-.svg' } },
      { code: 'RWF', nom: 'Radio Wallis et Futuna', texte: 'RADIO / WALLIS / ET FUTUNA', pole: 'PACIFIQUE', zone: 'Wallis-et-Futuna', lat: -13.3, lon: -176.2, a1: '#a52a2a', a2: '#4a3018', logos: { Full: 'RWF---Full.svg', BUG: 'RWF---BUG-.svg', ICN: 'RWF---ICN--.svg', Tag: 'RWF---Tag--.svg' } },
      { code: 'RVF', nom: 'Radio Vanuatu Francophone', texte: 'RADIO / VANUATU / FRANCOPHONE', pole: 'PACIFIQUE', zone: 'Vanuatu', lat: -16.5, lon: 167.8, a1: '#1b4d3e', a2: '#c68b59', logos: { Full: 'RVF---Full-.svg', BUG: 'RVF---BUG-.svg', ICN: 'RVF---ICN-.svg', Tag: 'RVF---Tag-.svg' } },
      { code: 'RLR', nom: 'Radio La Réunion Océan Indien', texte: 'RADIO / LA RÉUNION / OCÉAN INDIEN', pole: 'OCEAN_INDIEN', zone: 'La Réunion', lat: -21.1, lon: 55.5, a1: '#b83a14', a2: '#1a1a1a', logos: { Full: 'RLR---Full.svg', BUG: 'RLR---BUG.svg', ICN: 'RLR---ICN.svg', Tag: 'RLR---Tag.svg' } },
      { code: 'RMA', nom: 'Radio Mayotte Archipel', texte: 'RADIO / MAYOTTE / ARCHIPEL', pole: 'OCEAN_INDIEN', zone: 'Mayotte', lat: -12.8, lon: 45.2, a1: '#f4d03f', a2: '#0e6251', logos: { Full: 'RMA---Full.svg', BUG: 'RMA---BUG.svg', ICN: 'RMA---ICN.svg', Tag: 'RMA---Tag.svg' } },
      { code: 'RMD', nom: 'Radio Madagascar Francophone', texte: 'RADIO / MADAGASCAR / FRANCOPHONE', pole: 'OCEAN_INDIEN', zone: 'Madagascar', lat: -19.0, lon: 46.9, a1: '#007e3a', a2: '#e22b22', logos: { Full: 'RMD---Full.svg', BUG: 'RMD---BUG.svg', ICN: 'RMD---ICN.svg', Tag: 'RMD---Tag.svg' } },
      { code: 'RMR', nom: 'Radio Maurice Océan Indien', texte: 'RADIO / MAURICE / OCÉAN INDIEN', pole: 'OCEAN_INDIEN', zone: 'Île Maurice', lat: -20.3, lon: 57.6, a1: '#ffd500', a2: '#1a3668', logos: { Full: 'RMR---Full.svg', BUG: 'RMR---BUG.svg', ICN: 'RMR---ICN.svg', Tag: 'RMR---Tag.svg' } },
      { code: 'RQC', nom: 'Radio Québec Canada', texte: 'RADIO / QUÉBEC / CANADA', pole: 'AMERIQUE_NORD', zone: 'Québec et Canada francophone', lat: 47.0, lon: -71.5, a1: '#002d62', a2: '#0088ff', logos: { Full: 'RQC---Full.svg', BUG: 'RQC---BUG.svg', ICN: 'RQC---ICN.svg', Tag: 'RQC---Tag.svg' } },
      { code: 'RAC', nom: 'Radio Acadie', texte: 'RADIO / ACADIE', pole: 'AMERIQUE_NORD', zone: 'Acadie', lat: 46.1, lon: -64.8, a1: '#0055a4', a2: '#ffd100', logos: { Full: 'RAC---Full.svg', BUG: 'RAC---BUG.svg', ICN: 'RAC---ICN.svg', Tag: 'RAC---Tag.svg' } },
      { code: 'RSP', nom: 'Radio Saint-Pierre et Miquelon', texte: 'RADIO / SAINT-PIERRE / ET MIQUELON', pole: 'AMERIQUE_NORD', zone: 'Saint-Pierre-et-Miquelon', lat: 46.8, lon: -56.2, a1: '#a0c4ff', a2: '#03045e', logos: { Full: 'RSP---Full.svg', BUG: 'RSP---BUG.svg', ICN: 'RSP---ICN.svg', Tag: 'RSP---Tag.svg' } },
      { code: 'RAN', nom: 'Radio Antilles Caraïbes', texte: 'RADIO / ANTILLES / CARAÏBES', pole: 'CARAIBES_SUD', zone: 'Guadeloupe, Martinique, Saint-Martin, Saint-Barthélemy', lat: 16.0, lon: -61.5, a1: '#ffc300', a2: '#006994', logos: { Full: 'RAN---Full.svg', BUG: 'RAN---BUG.svg', ICN: 'RAN---ICN.svg', Tag: 'RAN---Tag.svg' } },
      { code: 'RGY', nom: 'Radio Guyane Amazonie', texte: 'RADIO / GUYANE / AMAZONIE', pole: 'CARAIBES_SUD', zone: 'Guyane', lat: 4.0, lon: -53.0, a1: '#228b22', a2: '#ffd700', logos: { Full: 'RGY---Full.svg', BUG: 'RGY---BUG.svg', ICN: 'RGY---ICN.svg', Tag: 'RGY---Tag.svg' } },
      { code: 'RMN', nom: 'Radio Maghreb Francophone', texte: 'RADIO / MAGHREB / FRANCOPHONE', pole: 'AFRIQUE_MO', zone: 'Maghreb : Algérie, Maroc, Tunisie', lat: 33.0, lon: 2.0, a1: '#006233', a2: '#c1272d', logos: { Full: 'RMN---Full.svg', BUG: 'RMN---BUG.svg', ICN: 'RMN---ICN.svg', Tag: 'RMN---Tag.svg' } },
      { code: 'RAF', nom: 'Radio Afrique Francophone', texte: 'RADIO / AFRIQUE / FRANCOPHONE', pole: 'AFRIQUE_MO', zone: 'Afrique subsaharienne', lat: 4.0, lon: 15.0, a1: '#af3b00', a2: '#1b5e30', logos: { Full: 'RAF---Full.svg', BUG: 'RAF---BUG.svg', ICN: 'RAF---ICN.svg', Tag: 'RAF---Tag.svg' } },
      { code: 'RLB', nom: 'Radio Liban Francophone', texte: 'RADIO / LIBAN / FRANCOPHONE', pole: 'AFRIQUE_MO', zone: 'Liban et Moyen-Orient', lat: 33.9, lon: 35.6, a1: '#00a859', a2: '#ee2a35', logos: { Full: 'RLB---Full.svg', BUG: 'RLB---BUG.svg', ICN: 'RLB---ICN.svg', Tag: 'RLB---Tag.svg' } }
    ]
  };

  /* 1) Furnality Radio : antenne généraliste nationale & internationale + pôle radio */
  var FURNALITY_RADIO = {
    code: 'FURNALITY', sigle: '', kind: 'national', nom: 'Furnality Radio', texte: 'FURNALITY / RADIO', pole: 'NATIONAL',
    zone: 'Nationale et internationale',
    slogan: 'La radio généraliste de Furnality',
    desc: 'Furnality Radio est l’antenne généraliste nationale et internationale du groupe Furnality : programmes généralistes, News, SoundofSkully et coordination du réseau régional RFF.',
    format: 'Généraliste, News & Musique · Régulation CRAN',
    fuseau: 'Europe/Paris',
    a1: '#004dff', a2: '#5a189a', publie: 1
  };

  /* 2) RFF : réseau d'antennes territoriales francophones */
  var RFF = {
    code: 'RFF', sigle: 'RFF', kind: 'brand', nom: 'Radio Francophones de Furnality', texte: 'RADIO / FRANCOPHONE / DE FURNALITY', pole: 'RESEAU',
    zone: 'Toute la francophonie',
    slogan: 'Les radios locales de la francophonie',
    desc: 'Le réseau de radios régionales de Furnality : des antennes locales implantées territoire par territoire, regroupées en six pôles et pilotées par Furnality Radio.',
    format: 'Réseau d’antennes territoriales',
    a1: '#004dff', a2: '#120a2b', publie: 1
  };

  /* ---------- Utilitaires ---------- */
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function filled(v) { return v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim().toUpperCase() !== 'NULL'; }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function norm(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function qs(k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } }
  function url(p) { return ASSET + p.split('/').map(encodeURIComponent).join('/'); }
  function fmtDate(s) {
    var d = new Date(String(s).replace(' ', 'T')); if (isNaN(d)) return '';
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function localClock(tz) {
    if (!filled(tz)) return '';
    try {
      return new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: '2-digit', minute: '2-digit' }).format(new Date());
    } catch (e) { return ''; }
  }

  /* Sigle à 3 lettres (uniquement RFF et antennes régionales) + nom complet */
  function sigleOf(s) {
    if (!s || s.kind === 'national') return '';
    return s.sigle || s.code || '';
  }
  function fullTitle(s) {
    if (!s) return '';
    var sig = sigleOf(s);
    return sig ? (sig + ' — ' + s.nom) : s.nom;
  }
  function sigleHtml(s, withFull) {
    if (!s) return '';
    var sig = sigleOf(s);
    if (!sig) return withFull ? ('<span>' + esc(s.nom) + '</span>') : '';
    var tag = '<span class="sigle-tag" style="background:' + esc(s.a1 || '#120a2b') + '">' + esc(sig) + '</span>';
    return withFull ? (tag + '<span>' + esc(s.nom) + '</span>') : tag;
  }

  /* ---------- Icônes (sprite) ---------- */
  var ICONS = {
    play: '<polygon points="7 3 20 12 7 21 7 3"/>',
    pause: '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    map: '<path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Z"/><path d="M9 3v16M15 5v16"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    headphones: '<path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M21 15v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1ZM3 15v3a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 1Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    wave: '<path d="M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2M8.4 15.6a5 5 0 0 1 0-7.2M15.6 8.4a5 5 0 0 1 0 7.2"/><circle cx="12" cy="12" r="1.5"/>'
  };
  function ic(n, extra) { return '<svg class="icon ' + (extra || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; }
  function sprite() {
    var s = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>';
    Object.keys(ICONS).forEach(function (k) { s += '<symbol id="i-' + k + '" viewBox="0 0 24 24">' + ICONS[k] + '</symbol>'; });
    document.body.insertAdjacentHTML('afterbegin', s + '</defs></svg>');
  }

  /* ---------- Données & Logos ---------- */
  var poleById = {}; DATA.poles.forEach(function (p) { poleById[p.id] = p; });
  var allCatalog = DATA.stations.map(function (s) { s.kind = 'rrf'; s.sigle = s.code; return s; });
  var stations = []; // Antennes régionales actives (activées progressivement)
  var contenus = [], programmes = [];

  function poleName(id) {
    if (id === 'NATIONAL') return 'Nationale & Internationale';
    if (id === 'RESEAU') return 'Réseau RFF';
    return poleById[id] ? poleById[id].nom : id;
  }
  function allEntities() { return [FURNALITY_RADIO, RFF].concat(stations); }
  function allCatalogEntities() { return [FURNALITY_RADIO, RFF].concat(allCatalog); }

  function find(code) {
    code = String(code || '').toUpperCase();
    return allEntities().filter(function (s) { return s.code === code; })[0] ||
           allCatalogEntities().filter(function (s) { return s.code === code; })[0];
  }
  function isLive(s) {
    if (!s || s.kind === 'brand') return false;
    return filled(s.stream_url) && s.statut !== 'soon';
  }

  /* Logos SVG en couleurs d'origine (Alt utilisé uniquement pour Furnality Radio sur fond sombre) */
  function logo(s, v) {
    v = v || 'Full';
    if (!s) return '';
    if (s.kind === 'national') {
      if (v === 'Alt') return url('Assets/STD/RADIO/Furnality Radio Alt.svg');
      if (v === 'Fav') return url('Assets/STD/RADIO/Furnality Radio Fav.svg');
      return url('Assets/STD/RADIO/Furnality Radio.svg');
    }
    if (s.kind === 'brand') {
      var rffMap = { Full: 'RFF---Full.svg', BUG: 'RFF---BUG.svg', ICN: 'RFF---ICN.svg', Tag: 'RFF---Tag.svg' };
      return url('Assets/STD/RADIO/RFF/' + (rffMap[v] || 'RFF---Full.svg'));
    }
    var file = (s.logos && (s.logos[v] || s.logos.BUG || s.logos.Full));
    return file ? url('Assets/STD/RADIO/RRF/' + file) : '';
  }

  /* Logo principal : BUG en couleurs pour les antennes RRF, Full/Alt selon le fond pour Furnality Radio */
  function cardLogo(s, onDark) {
    if (!s) return '';
    if (s.kind === 'national') return logo(s, onDark ? 'Alt' : 'Full');
    if (s.kind === 'brand') return logo(s, 'Full');
    return logo(s, 'BUG');
  }

  function logoImg(s, v, cls, alt, onDark) {
    var src = v ? logo(s, v) : cardLogo(s, onDark);
    var fb = (s && s.kind === 'rrf') ? logo(s, 'Full') : '';
    return '<img class="logo-svg ' + (cls || '') + '" src="' + esc(src) + '" alt="' + esc(alt != null ? alt : fullTitle(s)) + '"' +
      (fb && fb !== src ? ' data-fallback="' + esc(fb) + '"' : '') +
      ' data-code="' + esc(sigleOf(s) || 'FURNALITY') + '" draggable="false" loading="lazy">';
  }

  /* Fallback automatique si un SVG RRF/RFF échoue à charger */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.classList.contains('logo-svg')) return;
    var fb = img.getAttribute('data-fallback');
    if (fb && img.src !== fb) {
      img.removeAttribute('data-fallback');
      img.src = fb;
      return;
    }
    if (!img.getAttribute('data-svg-done')) {
      img.setAttribute('data-svg-done', '1');
      var code = esc(img.getAttribute('data-code') || 'RADIO');
      var svgBadge = '<svg xmlns="http://www.w3.org/2000/svg" width="130" height="44" viewBox="0 0 130 44">' +
        '<text x="0" y="30" font-family="Inter Tight,Inter,Arial,sans-serif" font-weight="900" font-size="22" letter-spacing="1.5" fill="#120a2b">' + code + '</text></svg>';
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgBadge);
    }
  }, true);

  /* Protection anti-clic-droit sur les logos */
  document.addEventListener('contextmenu', function (e) {
    if (e.target && e.target.closest && e.target.closest('.logo-svg, .idents, .fiche-logo, .brandcard-logo')) {
      e.preventDefault();
    }
  });

  function idents(s) {
    if (s.kind === 'national') return [
      { l: 'Standard (fond clair)', u: logo(s, 'Full'), dark: false },
      { l: 'Alternatif (fond sombre)', u: logo(s, 'Alt'), dark: true },
      { l: 'Icône / Favicon (Fav)', u: logo(s, 'Fav'), dark: false }
    ];
    if (s.kind === 'brand') return [
      { l: 'RFF · Standard', u: logo(s, 'Full'), dark: false },
      { l: 'RFF · Bug', u: logo(s, 'BUG'), dark: true }
    ];
    return [
      { l: 'Antenne (Full)', u: logo(s, 'Full'), dark: false },
      { l: 'Bug TV (BUG)', u: logo(s, 'BUG'), dark: true },
      { l: 'Icône (ICN)', u: logo(s, 'ICN'), dark: false },
      { l: 'Cartouche (Tag)', u: logo(s, 'Tag'), dark: false }
    ];
  }

  /* ---------- Chargement D1 + Activation progressive ---------- */
  var MERGE_FIELDS = ['nom', 'texte', 'pole', 'zone', 'slogan', 'description', 'format', 'langues', 'frequence', 'fuseau', 'equipe', 'contact', 'ouverture', 'a1', 'a2', 'stream_url', 'statut'];

  function mergeRow(target, row) {
    MERGE_FIELDS.forEach(function (k) {
      if (filled(row[k])) {
        if (k === 'description') target.desc = row[k];
        else target[k] = row[k];
      }
    });
    if (filled(row.lat) && filled(row.lon)) { target.lat = +row.lat; target.lon = +row.lon; }
    if (row.ordre != null && row.ordre !== '') target.ordre = +row.ordre;
    if (row.publie != null) target.publie = +row.publie;
  }

  function fetchJson(path) {
    return fetch(API + path).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  function load() {
    var safe = function (p) { return fetchJson(p).catch(function () { return null; }); };
    return Promise.all([safe('/api/radio/stations'), safe('/api/radio/contenus'), safe('/api/radio/programmes')]).then(function (r) {
      var rows = Array.isArray(r[0]) ? r[0] : null;
      var activeMap = {};
      var orderMap = {};

      if (rows && rows.length) {
        rows.forEach(function (row, idx) {
          var code = String(row.code || '').trim().toUpperCase();
          if (!code) return;
          var pub = (row.publie === 0 || row.publie === '0') ? 0 : 1;
          activeMap[code] = pub;
          orderMap[code] = row.ordre != null ? +row.ordre : (idx + 10);

          if (code === 'FURNALITY') { mergeRow(FURNALITY_RADIO, row); return; }
          if (code === 'RFF') { mergeRow(RFF, row); return; }

          var s = allCatalog.filter(function (x) { return x.code === code; })[0];
          if (!s) {
            s = { code: code, sigle: code, kind: 'rrf', a1: '#004dff', a2: '#5a189a', logos: null };
            allCatalog.push(s);
          }
          mergeRow(s, row);
        });

        stations = allCatalog.filter(function (s) {
          return activeMap[s.code] === 1;
        }).sort(function (a, b) {
          return (orderMap[a.code] || 999) - (orderMap[b.code] || 999);
        });
      } else {
        stations = allCatalog.filter(function (s) {
          return FALLBACK_ACTIVE.indexOf(s.code) > -1;
        });
      }

      contenus = (Array.isArray(r[1]) ? r[1] : []).filter(function (c) { return c.publie !== 0 && c.publie !== '0'; });
      programmes = (Array.isArray(r[2]) ? r[2] : []).filter(function (c) { return c.publie !== 0 && c.publie !== '0'; });
    });
  }

  /* ---------- Lecteur ---------- */
  var audio = null, playerEl = null, current = null;
  function toast(msg) {
    var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 3400);
  }
  function ensurePlayer() {
    if (playerEl) return;
    audio = new Audio(); audio.preload = 'none';
    playerEl = document.createElement('div'); playerEl.className = 'player'; playerEl.setAttribute('role', 'region'); playerEl.setAttribute('aria-label', 'Lecteur');
    playerEl.innerHTML = '<div class="wrap"><div class="player-logo"><img class="logo-svg" alt="" id="pl-logo" draggable="false"></div>' +
      '<div class="player-info"><b id="pl-title"></b><span id="pl-sub"></span></div><div class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
      '<input type="range" id="pl-vol" min="0" max="1" step="0.05" value="0.9" aria-label="Volume">' +
      '<button class="player-btn" id="pl-toggle" aria-label="Lecture / pause">' + ic('pause', 'icon--fill') + '</button>' +
      '<button class="player-close" id="pl-close" aria-label="Fermer le lecteur">' + ic('x') + '</button></div>';
    document.body.appendChild(playerEl); document.body.classList.add('has-player');
    function sync() {
      var on = !audio.paused;
      $('#pl-toggle').innerHTML = ic(on ? 'pause' : 'play', 'icon--fill'); playerEl.classList.toggle('is-playing', on);
    }
    audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
    audio.addEventListener('error', function () { if (current) toast('Ce flux est indisponible pour le moment.'); sync(); });
    $('#pl-toggle').onclick = function () { if (audio.paused) audio.play().catch(function () { toast('Lecture impossible.'); }); else audio.pause(); };
    $('#pl-close').onclick = function () { audio.pause(); audio.removeAttribute('src'); audio.load(); current = null; playerEl.classList.remove('open'); document.body.classList.remove('has-player'); };
    $('#pl-vol').oninput = function (e) { audio.volume = +e.target.value; };
    audio.volume = 0.9;
  }
  function play(item) {
    if (!item || !filled(item.url)) { toast((item && item.title ? item.title : 'Cette antenne') + ' arrive bientôt à l’antenne.'); return; }
    ensurePlayer(); current = item;
    $('#pl-logo').src = item.logo || ''; $('#pl-title').textContent = item.title || ''; $('#pl-sub').textContent = item.sub || '';
    playerEl.classList.add('open'); document.body.classList.add('has-player');
    audio.src = item.url; audio.play().catch(function () { toast('Lecture impossible : le navigateur a bloqué ou le flux est indisponible.'); });
  }
  function playStation(s) {
    s = s || FURNALITY_RADIO;
    if (!isLive(s)) { toast(fullTitle(s) + ' arrive bientôt à l’antenne.'); return; }
    play({ url: s.stream_url, title: fullTitle(s), sub: 'En direct · ' + s.zone, logo: cardLogo(s, true) });
  }
  function playContent(c) {
    var s = find(c.station_code) || FURNALITY_RADIO;
    play({ url: c.url, title: c.titre, sub: fullTitle(s) + (filled(c.duree) ? ' · ' + c.duree : ''), logo: cardLogo(s, true) });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-play]');
    if (b) { e.preventDefault(); var s = find(b.getAttribute('data-play')); if (s) playStation(s); return; }
    b = e.target.closest('[data-play-content]');
    if (b) {
      e.preventDefault(); var id = b.getAttribute('data-play-content');
      var c = contenus.filter(function (x) { return String(x.id) === id; })[0]; if (c) playContent(c);
    }
  });

  /* ---------- Gabarits ---------- */
  function badge(s) {
    if (s.kind === 'brand') return '<span class="badge badge--pole">Réseau RFF</span>';
    return isLive(s) ? '<span class="badge badge--live">En direct</span>' : '<span class="badge badge--soon">Bientôt</span>';
  }
  function stCard(s) {
    var href = 'radio.html?r=' + encodeURIComponent(s.code);
    return '<article class="st" style="--a1:' + esc(s.a1) + ';--a2:' + esc(s.a2) + '">' +
      '<a class="st-logo" href="' + href + '" aria-label="' + esc(fullTitle(s)) + '">' + logoImg(s, null, '', fullTitle(s), false) + '</a>' +
      '<div class="st-body"><div class="st-title">' + sigleHtml(s, false) + '<h3><a href="' + href + '">' + esc(s.nom) + '</a></h3></div><p class="st-zone">' + esc(s.zone) + '</p></div>' +
      '<div class="st-foot">' + badge(s) + '<span style="display:flex;gap:12px;align-items:center">' +
      '<a class="more" href="' + href + '">Fiche</a>' +
      (s.kind !== 'brand' ? '<button class="btn btn--sm btn--ghost" data-play="' + esc(s.code) + '" aria-label="Écouter ' + esc(fullTitle(s)) + '">' + ic('play', 'icon--fill') + ' Écouter</button>' : '') +
      '</span></div></article>';
  }

  /* Carte de contenu : affiche les couleurs + le sigle (si RFF/régionale) + le nom complet */
  function contentCard(c) {
    var s = find(c.station_code) || FURNALITY_RADIO;
    var a1 = esc(s.a1 || '#004dff'), a2 = esc(s.a2 || '#5a189a');
    var thumb = filled(c.image)
      ? '<img class="cover" src="' + esc(c.image) + '" alt="" loading="lazy">'
      : logoImg(s, null, 'fallback', fullTitle(s), true);
    var type = c.type === 'podcast' ? 'Podcast' : 'Replay';
    var href = 'radio.html?r=' + encodeURIComponent(s.code);

    return '<article class="cc" style="--a1:' + a1 + ';--a2:' + a2 + '">' +
      '<div class="cc-thumb">' + thumb + (filled(c.duree) ? '<span class="cc-dur">' + esc(c.duree) + '</span>' : '') +
      (filled(c.url) ? '<button class="cc-play" data-play-content="' + esc(c.id) + '" aria-label="Écouter ' + esc(c.titre) + '">' + ic('play', 'icon--fill') + '</button>' : '') + '</div>' +
      '<div class="cc-body">' +
        '<a class="cc-station" href="' + href + '" title="Voir la fiche de ' + esc(fullTitle(s)) + '">' +
          '<span class="cc-swatch" aria-hidden="true"></span>' +
          sigleHtml(s, false) +
          '<span class="cc-station-name">' + esc(s.nom) + '</span>' +
        '</a>' +
        '<div class="cc-meta"><span>' + type + '</span>' + (filled(c.date_publication) ? '<span>' + esc(fmtDate(c.date_publication)) + '</span>' : '') + '</div>' +
        '<h3>' + esc(c.titre) + '</h3>' + (filled(c.description) ? '<p>' + esc(c.description) + '</p>' : '') +
      '</div></article>';
  }

  function empty(icon, title, text) {
    return '<div class="empty">' + ic(icon) + '<b>' + esc(title) + '</b><span>' + esc(text) + '</span></div>';
  }

  /* ---------- Carte ---------- */
  function createMap(el, opts) {
    opts = opts || {};
    var W = window.RADIO_WORLD; if (!W || !el) return null;
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Carte des antennes de la RFF');
    var land = document.createElementNS(NS, 'g'); land.setAttribute('class', 'map-land');
    W.paths.forEach(function (d) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); land.appendChild(p); });
    svg.appendChild(land);
    var pinsG = document.createElementNS(NS, 'g'); svg.appendChild(pinsG);
    el.insertBefore(svg, el.firstChild);

    function proj(s) { var lon = s.lon < W.lon0 ? s.lon + 360 : s.lon; return [(lon - W.lon0) * W.s, (W.lat0 - s.lat) * W.s]; }
    var pins = {};
    stations.forEach(function (s) {
      if (s.lat == null || s.lon == null) return;
      var xy = proj(s);
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pin'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', fullTitle(s));
      g.innerHTML = '<circle class="halo" r="15"/><circle class="dot" r="6.5"/><text x="13" y="4.5" font-size="12">' + esc(sigleOf(s)) + '</text>';
      g._xy = xy; g._code = s.code;
      g.addEventListener('click', function () { select(s.code); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(s.code); } });
      pinsG.appendChild(g); pins[s.code] = g;
    });

    var vb = { x: 0, y: 0, w: W.w, h: W.h }, raf = null;
    function aspect() { return (el.clientWidth || 1000) / (el.clientHeight || 480); }
    function apply() {
      svg.setAttribute('viewBox', vb.x + ' ' + vb.y + ' ' + vb.w + ' ' + vb.h);
      var k = vb.w / (el.clientWidth || 1000);
      Object.keys(pins).forEach(function (c) { var g = pins[c]; g.setAttribute('transform', 'translate(' + g._xy[0] + ' ' + g._xy[1] + ') scale(' + k + ')'); });
    }
    function target(pole) {
      var a = aspect(), pts = stations.filter(function (s) { return pins[s.code] && (pole === 'ALL' || s.pole === pole); }).map(function (s) { return proj(s); });
      if (pole === 'ALL' || !pts.length) { var w = W.w, h = w / a; return { x: 0, y: (W.h - h) / 2 - 20, w: w, h: h }; }
      var x0 = Math.min.apply(null, pts.map(function (p) { return p[0]; })), x1 = Math.max.apply(null, pts.map(function (p) { return p[0]; }));
      var y0 = Math.min.apply(null, pts.map(function (p) { return p[1]; })), y1 = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
      var bw = x1 - x0, bh = y1 - y0;
      var w2 = Math.max(bw * 1.5, bh * 1.5 * a, 420), h2 = w2 / a;
      return { x: (x0 + x1) / 2 - w2 / 2, y: (y0 + y1) / 2 - h2 / 2, w: w2, h: h2 };
    }
    function animate(t) {
      cancelAnimationFrame(raf); var from = { x: vb.x, y: vb.y, w: vb.w, h: vb.h }, t0 = null, D = 650;
      function step(ts) {
        if (t0 == null) t0 = ts; var p = Math.min(1, (ts - t0) / D), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        ['x', 'y', 'w', 'h'].forEach(function (k) { vb[k] = from[k] + (t[k] - from[k]) * e; }); apply();
        if (p < 1) raf = requestAnimationFrame(step);
      }
      raf = requestAnimationFrame(step);
    }
    var curPole = 'ALL';
    function zoomTo(pole) {
      curPole = pole; el.classList.toggle('show-labels', pole !== 'ALL');
      var t = target(pole); if (window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches) { vb = t; apply(); } else animate(t);
    }
    function select(code) {
      Object.keys(pins).forEach(function (c) { pins[c].classList.toggle('is-sel', c === code); });
      if (pins[code]) pinsG.appendChild(pins[code]);
      if (opts.onSelect) opts.onSelect(code);
    }
    var ro = window.ResizeObserver ? new ResizeObserver(function () { var t = target(curPole); vb = t; apply(); }) : null;
    if (ro) ro.observe(el);
    vb = target('ALL'); apply();
    return { zoomTo: zoomTo, select: select, refresh: function () { vb = target(curPole); apply(); } };
  }

  /* ---------- Pages ---------- */
  var pages = {};

  pages.home = function () {
    var playable = [FURNALITY_RADIO].concat(stations);
    var live = playable.filter(isLive).length;
    var el = $('#home-stats');
    if (el) el.innerHTML =
      '<div class="stat"><b>' + stations.length + ' / ' + DATA.stations.length + '</b><span>Antennes RFF ouvertes</span></div>' +
      '<div class="stat"><b>' + DATA.poles.length + '</b><span>Pôles régionaux</span></div>' +
      '<div class="stat"><b>2</b><span>Entités : Furnality Radio &amp; RFF</span></div>' +
      '<div class="stat"><b>' + (live ? live : contenus.length) + '</b><span>' + (live ? 'Antennes en direct' : 'Contenus en ligne') + '</span></div>';

    var st = $('#onair-status'); if (st) st.innerHTML = badge(FURNALITY_RADIO);
    var now = nowShow('FURNALITY'), n = $('#onair-now');
    if (n) n.innerHTML = now ? 'À l’antenne<strong>' + esc(now.titre) + '</strong>' : 'Programmation<strong>' + (isLive(FURNALITY_RADIO) ? 'En direct' : 'Ouverture prochaine') + '</strong>';

    var ph = $('#home-poles');
    if (ph) ph.innerHTML = DATA.poles.map(function (p) {
      var list = stations.filter(function (s) { return s.pole === p.id; });
      var planned = DATA.stations.filter(function (s) { return s.pole === p.id; }).length;
      return '<a class="pole" href="radios.html?pole=' + p.id + '"><div class="pole-head"><h3>' + esc(p.nom) + '</h3><span>' + list.length + ' / ' + planned + '</span></div>' +
        '<div class="pole-icons">' + (list.length
          ? list.map(function (s) { return logoImg(s, 'BUG', '', sigleOf(s), false); }).join('')
          : '<span style="font-size:12px;color:var(--muted);font-weight:600">Ouverture progressive</span>') + '</div>' +
        '<p>' + esc(list.length ? list.map(function (s) { return sigleOf(s) + ' (' + s.zone.split(/[,:(]/)[0] + ')'; }).join(' · ') : 'Antennes en cours de déploiement') + '</p></a>';
    }).join('');

    var lt = $('#home-latest');
    if (lt) {
      var last = contenus.slice().sort(function (a, b) { return String(b.date_publication).localeCompare(String(a.date_publication)); }).slice(0, 3);
      lt.innerHTML = last.length ? last.map(contentCard).join('') : '<div style="grid-column:1/-1">' + empty('headphones', 'Les replays arrivent bientôt', 'Dès l’ouverture des antennes, retrouvez ici les émissions à réécouter.') + '</div>';
    }
    var m = $('#home-map');
    if (m) createMap(m, { onSelect: function (c) { location.href = 'radio.html?r=' + c; } });
  };

  pages.radios = function () {
    var poleSel = 'ALL', query = '', map, panel = $('#panel');
    var ctrl = $('#map-ctrl');
    ctrl.innerHTML = '<button class="chip is-on" data-pole="ALL">Tous les pôles</button>' + DATA.poles.map(function (p) { return '<button class="chip" data-pole="' + p.id + '">' + esc(p.court) + '</button>'; }).join('');
    function showPanel(code) {
      var s = find(code); if (!s) return;
      panel.innerHTML = '<div class="panel-card" style="--a1:' + esc(s.a1) + ';--a2:' + esc(s.a2) + '"><div class="panel-logo">' + logoImg(s, null, '', fullTitle(s), false) + '</div><div class="panel-body">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' + sigleHtml(s, false) + badge(s) + '<span class="badge badge--pole">' + esc(poleName(s.pole)) + '</span></div>' +
        '<h3>' + esc(s.nom) + '</h3><div class="kv">' + ic('pin') + '<span>' + esc(s.zone) + '</span></div>' +
        '<div class="kv">' + ic('wave') + '<span>' + esc(s.desc || 'Antenne locale de la RFF.') + '</span></div>' +
        '<div class="panel-actions"><button class="btn btn--grad btn--sm" data-play="' + esc(s.code) + '">' + ic('play', 'icon--fill') + ' Écouter</button><a class="btn btn--ghost btn--sm" href="radio.html?r=' + esc(s.code) + '">Fiche ' + ic('arrow') + '</a></div></div></div>';
    }
    map = createMap($('#map-stage'), { onSelect: showPanel });
    function setPole(p) {
      poleSel = p; $$('.chip[data-pole]').forEach(function (c) { c.classList.toggle('is-on', c.getAttribute('data-pole') === p); });
      if (map) map.zoomTo(p); renderList();
      try { history.replaceState(null, '', p === 'ALL' ? location.pathname + location.hash : '?pole=' + p + location.hash); } catch (e) { }
    }
    function renderList() {
      var q = norm(query), box = $('#list-grid');
      var nat = (poleSel === 'ALL' && (!q || norm(FURNALITY_RADIO.nom + ' ' + FURNALITY_RADIO.zone).indexOf(q) > -1)) ? [FURNALITY_RADIO] : [];
      var out = '';
      if (nat.length) out += '<div class="pole-title">Antenne nationale &amp; internationale</div><div class="stations">' + nat.map(stCard).join('') + '</div>';
      DATA.poles.forEach(function (p) {
        if (poleSel !== 'ALL' && poleSel !== p.id) return;
        var list = stations.filter(function (s) { return s.pole === p.id && (!q || norm(s.nom + ' ' + s.code + ' ' + s.zone).indexOf(q) > -1); });
        if (list.length) out += '<div class="pole-title">' + esc(p.nom) + '</div><div class="stations">' + list.map(stCard).join('') + '</div>';
      });
      box.innerHTML = out || empty('search', 'Aucune antenne active trouvée', 'Essayez un autre nom ou explorez les antennes déjà ouvertes.');
    }
    ctrl.addEventListener('click', function (e) { var b = e.target.closest('[data-pole]'); if (b) setPole(b.getAttribute('data-pole')); });
    $('#q').addEventListener('input', function (e) { query = e.target.value; renderList(); });
    $$('.tabs [data-view]').forEach(function (b) {
      b.addEventListener('click', function () { view(b.getAttribute('data-view')); });
    });
    function view(v) {
      $$('.tabs [data-view]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-view') === v); });
      $('#view-map').hidden = v !== 'map'; $('#view-list').hidden = v !== 'list';
      if (v === 'map' && map) map.refresh();
      try { history.replaceState(null, '', location.pathname + location.search + (v === 'list' ? '#liste' : '')); } catch (e) { }
    }
    var p0 = (qs('pole') || '').toUpperCase(); if (poleById[p0]) setPole(p0); else renderList();
    var r0 = qs('r'); if (r0 && find(r0)) { map && map.select(r0.toUpperCase()); } else {
      panel.innerHTML = '<div class="panel-empty">' + ic('pin') + '<b>Choisissez une antenne</b><span>Cliquez sur un point de la carte pour voir sa fiche, ou basculez sur la liste.</span></div>';
    }
    if (location.hash === '#liste') view('list');
  };

  /* ---------- Fiche de présentation enrichie avec Cloudflare (/api/radio/station) ---------- */
  pages.station = function () {
    var codeParam = (qs('r') || 'FURNALITY').toUpperCase();
    var s = find(codeParam), root = $('#station-root');
    if (!s) {
      root.innerHTML = '<section class="section"><div class="wrap">' + empty('search', 'Antenne introuvable', 'Ce code ne correspond à aucune antenne.') + '<p style="text-align:center;margin-top:20px"><a class="btn" href="radios.html">Voir toutes les radios</a></p></div></section>';
      return;
    }

    fetchJson('/api/radio/station?code=' + encodeURIComponent(s.code)).catch(function () { return null; }).then(function (detail) {
      if (detail && detail.station) mergeRow(s, detail.station);

      document.title = fullTitle(s) + ' — Furnality Radio';
      var kindLabel = s.kind === 'national' ? 'Antenne nationale & internationale' : s.kind === 'brand' ? 'Réseau RFF' : poleName(s.pole);
      var same = s.kind === 'rrf' ? stations.filter(function (x) { return x.pole === s.pole && x.code !== s.code; }) : [];
      var mineReplays = (detail && Array.isArray(detail.replays)) ? detail.replays : contenus.filter(function (c) { return String(c.station_code).toUpperCase() === s.code && c.type !== 'podcast'; });
      var minePodcasts = (detail && Array.isArray(detail.podcasts)) ? detail.podcasts : contenus.filter(function (c) { return String(c.station_code).toUpperCase() === s.code && c.type === 'podcast'; });
      var weekProgs = (detail && Array.isArray(detail.programmes)) ? detail.programmes : programmes.filter(function (p) { return String(p.station_code).toUpperCase() === s.code; });
      var today = weekProgs.filter(function (p) { return +p.jour === todayIdx(); }).sort(byStart);

      var desc = s.desc || (s.nom + ' (' + sigleOf(s) + ') est l’antenne locale de la RFF pour ' + s.zone + '. Elle fait partie du ' + poleName(s.pole) + ' et dépend de Furnality Radio.');
      var headGrad = (s.a1 && s.a2) ? 'style="background:linear-gradient(108deg,' + esc(s.a1) + ' 0%,' + esc(s.a2) + ' 100%)"' : '';
      var clock = localClock(s.fuseau);
      var sig = sigleOf(s);

      var factRows = [];
      if (sig) factRows.push(['Sigle', '<strong>' + esc(sig) + '</strong>']);
      factRows.push(['Nom complet', esc(s.nom)]);
      factRows.push(['Entité', esc(s.kind === 'national' ? 'Furnality Radio (Groupe Furnality)' : 'Réseau RFF · Furnality Radio')]);
      factRows.push(['Pôle', esc(kindLabel)]);
      factRows.push(['Zone', esc(s.zone)]);
      if (filled(s.format)) factRows.push(['Format', esc(s.format)]);
      if (filled(s.langues)) factRows.push(['Langues', esc(s.langues)]);
      if (filled(s.frequence)) factRows.push(['Diffusion', esc(s.frequence)]);
      if (clock) factRows.push(['Heure locale', esc(clock)]);
      if (filled(s.equipe)) factRows.push(['Rédaction', esc(s.equipe)]);
      if (filled(s.ouverture)) factRows.push(['Déploiement', esc(s.ouverture)]);
      factRows.push(['Couleurs', '<span class="color-pair"><span class="color-chip"><i style="background:' + esc(s.a1) + '"></i>' + esc(s.a1) + '</span><span class="color-chip"><i style="background:' + esc(s.a2) + '"></i>' + esc(s.a2) + '</span></span>']);
      factRows.push(['Statut', badge(s)]);

      var relationNote = '';
      if (s.kind === 'national') {
        relationNote = '<div class="note" style="margin-top:20px"><b>Antenne principale.</b> <strong>Furnality Radio</strong> est la radio généraliste nationale et internationale de Furnality et supervise l’ensemble des antennes territoriales du réseau <a href="radio.html?r=RFF">RFF</a>.</div>';
      } else if (s.kind === 'brand') {
        relationNote = '<div class="note" style="margin-top:20px"><b>Réseau régional.</b> La <strong>RFF</strong> regroupe les antennes territoriales francophones. Elle est pilotée par <a href="radio.html?r=FURNALITY">Furnality Radio</a>.</div>';
      }

      root.innerHTML =
        '<section class="page-head" ' + headGrad + '><div class="wrap"><div class="crumbs"><a href="radios.html">Radios</a> / ' + esc(kindLabel) + ' / <strong>' + esc(sig || s.nom) + '</strong></div>' +
        '<div class="fiche-logo">' + logoImg(s, null, '', fullTitle(s), true) + '</div>' +
        '<h1 class="h1">' + esc(sig ? (sig + ' · ' + s.nom) : s.nom) + '</h1>' +
        (filled(s.slogan) ? '<p class="fiche-slogan">' + esc(s.slogan) + '</p>' : '') +
        '<p>' + esc(s.zone) + '</p>' +
        '<div class="hero-cta">' +
          (s.kind === 'brand'
            ? '<a class="btn btn--white" href="radios.html">' + ic('map') + ' Explorer les antennes actives</a>'
            : '<button class="btn btn--white" data-play="' + esc(s.code) + '">' + ic('play', 'icon--fill') + ' Écouter</button>') +
          (s.kind === 'rrf' ? '<a class="btn btn--line-white" href="radios.html?r=' + esc(s.code) + '&pole=' + esc(s.pole) + '">' + ic('map') + ' Voir sur la carte</a>' : '') +
        '</div></div></section>' +

        '<section class="section"><div class="wrap fiche"><div>' +
          '<span class="eyebrow">Présentation' + (sig ? ' · ' + esc(sig) : '') + '</span><h2 class="h2" style="margin:10px 0 14px">' + esc(s.nom) + '</h2><p class="lead">' + esc(desc) + '</p>' +
          relationNote +

          (s.kind !== 'brand' ? (
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:36px 0 14px;flex-wrap:wrap">' +
              '<h3 class="h2" style="font-size:1.2rem">Grille des programmes</h3>' +
              '<div class="tabs" id="st-prog-tabs"><button class="is-on" data-ptab="today">Aujourd’hui</button><button data-ptab="week">Semaine (' + weekProgs.length + ')</button></div>' +
            '</div>' +
            '<div id="st-prog-box">' +
              (today.length ? '<div class="sched" style="margin-top:0">' + today.map(slot).join('') + '</div>' : empty('calendar', 'Aucune émission aujourd’hui', 'Consultez la grille de la semaine ou revenez à l’ouverture de l’antenne.')) +
            '</div>'
          ) : '') +

          '<h3 class="h2" style="font-size:1.2rem;margin:36px 0 14px">Replays (' + mineReplays.length + ')</h3>' +
          (mineReplays.length ? '<div class="cards" style="grid-template-columns:repeat(2,1fr)">' + mineReplays.slice(0, 6).map(contentCard).join('') + '</div>' : empty('headphones', 'Pas encore de replay', 'Les émissions à réécouter apparaîtront ici.')) +

          (minePodcasts.length ? '<h3 class="h2" style="font-size:1.2rem;margin:36px 0 14px">Podcasts (' + minePodcasts.length + ')</h3><div class="cards" style="grid-template-columns:repeat(2,1fr)">' + minePodcasts.slice(0, 4).map(contentCard).join('') + '</div>' : '') +
        '</div>' +

        '<aside><dl class="facts" style="border-top-color:' + esc(s.a1 || '#004dff') + '">' +
          factRows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') +
        '</dl>' +
        (same.length ? '<h3 style="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin:30px 0 12px;color:var(--violet)">Autres antennes actives du pôle</h3><div style="display:grid;gap:10px">' +
          same.map(function (x) { return '<a class="live" style="--a1:' + esc(x.a1) + '" href="radio.html?r=' + esc(x.code) + '">' + logoImg(x, 'BUG', 'lg', fullTitle(x), false) + '<div class="live-info"><b>' + sigleHtml(x, true) + '</b><span class="zone">' + esc(x.zone) + '</span></div>' + ic('arrow') + '</a>'; }).join('') + '</div>' : '') +
        '</aside></div></section>' +

        '<section class="section section--tint"><div class="wrap"><span class="eyebrow">Identité visuelle</span><h2 class="h2" style="margin:10px 0 26px">Déclinaisons de ' + esc(sig || s.nom) + '</h2><div class="idents" style="--a1:' + esc(s.a1) + ';--a2:' + esc(s.a2) + '">' +
          idents(s).map(function (i) {
            return '<div class="ident"><div class="ident-view' + (i.dark ? ' ident-view--dark' : '') + '"><img class="logo-svg" src="' + esc(i.u) + '" alt="' + esc(i.l) + '" draggable="false"></div><div class="ident-meta"><span>' + esc(i.l) + '</span></div></div>';
          }).join('') +
        '</div></div></section>';

      $$('#st-prog-tabs [data-ptab]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          $$('#st-prog-tabs [data-ptab]').forEach(function (b) { b.classList.remove('is-on'); });
          btn.classList.add('is-on');
          var mode = btn.getAttribute('data-ptab');
          var box = $('#st-prog-box');
          if (mode === 'today') {
            box.innerHTML = today.length ? '<div class="sched" style="margin-top:0">' + today.map(slot).join('') + '</div>' : empty('calendar', 'Aucune émission aujourd’hui', 'Consultez la grille complète de la semaine.');
          } else {
            if (!weekProgs.length) {
              box.innerHTML = empty('calendar', 'Grille hebdomadaire à venir', 'Les programmes de ' + fullTitle(s) + ' seront publiés prochainement.');
            } else {
              var html = '';
              DAYS.forEach(function (dName, i) {
                var dRows = weekProgs.filter(function (p) { return +p.jour === (i + 1); }).sort(byStart);
                if (dRows.length) html += '<div class="pole-title" style="margin:20px 0 10px">' + esc(dName) + '</div><div class="sched" style="margin-top:0">' + dRows.map(slot).join('') + '</div>';
              });
              box.innerHTML = html;
            }
          }
        });
      });
    });
  };

  pages.contenus = function () {
    var tab = location.hash === '#replays' ? 'replays' : 'stream', sel = 'ALL', q = '';
    var box = $('#contenus-box'), selEl = $('#f-station');
    var playableStations = [FURNALITY_RADIO].concat(stations);
    selEl.innerHTML = '<option value="ALL">Toutes les antennes (' + playableStations.length + ')</option>' +
      playableStations.map(function (s) { return '<option value="' + esc(s.code) + '">' + esc(fullTitle(s)) + '</option>'; }).join('');

    function render() {
      $$('.tabs [data-tab]').forEach(function (b) { b.classList.toggle('is-on', b.getAttribute('data-tab') === tab); });
      var nq = norm(q);
      if (tab === 'stream') {
        var list = playableStations.filter(function (s) { return (sel === 'ALL' || s.code === sel) && (!nq || norm(s.nom + ' ' + s.zone + ' ' + s.code).indexOf(nq) > -1); });
        box.innerHTML = list.length ? '<div class="live-list">' + list.map(function (s) {
          return '<div class="live" style="--a1:' + esc(s.a1) + ';--a2:' + esc(s.a2) + '">' +
            logoImg(s, null, 'lg', fullTitle(s), false) +
            '<div class="live-info"><b><span class="cc-swatch" aria-hidden="true"></span>' + sigleHtml(s, true) + '</b><span class="zone">' + esc(s.zone) + '</span></div>' +
            badge(s) +
            '<button class="round" data-play="' + esc(s.code) + '" aria-label="Écouter ' + esc(fullTitle(s)) + '"' + (isLive(s) ? '' : ' disabled') + '>' + ic('play', 'icon--fill') + '</button></div>';
        }).join('') + '</div>' + (!list.some(isLive) ? '<div class="note" style="margin-top:22px">Les flux ouvriront antenne par antenne, au fur et à mesure de leur mise en service.</div>' : '') : empty('search', 'Aucun résultat', 'Modifiez votre recherche.');
      } else {
        var rows = contenus.filter(function (c) {
          var st = find(c.station_code);
          var hay = c.titre + ' ' + (c.description || '') + ' ' + (st ? (st.code + ' ' + st.nom) : c.station_code);
          return (sel === 'ALL' || String(c.station_code).toUpperCase() === sel) && (!nq || norm(hay).indexOf(nq) > -1);
        }).sort(function (a, b) { return String(b.date_publication).localeCompare(String(a.date_publication)); });
        box.innerHTML = rows.length ? '<div class="cards">' + rows.map(contentCard).join('') + '</div>' : empty('headphones', 'Aucun replay pour l’instant', 'Les émissions à réécouter seront publiées ici dès l’ouverture des antennes.');
      }
    }
    $$('.tabs [data-tab]').forEach(function (b) { b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); try { history.replaceState(null, '', tab === 'replays' ? '#replays' : location.pathname); } catch (e) { } render(); }); });
    selEl.addEventListener('change', function () { sel = selEl.value; render(); });
    $('#q').addEventListener('input', function (e) { q = e.target.value; render(); });
    render();
  };

  var DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  function todayIdx() { var d = new Date().getDay(); return d === 0 ? 7 : d; }
  function byStart(a, b) { return String(a.debut).localeCompare(String(b.debut)); }
  function mins(t) { var m = /(\d{1,2}):(\d{2})/.exec(t || ''); return m ? +m[1] * 60 + +m[2] : null; }
  function isNow(p) {
    if (+p.jour !== todayIdx()) return false; var d = new Date(), n = d.getHours() * 60 + d.getMinutes(), a = mins(p.debut), b = mins(p.fin);
    return a != null && b != null && n >= a && (b > a ? n < b : true);
  }
  function nowShow(code) { return programmes.filter(function (p) { return String(p.station_code).toUpperCase() === code && isNow(p); })[0]; }
  function slot(p) {
    return '<div class="slot' + (isNow(p) ? ' is-now' : '') + '"><time>' + esc(p.debut) + (filled(p.fin) ? ' – ' + esc(p.fin) : '') + '</time><div><b>' + esc(p.titre) + '</b>' +
      (filled(p.description) ? '<span>' + esc(p.description) + '</span>' : '') + '</div>' + (filled(p.animateur) ? '<span>' + esc(p.animateur) + '</span>' : '<span></span>') + '</div>';
  }
  pages.programmes = function () {
    var playableStations = [FURNALITY_RADIO].concat(stations);
    var day = todayIdx(), code = (qs('r') || 'FURNALITY').toUpperCase();
    if (!playableStations.some(function (x) { return x.code === code; })) code = 'FURNALITY';

    var selEl = $('#f-station'), daysEl = $('#days'), box = $('#sched');
    selEl.innerHTML = playableStations.map(function (s) { return '<option value="' + esc(s.code) + '">' + esc(fullTitle(s)) + '</option>'; }).join('');
    selEl.value = code;
    daysEl.innerHTML = DAYS.map(function (d, i) { return '<button data-day="' + (i + 1) + '">' + d.slice(0, 3) + '.</button>'; }).join('');
    function render() {
      $$('[data-day]', daysEl).forEach(function (b) { b.classList.toggle('is-on', +b.getAttribute('data-day') === day); });
      var rows = programmes.filter(function (p) { return String(p.station_code).toUpperCase() === code && +p.jour === day; }).sort(byStart);
      $('#day-title').textContent = DAYS[day - 1] + ' · ' + fullTitle(find(code));
      box.innerHTML = rows.length ? '<div class="sched" style="margin-top:0">' + rows.map(slot).join('') + '</div>' : empty('calendar', 'Grille à venir', 'Les programmes de ' + fullTitle(find(code)) + ' seront publiés à l’ouverture de l’antenne.');
    }
    daysEl.addEventListener('click', function (e) { var b = e.target.closest('[data-day]'); if (b) { day = +b.getAttribute('data-day'); render(); } });
    selEl.addEventListener('change', function () { code = selEl.value; render(); });
    render();
  };

  pages.reseau = function () {
    var box = $('#reseau-poles');
    box.innerHTML = DATA.poles.map(function (p) {
      var list = stations.filter(function (s) { return s.pole === p.id; });
      var planned = DATA.stations.filter(function (s) { return s.pole === p.id; }).length;
      return '<div class="pole" style="cursor:default"><div class="pole-head"><h3>' + esc(p.nom) + '</h3><span>' + list.length + ' / ' + planned + '</span></div>' +
        (list.length
          ? '<ul style="display:grid;gap:10px">' + list.map(function (s) { return '<li><a href="radio.html?r=' + esc(s.code) + '" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' + logoImg(s, 'BUG', '', sigleOf(s), false) + sigleHtml(s, true) + '</a></li>'; }).join('') + '</ul>'
          : '<p>Antennes de ce pôle en cours d’activation progressive.</p>') +
      '</div>';
    }).join('');
  };

  /* ---------- Démarrage ---------- */
  function init() {
    sprite();
    var burger = $('#burger'), menu = $('#mobile-menu');
    if (burger && menu) burger.addEventListener('click', function () { var o = menu.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
    var page = document.body.getAttribute('data-page');
    $$('[data-ic]').forEach(function (n) { n.innerHTML = ic(n.getAttribute('data-ic'), n.hasAttribute('data-fill') ? 'icon--fill' : ''); });
    var p = pages[page];
    load().then(function () { if (p) p(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
