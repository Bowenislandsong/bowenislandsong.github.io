// js/section-hooks.js
(() => {
  let isDelegated = false;
  const INTERACTIVE_CLICK_TARGETS = 'a, button, input, textarea, select, label, summary, [contenteditable="true"]';

  function getTogglePanel(button) {
    const selector = button && button.getAttribute('data-toggle');
    return selector ? document.querySelector(selector) : null;
  }

  function findDetailsButton(container) {
    if (!container) return null;

    const explicitSelector = container.getAttribute && container.getAttribute('data-card-toggle');
    if (explicitSelector) {
      return container.querySelector(`[data-toggle="${explicitSelector}"]`) || document.querySelector(`[data-toggle="${explicitSelector}"]`);
    }

    return container.querySelector('button[data-toggle]') || null;
  }

  function hasActiveSelection() {
    const selection = window.getSelection && window.getSelection();
    return Boolean(selection && String(selection).trim());
  }

  function toggleDisclosure(button) {
    const toggleSelector = button && button.getAttribute('data-toggle');
    if (!toggleSelector) return;

    const panel = document.querySelector(toggleSelector);
    if (!panel) return;

    const opening = panel.classList.contains('hidden');
    const groupName = button.getAttribute('data-toggle-group') || (toggleSelector.startsWith('#abs-') ? 'abstracts' : '');

    if (opening && groupName) {
      collapseToggleGroup(groupName, button);
    }

    panel.classList.toggle('hidden');
    syncToggleButtons();
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

      const collapsedLabel = button.getAttribute('data-toggle-label-collapsed');
      const expandedLabel = button.getAttribute('data-toggle-label-expanded');
      if (collapsedLabel && expandedLabel) {
        button.textContent = expanded ? expandedLabel : collapsedLabel;
      }
    });

    document.querySelectorAll('[data-card-toggle], article').forEach((container) => {
      const detailsButton = findDetailsButton(container);
      container.classList.toggle('cursor-pointer', Boolean(detailsButton));
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
      const directInteractive = e.target.closest(INTERACTIVE_CLICK_TARGETS);
      if (directInteractive && !directInteractive.matches('[data-toggle],[data-copy]')) return;

      const target = e.target.closest('[data-toggle],[data-copy],[data-card-toggle],article');
      if (!target) return;

      if (target.matches('[data-card-toggle],article')) {
        if (hasActiveSelection()) return;

        const detailsButton = findDetailsButton(target);
        if (!detailsButton) return;

        e.preventDefault();
        toggleDisclosure(detailsButton);
        return;
      }

      const toggleSelector = target.getAttribute('data-toggle');
      if (toggleSelector) {
        e.preventDefault();
        toggleDisclosure(target);
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
    engineering() {
      bindDelegation();
      syncToggleButtons();
    },
    resources() {
      bindDelegation();
      syncToggleButtons();
    },
    'interview-prep'() {
      if (window.setupInterviewPrep) return window.setupInterviewPrep();
    },
    news() {
      bindDelegation();
      syncToggleButtons();
      if (window.setupNewsPage) return window.setupNewsPage();
    },
    resume() {
      bindDelegation();
      syncToggleButtons();
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
