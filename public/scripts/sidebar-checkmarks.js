/**
 * Sidebar Checkmarks for Blockchain Made Easy
 * Dynamically marks completed chapters in the Starlight sidebar
 * using the cryptographic learning chain from localStorage.
 */
(function () {
  const CHAPTER_MAP = {
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

  function updateSidebarCheckmarks() {
    const completed = getCompletedChapterIds();
    const links = document.querySelectorAll('nav a, aside a, .sidebar-content a');

    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      let matchedChapterId = null;

      for (const [slug, id] of Object.entries(CHAPTER_MAP)) {
        if (href.includes(slug)) {
          matchedChapterId = id;
          break;
        }
      }

      if (!matchedChapterId) return;

      const isCompleted = completed.has(matchedChapterId);
      const existingBadge = link.querySelector('.bme-check-badge');

      if (isCompleted) {
        if (!existingBadge) {
          const badge = document.createElement('span');
          badge.className = 'bme-check-badge';
          badge.textContent = '✓';
          badge.title = 'Block Mined & Sealed';
          badge.setAttribute('aria-label', 'Completed');
          link.appendChild(badge);
        }
      } else if (existingBadge) {
        existingBadge.remove();
      }
    });
  }

  // Hook into lifecycle events
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', updateSidebarCheckmarks);
    document.addEventListener('astro:page-load', updateSidebarCheckmarks);
    window.addEventListener('bme:chain-updated', updateSidebarCheckmarks);
    window.addEventListener('storage', updateSidebarCheckmarks);
  }
})();
