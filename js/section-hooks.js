// js/section-hooks.js
(() => {
  let isDelegated = false;

  // Collapse all abstract panels except an optional target selector
  function collapseOtherAbstracts(exceptSel) {
    const all = document.querySelectorAll('[id^="abs-"]');
    all.forEach(el => {
      if (!exceptSel || !el.matches(exceptSel)) el.classList.add('hidden');
    });

    // Sync aria-expanded on any abstract toggle buttons
    const allBtns = document.querySelectorAll('[data-toggle^="#abs-"]');
    allBtns.forEach(btn => {
      const sel = btn.getAttribute('data-toggle');
      const panel = sel ? document.querySelector(sel) : null;
      btn.setAttribute('aria-expanded', panel && !panel.classList.contains('hidden') ? 'true' : 'false');
    });
  }

  function bindDelegation() {
    if (isDelegated) return;
    isDelegated = true;

    document.addEventListener('click', async (e) => {
      const t = e.target.closest('[data-toggle],[data-copy]');
      if (!t) return;

      // --- Toggle / Abstract handling ---
      const toggleSel = t.getAttribute('data-toggle');
      if (toggleSel) {
        e.preventDefault();
        const el = document.querySelector(toggleSel);
        if (!el) return;

        const isAbstract = toggleSel.startsWith('#abs-');
        const currentlyHidden = el.classList.contains('hidden');

        if (isAbstract) {
          // If opening a new abstract, collapse others first
          if (currentlyHidden) {
            collapseOtherAbstracts(toggleSel);
            el.classList.remove('hidden');           // open the requested one
            t.setAttribute('aria-expanded', 'true');
          } else {
            // Clicking the same open abstract closes it
            el.classList.add('hidden');
            t.setAttribute('aria-expanded', 'false');
          }
        } else {
          // Generic toggles (non-abstract)
          el.classList.toggle('hidden');
          t.setAttribute('aria-expanded', el.classList.contains('hidden') ? 'false' : 'true');
        }
        return;
      }

      // --- Copy BibTeX / Cite (or any text target) ---
      const copySel = t.getAttribute('data-copy');
      if (copySel) {
        e.preventDefault();
        const src = document.querySelector(copySel);
        if (!src) return;
        const txt = src.innerText || src.textContent || '';

        try {
          await navigator.clipboard.writeText(txt);
          const old = t.textContent;
          t.textContent = 'Copied!';
          setTimeout(() => (t.textContent = old), 1200);
        } catch {
          // Fallback
          window.prompt('Copy to clipboard:', txt);
        }
      }
    });
  }

  // --- GitHub publications auto-loader (Personal page only) ---
  async function loadPubs() {
    const GH_USER = 'Bowenislandsong';
    const GH_REPO = 'bowenislandsong.github.io';
    const GH_BRANCH = 'main';
    const API_URL = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/papers?ref=${GH_BRANCH}`;

    const wrap = document.getElementById('pub-list');
    const hint = document.getElementById('pub-hint');
    if (!wrap) return;

    try {
      const res = await fetch(API_URL, { headers: { Accept: 'application/vnd.github.v3+json' } });
      if (!res.ok) throw new Error('GitHub API not ok');
      const files = await res.json();
      const items = (Array.isArray(files) ? files : []).filter(f => /\.(pdf|bib|tex)$/i.test(f.name));
      if (items.length === 0) {
        hint?.classList.remove('hidden');
        return;
      }

      items.sort((a, b) => a.name.localeCompare(b.name));
      const frag = document.createDocumentFragment();

      for (const f of items) {
        const card = document.createElement('div');
        card.className = 'rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4';
        const title = f.name.replace(/_/g, ' ').replace(/\.(pdf|bib|tex)$/i, '');
        const fileUrl = `https://${GH_USER}.github.io/publications/${encodeURIComponent(f.name)}`;
        const rawUrl  = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/${GH_BRANCH}/publications/${encodeURIComponent(f.name)}`;
        card.innerHTML = `
          <div class="min-w-0">
            <h3 class="font-medium truncate">${title}</h3>
            <p class="text-xs text-slate-500 truncate">publications/${f.name}</p>
          </div>
          <div class="flex flex-wrap gap-2 text-sm shrink-0">
            <a class="underline" href="${fileUrl}" target="_blank" rel="noopener">Open</a>
            <a class="underline" href="${rawUrl}" target="_blank" rel="noopener">Raw</a>
            <a class="underline" href="${fileUrl}?download=1" download>Download</a>
          </div>`;
        frag.appendChild(card);
      }
      wrap.appendChild(frag);
    } catch (e) {
      hint?.classList.remove('hidden');
      const err = document.createElement('p');
      err.className = 'text-sm text-red-600 mt-2';
      err.textContent = 'Could not load publications from GitHub. Try refreshing, or ensure publications/ exists and is public.';
      wrap.appendChild(err);
    }
  }

  // --- Public hooks for router ---
  window.sectionHooks = {
    personal() {
      bindDelegation();
      loadPubs();
      // Ensure only one abstract is visible on load (e.g., after deep link)
      collapseOtherAbstracts();
    },
    quantum() {
      bindDelegation();
      // Mount QuantumPage if available
      const root = document.querySelector('.qfx');
      if (window.QuantumPage && root) window.QuantumPage.mount(root);
    },
    genai() {
      bindDelegation();
    },
    health() {
      bindDelegation();
    },
    music() {
      bindDelegation();
    },
    classes() {
      // No delegation needed, just load the PDF viewer logic
      if (window.setupClassesViewer) window.setupClassesViewer();
    },
  };
})();
