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
    'share': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>'
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
  const unavailable = () => `<div class="n-empty">Les actualités sont momentanément indisponibles. Réessayez dans quelques instants.</div>`;
  const emptyBox = m => `<div class="n-empty">${esc(m)}</div>`;

  /* ---------- Bandeau des rubriques, horloge temps réel & recherche ---------- */
  function renderBand(activeSlug, onSearch) {
