/**
 * Furnality News — site d'information
 * Données : Cloudflare Worker + D1 (/api/news/rubriques, /api/news/articles)
 * Images : https://raw.githack.com/FurnalityNetwork/Asset/main/Assets/NEWS/
 */
(function () {
  'use strict';

  const API = (typeof CLOUDFLARE_WORKER_URL !== 'undefined') ? CLOUDFLARE_WORKER_URL : 'https://furnality-api.darkeoftime.workers.dev';
  const NEWS_ASSETS = 'https://raw.githack.com/FurnalityNetwork/Asset/main/Assets/NEWS/';
  const MAIL = 'furnality@gmail.com';

  /* ---------- Utilitaires ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isFilled = v => v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim().toUpperCase() !== 'NULL';
  const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const COLORS = ['rouge', 'rose', 'orange', 'jaune', 'bleu', 'vert', 'mauve', 'marron'];

  const ICONS = {
    'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'mail': '<rect x="2" y="4" width="20" height="16"/><path d="M22 7l-10 6L2 7"/>',
    'link': '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    'share': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    'newspaper': '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>',
    'search': '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'
  };
  const icon = n => `<svg class="n-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  function resolveImage(img) {
    if (!isFilled(img)) return '';
    const s = String(img).trim();
    if (/^(https?:\/\/|\/|\.\/)/i.test(s)) return s;
    const clean = s.replace(/^\/+/, '');
    return NEWS_ASSETS + (clean.includes('%') ? clean : encodeURI(clean));
  }

  function readingTime(text) {
    if (!isFilled(text)) return '';
    const words = String(text).trim().split(/\s+/).filter(Boolean).length;
    if (!words) return '';
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min`;
  }

  const parseDate = d => {
    if (!isFilled(d)) return null;
    const s = String(d).trim().replace(' ', 'T');
    const dt = new Date(s.length <= 10 ? s + 'T12:00:00' : s);
    return isNaN(dt) ? null : dt;
  };
  function timeAgo(d) {
    const dt = parseDate(d); if (!dt) return '';
    const min = Math.round((Date.now() - dt.getTime()) / 60000);
    if (min < 1) return 'À l’instant';
    if (min < 60) return `Il y a ${min} min`;
    if (min < 60 * 24) return `Il y a ${Math.floor(min / 60)} h`;
    if (min < 60 * 24 * 7) return `Il y a ${Math.floor(min / 1440)} j`;
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
  const shortDate = d => {
    const dt = parseDate(d); if (!dt) return '';
    return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };
  const hhmm = d => { const dt = parseDate(d); return dt ? dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''; };
  const fmtFull = d => {
    const dt = parseDate(d); if (!dt) return '';
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + (String(d).length > 10 ? ' à ' + hhmm(d).replace(':', ' h ') : '');
  };

  /* ---------- Données ---------- */
  async function load(path) {
    try {
      const r = await fetch(API + path);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      return { ok: true, data: Array.isArray(j) ? j : [] };
    } catch (e) { console.error('News API', path, e); return { ok: false, data: [] }; }
  }
  const byDate = (a, b) => String(b.date_publication || '').localeCompare(String(a.date_publication || '')) || Number(b.id) - Number(a.id);

  let RUBS = [];
  const rubOf = a => RUBS.find(r => String(r.id) === String(a.rubrique_id)) || null;
  const rubClass = r => { const c = norm(r && r.couleur); return 'rub-' + (COLORS.includes(c) ? c : 'rouge'); };
  const articleUrl = a => `article.html?id=${encodeURIComponent(a.id)}`;
  const rubUrl = r => `rubrique.html?r=${encodeURIComponent(r.slug || r.id)}`;

  /* ---------- Gabarits ---------- */
  function thumb(a, r) {
    const src = resolveImage(a.image);
    const label = esc(r ? r.nom : 'Furnality News');
    return `<div class="n-thumb ${!src ? 'n-thumb--empty' : ''}">${!src
      ? `<span>${label}</span>`
      : `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.parentNode.classList.add('n-thumb--empty');this.outerHTML='<span>${label}</span>'">`}</div>`;
  }
  const kicker = r => r ? `<span class="n-kicker">${esc(r.nom)}</span>` : '';
  const meta = (a, longRead = false) => {
    const rt = readingTime(a.contenu);
    const rtLabel = rt ? (longRead ? `${rt} de lecture` : rt) : '';
    const parts = [timeAgo(a.date_publication), rtLabel].filter(Boolean);
    return `<span class="n-meta">${esc(parts.join(' · '))}</span>`;
  };

  function card(a, opts = {}) {
    const r = rubOf(a);
    const cls = [
      'n-card',
      opts.small ? 'n-card--sm' : '',
      opts.compact ? 'n-card--compact' : '',
      opts.text ? 'n-card--text' : '',
      opts.row ? 'n-card--row' : '',
      rubClass(r)
    ].filter(Boolean).join(' ');

    return `
      <a class="${cls}" href="${articleUrl(a)}">
        ${opts.text ? '' : thumb(a, r)}
        <div>${kicker(r)}</div>
        <h3 class="n-title">${esc(a.titre)}</h3>
        ${opts.chapo && isFilled(a.chapo) ? `<p class="n-chapo">${esc(a.chapo)}</p>` : ''}
        ${meta(a, !!opts.longRead)}
      </a>`;
  }

  function feedList(list) {
    return list.map(a => {
      const r = rubOf(a);
      return `<a class="n-feed-item ${rubClass(r)}" href="${articleUrl(a)}">
        <span class="n-time">${esc(shortDate(a.date_publication))}</span>
        <span>${kicker(r)}<span class="n-title" style="display:block">${esc(a.titre)}</span></span>
      </a>`;
    }).join('');
  }

  function emptyBox(title, opts = {}) {
    const eyebrow = opts.eyebrow || 'Salle de rédaction';
    const desc = opts.desc || 'La rédaction prépare les prochains articles. Revenez très bientôt.';
    const iconName = opts.icon || 'newspaper';
    const action = opts.action || '';
    return `
      <div class="n-empty-state">
        <div class="n-empty-icon">${icon(iconName)}</div>
        <span class="n-kicker">${esc(eyebrow)}</span>
        <h3 class="n-empty-title">${esc(title)}</h3>
        <p class="n-empty-desc">${esc(desc)}</p>
        ${action ? `<div class="n-empty-actions">${action}</div>` : ''}
      </div>`;
  }

  const unavailable = () => emptyBox('Actualités momentanément indisponibles.', {
    eyebrow: 'Connexion au flux',
    desc: 'Impossible de joindre le serveur éditorial pour le moment. Réessayez dans quelques instants.',
    action: `<button class="n-btn n-btn--dark" type="button" onclick="location.reload()">Actualiser la page</button>`
  });

  /* ---------- Bandeau des rubriques, horloge temps réel & recherche ---------- */
  function renderBand(activeSlug, onSearch) {
    const nav = $('#news-nav'); if (!nav) return;
    nav.innerHTML = `<a href="index.html" class="${activeSlug === '' ? 'is-active' : ''}">À la une</a>` +
      RUBS.map(r => `<a class="${rubClass(r)} ${String(r.slug || r.id) === activeSlug ? 'is-active' : ''}" href="${rubUrl(r)}"><i class="n-dot"></i>${esc(r.nom)}</a>`).join('');

    const d = $('#news-date');
    if (d) {
      const updateClock = () => {
        const now = new Date();
        const dateTxt = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const timeTxt = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        d.innerHTML = `<span>${esc(dateTxt.charAt(0).toUpperCase() + dateTxt.slice(1))}</span><span class="n-clock">${esc(timeTxt)}</span>`;
      };
      updateClock();
      clearInterval(window._nClockTimer);
      window._nClockTimer = setInterval(updateClock, 1000);
    }

    const activeLink = nav.querySelector('.is-active');
    if (activeLink && nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = Math.max(0, activeLink.offsetLeft - (nav.clientWidth - activeLink.offsetWidth) / 2);
    }

    const prevBtn = $('#n-cat-prev');
    const nextBtn = $('#n-cat-next');
    const toggleBtn = $('#n-cat-toggle');
    const catsBar = $('#n-band-cats');

    const updateScrollButtons = () => {
      if (!prevBtn || !nextBtn) return;
      const canScroll = nav.scrollWidth > nav.clientWidth + 4;
      prevBtn.hidden = !canScroll || nav.scrollLeft <= 2;
      nextBtn.hidden = !canScroll || nav.scrollLeft + nav.clientWidth >= nav.scrollWidth - 2;
    };

    if (prevBtn) prevBtn.addEventListener('click', () => nav.scrollBy({ left: -240, behavior: 'smooth' }));
    if (nextBtn) nextBtn.addEventListener('click', () => nav.scrollBy({ left: 240, behavior: 'smooth' }));
    nav.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons, { passive: true });
    requestAnimationFrame(updateScrollButtons);

    if (toggleBtn && catsBar) {
      toggleBtn.addEventListener('click', () => {
        const expanded = catsBar.classList.toggle('is-expanded');
        toggleBtn.setAttribute('aria-expanded', String(expanded));
        if (!expanded) requestAnimationFrame(updateScrollButtons);
      });
    }

    const form = $('#news-search-form');
    const input = $('#news-search');
    if (form && input) {
      if (onSearch) {
        form.addEventListener('submit', e => { e.preventDefault(); onSearch(input.value); });
        input.addEventListener('input', () => onSearch(input.value));
      } else {
        form.addEventListener('submit', e => {
          e.preventDefault();
          const q = input.value.trim();
          if (q) location.href = `index.html?q=${encodeURIComponent(q)}`;
        });
      }
    }
  }

  /* ---------- Accueil ---------- */
  async function pageHome() {
    const [rr, ar] = await Promise.all([load('/api/news/rubriques'), load('/api/news/articles')]);
    RUBS = rr.data.slice().sort((a, b) => (Number(a.ordre) || 0) - (Number(b.ordre) || 0));

    const front = $('#n-front');
    const homeSections = $('#n-home-sections');
    const searchBox = $('#n-search-results');

    const all = ar.ok ? ar.data.slice().sort(byDate) : [];

    const runSearch = rawQ => {
      const q = norm(rawQ);
      if (!searchBox || !homeSections) return;
      if (!q) {
        searchBox.hidden = true;
        homeSections.hidden = false;
        return;
      }
      homeSections.hidden = true;
      searchBox.hidden = false;
      const matches = all.filter(a => {
        const r = rubOf(a);
        return norm(`${a.titre} ${a.chapo} ${a.contenu} ${a.auteur} ${r ? r.nom : ''}`).includes(q);
      });
      searchBox.innerHTML = `
        <section class="n-section">
          <div class="n-sec-head">
            <h2>Résultats pour « ${esc(rawQ.trim())} » (${matches.length})</h2>
            <a href="index.html" id="n-clear-search">Effacer la recherche</a>
          </div>
          ${matches.length
            ? `<div class="n-grid2" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">${matches.map(a => card(a, { chapo: true })).join('')}</div>`
            : emptyBox('Aucun résultat trouvé.', {
                eyebrow: 'Recherche',
                icon: 'search',
                desc: `Aucun article ne correspond à « ${rawQ.trim()} ». Essayez avec un autre mot-clé ou parcourez les rubriques.`,
                action: `<button class="n-btn n-btn--dark" type="button" id="n-clear-search-btn">Effacer la recherche</button>`
              })}
        </section>`;
      const resetSearch = e => {
        e.preventDefault();
        const inp = $('#news-search');
        if (inp) inp.value = '';
        history.replaceState(null, '', 'index.html');
        runSearch('');
      };
      const clr = $('#n-clear-search');
      const clrBtn = $('#n-clear-search-btn');
      if (clr) clr.addEventListener('click', resetSearch);
      if (clrBtn) clrBtn.addEventListener('click', resetSearch);
    };

    renderBand('', runSearch);

    const hideSecondary = () => {
      const moreSec = $('#n-more')?.closest('.n-section');
      if (moreSec) moreSec.hidden = true;
    };
    if (!ar.ok) {
      hideSecondary();
      front.innerHTML = `<div style="grid-column:1/-1">${unavailable()}</div>`;
      return;
    }
    if (!all.length) {
      hideSecondary();
      front.innerHTML = `<div style="grid-column:1/-1">${emptyBox('Aucun article publié pour le moment.', {
        eyebrow: 'Édition en préparation',
        desc: 'Les journalistes et contributeurs du réseau préparent les prochains sujets. Revenez très bientôt ou explorez nos antennes.',
        action: `<a class="n-btn n-btn--dark" href="https://furnalitynetwork.github.io/Zapping">Découvrir Zapping</a>`
      })}</div>`;
      return;
    }

    const featured = all.filter(a => Number(a.a_la_une) > 0).sort((a, b) => Number(a.a_la_une) - Number(b.a_la_une));
    const pool = [...featured, ...all.filter(a => !featured.includes(a))];
    const used = new Set();
    const take = n => { const out = []; for (const a of pool) { if (out.length >= n) break; if (!used.has(a.id)) { used.add(a.id); out.push(a); } } return out; };

    const lead = take(1)[0], side = take(4), strip = take(4);
    const lr = rubOf(lead);
    front.innerHTML = `
      <div class="n-lead">
        <a class="n-card ${rubClass(lr)}" href="${articleUrl(lead)}" style="gap:14px">
          ${thumb(lead, lr)}
          <div>${kicker(lr)}</div>
          <h2 class="n-title">${esc(lead.titre)}</h2>
          ${isFilled(lead.chapo) ? `<p class="n-chapo">${esc(lead.chapo)}</p>` : ''}
          ${meta(lead, true)}
        </a>
      </div>
      <div class="n-side">${side.map(a => card(a, { compact: true })).join('')}</div>`;
    const stripBox = $('#n-strip');
    if (stripBox) stripBox.innerHTML = strip.map(a => card(a, { text: true })).join('');

    const more = take(6);
    const moreBox = $('#n-more');
    if (more.length) {
      moreBox.innerHTML = more.map(a => card(a, { chapo: true })).join('');
    } else {
      moreBox.innerHTML = `<div style="grid-column:1/-1">${emptyBox('Plus d’articles très bientôt.', {
        eyebrow: 'À suivre',
        desc: 'D’autres sujets sont en cours de rédaction.'
      })}</div>`;
    }
    const feedBox = $('#n-feed-list');
    if (feedBox) feedBox.innerHTML = feedList(all.slice(0, 8));

    const rubsBox = $('#n-rubs');
    rubsBox.innerHTML = RUBS.map(r => {
      const items = all.filter(a => String(a.rubrique_id) === String(r.id)).slice(0, 4);
      if (!items.length) return '';
      return `
        <section class="n-section ${rubClass(r)}">
          <div class="n-sec-head"><h2>${esc(r.nom)}</h2><a href="${rubUrl(r)}">Toute la rubrique ${icon('arrow-right')}</a></div>
          <div class="n-rub">
            <div class="n-big">${card(items[0], { chapo: true })}</div>
            <div class="n-rest">${items.slice(1).map(a => card(a, { row: true })).join('')}</div>
          </div>
        </section>`;
    }).join('');

    const preQ = new URLSearchParams(location.search).get('q');
    if (preQ) {
      const inp = $('#news-search');
      if (inp) inp.value = preQ;
      runSearch(preQ);
    }
  }

  /* ---------- Rubrique ---------- */
  async function pageRubrique() {
    const [rr, ar] = await Promise.all([load('/api/news/rubriques'), load('/api/news/articles')]);
    RUBS = rr.data.slice().sort((a, b) => (Number(a.ordre) || 0) - (Number(b.ordre) || 0));
    const slug = new URLSearchParams(location.search).get('r') || '';
    const r = RUBS.find(x => String(x.slug || x.id) === slug);
    renderBand(slug);
    const head = $('#n-rub-head'), box = $('#n-rub-list');
    if (!rr.ok || !ar.ok) { box.innerHTML = unavailable(); return; }
    if (!r) {
      box.innerHTML = emptyBox('Rubrique introuvable.', {
        eyebrow: 'Erreur 404',
        desc: 'Cette rubrique n’existe pas ou a été déplacée.',
        action: `<a class="n-btn n-btn--dark" href="index.html">Retour à la une</a>`
      });
      return;
    }
    document.title = `${r.nom} — Furnality News`;
    head.className = `n-rub-head ${rubClass(r)}`;
    head.innerHTML = `<div class="n-wrap"><p class="n-crumbs"><a href="index.html">News</a> / ${esc(r.nom)}</p><h1>${esc(r.nom)}</h1>${isFilled(r.description) ? `<p>${esc(r.description)}</p>` : ''}</div>`;
    const list = ar.data.filter(a => String(a.rubrique_id) === String(r.id)).sort(byDate);
    box.className = rubClass(r);
    if (!list.length) {
      box.innerHTML = emptyBox('Aucun article dans cette rubrique.', {
        eyebrow: r.nom,
        desc: 'Aucun sujet n’a encore été publié dans cette catégorie. Retrouvez toute l’actualité du réseau à la une.',
        action: `<a class="n-btn n-btn--dark" href="index.html">Retour à la une</a>`
      });
      return;
    }
    box.innerHTML = `
      <div class="n-rub" style="margin-bottom:36px">
        <div class="n-big">${card(list[0], { chapo: true })}</div>
        <div class="n-rest">${list.slice(1, 4).map(a => card(a, { row: true })).join('')}</div>
      </div>
      ${list.length > 4 ? `<div class="n-sec-head"><h2>Plus d’articles</h2></div><div class="n-grid2" style="grid-template-columns:repeat(3,1fr)">${list.slice(4).map(a => card(a, { small: true })).join('')}</div>` : ''}`;
  }

  /* ---------- Article ---------- */
  async function pageArticle() {
    const [rr, ar] = await Promise.all([load('/api/news/rubriques'), load('/api/news/articles')]);
    RUBS = rr.data.slice().sort((a, b) => (Number(a.ordre) || 0) - (Number(b.ordre) || 0));
    const box = $('#n-article-root');
    const id = new URLSearchParams(location.search).get('id');
    const a = ar.data.find(x => String(x.id) === String(id));
    const r = a ? rubOf(a) : null;
    renderBand(r ? String(r.slug || r.id) : '__none__');
    if (!ar.ok) { box.innerHTML = `<div style="grid-column:1/-1">${unavailable()}</div>`; return; }
    if (!a) {
      box.innerHTML = `<div style="grid-column:1/-1">${emptyBox('Article introuvable.', {
        eyebrow: 'Erreur 404',
        desc: 'Cet article n’existe pas ou n’est plus publié sur Furnality News.',
        action: `<a class="n-btn n-btn--dark" href="index.html">Retour à la une</a>`
      })}</div>`;
      return;
    }
    document.title = `${a.titre} — Furnality News`;
    const all = ar.data.slice().sort(byDate);
    const paras = String(a.contenu || '').split(/\n+/).map(s => s.trim()).filter(Boolean);
    const related = all.filter(x => x.id !== a.id && String(x.rubrique_id) === String(a.rubrique_id)).slice(0, 3);
    const latest = all.filter(x => x.id !== a.id).slice(0, 6);
    const imgSrc = resolveImage(a.image);
    const rt = readingTime(a.contenu);

    const prog = $('#n-progress');
    if (prog) {
      prog.className = 'n-progress ' + rubClass(r);
      window.addEventListener('scroll', () => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.width = docH > 0 ? Math.min(100, Math.max(0, (window.scrollY / docH) * 100)) + '%' : '0%';
      }, { passive: true });
    }

    box.className = 'n-article-wrap ' + rubClass(r);
    box.innerHTML = `
      <article class="n-article">
        <div>${r ? `<a href="${rubUrl(r)}" class="n-kicker">${esc(r.nom)}</a>` : ''}</div>
        <h1>${esc(a.titre)}</h1>
        ${isFilled(a.chapo) ? `<p class="n-lede">${esc(a.chapo)}</p>` : ''}
        <div class="n-byline">
          <span>Publié le <b>${esc(fmtFull(a.date_publication))}</b></span>
          ${isFilled(a.auteur) ? `<span>Par <b>${esc(a.auteur)}</b></span>` : ''}
          ${isFilled(a.source) ? `<span>Source : <b>${esc(a.source)}</b></span>` : ''}
          ${rt ? `<span><b>${esc(rt)} de lecture</b></span>` : ''}
        </div>
        ${imgSrc ? `<figure class="n-figure"><img src="${esc(imgSrc)}" alt="${esc(a.titre)}"></figure>` : ''}
        <div class="n-body">${paras.map(p => `<p>${esc(p)}</p>`).join('') || ''}</div>
        <div class="n-share">
          ${navigator.share ? `<button class="n-btn n-btn--dark" id="n-native-share" type="button">${icon('share')} Partager</button>` : ''}
          <button class="n-btn n-btn--dark" id="n-copy" type="button">${icon('link')} Copier le lien</button>
          <a class="n-btn" href="mailto:${MAIL}?subject=${encodeURIComponent('Précision sur : ' + a.titre)}">${icon('mail')} Signaler une erreur</a>
        </div>
        ${related.length ? `<section class="n-more"><div class="n-sec-head"><h2>À lire aussi</h2></div><div class="n-three">${related.map(x => card(x, { small: true })).join('')}</div></section>` : ''}
      </article>
      <aside class="n-feed" style="top:96px">
        <div class="n-feed-head"><h3>Dernières infos</h3></div>
        <div class="n-feed-list">${feedList(latest)}</div>
      </aside>`;

    const nativeShare = $('#n-native-share');
    if (nativeShare) nativeShare.addEventListener('click', () => {
      navigator.share({ title: a.titre, text: a.chapo || a.titre, url: location.href }).catch(() => {});
    });
    const copy = $('#n-copy');
    if (copy) copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); copy.textContent = 'Lien copié'; }
      catch (e) { copy.textContent = 'Copie impossible'; }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const fn = { home: pageHome, rubrique: pageRubrique, article: pageArticle }[document.body.dataset.page];
    if (fn) fn();
  });
})();
