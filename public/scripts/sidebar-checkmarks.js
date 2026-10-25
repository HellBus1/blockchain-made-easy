/**
 * Learning Progress Indicator System for Blockchain Made Easy
 * Dynamically renders progress widgets, sidebar meters, chapter badges,
 * and header status using the cryptographic learning chain from localStorage.
 */
(function () {
  const TOTAL_TRACK1 = 9;
  const TOTAL_TRACK2 = 6;
  const TOTAL_CURRICULUM = TOTAL_TRACK1 + TOTAL_TRACK2;

  const TRACK1_MAP = {
    '01-what-money-really-is': 'foundations-01',
    '02-the-double-spend-problem': 'foundations-02',
    '03-the-shared-notebook': 'foundations-03',
    '04-gossip-protocol': 'foundations-04',
    '05-cryptographic-hashing': 'foundations-05',
    '06-blocks-and-blockchain': 'foundations-06',
    '07-pow-vs-pos': 'foundations-07',
    '08-minting-and-halving': 'foundations-08',
    '09-alice-to-bob-walkthrough': 'foundations-09',
  };

  const TRACK2_MAP = {
    '01-keys-and-addresses': 'wallets-01',
    '02-seed-phrases': 'wallets-02',
    '03-custodial-vs-self-custody': 'wallets-03',
    '04-hot-cold-hardware-wallets': 'wallets-04',
    '05-sending-safely': 'wallets-05',
    '06-scams-and-security': 'wallets-06',
  };

  const ALL_CHAPTERS_MAP = { ...TRACK1_MAP, ...TRACK2_MAP };

  function getCompletedChapterIds() {
    try {
      const raw = localStorage.getItem('bme_learning_chain');
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.map((block) => block.chapterId));
    } catch {
      return new Set();
    }
  }

  function updateSidebarAndProgress() {
    const completed = getCompletedChapterIds();
    const track1Count = Object.values(TRACK1_MAP).filter((id) => completed.has(id)).length;
    const track2Count = Object.values(TRACK2_MAP).filter((id) => completed.has(id)).length;
    const totalCompleted = track1Count + track2Count;
    const progressPct = Math.round((totalCompleted / TOTAL_CURRICULUM) * 100);
    const currentPath = window.location.pathname;

    // 1. Sidebar Progress Card
    const sidebar = document.getElementById('starlight__sidebar') || document.querySelector('aside.sidebar, .sidebar-pane');
    if (sidebar) {
      let card = sidebar.querySelector('.bme-sidebar-progress-card');
      if (!card) {
        card = document.createElement('div');
        card.className = 'bme-sidebar-progress-card';
        const firstChild = sidebar.firstElementChild;
        if (firstChild) {
          sidebar.insertBefore(card, firstChild);
        } else {
          sidebar.appendChild(card);
        }
      }

      card.innerHTML = `
        <div class="bme-progress-header">
          <span class="bme-progress-title">⛓️ Learning Progress</span>
          <span class="bme-progress-pct">${progressPct}%</span>
        </div>
        <div class="bme-progress-bar-bg">
          <div class="bme-progress-bar-fill" style="width: ${progressPct}%"></div>
        </div>
        <div class="bme-progress-footer">
          <span>${totalCompleted} of ${TOTAL_CURRICULUM} Blocks Mined</span>
          <a href="/dashboard/" class="bme-progress-link">Ledger ↗</a>
        </div>
      `;
    }

    // 2. Track Header Progress Badges
    const summaries = document.querySelectorAll('summary, .sidebar-group-label');
    summaries.forEach((el) => {
      const text = el.textContent || '';
      if (text.includes('Track 1: Foundations')) {
        let badge = el.querySelector('.bme-track-count');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'bme-track-count';
          el.appendChild(badge);
        }
        badge.textContent = `(${track1Count}/${TOTAL_TRACK1})`;
      } else if (text.includes('Track 2: Wallets & Security')) {
        let badge = el.querySelector('.bme-track-count');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'bme-track-count';
          el.appendChild(badge);
        }
        badge.textContent = `(${track2Count}/${TOTAL_TRACK2})`;
      }
    });

    // 3. Chapter Links Status Icons (✓ Sealed, ● Active Reading, ○ Pending)
    const links = document.querySelectorAll('nav a, aside a, .sidebar-content a');
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      let matchedChapterId = null;

      for (const [slug, id] of Object.entries(ALL_CHAPTERS_MAP)) {
        if (href.includes(slug)) {
          matchedChapterId = id;
          break;
        }
      }

      if (!matchedChapterId) return;

      const isCompleted = completed.has(matchedChapterId);
      const isCurrent = currentPath.includes(href) || (href.length > 2 && currentPath.endsWith(href));
      
      let badge = link.querySelector('.bme-check-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'bme-check-badge';
        link.appendChild(badge);
      }

      if (isCompleted) {
        badge.className = 'bme-check-badge bme-completed';
        badge.textContent = '✓';
        badge.title = 'Block Mined & Sealed';
        badge.setAttribute('aria-label', 'Completed');
      } else if (isCurrent) {
        badge.className = 'bme-check-badge bme-current';
        badge.textContent = '●';
        badge.title = 'Current Chapter';
        badge.setAttribute('aria-label', 'In Progress');
      } else {
        badge.className = 'bme-check-badge bme-pending';
        badge.textContent = '○';
        badge.title = 'Unsealed Block';
        badge.setAttribute('aria-label', 'Not Started');
      }
    });

    // 4. Header Top Navbar Progress Pill
    const headerContainer = document.querySelector('.header .sl-flex') || document.querySelector('header .sl-flex');
    if (headerContainer) {
      let headerPill = document.getElementById('bme-header-pill');
      if (!headerPill) {
        headerPill = document.createElement('a');
        headerPill.id = 'bme-header-pill';
        headerPill.href = '/dashboard/';
        headerPill.className = 'bme-header-progress-pill';
        headerPill.title = 'View your cryptographic learning chain on the dashboard';
        headerContainer.appendChild(headerPill);
      }
      headerPill.innerHTML = `
        <span class="bme-pill-dot ${totalCompleted > 0 ? 'bg-emerald-500' : 'bg-primary'}"></span>
        <span class="bme-pill-text">Chain: <strong>${totalCompleted}/${TOTAL_CURRICULUM}</strong> (${progressPct}%)</span>
      `;
    }
  }

  // Hook into lifecycle events
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', updateSidebarAndProgress);
    document.addEventListener('astro:page-load', updateSidebarAndProgress);
    window.addEventListener('bme:chain-updated', updateSidebarAndProgress);
    window.addEventListener('storage', updateSidebarAndProgress);
  }
})();
