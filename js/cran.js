/**
- CRAN — Conseil de Régulation de l'Audiovisuel et du Numérique
- Données : Cloudflare Worker + D1 (même API que Furnality)
- Aucune dépendance externe.
 */
const CRAN_API = (typeof CRAN_API_URL !== 'undefined') ? CRAN_API_URL : 'https://furnality-api.darkeoftime.workers.dev';
const CRAN_MAIL = 'furnality@gmail.com';

/* ---------- Utilitaires ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isFilled = v => v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim().toUpperCase() !== 'NULL';
const norm = s => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
const safeUrl = u => (isFilled(u) && /^(https?:\/\/|\/|\.\/|[\w-]+\.[\w]+)/i.test(String(u).trim())) ? String(u).trim() : '#';
const isArchived = d => /^ARCHIV/i.test(String(d && d.status ? d.status : '').trim());

const ICONS = {
  'arrow-right': '<path d="M5 12h14M12 5l7 7-7 7"/>',
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  'external': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>',
  'file': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5"/>',
  'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
  'x': '<path d="M18 6L6 18M6 6l12 12"/>',
  'mail': '<rect x="2" y="4" width="20" height="16"/><path d="M22 7l-10 6L2 7"/>',
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
  'alert': '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  'scale': '<path d="M12 3v18M5 21h14M5 7l-3 8a4 4 0 0 0 6 0zM19 7l-3 8a4 4 0 0 0 6 0zM5 7h14"/>',
  'tv': '<rect x="2" y="7" width="20" height="14"/><path d="M17 2l-5 5-5-5"/>',
  'radio': '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2"/>',
  'archive': '<rect x="2" y="4" width="20" height="5"/><path d="M4 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9M10 13h4"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>',
  'folder': '<path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  'check': '<path d="M20 6L9 17l-5-5"/>',
  'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  'megaphone': '<path d="M3 11v2a1 1 0 0 0 1 1h3l8 5V5L7 10H4a1 1 0 0 0-1 1zM19 9a4 4 0 0 1 0 6"/>'
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

function fmtDate(d) {
  if (!isFilled(d)) return '';
  const s = String(d).trim();
  const dt = new Date(s.length <= 10 ? s + 'T12:00:00' : s);
  return isNaN(dt) ? s : dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtDateShort(d) {
  if (!isFilled(d)) return '';
  const s = String(d).trim();
  const dt = new Date(s.length <= 10 ? s + 'T12:00:00' : s);
  return isNaN(dt) ? s : dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/* Style des types d'annonces / statuts */
function toneOf(label) {
  const k = norm(label);
  if (/revocation|retrait|sanction|interdiction|arret|ferme/.test(k)) return 'badge--danger';
  if (/suspension|mise en demeure|suspendu/.test(k)) return 'badge--alert';
  if (/avertissement|signalement|surveillance|enquete|instruction/.test(k)) return 'badge--warn';
  if (/autoris|nouvelle|agree|conforme|actif/.test(k)) return 'badge--ok';
  return '';
}
const badge = label => isFilled(label) ? `<span class="badge ${toneOf(label)}">${esc(label)}</span>` : '';

/* ---------- Données ---------- */
async function load(path) {
  try {
    const res = await fetch(CRAN_API + path);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return { ok: true, data: Array.isArray(data) ? data : [] };
  } catch (err) {
    console.error('CRAN API', path, err);
    return { ok: false, data: [] };
  }
}
const byDateDesc = (a, b) => String(b.date || '').localeCompare(String(a.date || '')) || Number(b.id) - Number(a.id);
const loadNews = async () => { const r = await load('/api/cran/news'); r.data.sort(byDateDesc); return r; };
const loadDocs = () => load('/api/cran/documents');
const loadDiff = () => load('/api/diffusions');
const loadChannels = () => load('/api/cran/chaines');
const isDecision = n => isFilled(n.numero_decision);
const diffName = (diff, id) => { const d = diff.find(x => String(x.id) === String(id)); return d ? d.nom : ''; };
const isChanArchived = (d, regs) => {
  if (isArchived(d)) return true;
  const r = regs.find(x => String(x.diffusion_id) === String(d.id));
  return !!(r && /^archiv/i.test(norm(r.statut)));
};

const unavailable = (what) => `<div class="empty">${icon('alert')}<p style="margin-top:8px">${esc(what)} momentanément indisponible. Réessayez dans quelques instants.</p></div>`;
const emptyBox = (msg) => `<div class="empty">${esc(msg)}</div>`;

/* ---------- Gabarits ---------- */
function newsCard(n, diff) {
  const chan = isFilled(n.diffusion_id) ? diffName(diff, n.diffusion_id) : '';
  return `
    <a class="card" href="actualites.html?id=${encodeURIComponent(n.id)}">
      <div class="card-meta">${badge(n.type)}<span>${esc(fmtDate(n.date))}</span></div>
      <h3 class="card-title">${esc(n.titre)}</h3>
      ${isFilled(n.resume) ? `<p class="card-text">${esc(n.resume)}</p>` : ''}
      <div class="card-foot card-meta">
        ${chan ? `<span>${esc(chan)}</span>` : ''}
        <span class="link-arrow" style="margin-left:auto">Lire ${icon('arrow-right')}</span>
      </div>
    </a>`;
}

/* ---------- Pages ---------- */
async function pageHome() {
  const [news, docs, diff, regs] = await Promise.all([loadNews(), loadDocs(), loadDiff(), loadChannels()]);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  const activeDiff = diff.data.filter(d => !isChanArchived(d, regs.data));
  const tv = activeDiff.filter(d => String(d.role).toUpperCase() === 'TV').length;
  const rdo = activeDiff.filter(d => String(d.role).toUpperCase() === 'RDO').length;
  set('stat-tv', diff.ok ? tv : '—');
  set('stat-rdo', diff.ok ? rdo : '—');
  set('stat-dec', news.ok ? news.data.filter(isDecision).length : '—');
  set('stat-doc', docs.ok ? docs.data.length : '—');

  const box = $('#home-news');
  if (!box) return;
  if (!news.ok) { box.innerHTML = unavailable('Les annonces sont'); return; }
  if (!news.data.length) { box.innerHTML = emptyBox('Aucune annonce publiée pour le moment.'); return; }
  box.innerHTML = news.data.slice(0, 3).map(n => newsCard(n, diff.data)).join('');
}

async function pageNews() {
  const root = $('#news-root');
  const [news, diff] = await Promise.all([loadNews(), loadDiff()]);
  if (!news.ok) { root.innerHTML = unavailable('Les annonces sont'); return; }

  const id = new URLSearchParams(location.search).get('id');
  if (id) {
    const n = news.data.find(x => String(x.id) === String(id));
    if (!n) { root.innerHTML = emptyBox('Cette annonce est introuvable ou n’est plus publiée.') + `<p style="margin-top:20px"><a class="link-arrow" href="actualites.html">${icon('arrow-left')} Toutes les annonces</a></p>`; return; }
    document.title = `${n.titre} — CRAN`;
    const pt = $('#page-title'), pl = $('#page-lead');
    if (pt) pt.textContent = n.titre;
    if (pl) pl.hidden = true;
    const chan = isFilled(n.diffusion_id) ? diffName(diff.data, n.diffusion_id) : '';
    const paras = String(n.contenu || n.resume || '').split(/\n{1,}/).map(s => s.trim()).filter(Boolean);
    root.innerHTML = `
      <article class="article">
        <a class="link-arrow" href="actualites.html">${icon('arrow-left')} Toutes les annonces</a>
        <div class="facts">
          <div><b>Type</b>${badge(n.type) || '—'}</div>
          <div><b>Date</b>${esc(fmtDate(n.date))}</div>
          ${isDecision(n) ? `<div><b>Décision n°</b>${esc(n.numero_decision)}</div>` : ''}
          ${chan ? `<div><b>Chaîne / station</b>${esc(chan)}</div>` : ''}
        </div>
        <div class="prose">${paras.map(p => `<p>${esc(p)}</p>`).join('') || '<p>—</p>'}</div>
        ${chan ? `<p style="margin-top:32px"><a class="btn btn--outline" href="decisions.html?chaine=${encodeURIComponent(n.diffusion_id)}">Décisions concernant ${esc(chan)} ${icon('arrow-right')}</a></p>` : ''}
      </article>`;
    return;
  }

  if (!news.data.length) { root.innerHTML = emptyBox('Aucune annonce publiée pour le moment.'); return; }
  const types = [...new Set(news.data.map(n => n.type).filter(isFilled))];
  root.innerHTML = `
    <div class="chips" id="news-chips" role="group" aria-label="Filtrer par type">
      <button class="chip is-active" data-type="">Toutes</button>
      ${types.map(t => `<button class="chip" data-type="${esc(t)}">${esc(t)}</button>`).join('')}
    </div>
    <div class="grid" id="news-grid"></div>`;
  const grid = $('#news-grid');
  const draw = type => {
    const list = news.data.filter(n => !type || n.type === type);
    grid.innerHTML = list.length ? list.map(n => newsCard(n, diff.data)).join('') : emptyBox('Aucune annonce de ce type.');
  };
  $('#news-chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    document.querySelectorAll('#news-chips .chip').forEach(c => c.classList.toggle('is-active', c === b));
    draw(b.dataset.type);
  });
  draw('');
}

async function pageDecisions() {
  const root = $('#dec-root');
  const [news, diff] = await Promise.all([loadNews(), loadDiff()]);
  if (!news.ok) { root.innerHTML = unavailable('Le registre est'); return; }
  const all = news.data.filter(isDecision);
  if (!all.length) { root.innerHTML = emptyBox('Aucune décision publiée pour le moment.'); return; }

  const types = [...new Set(all.map(n => n.type).filter(isFilled))];
  const chanIds = [...new Set(all.map(n => String(n.diffusion_id)).filter(v => isFilled(v)))];
  const pre = new URLSearchParams(location.search).get('chaine') || '';

  root.innerHTML = `
    <div class="toolbar">
      <div class="field"><label class="sr-only" for="f-type">Type de décision</label>
        <select id="f-type"><option value="">Tous les types</option>${types.map(t => `<option>${esc(t)}</option>`).join('')}</select></div>
      <div class="field"><label class="sr-only" for="f-chan">Chaîne ou station</label>
        <select id="f-chan"><option value="">Toutes les chaînes et stations</option>${chanIds.map(i => `<option value="${esc(i)}" ${i === pre ? 'selected' : ''}>${esc(diffName(diff.data, i) || 'Chaîne ' + i)}</option>`).join('')}</select></div>
      <span class="count" id="dec-count"></span>
    </div>
    <div class="register" id="dec-list"></div>`;

  const draw = () => {
    const t = $('#f-type').value, c = $('#f-chan').value;
    const list = all.filter(n => (!t || n.type === t) && (!c || String(n.diffusion_id) === c));
    $('#dec-count').textContent = `${list.length} décision${list.length > 1 ? 's' : ''}`;
    $('#dec-list').innerHTML = list.length ? `
      <div class="reg-head"><span>N° de décision</span><span>Date</span><span>Type</span><span>Objet</span><span></span></div>
      ${list.map(n => `
        <a class="reg-row" href="actualites.html?id=${encodeURIComponent(n.id)}">
          <span class="reg-num">${esc(n.numero_decision)}</span>
          <span>${esc(fmtDateShort(n.date))}</span>
          <span>${badge(n.type)}</span>
          <span class="reg-obj">${esc(n.titre)}${isFilled(n.diffusion_id) && diffName(diff.data, n.diffusion_id) ? `<small>${esc(diffName(diff.data, n.diffusion_id))}</small>` : ''}</span>
          <span class="reg-arrow">${icon('arrow-right')}</span>
        </a>`).join('')}` : emptyBox('Aucune décision ne correspond à ces filtres.');
  };
  $('#f-type').addEventListener('change', draw);
  $('#f-chan').addEventListener('change', draw);
  draw();
}

async function pageDocs() {
  const root = $('#docs-root');
  const docs = await loadDocs();
  if (!docs.ok) { root.innerHTML = unavailable('Les dossiers sont'); return; }
  if (!docs.data.length) { root.innerHTML = emptyBox('Aucun dossier disponible pour le moment.'); return; }

  const list = docs.data.slice().sort((a, b) => (Number(a.ordre) || 0) - (Number(b.ordre) || 0) || String(b.date || '').localeCompare(String(a.date || '')) || Number(b.id) - Number(a.id));
  const cats = [...new Set(list.map(d => isFilled(d.categorie) ? d.categorie : 'Autres'))];
  const params = new URLSearchParams(location.search);
  let cat = params.get('categorie') || '';
  if (cat && !cats.includes(cat)) cat = '';

  root.innerHTML = `
    <div class="toolbar">
      <div class="field" style="flex:1;min-width:240px"><label class="sr-only" for="q">Rechercher un dossier</label>
        <input id="q" type="search" placeholder="Rechercher un dossier (titre, mot-clé…)"></div>
      <span class="count" id="docs-count"></span>
    </div>
    <div class="chips" id="docs-chips" role="group" aria-label="Filtrer par catégorie">
      <button class="chip ${cat ? '' : 'is-active'}" data-cat="">Tous</button>
      ${cats.map(c => `<button class="chip ${c === cat ? 'is-active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div id="docs-list"></div>`;

  const draw = () => {
    const q = norm($('#q').value);
    const filtered = list.filter(d => {
      const c = isFilled(d.categorie) ? d.categorie : 'Autres';
      return (!cat || c === cat) && (!q || norm(`${d.titre} ${d.description} ${c}`).includes(q));
    });
    $('#docs-count').textContent = `${filtered.length} dossier${filtered.length > 1 ? 's' : ''}`;
    if (!filtered.length) { $('#docs-list').innerHTML = emptyBox('Aucun dossier ne correspond à votre recherche.'); return; }
    const groups = cats.filter(c => filtered.some(d => (isFilled(d.categorie) ? d.categorie : 'Autres') === c));
    $('#docs-list').innerHTML = groups.map(c => `
      <section class="doc-group">
        <h2>${esc(c)}</h2>
        ${filtered.filter(d => (isFilled(d.categorie) ? d.categorie : 'Autres') === c).map(d => {
          const meta = [isFilled(d.format) ? String(d.format).toUpperCase() : '', isFilled(d.taille) ? d.taille : '', isFilled(d.date) ? 'Mis à jour le ' + fmtDate(d.date) : ''].filter(Boolean).join(' · ');
          return `
          <div class="doc">
            <div class="tile-icon tile-icon--lt">${icon('file')}</div>
            <div>
              <p class="doc-title">${esc(d.titre)}</p>
              ${isFilled(d.description) ? `<p class="doc-desc">${esc(d.description)}</p>` : ''}
              ${meta ? `<p class="doc-meta">${esc(meta)}</p>` : ''}
            </div>
            <a class="btn btn--sm" href="${esc(safeUrl(d.url))}" target="_blank" rel="noopener noreferrer">${icon('download')} Télécharger</a>
          </div>`;
        }).join('')}
      </section>`).join('');
  };
  $('#q').addEventListener('input', draw);
  $('#docs-chips').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    cat = b.dataset.cat;
    document.querySelectorAll('#docs-chips .chip').forEach(c => c.classList.toggle('is-active', c === b));
    draw();
  });
  draw();
}

async function pageChains() {
  const root = $('#chain-root');
  const [diff, regs, news] = await Promise.all([loadDiff(), loadChannels(), loadNews()]);
  if (!diff.ok) { root.innerHTML = unavailable('La liste des chaînes et stations est'); return; }
  if (!diff.data.length) { root.innerHTML = emptyBox('Aucune chaîne ni station enregistrée.'); return; }

  const reg = id => regs.data.find(r => String(r.diffusion_id) === String(id)) || null;
  const nbDec = id => news.data.filter(n => isDecision(n) && String(n.diffusion_id) === String(id)).length;

  const card = (d, archived = false) => {
    const r = reg(d.id), n = nbDec(d.id);
    const statutLabel = (r && isFilled(r.statut)) ? r.statut : (archived ? 'Archivée' : '');
    const rows = r ? [
      ['N° d’autorisation', r.numero_autorisation],
      ['Autorisée le', isFilled(r.date_autorisation) ? fmtDate(r.date_autorisation) : ''],
      ['Responsable', r.responsable]
    ].filter(x => isFilled(x[1])) : [];
    return `
      <article class="card card--hover" ${archived ? 'style="opacity:.82"' : ''}>
        <div class="chan-logo ${isFilled(d.logo) ? '' : 'chan-logo--empty'}">${isFilled(d.logo) ? `<img src="${esc(d.logo)}" alt="${esc(d.nom)}" loading="lazy" ${archived ? 'style="filter:grayscale(100%)"' : ''}>` : esc(d.nom)}</div>
        <div class="card-meta">${statutLabel ? badge(statutLabel) : ''}</div>
        <h3 class="card-title">${esc(d.nom)}</h3>
        ${rows.length ? `<dl class="dl">${rows.map(x => `<dt>${esc(x[0])}</dt><dd>${esc(x[1])}</dd>`).join('')}</dl>` : ''}
        ${r && isFilled(r.notes) ? `<p class="card-text">${esc(r.notes)}</p>` : ''}
        <div class="card-foot">
          ${n ? `<a class="link-arrow" href="decisions.html?chaine=${encodeURIComponent(d.id)}">${n} décision${n > 1 ? 's' : ''} ${icon('arrow-right')}</a>` : `<span class="card-meta">Aucune décision enregistrée</span>`}
        </div>
      </article>`;
  };

  const active = diff.data.filter(d => !isChanArchived(d, regs.data));
  const archived = diff.data.filter(d => isChanArchived(d, regs.data));

  const tv = active.filter(d => String(d.role).toUpperCase() === 'TV');
  const rdo = active.filter(d => String(d.role).toUpperCase() === 'RDO');

  root.innerHTML = `
    ${tv.length ? `<h2 class="sub-title">${icon('tv')} Télévision</h2><div class="grid" style="margin-bottom:48px">${tv.map(d => card(d, false)).join('')}</div>` : ''}
    ${rdo.length ? `<h2 class="sub-title">${icon('radio')} Stations de radio</h2><div class="grid" style="margin-bottom:48px">${rdo.map(d => card(d, false)).join('')}</div>` : ''}
    <h2 class="sub-title">${icon('archive')} Archives</h2>
    ${archived.length
      ? `<div class="grid">${archived.map(d => card(d, true)).join('')}</div>`
      : emptyBox('Aucune chaîne ni station archivée pour le moment.')}
  `;
}

async function pageReport() {
  const [diff, regs] = await Promise.all([loadDiff(), loadChannels()]);
  const sel = $('#r-chan');
  const activeDiff = diff.data.filter(d => !isChanArchived(d, regs.data));
  const opts = activeDiff.map(d => `<option>${esc(d.nom)}</option>`).join('');
  sel.innerHTML = `<option value="">— Choisir —</option>${opts}<option>Autre / je ne sais pas</option>`;
  const pre = new URLSearchParams(location.search).get('chaine');
  if (pre) { const name = diffName(activeDiff, pre); if (name) sel.value = name; }

  const form = $('#report-form');
  const status = $('#r-status');
  const val = id => ($('#' + id).value || '').trim();

  const build = () => {
    const subject = `[CRAN] Signalement — ${val('r-chan')}`;
    const body = [
      'SIGNALEMENT ADRESSÉ AU CRAN',
      '',
      `Chaîne / station : ${val('r-chan')}`,
      `Motif : ${val('r-motif')}`,
      `Date et heure du contenu : ${val('r-date') || 'non précisé'}`,
      `Lien / référence : ${val('r-link') || 'non précisé'}`,
      '',
      'Description :',
      val('r-desc'),
      '',
      `Signalé par : ${val('r-name') || 'anonyme'}${val('r-contact') ? ' — ' + val('r-contact') : ''}`
    ].join('\n');
    return { subject, body };
  };
  const validate = () => {
    let ok = true;
    [['r-chan', v => v], ['r-motif', v => v], ['r-desc', v => v.length >= 20]].forEach(([id, test]) => {
      const good = !!test(val(id));
      $('#' + id).closest('.field').classList.toggle('invalid', !good);
      if (!good) ok = false;
    });
    return ok;
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) { status.hidden = true; return; }
    const { subject, body } = build();
    status.hidden = false;
    status.textContent = 'Votre application de messagerie va s’ouvrir avec le signalement prêt à envoyer à ' + CRAN_MAIL + '.';
    window.location.href = `mailto:${CRAN_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
  $('#r-copy').addEventListener('click', async () => {
    if (!validate()) { status.hidden = true; return; }
    const { subject, body } = build();
    status.hidden = false;
    try { await navigator.clipboard.writeText(`À : ${CRAN_MAIL}\nObjet : ${subject}\n\n${body}`); status.textContent = 'Message copié. Collez-le dans un e-mail adressé à ' + CRAN_MAIL + '.'; }
    catch (err) { status.textContent = 'Copie impossible depuis ce navigateur. Utilisez le bouton « Envoyer par e-mail ».'; }
  });
}

/* ---------- Initialisation ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const burger = $('#burger'), menu = $('#mobile-menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.innerHTML = icon(open ? 'x' : 'menu');
    });
  }
  const pages = { home: pageHome, news: pageNews, decisions: pageDecisions, docs: pageDocs, chains: pageChains, report: pageReport };
  const fn = pages[document.body.dataset.page];
  if (fn) fn();
});
