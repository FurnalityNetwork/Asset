/**
 * FURNALITY NETWORK — CLIENT-SIDE ARCHITECTURE
 * Intégration Cloudflare Workers / D1 & Navigation
 */

// Remplacez par l'URL officielle de votre Cloudflare Worker une fois déployé
const CLOUDFLARE_WORKER_URL = 'https://furnality-api.<votre-sous-domaine>.workers.dev';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Menu Mobile
  initMobileMenu();

  // 3. Navigation Dynamique du Footer depuis Cloudflare D1
  if (document.getElementById('footer-furnality')) {
    loadFooterLinks();
  }
});

function initMobileMenu() {
  const menuToggle = document.getElementById('menu-button') || document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }
}

async function loadFooterLinks() {
  try {
    const res = await fetch(`${CLOUDFLARE_WORKER_URL}/api/footer-links`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    
    const data = await res.json();

    const furnalityNav = document.getElementById('footer-furnality');
    const officeNav = document.getElementById('footer-office');
    const channelsNav = document.getElementById('footer-channels');

    if (furnalityNav) furnalityNav.innerHTML = '';
    if (officeNav) officeNav.innerHTML = '';
    if (channelsNav) channelsNav.innerHTML = '';

    data.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'footer-link';
      a.textContent = link.label;

      if (link.id >= 1000 && link.id < 2000 && furnalityNav) {
        furnalityNav.appendChild(a);
      } else if (link.id >= 2000 && link.id < 3000 && officeNav) {
        officeNav.appendChild(a);
      } else if (link.id >= 3000 && channelsNav) {
        channelsNav.appendChild(a);
      }
    });
  } catch (err) {
    console.error('Erreur de chargement du pied de page via Cloudflare:', err);
  }
}
