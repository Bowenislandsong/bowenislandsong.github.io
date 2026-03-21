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

  // --- Public hooks for router ---
  window.sectionHooks = {
    personal() {
      bindDelegation();
      // Ensure only one abstract is visible on load (e.g., after deep link)
      collapseOtherAbstracts();
    },
    research() {
      bindDelegation();
      collapseOtherAbstracts();
    },
    quantum({ anchor } = {}) {
      bindDelegation();
      if (window.setupQuantumPage) return window.setupQuantumPage({ anchor });
    },
    'paper-discovery'() {
      if (window.setupPapersDiscovery) return window.setupPapersDiscovery();
    },
  };
})();
