// js/news.js
// Loads short-form site news from /news/index.json and renders
// a featured update, a recent stream, and a year-grouped archive.

(function () {
  'use strict';

  const NEWS_URL = 'news/index.json';
  let cachedNews = null;

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value, options) {
    if (!value) return '';
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-US', options || {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  function getYear(value) {
    if (!value) return 'Older';
    return String(value).slice(0, 4) || 'Older';
  }

  function normalizeNewsData(data) {
    const items = Array.isArray(data && data.items) ? data.items : [];
    const normalizedItems = items
      .filter((item) => item && item.slug && item.title && item.date)
      .map((item) => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags : [],
        body: Array.isArray(item.body) ? item.body : [],
        links: Array.isArray(item.links) ? item.links : [],
        archived: Boolean(item.archived),
      }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));

    return {
      featuredSlug: data && data.featuredSlug ? data.featuredSlug : '',
      items: normalizedItems,
    };
  }

  async function fetchNews() {
    if (cachedNews) return cachedNews;
    const res = await fetch(NEWS_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Could not load ${NEWS_URL} (${res.status})`);
    const data = await res.json();
    cachedNews = normalizeNewsData(data);
    return cachedNews;
  }

  function renderTags(tags) {
    if (!tags.length) return '';
    return `
      <div class="mt-4 flex flex-wrap gap-2">
        ${tags.map((tag) => `<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">${escapeHtml(tag)}</span>`).join('')}
      </div>
    `;
  }

  function renderLinks(links, mode) {
    if (!links.length) return '';
    const className = mode === 'primary'
      ? 'inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800'
      : 'inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50';

    return `
      <div class="mt-5 flex flex-wrap gap-3">
        ${links.map((link) => {
          const href = escapeHtml(link.href || '#');
          const label = escapeHtml(link.label || 'Open');
          const isExternal = /^https?:\/\//i.test(link.href || '');
          const target = isExternal ? ' target="_blank" rel="noopener"' : '';
          const download = link.download ? ' download' : '';
          return `<a href="${href}"${target}${download} class="${className}">${label}</a>`;
        }).join('')}
      </div>
    `;
  }

  function renderMetaRow(item) {
    const rows = [
      { label: 'Posted', value: formatDate(item.date) },
      { label: 'Event', value: item.event_date ? formatDate(item.event_date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '' },
      { label: 'Venue', value: item.venue || '' },
      { label: 'Location', value: item.location || '' },
    ].filter((row) => row.value);

    return `
      <dl class="mt-6 grid gap-4 sm:grid-cols-2">
        ${rows.map((row) => `
          <div class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
            <dt class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">${escapeHtml(row.label)}</dt>
            <dd class="mt-2 text-sm font-semibold text-slate-900">${escapeHtml(row.value)}</dd>
          </div>
        `).join('')}
      </dl>
    `;
  }

  function renderBodyParagraphs(paragraphs) {
    if (!paragraphs.length) return '';
    return paragraphs.map((paragraph) => `
      <p class="mt-3 text-sm leading-6 text-slate-600">
        ${escapeHtml(paragraph)}
      </p>
    `).join('');
  }

  function renderFeaturedDetails(item) {
    if (!item.body.length) return '';
    const panelId = `news-body-${item.slug}`;

    return `
      <div class="mt-5">
        <button
          type="button"
          class="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          data-toggle="#${escapeHtml(panelId)}"
          data-toggle-group="news-featured"
          data-toggle-label-collapsed="Show update details"
          data-toggle-label-expanded="Hide update details"
          aria-controls="${escapeHtml(panelId)}"
          aria-expanded="false"
        >
          Show update details
        </button>
      </div>
      <div id="${escapeHtml(panelId)}" class="mt-4 hidden border-t border-slate-200 pt-4">
        ${renderBodyParagraphs(item.body)}
      </div>
    `;
  }

  function renderFeatured(item) {
    if (!item) {
      return `
        <div class="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-8 text-slate-600">
          No featured update matches the current search.
        </div>
      `;
    }

    return `
      <article class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_90px_-52px_rgba(15,23,42,0.28)]">
        <div class="grid gap-0 lg:grid-cols-[1.02fr,0.98fr]">
          <div class="p-8 md:p-10">
            <div class="flex flex-wrap gap-2">
              <span class="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">${escapeHtml(item.category || 'Update')}</span>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">${escapeHtml(item.status || 'Live')}</span>
            </div>
            <h3 class="mt-5 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">${escapeHtml(item.title)}</h3>
            <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-700">${escapeHtml(item.summary || '')}</p>
            ${renderMetaRow(item)}
            ${renderTags(item.tags)}
            ${renderLinks(item.links, 'primary')}
            ${renderFeaturedDetails(item)}
          </div>

          <div class="border-t border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(255,255,255,1))] p-6 lg:border-l lg:border-t-0 lg:p-8">
            <div class="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_80px_-52px_rgba(15,23,42,0.24)]">
              <img
                src="${escapeHtml(item.poster_image || '')}"
                alt="${escapeHtml(item.poster_alt || item.title)}"
                class="w-full object-cover"
                loading="lazy"
              />
            </div>
            <p class="mt-4 text-sm leading-6 text-slate-600">
              Poster preview for the current announcement. The full PDF stays linked below for direct access.
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <a href="${escapeHtml(item.poster_pdf || '#')}" download class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800">Download poster</a>
              <a href="#/news#archive" class="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50">Jump to archive</a>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  function renderCurrentCard(item) {
    return `
      <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-wrap gap-2">
          <span class="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">${escapeHtml(item.category || 'Update')}</span>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">${escapeHtml(formatDate(item.date))}</span>
        </div>
        <h3 class="mt-3 text-2xl font-semibold text-slate-900">${escapeHtml(item.title)}</h3>
        <p class="mt-3 text-sm leading-6 text-slate-600">${escapeHtml(item.summary || '')}</p>
        ${renderLinks(item.links, 'secondary')}
      </article>
    `;
  }

  function renderArchiveGroup(year, items) {
    return `
      <section class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Archive Year</p>
            <h3 class="mt-2 text-2xl font-semibold text-slate-900">${escapeHtml(year)}</h3>
          </div>
          <p class="text-sm text-slate-500">${items.length} item(s)</p>
        </div>

        <div class="mt-5 space-y-4">
          ${items.map((item) => `
            <article class="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">${escapeHtml(formatDate(item.date))}</span>
                <span class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">${escapeHtml(item.category || 'Update')}</span>
              </div>
              <h4 class="mt-3 text-lg font-semibold text-slate-900">${escapeHtml(item.title)}</h4>
              <p class="mt-2 text-sm leading-6 text-slate-600">${escapeHtml(item.summary || '')}</p>
              ${renderLinks(item.links, 'secondary')}
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function groupArchiveItems(items) {
    const groups = new Map();
    items.forEach((item) => {
      const year = getYear(item.date);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(item);
    });
    return Array.from(groups.entries()).sort((a, b) => String(b[0]).localeCompare(String(a[0])));
  }

  function matchesQuery(item, query) {
    if (!query) return true;
    const haystack = [
      item.title,
      item.summary,
      item.category,
      item.status,
      item.venue,
      item.location,
      ...(item.tags || []),
      ...(item.body || []),
    ].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
  }

  function splitVisibleItems(data, query) {
    const visibleItems = data.items.filter((item) => matchesQuery(item, query));
    const featured = visibleItems.find((item) => item.slug === data.featuredSlug && !item.archived)
      || visibleItems.find((item) => !item.archived)
      || null;

    return {
      featured,
      current: visibleItems.filter((item) => !item.archived && (!featured || item.slug !== featured.slug)),
      archive: visibleItems.filter((item) => item.archived),
      total: visibleItems.length,
    };
  }

  function renderEmptyState(message) {
    return `
      <div class="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-8 text-sm leading-6 text-slate-600">
        ${escapeHtml(message)}
      </div>
    `;
  }

  function renderNewsState(data, query) {
    const featuredShell = document.getElementById('news-featured-shell');
    const currentList = document.getElementById('news-current-list');
    const archiveGroups = document.getElementById('news-archive-groups');
    const count = document.getElementById('news-count');

    if (!featuredShell || !currentList || !archiveGroups || !count) return;

    const state = splitVisibleItems(data, query);
    count.textContent = String(state.total);

    featuredShell.innerHTML = renderFeatured(state.featured);
    currentList.innerHTML = state.current.length
      ? state.current.map(renderCurrentCard).join('')
      : renderEmptyState(query
        ? 'No current updates match this search yet.'
        : 'The current feed begins with the featured update above. Additional public updates will appear here over time.');

    const archiveMarkup = groupArchiveItems(state.archive).map(([year, items]) => renderArchiveGroup(year, items)).join('');
    archiveGroups.innerHTML = archiveMarkup || renderEmptyState(query
      ? 'No archived updates match this search yet.'
      : 'No archived updates yet. Older announcements will appear here as the News page grows.');

    if (window.syncToggleButtons) window.syncToggleButtons();
  }

  function renderError(message) {
    const featuredShell = document.getElementById('news-featured-shell');
    const currentList = document.getElementById('news-current-list');
    const archiveGroups = document.getElementById('news-archive-groups');
    const fallback = renderEmptyState(message);

    if (featuredShell) featuredShell.innerHTML = fallback;
    if (currentList) currentList.innerHTML = fallback;
    if (archiveGroups) archiveGroups.innerHTML = fallback;
  }

  window.setupNewsPage = async function setupNewsPage() {
    const searchInput = document.getElementById('news-search');

    try {
      const data = await fetchNews();
      const render = () => renderNewsState(data, searchInput ? searchInput.value.trim() : '');

      if (searchInput) {
        searchInput.addEventListener('input', render);
      }

      render();
    } catch (error) {
      console.error('[News] failed to load:', error);
      renderError(`Could not load the news feed right now. ${error.message}`);
    }
  };
})();
