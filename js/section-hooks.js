// js/section-hooks.js
(() => {
  let isDelegated = false;

  function getTogglePanel(button) {
    const selector = button && button.getAttribute('data-toggle');
    return selector ? document.querySelector(selector) : null;
  }

  function syncToggleButtons() {
    document.querySelectorAll('[data-toggle]').forEach((button) => {
      const selector = button.getAttribute('data-toggle');
      const panel = getTogglePanel(button);
      const expanded = Boolean(panel) && !panel.classList.contains('hidden');
      button.setAttribute('aria-expanded', expanded ? 'true' : 'false');

      if (selector && selector.startsWith('#') && !button.hasAttribute('aria-controls')) {
        button.setAttribute('aria-controls', selector.slice(1));
      }
    });
  }

  function collapseToggleGroup(groupName, exceptButton) {
    if (!groupName) return;

    document.querySelectorAll('[data-toggle-group]').forEach((button) => {
      if (button === exceptButton) return;
      if (button.getAttribute('data-toggle-group') !== groupName) return;

      const panel = getTogglePanel(button);
      if (panel) panel.classList.add('hidden');
      button.setAttribute('aria-expanded', 'false');
    });
  }

  function bindDelegation() {
    if (isDelegated) return;
    isDelegated = true;

    document.addEventListener('click', async (e) => {
      const target = e.target.closest('[data-toggle],[data-copy]');
      if (!target) return;

      const toggleSelector = target.getAttribute('data-toggle');
      if (toggleSelector) {
        e.preventDefault();

        const panel = document.querySelector(toggleSelector);
        if (!panel) return;

        const opening = panel.classList.contains('hidden');
        const groupName = target.getAttribute('data-toggle-group') || (toggleSelector.startsWith('#abs-') ? 'abstracts' : '');

        if (opening && groupName) {
          collapseToggleGroup(groupName, target);
        }

        panel.classList.toggle('hidden');
        syncToggleButtons();
        return;
      }

      const copySelector = target.getAttribute('data-copy');
      if (copySelector) {
        e.preventDefault();
        const source = document.querySelector(copySelector);
        if (!source) return;

        const text = source.innerText || source.textContent || '';

        try {
          await navigator.clipboard.writeText(text);
          const oldText = target.textContent;
          target.textContent = 'Copied!';
          setTimeout(() => (target.textContent = oldText), 1200);
        } catch {
          window.prompt('Copy to clipboard:', text);
        }
      }
    });
  }

  window.syncToggleButtons = syncToggleButtons;

  window.sectionHooks = {
    personal() {
      bindDelegation();
      syncToggleButtons();
    },
    research() {
      bindDelegation();
      syncToggleButtons();
    },
    news() {
      bindDelegation();
      syncToggleButtons();
      if (window.setupNewsPage) return window.setupNewsPage();
    },
    quantum({ anchor } = {}) {
      bindDelegation();
      syncToggleButtons();
      if (window.setupQuantumPage) return window.setupQuantumPage({ anchor });
    },
    'paper-discovery'() {
      if (window.setupPapersDiscovery) return window.setupPapersDiscovery();
    },
  };
})();
