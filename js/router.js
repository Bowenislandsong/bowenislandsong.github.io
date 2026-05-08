// js/router.js
// Hash router for `#/page#anchor` + smooth in-page anchors.
// Loads partials from /sections/<page>.html into #app and then invokes page hooks.

(() => {
  const APP = document.getElementById('app');
  const subnavPersonal = document.getElementById('personal-subnav');
  const subnavResearch = document.getElementById('research-subnav');
  const subnavNews = document.getElementById('news-subnav');
  const subnavEngineering = document.getElementById('engineering-subnav');
  const subnavInterviewPrep = document.getElementById('interview-prep-subnav');
  const subnavResume = document.getElementById('resume-subnav');
  const subnavResources = document.getElementById('resources-subnav');

  // ---- Config ----
  const DEFAULT_PAGE = 'personal';
  const SECTION_DIR = 'sections';
  const routes = {
    personal: 'sections/personal.html',
    research: 'sections/research.html',
    engineering: 'sections/engineering.html',
    resources: 'sections/resources.html',
    'interview-prep': 'sections/interview-prep.html',
    news: 'sections/news.html',
    resume: 'sections/resume.html',
    quantum: 'sections/quantum.html',
    'paper-discovery': 'sections/paper-discovery.html',
  };
  const routeNames = new Set(Object.keys(routes));
  const resourcePages = new Set(['resources', 'interview-prep', 'quantum', 'paper-discovery']);
  const CACHE_MODE = 'no-store'; // ensure you always see latest
  const SCROLL_BEHAVIOR = 'smooth';

  // ---- State ----
  let currentPage = null;
  let inflightReq = 0;                     // race guard
  const scrollStore = new Map();           // page -> scrollTop
  const loadedPages = new Set();           // basic cache of what's been loaded

  // ---- Utilities ----
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function pageFromHash(rawHash) {
    // Supports: "#/personal#research", "#/paper-discovery", "", "#research" (in-page)
    const raw = rawHash || '';
    if (raw.startsWith('#/')) {
      const noPrefix = raw.slice(2);                   // "personal#research"
      const [page, anchor] = noPrefix.split('#');
      return { page: page || DEFAULT_PAGE, anchor: anchor || '' };
    }
    // No page prefix: treat as anchor on current/default page
    const anchor = raw.replace(/^#/, '');
    return { page: currentPage || DEFAULT_PAGE, anchor };
  }

  function isValidPage(page) {
    return routeNames.has(page);
  }

  function canonicalHash(page, anchor) {
    return `#/` + page + (anchor ? `#${anchor}` : '');
  }

  function highlightNav(page) {
    const navPage = resourcePages.has(page) ? 'resources' : page;
    document.querySelectorAll('.main-nav-btn').forEach(btn => {
      btn.classList.remove('bg-slate-200', 'font-medium');
      if (btn.getAttribute('data-page') === navPage) {
        btn.classList.add('bg-slate-200', 'font-medium');
      }
    });
  }

  function toggleSubnavs(page) {
    if (subnavPersonal) subnavPersonal.classList.toggle('hidden', page !== 'personal');
    if (subnavResearch) subnavResearch.classList.toggle('hidden', page !== 'research');
    if (subnavNews) subnavNews.classList.toggle('hidden', page !== 'news');
    if (subnavEngineering) subnavEngineering.classList.toggle('hidden', page !== 'engineering');
    if (subnavInterviewPrep) subnavInterviewPrep.classList.toggle('hidden', page !== 'interview-prep');
    if (subnavResume) subnavResume.classList.toggle('hidden', page !== 'resume');
    if (subnavResources) subnavResources.classList.toggle('hidden', !['resources', 'quantum', 'paper-discovery'].includes(page));
  }

  function scrollToAnchor(anchor) {
    if (!anchor) {
      window.scrollTo({ top: 0, behavior: SCROLL_BEHAVIOR });
      return;
    }
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: 'start' });
  }

  async function fetchSectionHTML(page) {
    const url = `${SECTION_DIR}/${page}.html`;
    const res = await fetch(url, { cache: CACHE_MODE });
    if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
    return res.text();
  }

  async function loadPage(page) {
    // Save current scroll before navigating away
    if (currentPage) scrollStore.set(currentPage, window.scrollY);

    const reqId = ++inflightReq;
    try {
      const html = await fetchSectionHTML(page);
      if (reqId !== inflightReq) return; // a newer request won

      // Inject HTML. Section partials are markup-only; page init lives in section hooks.
      APP.innerHTML = html;
      currentPage = page;
      loadedPages.add(page);

      toggleSubnavs(page);
      highlightNav(page);

      // Re-typeset math if MathJax is loaded
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([APP]);
      }
    } catch (e) {
      if (reqId !== inflightReq) return;
      APP.innerHTML = `
        <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p class="font-medium">Could not load this section.</p>
          <p class="mt-1">Error: ${e.message}</p>
        </div>`;
      toggleSubnavs(''); // hide subnavs on error
    }
  }

  async function ensurePage(page) {
    if (page === currentPage && APP.children.length) return false;
    await loadPage(page);
    return true;
  }

  async function handleRoute(hash) {
    const parsed = pageFromHash(hash);
    const page = isValidPage(parsed.page) ? parsed.page : DEFAULT_PAGE;
    const anchor = parsed.anchor || '';
    const desiredHash = canonicalHash(page, anchor);

    if (location.hash !== desiredHash) {
      history.replaceState(null, '', desiredHash);
    }

    // Ensure correct page is in the DOM
    const pageChanged = await ensurePage(page);

    // Page hooks own all section-specific boot logic.
    if (window.sectionHooks && typeof window.sectionHooks[page] === 'function') {
      try {
        await window.sectionHooks[page]({ page, anchor, pageChanged });
      } catch (e) {
        console.error('[Router] section hook failed:', e);
      }
    }

    // If returning to a page without an anchor, restore previous scroll
    if (!anchor && pageChanged && scrollStore.has(page)) {
      const y = scrollStore.get(page);
      window.scrollTo({ top: y, behavior: 'auto' });
    } else {
      // Wait 1 frame for layout, then scroll to anchor (if any)
      await sleep(0);
      scrollToAnchor(anchor);
    }

    // Accessibility: focus the main region
    APP.setAttribute('tabindex', '-1');
    APP.focus({ preventScroll: true });
    setTimeout(() => APP.removeAttribute('tabindex'), 100);
  }

  // ---- Prefetch on hover (best-effort) ----
  const prefetch = (() => {
    const queued = new Set();
    return async function(page) {
      if (!page || loadedPages.has(page) || queued.has(page)) return;
      queued.add(page);
      try { await fetch(`${SECTION_DIR}/${page}.html`, { cache: 'force-cache' }); }
      catch { /* ignore */ }
    };
  })();

  function setupPrefetch() {
    document.addEventListener('mouseover', (e) => {
      const a = e.target.closest('a[href^="#/"]');
      if (!a) return;
      const href = a.getAttribute('href');     // "#/quantum" or "#/personal#skills"
      const page = href.slice(2).split('#')[0] || DEFAULT_PAGE;
      if (isValidPage(page)) prefetch(page);
    }, { passive: true });
  }

  // ---- In-page anchor delegation (plain "#anchor") ----
  function setupRouteDelegation() {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = e.target.closest('a[href^="#/"]');
      if (!a) return;
      if (a.target && a.target !== '_self') return;

      const href = a.getAttribute('href');
      if (!href) return;

      e.preventDefault();
      if (location.hash !== href) {
        history.pushState(null, '', href);
      }
      handleRoute(href);
    });
  }

  function setupAnchorDelegation() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');

      // Skip router links "#/..."
      if (href.startsWith('#/')) return;

      // Treat as in-page anchor for the current page
      const anchor = href.slice(1);
      if (!anchor) return;

      // Only intercept when the target anchor exists in current DOM
      const el = document.getElementById(anchor);
      if (!el) return;

      e.preventDefault();
      el.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: 'start' });

      // Keep URL canonical: "#/page#anchor"
      const canonical = `#/` + (currentPage || DEFAULT_PAGE) + (anchor ? `#${anchor}` : '');
      if (location.hash !== canonical) history.replaceState(null, '', canonical);
    }, true);
  }

  // ---- Boot ----
  window.addEventListener('hashchange', () => handleRoute(location.hash));
  window.addEventListener('popstate', () => handleRoute(location.hash));
  window.addEventListener('DOMContentLoaded', () => {
    setupPrefetch();
    setupRouteDelegation();
    setupAnchorDelegation();

    // If no hash, go to default page
    if (!location.hash) {
      history.replaceState(null, '', `#/` + DEFAULT_PAGE);
    }
    handleRoute(location.hash);
  });
})();
